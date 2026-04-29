<?php
require_once '../db.php';

$conn = connectDB();


if (isset($_GET['id'])) {
    $recipeId = intval($_GET['id']);
    

    $query = "SELECT * FROM recipes WHERE pk_recipes = $recipeId";
    $result = mysqli_query($conn, $query);
    
    if ($result && $row = mysqli_fetch_assoc($result)) {
        $recipe = $row;
  
        $categoriesData = json_decode(file_get_contents('../data/categories.json'), true);
        $difficultiesData = json_decode(file_get_contents('../data/difficulties.json'), true);
        
        $recipe['categoryName'] = isset($categoriesData[$recipe['category']]['name']) ? $categoriesData[$recipe['category']]['name'] : 'Unknown';
        $recipe['categoryIcon'] = isset($categoriesData[$recipe['category']]['icon']) ? $categoriesData[$recipe['category']]['icon'] : '';
        
        $recipe['difficultyName'] = isset($difficultiesData[$recipe['difficulty']]['name']) ? $difficultiesData[$recipe['difficulty']]['name'] : 'Unknown';
        $recipe['difficultyStars'] = isset($difficultiesData[$recipe['difficulty']]['stars']) ? $difficultiesData[$recipe['difficulty']]['stars'] : '';
        
        $ingredientQuery = "
            SELECT 
                i.pk_ingredients,
                i.name,
                i.category,
                inc.amount,
                inc.unit
            FROM includes inc
            JOIN ingredients i ON inc.pkfk_ingredient = i.pk_ingredients
            WHERE inc.pkfk_recipe = $recipeId
            ORDER BY i.category, i.name
        ";
        
        $ingredientResult = mysqli_query($conn, $ingredientQuery);
        $recipe['ingredients'] = [];
        
        while ($ing = mysqli_fetch_assoc($ingredientResult)) {
            $recipe['ingredients'][] = [
                'pk_ingredients' => $ing['pk_ingredients'],
                'name' => $ing['name'],
                'category' => !empty($ing['category']) ? $ing['category'] : 'Other',
                'amount' => $ing['amount'],
                'unit' => $ing['unit']
            ];
        }
        
        jsonResponse($recipe);
    } else {
        jsonResponse(['error' => 'Recipe not found'], 404);
    }
} else {
    $where = [];
    
    if (isset($_GET['category']) && $_GET['category'] !== '') {
        $category = intval($_GET['category']);
        $where[] = "category = $category";
    }
    
    if (isset($_GET['difficulty']) && $_GET['difficulty'] !== '') {
        $difficulty = intval($_GET['difficulty']);
        $where[] = "difficulty = $difficulty";
    }
    
    if (isset($_GET['ids']) && $_GET['ids'] !== '') {
        $ids = explode(',', $_GET['ids']);
        $ids = array_map('intval', $ids);
        $ids = array_filter($ids);
        if (!empty($ids)) {
            $idsStr = implode(',', $ids);
            $where[] = "pk_recipes IN ($idsStr)";
        }
    }
    
    $whereClause = '';
    if (!empty($where)) {
        $whereClause = 'WHERE ' . implode(' AND ', $where);
    }
    
    $query = "SELECT * FROM recipes $whereClause ORDER BY category, difficulty, name";
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
    
    jsonResponse(['recipes' => $recipes, 'count' => count($recipes)]);
}

mysqli_close($conn);
?>
