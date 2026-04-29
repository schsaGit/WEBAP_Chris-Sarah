<?php
# returns up to 3 local recipes that use the given ingredient

require_once '../db.php'; # loads shared helpers

$conn = connectDB();

$ingredientId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($ingredientId <= 0) {
    jsonResponse(['error' => 'Ingredient ID required'], 400);
}

$query = "
    SELECT
        r.pk_recipes,
        r.name
    FROM recipes r
    JOIN includes inc ON r.pk_recipes = inc.pkfk_recipe
    WHERE inc.pkfk_ingredient = $ingredientId
    ORDER BY r.name
    LIMIT 3
";

$result = mysqli_query($conn, $query);
if (!$result) {
    jsonResponse(['error' => 'Database error: ' . mysqli_error($conn)], 500);
}

$recipes = [];
while ($row = mysqli_fetch_assoc($result)) {
    $recipes[] = [
        'pk_recipes' => intval($row['pk_recipes']),
        'name' => $row['name']
    ];
}

jsonResponse(['recipes' => $recipes]);

mysqli_close($conn);
