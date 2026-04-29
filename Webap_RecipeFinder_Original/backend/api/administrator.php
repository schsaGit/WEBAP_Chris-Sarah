<?php
require_once '../db.php';

$conn = connectDB();

function readInput()
{
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (!is_array($data)) {
        $data = $_POST;
    }

    return $data;
}

function requireAdministrator($conn)
{
    if (!isset($_COOKIE['user'])) {
        jsonResponse(['error' => 'You must be logged in.'], 401);
    }

    $userId = intval($_COOKIE['user']);
    $stmt = mysqli_prepare($conn, "SELECT role FROM Users WHERE pk_userId = ?");
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $role);

    if (!mysqli_stmt_fetch($stmt)) {
        mysqli_stmt_close($stmt);
        jsonResponse(['error' => 'User not found.'], 401);
    }

    mysqli_stmt_close($stmt);

    if ($role !== 'administrator') {
        jsonResponse(['error' => 'Administrator access required.'], 403);
    }

    return $userId;
}

function listUsers($conn)
{
    $result = mysqli_query($conn, "SELECT pk_userId, username, name, pfp, role, created FROM Users ORDER BY pk_userId");
    $users = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }

    jsonResponse(['users' => $users]);
}

function createUser($conn, $data)
{
    $username = trim($data['username'] ?? '');
    $name = trim($data['name'] ?? '');
    $password = $data['password'] ?? '';
    $pfp = trim($data['pfp'] ?? '');
    $role = ($data['role'] ?? 'user') === 'administrator' ? 'administrator' : 'user';

    if ($username === '' || $password === '') {
        jsonResponse(['error' => 'Username and password are required.'], 400);
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = mysqli_prepare($conn, "INSERT INTO Users (username, password, name, pfp, role) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, 'sssss', $username, $hashedPassword, $name, $pfp, $role);

    if (!mysqli_stmt_execute($stmt)) {
        jsonResponse(['error' => 'Could not create user.'], 500);
    }

    jsonResponse(['message' => 'User created.', 'id' => mysqli_insert_id($conn)], 201);
}

function updateUser($conn, $data)
{
    $id = intval($data['id'] ?? 0);
    $username = trim($data['username'] ?? '');
    $name = trim($data['name'] ?? '');
    $pfp = trim($data['pfp'] ?? '');
    $role = ($data['role'] ?? 'user') === 'administrator' ? 'administrator' : 'user';
    $password = $data['password'] ?? '';

    if (!$id || $username === '') {
        jsonResponse(['error' => 'User ID and username are required.'], 400);
    }

    if ($password !== '') {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = mysqli_prepare($conn, "UPDATE Users SET username = ?, name = ?, pfp = ?, role = ?, password = ? WHERE pk_userId = ?");
        mysqli_stmt_bind_param($stmt, 'sssssi', $username, $name, $pfp, $role, $hashedPassword, $id);
    } else {
        $stmt = mysqli_prepare($conn, "UPDATE Users SET username = ?, name = ?, pfp = ?, role = ? WHERE pk_userId = ?");
        mysqli_stmt_bind_param($stmt, 'ssssi', $username, $name, $pfp, $role, $id);
    }

    if (!mysqli_stmt_execute($stmt)) {
        jsonResponse(['error' => 'Could not update user.'], 500);
    }

    jsonResponse(['message' => 'User updated.']);
}

function deleteUser($conn, $adminUserId, $data)
{
    $id = intval($data['id'] ?? ($_GET['id'] ?? 0));

    if (!$id) {
        jsonResponse(['error' => 'User ID is required.'], 400);
    }

    if ($id === $adminUserId) {
        jsonResponse(['error' => 'You cannot delete your own administrator account.'], 400);
    }

    $stmt = mysqli_prepare($conn, "DELETE FROM Users WHERE pk_userId = ?");
    mysqli_stmt_bind_param($stmt, 'i', $id);

    if (!mysqli_stmt_execute($stmt)) {
        jsonResponse(['error' => 'Could not delete user.'], 500);
    }

    jsonResponse(['message' => 'User deleted.']);
}

function listRecipes($conn)
{
    $result = mysqli_query($conn, "SELECT pk_recipes, name, description, imageUrl, preparationTime, category, difficulty, instructions, created FROM recipes ORDER BY pk_recipes");
    $recipes = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $recipes[] = $row;
    }

    jsonResponse(['recipes' => $recipes]);
}

function recipeValues($data)
{
    return [
        trim($data['name'] ?? ''),
        trim($data['description'] ?? ''),
        trim($data['imageUrl'] ?? ''),
        intval($data['preparationTime'] ?? 0),
        intval($data['category'] ?? 0),
        intval($data['difficulty'] ?? 0),
        trim($data['instructions'] ?? '')
    ];
}

function createRecipe($conn, $data)
{
    [$name, $description, $imageUrl, $preparationTime, $category, $difficulty, $instructions] = recipeValues($data);

    if ($name === '' || !$preparationTime || !$category || !$difficulty || $instructions === '') {
        jsonResponse(['error' => 'Name, preparation time, category, difficulty, and instructions are required.'], 400);
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO recipes (name, description, imageUrl, preparationTime, category, difficulty, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, 'sssiiis', $name, $description, $imageUrl, $preparationTime, $category, $difficulty, $instructions);

    if (!mysqli_stmt_execute($stmt)) {
        jsonResponse(['error' => 'Could not create recipe.'], 500);
    }

    jsonResponse(['message' => 'Recipe created.', 'id' => mysqli_insert_id($conn)], 201);
}

function updateRecipe($conn, $data)
{
    $id = intval($data['id'] ?? 0);
    [$name, $description, $imageUrl, $preparationTime, $category, $difficulty, $instructions] = recipeValues($data);

    if (!$id || $name === '' || !$preparationTime || !$category || !$difficulty || $instructions === '') {
        jsonResponse(['error' => 'Recipe ID, name, preparation time, category, difficulty, and instructions are required.'], 400);
    }

    $stmt = mysqli_prepare($conn, "UPDATE recipes SET name = ?, description = ?, imageUrl = ?, preparationTime = ?, category = ?, difficulty = ?, instructions = ? WHERE pk_recipes = ?");
    mysqli_stmt_bind_param($stmt, 'sssiiisi', $name, $description, $imageUrl, $preparationTime, $category, $difficulty, $instructions, $id);

    if (!mysqli_stmt_execute($stmt)) {
        jsonResponse(['error' => 'Could not update recipe.'], 500);
    }

    jsonResponse(['message' => 'Recipe updated.']);
}

function deleteRecipe($conn, $data)
{
    $id = intval($data['id'] ?? ($_GET['id'] ?? 0));

    if (!$id) {
        jsonResponse(['error' => 'Recipe ID is required.'], 400);
    }

    $stmt = mysqli_prepare($conn, "DELETE FROM recipes WHERE pk_recipes = ?");
    mysqli_stmt_bind_param($stmt, 'i', $id);

    if (!mysqli_stmt_execute($stmt)) {
        jsonResponse(['error' => 'Could not delete recipe.'], 500);
    }

    jsonResponse(['message' => 'Recipe deleted.']);
}

$adminUserId = requireAdministrator($conn);
$resource = $_GET['resource'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = readInput();

if ($resource === 'users') {
    if ($method === 'GET') listUsers($conn);
    if ($method === 'POST') createUser($conn, $data);
    if ($method === 'PUT') updateUser($conn, $data);
    if ($method === 'DELETE') deleteUser($conn, $adminUserId, $data);
}

if ($resource === 'recipes') {
    if ($method === 'GET') listRecipes($conn);
    if ($method === 'POST') createRecipe($conn, $data);
    if ($method === 'PUT') updateRecipe($conn, $data);
    if ($method === 'DELETE') deleteRecipe($conn, $data);
}

jsonResponse(['error' => 'Unknown admin action.'], 404);
?>
