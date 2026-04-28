<?php
# finds up to 5 recipes that share at least 3 ingredients with the given recipe

require_once '../db.php'; # loads the shared helper functions

$conn = connectDB(); # opens the database connection

if (!isset($_GET['id'])) {
    jsonResponse(['error' => 'Recipe ID required'], 400); # sends an error if no recipe ID was given in the URL
}

$recipeId = intval($_GET['id']); # takes the recipe ID from the URL (e.g. ?id=3) and converts it to a number

# this query finds other recipes that share ingredients with the given recipe:
# - the inner SELECT gets all ingredient IDs that the given recipe uses
# - JOIN includes i1 links each other recipe to those same ingredients
# - COUNT(DISTINCT ...) counts how many shared ingredients each other recipe has
# - HAVING matching_ingredients >= 3 keeps only recipes with at least 3 shared ingredients
# - ORDER BY matching_ingredients DESC puts the most similar recipes first
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
    $similar[] = $row; # adds each similar recipe to the results array
}

# sends back the count of similar recipes and the list
jsonResponse([
    'count' => count($similar),
    'similar_recipes' => $similar
]);

mysqli_close($conn); # closes the database connection
?>
