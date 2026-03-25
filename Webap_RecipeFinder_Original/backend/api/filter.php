<?php
require_once '../db.php';

$conn = connectDB();


$ingredients = isset($_GET['ingredients']) ? explode(',', $_GET['ingredients']) : [];

if (empty($ingredients)) {
    jsonResponse(['error' => 'No ingredients selected'], 400);
}


$ingredients = array_filter(array_map('intval', $ingredients));

if (empty($ingredients)) {
    jsonResponse(['error' => 'Invalid ingredient IDs'], 400);
}

$ingredientIds = implode(',', $ingredients);
$ingredientCount = count($ingredients);


$query = "
    SELECT 
        r.pk_recipes,
        r.name,
        r.description,
        r.preparationTime,
        r.category,
        r.difficulty,
        COUNT(DISTINCT inc.pkfk_ingredient) as total_ingredients,
        SUM(CASE WHEN inc.pkfk_ingredient IN ($ingredientIds) THEN 1 ELSE 0 END) as matching_ingredients
    FROM recipes r
    LEFT JOIN includes inc ON r.pk_recipes = inc.pkfk_recipe
    GROUP BY r.pk_recipes, r.name, r.description, r.preparationTime, r.category, r.difficulty
    HAVING matching_ingredients = $ingredientCount
    ORDER BY r.name
";

$result = mysqli_query($conn, $query);

if (!$result) {
    jsonResponse(['error' => 'Database error: ' . mysqli_error($conn)], 500);
}

$recipes = [];

while ($row = mysqli_fetch_assoc($result)) {
    $recipeId = $row['pk_recipes'];
    
    $ingredientQuery = "
        SELECT 
            i.name as ingredient_name,
            i.category,
            inc.amount,
            inc.unit
        FROM includes inc
        JOIN ingredients i ON inc.pkfk_ingredient = i.pk_ingredients
        WHERE inc.pkfk_recipe = $recipeId 
        AND inc.pkfk_ingredient IN ($ingredientIds)
        ORDER BY i.category, i.name
    ";
    
    $ingredientResult = mysqli_query($conn, $ingredientQuery);
    $matchingByCategory = [];
    
    while ($ing = mysqli_fetch_assoc($ingredientResult)) {
        $category = !empty($ing['category']) ? $ing['category'] : 'Other';
        if (!isset($matchingByCategory[$category])) {
            $matchingByCategory[$category] = [];
        }
        $matchingByCategory[$category][] = $ing['ingredient_name'];
    }


    $missingQuery = "
        SELECT i.name
        FROM includes inc
        JOIN ingredients i ON inc.pkfk_ingredient = i.pk_ingredients
        WHERE inc.pkfk_recipe = $recipeId 
        AND inc.pkfk_ingredient NOT IN ($ingredientIds)
        ORDER BY i.name
    ";
    
    $missingResult = mysqli_query($conn, $missingQuery);
    $missingList = [];
    $missingCount = 0;
    
    while ($missing = mysqli_fetch_assoc($missingResult)) {
        $missingList[] = $missing['name'];
        $missingCount++;
    }
    
    $recipes[] = [
        'pk_recipes' => $row['pk_recipes'],
        'name' => $row['name'],
        'description' => $row['description'],
        'preparationTime' => $row['preparationTime'],
        'category' => $row['category'],
        'difficulty' => $row['difficulty'],
        'total_ingredients' => (int)$row['total_ingredients'],
        'matching_ingredients' => (int)$row['matching_ingredients'],
        'missing_ingredients' => $missingCount,
        'missing_list' => $missingList,
        'matching_ingredients_by_category' => $matchingByCategory
    ];
}

jsonResponse([
    'count' => count($recipes),
    'selected_ingredients_count' => $ingredientCount,
    'recipes' => $recipes
]);

mysqli_close($conn);
?>
