<?php
# create_recipe.php — receives a POST request from the "Create Your Own Recipe" form
# inserts the new recipe into the local DB using prepared statements
# requires the user to be logged in (checks the "user" cookie)

require_once '../db.php'; # loads connectDB() and jsonResponse()

# block any non-POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

# check login — the cookie stores the pk_userId set during login
if (!isset($_COOKIE['user']) || !is_numeric($_COOKIE['user'])) {
    jsonResponse(['error' => 'Not logged in'], 401);
}

$userId = intval($_COOKIE['user']); # the ID of the user creating the recipe

# ── pull and sanitise every field from the form ──────────────────────────────

$name            = trim($_POST['name']            ?? '');
$description     = trim($_POST['description']     ?? '');
$imageUrl        = trim($_POST['imageUrl']        ?? '');
$preparationTime = intval($_POST['preparationTime'] ?? 0);
$category        = intval($_POST['category']      ?? 0);
$difficulty      = intval($_POST['difficulty']    ?? 0);
$instructions    = trim($_POST['instructions']    ?? '');

# ── basic validation ─────────────────────────────────────────────────────────

$errors = [];

if ($name === '')           { $errors[] = 'Recipe name is required.'; }
if ($instructions === '')   { $errors[] = 'Instructions are required.'; }
if ($preparationTime <= 0)  { $errors[] = 'Preparation time must be a positive number.'; }
if ($category < 1 || $category > 4) { $errors[] = 'Please choose a valid category.'; }
if ($difficulty < 1 || $difficulty > 3) { $errors[] = 'Please choose a valid difficulty.'; }

# imageUrl is optional — if empty we leave it NULL in the DB
if ($imageUrl !== '' && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
    $errors[] = 'Image URL does not look valid (must start with http:// or https://).';
}

if (!empty($errors)) {
    jsonResponse(['error' => implode(' ', $errors)], 422);
}

# ── fetch the username to append "Created by <username>" to the description ──

$conn = connectDB();

$userQuery = "SELECT username FROM Users WHERE pk_userId = ?";
$userStmt  = mysqli_prepare($conn, $userQuery);
mysqli_stmt_bind_param($userStmt, 'i', $userId);
mysqli_stmt_execute($userStmt);
mysqli_stmt_bind_result($userStmt, $username);

if (!mysqli_stmt_fetch($userStmt)) {
    mysqli_stmt_close($userStmt);
    mysqli_close($conn);
    jsonResponse(['error' => 'User not found.'], 404);
}
mysqli_stmt_close($userStmt);

# append bold attribution on a new line at the end of the description
$creatorLine = '<b>Created by ' . $username . '.</b>';
$finalDescription = ($description !== '')
    ? $description . "\n" . $creatorLine
    : $creatorLine;

# imageUrl NULL when not provided
$imageUrlValue = ($imageUrl !== '') ? $imageUrl : null;

# ── insert the recipe ────────────────────────────────────────────────────────

$insertQuery = "
    INSERT INTO recipes (name, description, imageUrl, preparationTime, category, difficulty, instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
";

$stmt = mysqli_prepare($conn, $insertQuery);

if (!$stmt) {
    mysqli_close($conn);
    jsonResponse(['error' => 'Failed to prepare insert statement.'], 500);
}

# s = string, s = string, s = string (nullable), i = int, i = int, i = int, s = string
mysqli_stmt_bind_param($stmt, 'sssiiis',
    $name,
    $finalDescription,
    $imageUrlValue,
    $preparationTime,
    $category,
    $difficulty,
    $instructions
);

if (!mysqli_stmt_execute($stmt)) {
    # most likely cause: duplicate name (UNIQUE constraint on recipes.name)
    $errMsg = mysqli_stmt_error($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);

    if (strpos($errMsg, 'Duplicate entry') !== false) {
        jsonResponse(['error' => "A recipe named \"$name\" already exists. Please choose a different name."], 409);
    }
    jsonResponse(['error' => 'Failed to save recipe: ' . $errMsg], 500);
}

$newId = mysqli_insert_id($conn); # the AUTO_INCREMENT id of the new row

mysqli_stmt_close($stmt);
mysqli_close($conn);

# return success with the new recipe's ID so the frontend can jump straight to its detail view
jsonResponse([
    'success' => true,
    'message' => 'Recipe "' . $name . '" saved successfully!',
    'pk_recipes' => $newId
], 201);
?>
