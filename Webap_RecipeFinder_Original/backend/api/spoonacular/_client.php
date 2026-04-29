<?php
# shared helper for all spoonacular endpoints: HTTP call + response normalizer

require_once __DIR__ . '/../../config/api_keys.php'; # loads SPOONACULAR_KEY constant
require_once __DIR__ . '/../../db.php';                  # gives us jsonResponse()

# does the actual HTTP call to spoonacular and returns the decoded JSON;
# sends a 502 and stops if the request fails
function spoonGet($path, $params = []) {
    $params['apiKey'] = SPOONACULAR_KEY;
    $url = 'https://api.spoonacular.com' . $path . '?' . http_build_query($params);

    # use cURL when available for proper error handling; fall back to file_get_contents
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body === false || $code >= 400) {
            jsonResponse(['error' => 'Spoonacular request failed', 'code' => $code], 502);
        }
    } else {
        $body = @file_get_contents($url);
        if ($body === false) {
            jsonResponse(['error' => 'Spoonacular unreachable'], 502);
        }
    }

    return json_decode($body, true);
}

# maps a category name to an emoji icon (mirrors your local categories.json)
function spoonIcon($cat) {
    $map = [
        'dessert'      => '🍰',
        'main course'  => '🍽️',
        'side dish'    => '🥄',
        'salad'        => '🥗',
        'soup'         => '🍲',
        'breakfast'    => '🥐',
        'snack'        => '🍿',
        'appetizer'    => '🥟',
        'beverage'     => '🥤',
        'drink'        => '🥤',
        'sauce'        => '🥫',
        'bread'        => '🍞'
    ];
    return $map[strtolower($cat)] ?? '🍽️';
}

# converts prep time in minutes to a difficulty label + star rating
# (mirrors the structure of your local difficulties.json)
function spoonDifficulty($min) {
    if ($min < 20) return ['Easy',   '⭐'];
    if ($min < 60) return ['Medium', '⭐⭐'];
    return                ['Hard',   '⭐⭐⭐'];
}

# strips HTML tags and collapses whitespace, returns the full clean text
function spoonStripHtml($html) {
    return trim(preg_replace('/\s+/', ' ', strip_tags($html ?? '')));
}

# strips HTML tags and trims to ~160 chars at a word boundary, adds an ellipsis
function spoonShorten($html, $len = 160) {
    $txt = spoonStripHtml($html);
    if (mb_strlen($txt) <= $len) return $txt;
    $cut = mb_substr($txt, 0, $len);
    $pos = mb_strrpos($cut, ' ');
    if ($pos === false) $pos = $len;
    return mb_substr($cut, 0, $pos) . '…';
}

# joins analyzedInstructions steps into "1. ... 2. ..." like local recipes,
# falls back to the plain instructions field if no steps are available
function spoonInstructions($r) {
    $steps = $r['analyzedInstructions'][0]['steps'] ?? [];
    if (empty($steps)) {
        return trim(strip_tags($r['instructions'] ?? ''));
    }
    $out = [];
    foreach ($steps as $s) {
        $out[] = $s['number'] . '. ' . trim($s['step']);
    }
    return implode("\n", $out);
}

# turns one spoonacular recipe into the same shape as a local recipe
# $full = true includes ingredients[] and instructions (used for detail view)
function spoonNormalize($r, $full = false) {
    $cat = $r['dishTypes'][0] ?? 'Unknown';
    [$dif, $stars] = spoonDifficulty($r['readyInMinutes'] ?? 60);

    $ingredients = [];
    foreach (($r['extendedIngredients'] ?? []) as $ing) {
        $ingredients[] = [
            'name'     => $ing['name'] ?? ($ing['original'] ?? ''),
            'category' => !empty($ing['aisle']) ? $ing['aisle'] : 'Other',
            'amount'   => $ing['amount'] ?? null,
            'unit'     => $ing['unit'] ?? ''
        ];
    }

    return [
        'id'               => 'spoon-' . $r['id'],
        'source'           => 'spoonacular',
        'name'             => $r['title'] ?? '',
        'description'      => $full ? spoonStripHtml($r['summary'] ?? '') : spoonShorten($r['summary'] ?? ''),
        'imageUrl'         => $r['image'] ?? '',
        'preparationTime'  => ($r['readyInMinutes'] ?? '?') . ' min',
        'category'         => $cat,
        'categoryName'     => ucfirst($cat),
        'categoryIcon'     => spoonIcon($cat),
        'difficulty'       => $dif,
        'difficultyName'   => $dif,
        'difficultyStars'  => $stars,
        'ingredient_count' => count($ingredients),
        'ingredients'      => $full ? $ingredients : [],
        'instructions'     => $full ? spoonInstructions($r) : '',
        'sourceUrl'        => $r['sourceUrl'] ?? ('https://spoonacular.com/recipes/' . urlencode($r['title'] ?? '') . '-' . $r['id'])
    ];
}
?>
