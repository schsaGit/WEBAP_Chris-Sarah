<?php
require_once '../db.php';

$conn = connectDB();

$search = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : '';

if (empty($search)) {
    jsonResponse(['error' => 'Search term is missing'], 400);
}

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

$categoriesData = json_decode(file_get_contents('../data/categories.json'), true);
$difficultiesData = json_decode(file_get_contents('../data/difficulties.json'), true);

$recipes = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['categoryName'] = isset($categoriesData[$row['category']]['name']) ? $categoriesData[$row['category']]['name'] : 'Unknown';
    $row['categoryIcon'] = isset($categoriesData[$row['category']]['icon']) ? $categoriesData[$row['category']]['icon'] : '';
    
    $row['difficultyName'] = isset($difficultiesData[$row['difficulty']]['name']) ? $difficultiesData[$row['difficulty']]['name'] : 'Unknown';
    $row['difficultyStars'] = isset($difficultiesData[$row['difficulty']]['stars']) ? $difficultiesData[$row['difficulty']]['stars'] : '';
    
    $recipeId = $row['pk_recipes'];
    $countQuery = "SELECT COUNT(*) as count FROM includes WHERE pkfk_recipe = $recipeId";
    $countResult = mysqli_query($conn, $countQuery);
    $countRow = mysqli_fetch_assoc($countResult);
    $row['ingredient_count'] = $countRow['count'];
    
    $recipes[] = $row;
}

jsonResponse([
    'count' => count($recipes),
    'search_term' => $search,
    'recipes' => $recipes
]);

mysqli_close($conn);
?>
