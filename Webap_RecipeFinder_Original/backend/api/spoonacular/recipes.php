<?php
# handles two things: get one spoonacular recipe by ID, or get a list (with optional category/difficulty filters)
# (mirrors the structure of local recipes.php)

require_once __DIR__ . '/_client.php';

if (isset($_GET['id'])) {
    # --- SINGLE RECIPE MODE: ?id=spoon-640921 returns full details ---

    $rawId = $_GET['id'];
    $id = intval(str_replace('spoon-', '', $rawId));

    if ($id <= 0) {
        jsonResponse(['error' => 'Invalid recipe ID'], 400);
    }

    $r = spoonGet("/recipes/$id/information", ['includeNutrition' => 'false']);

    if (empty($r['id'])) {
        jsonResponse(['error' => 'Recipe not found'], 404);
    }

    jsonResponse(spoonNormalize($r, true));

} else {
    # --- LIST MODE: filtered (complexSearch) when category/difficulty given, else random ---

    $hasFilter = (isset($_GET['category']) && $_GET['category'] !== '')
              || (isset($_GET['difficulty']) && $_GET['difficulty'] !== '');

    if ($hasFilter) {
        # use complexSearch so we can pass filter params; addRecipeInformation pulls in
        # the fields we need for the card (image, readyInMinutes, dishTypes)
        $params = [
            'number'               => 12,
            'addRecipeInformation' => 'true',
            'fillIngredients'      => 'true'   # required for extendedIngredients (so the card's ingredient_count works)
        ];

        # map local category IDs to spoonacular's "type" values (dishTypes vocabulary)
        if (isset($_GET['category']) && $_GET['category'] !== '') {
            $catMap = [
                '1' => 'main course',
                '2' => 'side dish',
                '3' => 'soup',
                '4' => 'dessert'
            ];
            $cat = $_GET['category'];
            if (isset($catMap[$cat])) {
                $params['type'] = $catMap[$cat];
            }
        }

        # difficulty maps to readyInMinutes ranges (Easy <20, Medium 20–59, Hard ≥60)
        # spoonacular only has maxReadyTime, not minReadyTime, so the lower bound is enforced after the fetch
        $diffFilter = null;
        if (isset($_GET['difficulty']) && $_GET['difficulty'] !== '') {
            $diff = $_GET['difficulty'];
            if ($diff === '1') {
                $params['maxReadyTime'] = 19;
            } elseif ($diff === '2') {
                $params['maxReadyTime'] = 59;
                $diffFilter = 'medium';
            } elseif ($diff === '3') {
                $diffFilter = 'hard';
            }
        }

        $data = spoonGet('/recipes/complexSearch', $params);

        $recipes = [];
        foreach (($data['results'] ?? []) as $r) {
            $time = $r['readyInMinutes'] ?? 60;
            # enforce the lower bound that spoonacular doesn't support natively
            if ($diffFilter === 'medium' && $time < 20) continue;
            if ($diffFilter === 'hard'   && $time < 60) continue;
            $recipes[] = spoonNormalize($r);
        }

        jsonResponse(['recipes' => $recipes, 'count' => count($recipes)]);

    } else {
        # default list: spoonacular has no "all recipes" endpoint, so we use random for variety
        $count = isset($_GET['number']) ? max(1, min(20, intval($_GET['number']))) : 12;

        $data = spoonGet('/recipes/random', ['number' => $count]);

        $recipes = [];
        foreach (($data['recipes'] ?? []) as $r) {
            $recipes[] = spoonNormalize($r);
        }

        jsonResponse(['recipes' => $recipes, 'count' => count($recipes)]);
    }
}
?>
