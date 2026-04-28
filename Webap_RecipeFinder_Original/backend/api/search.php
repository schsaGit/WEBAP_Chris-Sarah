<?php
# searches recipes by name or description and returns matches sorted by relevance

require_once '../db.php'; # loads the shared helper functions

$conn = connectDB(); # opens the database connection

# takes the search word from the URL (e.g. ?q=pasta), sanitizes it to prevent SQL injection
$search = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : '';

if (empty($search)) {
    jsonResponse(['error' => 'Search term is missing'], 400); # sends an error if no search word was given
}

# LIKE '%$search%' means "contains the search word anywhere in the text"
# the CASE block gives each row a relevance score: 1 if name matches, 2 if only description matches
# ORDER BY relevance ASC puts the best matches first
$query = "SELECT *,
    CASE
        WHEN name LIKE '%$search%' THEN 1
        WHEN description LIKE '%$search%' THEN 2
        ELSE 3
    END AS relevance
    FROM recipes
    WHERE name LIKE '%$search%' OR description LIKE '%$search%'
    ORDER BY relevance ASC, name ASC";
$result = mysqli_query($conn, $query);

# loads category and difficulty data from JSON files to add names/icons to each recipe
$categoriesData = json_decode(file_get_contents('../data/categories.json'), true);
$difficultiesData = json_decode(file_get_contents('../data/difficulties.json'), true);

$recipes = [];
while ($row = mysqli_fetch_assoc($result)) {
    # looks up the category name and icon using the category ID stored on the recipe
    $row['categoryName'] = isset($categoriesData[$row['category']]['name']) ? $categoriesData[$row['category']]['name'] : 'Unknown';
    $row['categoryIcon'] = isset($categoriesData[$row['category']]['icon']) ? $categoriesData[$row['category']]['icon'] : '';

    # looks up the difficulty name and star rating using the difficulty ID stored on the recipe
    $row['difficultyName'] = isset($difficultiesData[$row['difficulty']]['name']) ? $difficultiesData[$row['difficulty']]['name'] : 'Unknown';
    $row['difficultyStars'] = isset($difficultiesData[$row['difficulty']]['stars']) ? $difficultiesData[$row['difficulty']]['stars'] : '';

    # counts how many ingredients this recipe has by checking the includes table
    $recipeId = $row['pk_recipes'];
    $countQuery = "SELECT COUNT(*) as count FROM includes WHERE pkfk_recipe = $recipeId";
    $countResult = mysqli_query($conn, $countQuery);
    $countRow = mysqli_fetch_assoc($countResult);
    $row['ingredient_count'] = $countRow['count'];

    $recipes[] = $row; # adds the enriched recipe to the results array
}

# sends back the total count, the search word used, and the list of matching recipes
jsonResponse([
    'count' => count($recipes),
    'search_term' => $search,
    'recipes' => $recipes
]);

mysqli_close($conn); # closes the database connection
?>
