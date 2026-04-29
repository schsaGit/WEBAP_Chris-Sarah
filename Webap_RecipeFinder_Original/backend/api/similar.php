<?php
require_once '../db.php';

$conn = connectDB();

if (!isset($_GET['id'])) {
    jsonResponse(['error' => 'Recipe ID required'], 400);
}

$recipeId = intval($_GET['id']);

$query = "
    SELECT 
        r.pk_recipes,
        r.name,
        r.description,
        r.imageUrl,
        r.preparationTime,
        r.category,
        r.difficulty,
        COUNT(DISTINCT i1.pkfk_ingredient) as matching_ingredients
    FROM recipes r
    JOIN includes i1 ON r.pk_recipes = i1.pkfk_recipe
    WHERE i1.pkfk_ingredient IN (
        SELECT pkfk_ingredient 
        FROM includes 
        WHERE pkfk_recipe = $recipeId
    )
    AND r.pk_recipes != $recipeId
    GROUP BY r.pk_recipes
    HAVING matching_ingredients >= 3
    ORDER BY matching_ingredients DESC
    LIMIT 5
";

$result = mysqli_query($conn, $query);

$similar = [];
while ($row = mysqli_fetch_assoc($result)) {
    $similar[] = $row;
}

jsonResponse([
    'count' => count($similar),
    'similar_recipes' => $similar
]);

mysqli_close($conn);
?>
