<?php
# filters spoonacular recipes by ingredients (comma-separated names)
# mirrors local filter.php contract (?ingredients=...) but accepts names not IDs

require_once __DIR__ . '/_client.php';

# takes the ingredients from the URL (e.g. ?ingredients=tomato,basil,garlic)
$ing = isset($_GET['ingredients']) ? trim($_GET['ingredients']) : '';

if ($ing === '') {
    jsonResponse(['error' => 'No ingredients selected'], 400);
}

# splits the list to count how many ingredients the user actually selected
$names = array_filter(array_map('trim', explode(',', $ing)));
if (empty($names)) {
    jsonResponse(['error' => 'Invalid ingredient names'], 400);
}

# findByIngredients returns recipes that use the most of the given ingredients;
# ranking=1 maximizes used ingredients, ranking=2 minimizes missing ingredients
$data = spoonGet('/recipes/findByIngredients', [
    'ingredients' => implode(',', $names),
    'number'      => 12,
    'ranking'     => 1,
    'ignorePantry' => 'true'
]);

$recipes = [];
foreach ($data as $r) {
    # findByIngredients responses are slim, so normalize what we can
    $base = spoonNormalize($r);

    # add the matching/missing fields the local filter.php returns
    $base['matching_ingredients'] = $r['usedIngredientCount'] ?? 0;
    $base['total_ingredients']    = ($r['usedIngredientCount'] ?? 0) + ($r['missedIngredientCount'] ?? 0);
    $base['missing_ingredients']  = $r['missedIngredientCount'] ?? 0;
    $base['missing_list']         = array_map(
        function ($m) { return $m['name']; },
        $r['missedIngredients'] ?? []
    );

    # group matching ingredients by aisle to mirror local filter.php
    $byCategory = [];
    foreach (($r['usedIngredients'] ?? []) as $u) {
        $cat = !empty($u['aisle']) ? $u['aisle'] : 'Other';
        if (!isset($byCategory[$cat])) $byCategory[$cat] = [];
        $byCategory[$cat][] = $u['name'];
    }
    $base['matching_ingredients_by_category'] = $byCategory;

    $recipes[] = $base;
}

# returns the same envelope as local filter.php
jsonResponse([
    'count'                      => count($recipes),
    'selected_ingredients_count' => count($names),
    'recipes'                    => $recipes
]);
?>
