<?php
# filters recipes to find ones that contain ALL of the selected ingredients

require_once '../db.php'; # loads the shared helper functions

$conn = connectDB(); # opens the database connection

# takes the ingredient IDs from the URL (e.g. ?ingredients=1,5,12) and splits them into an array
$ingredients = isset($_GET['ingredients']) ? explode(',', $_GET['ingredients']) : [];

if (empty($ingredients)) {
    jsonResponse(['error' => 'No ingredients selected'], 400); # sends an error if no ingredients were given
}

$ingredients = array_filter(array_map('intval', $ingredients)); # converts each ID to a number and removes any invalid (zero) values

if (empty($ingredients)) {
    jsonResponse(['error' => 'Invalid ingredient IDs'], 400); # sends an error if all IDs were invalid
}

$ingredientIds = implode(',', $ingredients); # turns the array back into a comma-separated string for use in SQL
$ingredientCount = count($ingredients); # the number of ingredients the user selected

# this query finds recipes that have ALL of the selected ingredients:
# - SUM(CASE ...) counts how many of the selected ingredients each recipe has
# - HAVING matching_ingredients = $ingredientCount keeps only recipes where ALL selected ingredients match
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
    jsonResponse(['error' => 'Database error: ' . mysqli_error($conn)], 500); # sends an error if the query failed
}

$recipes = [];

while ($row = mysqli_fetch_assoc($result)) {
    $recipeId = $row['pk_recipes'];

    # fetches only the matching ingredients for this recipe, grouped by category
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
    $matchingByCategory = []; # will hold matching ingredients organized by category name

    while ($ing = mysqli_fetch_assoc($ingredientResult)) {
        $category = !empty($ing['category']) ? $ing['category'] : 'Other'; # falls back to 'Other' if no category
        if (!isset($matchingByCategory[$category])) {
            $matchingByCategory[$category] = []; # creates the category group if it doesn't exist yet
        }
        $matchingByCategory[$category][] = $ing['ingredient_name']; # adds the ingredient name to its category group
    }

    # fetches the ingredients this recipe needs that are NOT in the selected list (the missing ones)
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
        $missingList[] = $missing['name']; # adds each missing ingredient name to the list
        $missingCount++;
    }

    # builds the full result object for this recipe
    $recipes[] = [
        'pk_recipes' => $row['pk_recipes'],
        'name' => $row['name'],
        'description' => $row['description'],
        'preparationTime' => $row['preparationTime'],
        'category' => $row['category'],
        'difficulty' => $row['difficulty'],
        'total_ingredients' => (int)$row['total_ingredients'],          # total number of ingredients in the recipe
        'matching_ingredients' => (int)$row['matching_ingredients'],    # how many of the selected ingredients it has
        'missing_ingredients' => $missingCount,                         # how many ingredients the recipe needs that weren't selected
        'missing_list' => $missingList,                                 # names of the missing ingredients
        'matching_ingredients_by_category' => $matchingByCategory       # matching ingredients grouped by category
    ];
}

# sends back the count, how many ingredients were selected, and the matching recipes
jsonResponse([
    'count' => count($recipes),
    'selected_ingredients_count' => $ingredientCount,
    'recipes' => $recipes
]);

mysqli_close($conn); # closes the database connection
?>
