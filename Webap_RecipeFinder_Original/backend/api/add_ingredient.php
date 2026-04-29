<?php
# add_ingredient.php — inserts a new ingredient and returns the saved row
# called via AJAX from the Create Recipe form when the user types a name not in the list

require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_COOKIE['user']) || !is_numeric($_COOKIE['user'])) {
    jsonResponse(['error' => 'Not logged in'], 401);
}

$name     = trim($_POST['name']     ?? '');
$category = trim($_POST['category'] ?? '');

if ($name === '') {
    jsonResponse(['error' => 'Ingredient name is required.'], 422);
}
if ($category === '') {
    jsonResponse(['error' => 'Category is required.'], 422);
}

$conn = connectDB();

$stmt = mysqli_prepare($conn, 'INSERT INTO ingredients (name, category) VALUES (?, ?)');

if (!$stmt) {
    mysqli_close($conn);
    jsonResponse(['error' => 'Failed to prepare statement.'], 500);
}

mysqli_stmt_bind_param($stmt, 'ss', $name, $category);

if (!mysqli_stmt_execute($stmt)) {
    $errMsg = mysqli_stmt_error($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);

    if (strpos($errMsg, 'Duplicate entry') !== false) {
        jsonResponse(['error' => "An ingredient named \"$name\" already exists."], 409);
    }
    jsonResponse(['error' => 'Failed to save ingredient: ' . $errMsg], 500);
}

$newId = mysqli_insert_id($conn);
mysqli_stmt_close($stmt);
mysqli_close($conn);

jsonResponse([
    'success'        => true,
    'pk_ingredients' => $newId,
    'name'           => $name,
    'category'       => $category,
], 201);
?>
