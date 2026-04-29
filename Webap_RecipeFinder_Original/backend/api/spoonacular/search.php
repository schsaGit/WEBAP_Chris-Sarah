<?php
# searches spoonacular by name; mirrors local search.php contract (?q=...)

require_once __DIR__ . '/_client.php';

# takes the search word from the URL (e.g. ?q=pasta)
$q = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($q === '') {
    jsonResponse(['error' => 'Search term is missing'], 400); # same error shape as local search.php
}

# complexSearch returns a results array; addRecipeInformation gives us
# the fields we need for the card (image, readyInMinutes, dishTypes)
$data = spoonGet('/recipes/complexSearch', [
    'query'                => $q,
    'number'               => 12,
    'addRecipeInformation' => 'true',
    'fillIngredients'      => 'true'   # required for extendedIngredients (so the card's ingredient_count works)
]);

$recipes = [];
foreach (($data['results'] ?? []) as $r) {
    $recipes[] = spoonNormalize($r); # normalize each result into the unified shape
}

# returns the same envelope as local search.php
jsonResponse([
    'count'       => count($recipes),
    'search_term' => $q,
    'recipes'     => $recipes
]);
?>
