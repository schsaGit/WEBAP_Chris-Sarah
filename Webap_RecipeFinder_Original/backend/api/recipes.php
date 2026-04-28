<?php
# handles two things: get one recipe by ID, or get a list of recipes with optional filters

require_once '../db.php'; # loads the shared helper functions

$conn = connectDB(); # opens the database connection


if (isset($_GET['id'])) {
    # --- SINGLE RECIPE MODE: ?id=3 returns full details for one recipe ---

    $recipeId = intval($_GET['id']); # takes the ID from the URL and converts it to a number

    $query = "SELECT * FROM recipes WHERE pk_recipes = $recipeId"; # fetches the recipe row by its ID
    $result = mysqli_query($conn, $query);

    if ($result && $row = mysqli_fetch_assoc($result)) {
        $recipe = $row;

        # loads category and difficulty data from JSON files to add human-readable names
        $categoriesData = json_decode(file_get_contents('../data/categories.json'), true);
        $difficultiesData = json_decode(file_get_contents('../data/difficulties.json'), true);

        # adds the category name and icon to the recipe using its category ID
        $recipe['categoryName'] = isset($categoriesData[$recipe['category']]['name']) ? $categoriesData[$recipe['category']]['name'] : 'Unknown';
        $recipe['categoryIcon'] = isset($categoriesData[$recipe['category']]['icon']) ? $categoriesData[$recipe['category']]['icon'] : '';

        # adds the difficulty name and star rating to the recipe using its difficulty ID
        $recipe['difficultyName'] = isset($difficultiesData[$recipe['difficulty']]['name']) ? $difficultiesData[$recipe['difficulty']]['name'] : 'Unknown';
        $recipe['difficultyStars'] = isset($difficultiesData[$recipe['difficulty']]['stars']) ? $difficultiesData[$recipe['difficulty']]['stars'] : '';

        # fetches all ingredients for this recipe by joining the includes table with the ingredients table
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
                'category' => !empty($ing['category']) ? $ing['category'] : 'Other', # falls back to 'Other' if category is empty
                'amount' => $ing['amount'],
                'unit' => $ing['unit']
            ];
        }

        jsonResponse($recipe); # sends the full recipe with its ingredients back as JSON
    } else {
        jsonResponse(['error' => 'Recipe not found'], 404); # sends a 404 if no recipe with that ID exists
    }
} else {
    # --- LIST MODE: returns all recipes, optionally filtered by category, difficulty, or IDs ---

    $where = []; # collects filter conditions to add to the SQL WHERE clause

    if (isset($_GET['category']) && $_GET['category'] !== '') {
        $category = intval($_GET['category']);
        $where[] = "category = $category"; # adds a category filter if ?category=1 is in the URL
    }

    if (isset($_GET['difficulty']) && $_GET['difficulty'] !== '') {
        $difficulty = intval($_GET['difficulty']);
        $where[] = "difficulty = $difficulty"; # adds a difficulty filter if ?difficulty=2 is in the URL
    }

    if (isset($_GET['ids']) && $_GET['ids'] !== '') {
        $ids = explode(',', $_GET['ids']); # splits the comma-separated list of IDs into an array
        $ids = array_map('intval', $ids);  # converts each ID to an integer
        $ids = array_filter($ids);         # removes any zero or empty values
        if (!empty($ids)) {
            $idsStr = implode(',', $ids);
            $where[] = "pk_recipes IN ($idsStr)"; # adds a filter to only return the given recipe IDs
        }
    }

    $whereClause = '';
    if (!empty($where)) {
        $whereClause = 'WHERE ' . implode(' AND ', $where); # joins all conditions with AND
    }

    $query = "SELECT * FROM recipes $whereClause ORDER BY category, difficulty, name"; # fetches recipes with all applied filters
    $result = mysqli_query($conn, $query);

    # loads category and difficulty data from JSON to add names/icons to each recipe
    $categoriesData = json_decode(file_get_contents('../data/categories.json'), true);
    $difficultiesData = json_decode(file_get_contents('../data/difficulties.json'), true);

    $recipes = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['categoryName'] = isset($categoriesData[$row['category']]['name']) ? $categoriesData[$row['category']]['name'] : 'Unknown';
        $row['categoryIcon'] = isset($categoriesData[$row['category']]['icon']) ? $categoriesData[$row['category']]['icon'] : '';

        $row['difficultyName'] = isset($difficultiesData[$row['difficulty']]['name']) ? $difficultiesData[$row['difficulty']]['name'] : 'Unknown';
        $row['difficultyStars'] = isset($difficultiesData[$row['difficulty']]['stars']) ? $difficultiesData[$row['difficulty']]['stars'] : '';

        # counts how many ingredients this recipe has
        $recipeId = $row['pk_recipes'];
        $countQuery = "SELECT COUNT(*) as count FROM includes WHERE pkfk_recipe = $recipeId";
        $countResult = mysqli_query($conn, $countQuery);
        $countRow = mysqli_fetch_assoc($countResult);
        $row['ingredient_count'] = $countRow['count'];

        $recipes[] = $row; # adds the enriched recipe to the results array
    }

    jsonResponse(['recipes' => $recipes, 'count' => count($recipes)]); # sends the list and total count as JSON
}

mysqli_close($conn); # closes the database connection
?>
