<?php
# returns the ID of one randomly chosen spoonacular recipe
# mirrors local random.php (which returns { pk_recipes: ... })

require_once __DIR__ . '/_client.php';

$data = spoonGet('/recipes/random', ['number' => 1]);

if (empty($data['recipes'][0])) {
    jsonResponse(['error' => 'No recipes found'], 404);
}

$r = $data['recipes'][0];

# returns the prefixed ID so the frontend can route detail calls to the right endpoint
jsonResponse([
    'id'   => 'spoon-' . $r['id'],
    'name' => $r['title'] ?? ''
]);
?>
