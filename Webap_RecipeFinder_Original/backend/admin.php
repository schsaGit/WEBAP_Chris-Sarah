<?php
require_once 'db.php';

$conn = connectDB();
$isAdministrator = false;

if (isset($_COOKIE['user'])) {
    $userId = intval($_COOKIE['user']);
    $stmt = mysqli_prepare($conn, "SELECT role FROM Users WHERE pk_userId = ?");
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $role);
    $isAdministrator = mysqli_stmt_fetch($stmt) && $role === 'administrator';
    mysqli_stmt_close($stmt);
}

mysqli_close($conn);

if (!$isAdministrator) {
    http_response_code(403);
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Admin - Recipe Finder</title>
    <link rel="stylesheet" href="../frontend/css/style.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
<div id="page">
    <div id="app">
        <div class="admin-header">
            <div>
                <h1>Admin</h1>
                <p>Manage users and recipes.</p>
            </div>
            <a href="../frontend/index.html"><button>Back to recipes</button></a>
        </div>

        <?php if (!$isAdministrator): ?>
            <div id="admin-message" class="admin-error" style="display: block;">
                Administrator access required.
            </div>
        <?php else: ?>
            <div id="admin-message"></div>

            <div class="admin-grid">
                <section class="admin-section">
                    <h2>Users</h2>
                    <form id="user-form" class="admin-form">
                        <input type="hidden" id="user-id">
                        <label>Name <input type="text" id="user-name"></label>
                        <label>Username <input type="text" id="user-username" required></label>
                        <label>Password <input type="password" id="user-password" placeholder="Leave blank to keep current password"></label>
                        <label>Profile image <input type="text" id="user-pfp"></label>
                        <label>Role
                            <select id="user-role">
                                <option value="user">User</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </label>
                        <div class="admin-actions">
                            <button type="submit">Save user</button>
                            <button type="button" id="clear-user-form">Clear</button>
                        </div>
                    </form>
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead>
                            <tr><th>ID</th><th>Username</th><th>Name</th><th>Role</th><th>Actions</th></tr>
                            </thead>
                            <tbody id="users-table"></tbody>
                        </table>
                    </div>
                </section>

                <section class="admin-section">
                    <h2>Recipes</h2>
                    <form id="recipe-form" class="admin-form">
                        <input type="hidden" id="recipe-id">
                        <label>Name <input type="text" id="recipe-name" required></label>
                        <label>Description <textarea id="recipe-description"></textarea></label>
                        <label>Image URL <input type="text" id="recipe-image"></label>
                        <label>Preparation time <input type="number" id="recipe-time" min="1" required></label>
                        <label>Category
                            <select id="recipe-category" required>
                                <option value="1">Main Course</option>
                                <option value="2">Side Dish</option>
                                <option value="3">Soup</option>
                                <option value="4">Sweets/Dessert</option>
                            </select>
                        </label>
                        <label>Difficulty
                            <select id="recipe-difficulty" required>
                                <option value="1">Easy</option>
                                <option value="2">Medium</option>
                                <option value="3">Hard</option>
                            </select>
                        </label>
                        <label>Instructions <textarea id="recipe-instructions" required></textarea></label>
                        <div class="admin-actions">
                            <button type="submit">Save recipe</button>
                            <button type="button" id="clear-recipe-form">Clear</button>
                        </div>
                    </form>
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead>
                            <tr><th>ID</th><th>Name</th><th>Time</th><th>Actions</th></tr>
                            </thead>
                            <tbody id="recipes-table"></tbody>
                        </table>
                    </div>
                </section>
            </div>

            <script src="../frontend/js/admin.js"></script>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
