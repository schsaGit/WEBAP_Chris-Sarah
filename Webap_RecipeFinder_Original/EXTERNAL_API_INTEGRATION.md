# External API Integration Guide
## Spoonacular + CalorieNinjas

This guide describes how to add **Spoonacular** and **CalorieNinjas** as additional recipe
sources to the existing Recipe Finder project. The integration follows the same code style
already used in the project: procedural PHP with `mysqli_*`, the shared helpers in
`db.php` (`connectDB`, `jsonResponse`, `loadJsonFile`), and jQuery `$.getJSON` on the
frontend.

YouTube integration is intentionally **not** included here and will be added later.

---

## 1. Goal

External recipes from Spoonacular and CalorieNinjas should behave **exactly like local
recipes**:

- They appear as clickable cards in the recipe list.
- They appear in search results next to local recipes.
- Clicking a card opens the same detail view.
- Filtering by ingredients also queries the external APIs.

To distinguish the source, every recipe gets a **prefixed ID**:

| ID format         | Source        |
|-------------------|---------------|
| `local-5`         | Own database  |
| `spoon-715769`    | Spoonacular   |
| `cnj-pasta-pesto` | CalorieNinjas |

---

## 2. New folder + file structure

Only **new** files are listed. Existing files are modified separately (section 6).

```
backend/
├── config/
│   ├── api_keys.php             ← NEW (gitignored)
│   └── api_keys.example.php     ← NEW (template, committed)
├── services/
│   ├── http.php                 ← NEW (shared HTTP helper using cURL)
│   ├── spoonacular.php          ← NEW (Spoonacular API wrapper)
│   ├── calorieninjas.php        ← NEW (CalorieNinjas API wrapper)
│   └── normalizer.php           ← NEW (unified recipe shape)
└── api/
    └── recipe.php               ← NEW (unified detail endpoint)
```

Add to `.gitignore`:
```
backend/config/api_keys.php
```

---

## 3. API keys (Backend only — never frontend!)

### `backend/config/api_keys.example.php`

```php
<?php
# template for required API keys
# copy this file to api_keys.php and fill in your real keys

define('SPOONACULAR_KEY',    ''); # https://spoonacular.com/food-api
define('CALORIENINJAS_KEY',  ''); # https://calorieninjas.com/api
?>
```

### `backend/config/api_keys.php`  (gitignored, real values)

```php
<?php
# real API keys - DO NOT COMMIT THIS FILE
# this file is loaded only by backend services

define('SPOONACULAR_KEY',    'your_spoonacular_key_here');
define('CALORIENINJAS_KEY',  'your_calorieninjas_key_here');
?>
```

---

## 4. Shared HTTP helper

External APIs are called via cURL. To keep the call logic short in the service files,
a small helper is added.

### `backend/services/http.php`

```php
<?php
# shared HTTP helper for external API calls (uses cURL)
# returns the decoded JSON array, or null on error

function httpGetJson($url, $headers = []) {
    $ch = curl_init($url);                                      # opens a new cURL session
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);             # returns the response as a string instead of printing it
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);                      # max 10 seconds, then it gives up
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);         # sets request headers (e.g. X-Api-Key)
    }
    $response = curl_exec($ch);                                 # actually performs the request
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);          # gets the HTTP status code (e.g. 200, 404)
    curl_close($ch);                                            # closes the session

    if ($status !== 200 || $response === false) {
        return null;                                            # call failed - we return null and let the caller decide
    }
    return json_decode($response, true);                        # converts JSON string into a PHP array
}
?>
```

---

## 5. Service wrappers

Each service file exposes simple functions that other endpoints can call. They all
**normalize** their result into the project's unified recipe shape (see section 5.4).

---

### 5.1 Spoonacular service

Key endpoints used:
- `GET /recipes/complexSearch?query=...` (text search + filters)
- `GET /recipes/{id}/information` (single recipe details)
- `GET /recipes/findByIngredients?ingredients=a,b,c` (filter by ingredient names)
- `GET /recipes/random?number=1` (random recipe)

### `backend/services/spoonacular.php`

```php
<?php
# wrapper for the Spoonacular API
# all functions return arrays in the project's unified recipe shape (see normalizer.php)

require_once __DIR__ . '/../config/api_keys.php';
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/normalizer.php';

# searches Spoonacular by text query and returns up to $limit recipes
function spoonacularSearch($query, $limit = 10) {
    $url = 'https://api.spoonacular.com/recipes/complexSearch'
         . '?query='     . urlencode($query)
         . '&number='    . intval($limit)
         . '&addRecipeInformation=true'                         # asks the API to include extra fields (image, summary, etc.)
         . '&apiKey='    . SPOONACULAR_KEY;

    $data = httpGetJson($url);
    if (!$data || !isset($data['results'])) return [];

    $recipes = [];
    foreach ($data['results'] as $row) {
        $recipes[] = normalizeSpoonacularRecipe($row);          # converts each entry to the unified shape
    }
    return $recipes;
}

# fetches the full details of one Spoonacular recipe by its numeric Spoonacular ID
function spoonacularGetById($spoonId) {
    $url = 'https://api.spoonacular.com/recipes/' . intval($spoonId) . '/information'
         . '?includeNutrition=false'
         . '&apiKey='    . SPOONACULAR_KEY;

    $data = httpGetJson($url);
    if (!$data) return null;

    return normalizeSpoonacularRecipe($data, true);             # second arg = include ingredient details
}

# searches recipes by ingredient names (comma-separated string like "tomato,chicken,garlic")
function spoonacularByIngredients($ingredientsStr, $limit = 10) {
    $url = 'https://api.spoonacular.com/recipes/findByIngredients'
         . '?ingredients=' . urlencode($ingredientsStr)
         . '&number='      . intval($limit)
         . '&ranking=1'                                         # 1 = maximize used ingredients
         . '&apiKey='      . SPOONACULAR_KEY;

    $data = httpGetJson($url);
    if (!is_array($data)) return [];

    $recipes = [];
    foreach ($data as $row) {
        $recipes[] = normalizeSpoonacularRecipe($row);
    }
    return $recipes;
}

# returns one random recipe from Spoonacular (used by random.php)
function spoonacularRandom() {
    $url = 'https://api.spoonacular.com/recipes/random'
         . '?number=1'
         . '&apiKey=' . SPOONACULAR_KEY;

    $data = httpGetJson($url);
    if (!$data || empty($data['recipes'])) return null;

    return normalizeSpoonacularRecipe($data['recipes'][0], true);
}
?>
```

---

### 5.2 CalorieNinjas service

CalorieNinjas requires the key in a header: `X-Api-Key: ...`

Key endpoints used:
- `GET /v1/recipe?query=...` (recipe search)
- `GET /v1/nutrition?query=...` (nutrition info per ingredient string)

### `backend/services/calorieninjas.php`

```php
<?php
# wrapper for the CalorieNinjas API
# search returns recipes; nutrition returns calories/protein/fat/carbs for any ingredient text

require_once __DIR__ . '/../config/api_keys.php';
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/normalizer.php';

# searches CalorieNinjas recipes by text query and returns up to $limit results
function calorieninjasSearch($query, $limit = 10) {
    $url = 'https://api.calorieninjas.com/v1/recipe?query=' . urlencode($query);

    $headers = ['X-Api-Key: ' . CALORIENINJAS_KEY];             # CalorieNinjas wants the key in a header, not in the URL
    $data = httpGetJson($url, $headers);
    if (!is_array($data)) return [];

    $recipes = [];
    $count   = 0;
    foreach ($data as $row) {
        if ($count >= $limit) break;                            # CalorieNinjas does not have a built-in limit, so we cap it ourselves
        $recipes[] = normalizeCalorieNinjasRecipe($row);
        $count++;
    }
    return $recipes;
}

# fetches a single CalorieNinjas recipe by its slug (the part after "cnj-" in the prefixed ID)
# CalorieNinjas has no real ID, so we re-search and pick the first result whose slug matches
function calorieninjasGetBySlug($slug) {
    $query = str_replace('-', ' ', $slug);                      # turns "italian-wedding-soup" back into "italian wedding soup"
    $results = calorieninjasSearch($query, 5);
    foreach ($results as $r) {
        if ($r['id'] === 'cnj-' . $slug) return $r;             # exact match wins
    }
    return $results[0] ?? null;                                 # fallback to first result if no exact match
}

# returns nutrition info for any ingredient text (e.g. "200g chicken, 1 cup rice")
# used to enrich any recipe (local, spoonacular, or cnj) with nutrition data
function calorieninjasNutrition($ingredientsText) {
    $url = 'https://api.calorieninjas.com/v1/nutrition?query=' . urlencode($ingredientsText);

    $headers = ['X-Api-Key: ' . CALORIENINJAS_KEY];
    $data = httpGetJson($url, $headers);
    if (!$data || !isset($data['items'])) return null;

    # sums up the per-ingredient values into one total per nutrient
    $total = ['calories' => 0, 'protein_g' => 0, 'fat_total_g' => 0, 'carbohydrates_total_g' => 0];
    foreach ($data['items'] as $item) {
        $total['calories']              += floatval($item['calories']              ?? 0);
        $total['protein_g']             += floatval($item['protein_g']             ?? 0);
        $total['fat_total_g']           += floatval($item['fat_total_g']           ?? 0);
        $total['carbohydrates_total_g'] += floatval($item['carbohydrates_total_g'] ?? 0);
    }
    return $total;
}
?>
```

---

### 5.3 Normalizer — the unified recipe shape

All three sources end up in the same shape so the frontend can render them with one
single template. This is the **core of the merge**.

### Unified recipe shape

```json
{
  "id": "local-5" | "spoon-715769" | "cnj-pasta-pesto",
  "source": "local" | "spoonacular" | "calorieninjas",
  "name": "Pasta Carbonara",
  "description": "Creamy Italian classic...",
  "imageUrl": "https://...",
  "preparationTime": "30 min",
  "category": "Main Course",
  "categoryIcon": "🍽️",
  "difficulty": "Medium",
  "difficultyStars": "★★",
  "ingredient_count": 6,
  "ingredients": [
    { "name": "Pasta",  "amount": "200", "unit": "g",       "category": "Pasta" },
    { "name": "Bacon",  "amount": "100", "unit": "g",       "category": "Meat"  }
  ]
}
```

### `backend/services/normalizer.php`

```php
<?php
# converts each external API's response into the project's unified recipe shape
# the frontend can then render any source with a single template

# converts a Spoonacular API response row into the unified shape
# $detailed = true means the row contains ingredient details (from /recipes/{id}/information)
function normalizeSpoonacularRecipe($row, $detailed = false) {
    $ingredients = [];
    if ($detailed && isset($row['extendedIngredients'])) {
        foreach ($row['extendedIngredients'] as $ing) {
            $ingredients[] = [
                'name'     => $ing['name']        ?? '',
                'amount'   => isset($ing['amount']) ? strval($ing['amount']) : '',
                'unit'     => $ing['unit']        ?? '',
                'category' => $ing['aisle']       ?? 'Other'    # Spoonacular uses "aisle" (e.g. "Produce")
            ];
        }
    }

    return [
        'id'                => 'spoon-' . $row['id'],
        'source'            => 'spoonacular',
        'name'              => $row['title']                       ?? '',
        'description'       => strip_tags($row['summary']          ?? ''),  # Spoonacular summary is HTML, we strip tags
        'imageUrl'          => $row['image']                       ?? '',
        'preparationTime'   => isset($row['readyInMinutes']) ? $row['readyInMinutes'] . ' min' : '',
        'category'          => $row['dishTypes'][0]                ?? 'External',
        'categoryIcon'      => '🥄',                                # spoonacular badge
        'difficulty'        => '',                                  # not provided
        'difficultyStars'   => '',
        'ingredient_count'  => count($ingredients),
        'ingredients'       => $ingredients
    ];
}

# converts a CalorieNinjas API response row into the unified shape
# CalorieNinjas returns ingredients as a single text string - we split on commas
function normalizeCalorieNinjasRecipe($row) {
    $ingredients     = [];
    $ingredientsText = $row['ingredients'] ?? '';
    if (!empty($ingredientsText)) {
        $parts = explode(',', $ingredientsText);                   # splits the text on commas
        foreach ($parts as $p) {
            $p = trim($p);
            if ($p !== '') {
                $ingredients[] = [
                    'name'     => $p,                              # the whole text (CalorieNinjas does not separate amount/unit)
                    'amount'   => '',
                    'unit'     => '',
                    'category' => 'Other'
                ];
            }
        }
    }

    $title = $row['title'] ?? 'Unknown Recipe';
    $slug  = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));   # turns "Italian Wedding Soup" into "italian-wedding-soup"
    $slug  = trim($slug, '-');

    return [
        'id'                => 'cnj-' . $slug,
        'source'            => 'calorieninjas',
        'name'              => $title,
        'description'       => $row['instructions'] ?? '',
        'imageUrl'          => '',                                 # CalorieNinjas does not provide images
        'preparationTime'   => isset($row['servings']) ? $row['servings'] : '',
        'category'          => 'External',
        'categoryIcon'      => '🥗',
        'difficulty'        => '',
        'difficultyStars'   => '',
        'ingredient_count'  => count($ingredients),
        'ingredients'       => $ingredients
    ];
}

# converts a local DB recipe row (already enriched with category/difficulty from JSON)
# into the unified shape - this matches what recipes.php already produces
function normalizeLocalRecipe($row) {
    return [
        'id'                => 'local-' . $row['pk_recipes'],
        'source'            => 'local',
        'name'              => $row['name']            ?? '',
        'description'       => $row['description']     ?? '',
        'imageUrl'          => $row['imageUrl']        ?? '',
        'preparationTime'   => isset($row['preparationTime']) ? $row['preparationTime'] . ' min' : '',
        'category'          => $row['categoryName']    ?? 'Unknown',
        'categoryIcon'      => $row['categoryIcon']    ?? '🍽️',
        'difficulty'        => $row['difficultyName']  ?? '',
        'difficultyStars'   => $row['difficultyStars'] ?? '',
        'ingredient_count'  => intval($row['ingredient_count'] ?? 0),
        'ingredients'       => $row['ingredients']     ?? []
    ];
}
?>
```

---

## 6. Existing endpoints — what changes

The existing endpoints stay backward-compatible: by default they still return only
local data. A new optional query parameter `source` controls whether external sources
are merged in.

| `source` value         | Behavior                                  |
|------------------------|-------------------------------------------|
| (omitted) or `local`   | Only DB results (current behavior)         |
| `all`                  | DB + Spoonacular + CalorieNinjas           |
| `spoonacular`          | Only Spoonacular                           |
| `calorieninjas`        | Only CalorieNinjas                         |

---

### 6.1 `backend/api/search.php` — add external sources

At the **end** of the file, before sending the response, merge external recipes if
`source=all` (or a specific external one) was requested. The local search logic stays
exactly as it is.

Add **after** the existing `while ($row = mysqli_fetch_assoc($result))` loop:

```php
# new: merge external API results if the user asked for them
$source = isset($_GET['source']) ? $_GET['source'] : 'local';

if ($source === 'all' || $source === 'spoonacular') {
    require_once '../services/spoonacular.php';
    $external = spoonacularSearch($search, 10);                 # uses the same search term
    foreach ($external as $r) { $recipes[] = $r; }              # append to the same array
}

if ($source === 'all' || $source === 'calorieninjas') {
    require_once '../services/calorieninjas.php';
    $external = calorieninjasSearch($search, 10);
    foreach ($external as $r) { $recipes[] = $r; }
}
```

The local rows already carry the keys (`name`, `description`, `categoryName`, ...) the
frontend uses. To keep the frontend simple, also wrap each local row through
`normalizeLocalRecipe()` so all entries have the unified shape:

```php
require_once '../services/normalizer.php';
# ... after local loop, replace push with:
$recipes[] = normalizeLocalRecipe($row);
```

---

### 6.2 `backend/api/recipes.php` — add external sources to list view

Same approach: only the **list** branch (no `?id=` given) gets the new merging logic.
The detail branch (`?id=...`) keeps its existing DB logic — the unified detail call
goes through the new `recipe.php` (section 6.4).

Inside the `else` branch (list mode), after building `$recipes`:

```php
$source = isset($_GET['source']) ? $_GET['source'] : 'local';

if ($source === 'all' || $source === 'spoonacular') {
    require_once '../services/spoonacular.php';
    $query = isset($_GET['q']) ? $_GET['q'] : 'main course';    # Spoonacular needs a query, fallback string
    foreach (spoonacularSearch($query, 10) as $r) $recipes[] = $r;
}

if ($source === 'all' || $source === 'calorieninjas') {
    require_once '../services/calorieninjas.php';
    $query = isset($_GET['q']) ? $_GET['q'] : 'recipe';
    foreach (calorieninjasSearch($query, 10) as $r) $recipes[] = $r;
}
```

---

### 6.3 `backend/api/filter.php` — extend ingredient filter

Spoonacular's `findByIngredients` is a perfect match for filter.php. Map the selected
ingredient IDs back to their **names** (already done in `filter.php` indirectly via the
JOIN), then pass them as a comma-separated string.

After the existing local loop, add:

```php
$source = isset($_GET['source']) ? $_GET['source'] : 'local';

if ($source === 'all' || $source === 'spoonacular') {
    # turn the selected ingredient IDs into a list of names so Spoonacular understands them
    $nameQuery = "SELECT name FROM ingredients WHERE pk_ingredients IN ($ingredientIds)";
    $nameRes   = mysqli_query($conn, $nameQuery);
    $names     = [];
    while ($n = mysqli_fetch_assoc($nameRes)) { $names[] = $n['name']; }
    $namesStr  = implode(',', $names);

    require_once '../services/spoonacular.php';
    foreach (spoonacularByIngredients($namesStr, 10) as $r) $recipes[] = $r;
}
```

CalorieNinjas does not have an ingredient-based search, so it is skipped here.

---

### 6.4 `backend/api/recipe.php` — NEW unified detail endpoint

This new endpoint replaces the `?id=` branch of `recipes.php` for the frontend detail
view. It looks at the prefix of the requested ID and dispatches to the right source.

### `backend/api/recipe.php`

```php
<?php
# unified detail endpoint - works for local, spoonacular and calorieninjas recipes
# example calls:
#   GET /api/recipe.php?id=local-5
#   GET /api/recipe.php?id=spoon-715769
#   GET /api/recipe.php?id=cnj-italian-wedding-soup

require_once '../db.php';                                       # connectDB, jsonResponse, loadJsonFile
require_once '../services/normalizer.php';

if (!isset($_GET['id'])) {
    jsonResponse(['error' => 'Recipe ID required'], 400);       # must include ?id=...
}

$rawId = $_GET['id'];

# splits "local-5" into ["local", "5"], or "cnj-italian-wedding-soup" into ["cnj", "italian-wedding-soup"]
$dashPos = strpos($rawId, '-');
if ($dashPos === false) {
    jsonResponse(['error' => 'Invalid recipe ID format'], 400);
}
$prefix = substr($rawId, 0, $dashPos);
$rest   = substr($rawId, $dashPos + 1);

# ---------- local DB recipe ----------
if ($prefix === 'local') {
    $conn = connectDB();
    $recipeId = intval($rest);

    $query  = "SELECT * FROM recipes WHERE pk_recipes = $recipeId";
    $result = mysqli_query($conn, $query);

    if (!$result || !($row = mysqli_fetch_assoc($result))) {
        jsonResponse(['error' => 'Recipe not found'], 404);
    }

    # enrich with JSON files (same logic as recipes.php?id=)
    $categoriesData   = loadJsonFile('categories.json');
    $difficultiesData = loadJsonFile('difficulties.json');

    $row['categoryName']    = isset($categoriesData[$row['category']]['name'])     ? $categoriesData[$row['category']]['name']     : 'Unknown';
    $row['categoryIcon']    = isset($categoriesData[$row['category']]['icon'])     ? $categoriesData[$row['category']]['icon']     : '';
    $row['difficultyName']  = isset($difficultiesData[$row['difficulty']]['name']) ? $difficultiesData[$row['difficulty']]['name'] : 'Unknown';
    $row['difficultyStars'] = isset($difficultiesData[$row['difficulty']]['stars'])? $difficultiesData[$row['difficulty']]['stars']: '';

    # load ingredients via the same JOIN used in recipes.php
    $ingredientQuery = "
        SELECT i.pk_ingredients, i.name, i.category, inc.amount, inc.unit
        FROM includes inc
        JOIN ingredients i ON inc.pkfk_ingredient = i.pk_ingredients
        WHERE inc.pkfk_recipe = $recipeId
        ORDER BY i.category, i.name
    ";
    $ingredientResult   = mysqli_query($conn, $ingredientQuery);
    $row['ingredients'] = [];
    while ($ing = mysqli_fetch_assoc($ingredientResult)) {
        $row['ingredients'][] = [
            'name'     => $ing['name'],
            'amount'   => $ing['amount'],
            'unit'     => $ing['unit'],
            'category' => !empty($ing['category']) ? $ing['category'] : 'Other'
        ];
    }
    $row['ingredient_count'] = count($row['ingredients']);

    $unified = normalizeLocalRecipe($row);

    # bonus merge: enrich any recipe with CalorieNinjas nutrition
    require_once '../services/calorieninjas.php';
    $ingredientsText = '';
    foreach ($row['ingredients'] as $ing) {
        $ingredientsText .= $ing['amount'] . ' ' . $ing['unit'] . ' ' . $ing['name'] . ', ';
    }
    $unified['nutrition'] = calorieninjasNutrition(rtrim($ingredientsText, ', '));

    jsonResponse($unified);
    mysqli_close($conn);
}

# ---------- spoonacular recipe ----------
elseif ($prefix === 'spoon') {
    require_once '../services/spoonacular.php';
    $unified = spoonacularGetById($rest);
    if (!$unified) jsonResponse(['error' => 'Spoonacular recipe not found'], 404);

    # bonus merge: also fetch nutrition via CalorieNinjas
    require_once '../services/calorieninjas.php';
    $ingredientsText = '';
    foreach ($unified['ingredients'] as $ing) {
        $ingredientsText .= $ing['amount'] . ' ' . $ing['unit'] . ' ' . $ing['name'] . ', ';
    }
    $unified['nutrition'] = calorieninjasNutrition(rtrim($ingredientsText, ', '));

    jsonResponse($unified);
}

# ---------- calorieninjas recipe ----------
elseif ($prefix === 'cnj') {
    require_once '../services/calorieninjas.php';
    $unified = calorieninjasGetBySlug($rest);
    if (!$unified) jsonResponse(['error' => 'CalorieNinjas recipe not found'], 404);

    # the recipe text already lists ingredients - re-use that for the nutrition call
    $ingredientsText = '';
    foreach ($unified['ingredients'] as $ing) {
        $ingredientsText .= $ing['name'] . ', ';
    }
    $unified['nutrition'] = calorieninjasNutrition(rtrim($ingredientsText, ', '));

    jsonResponse($unified);
}

else {
    jsonResponse(['error' => 'Unknown source prefix: ' . $prefix], 400);
}
?>
```

---

### 6.5 `backend/api/random.php` — optional source switch

Add `?source=` support so the random recipe can come from any source:

```php
$source = isset($_GET['source']) ? $_GET['source'] : 'local';

if ($source === 'spoonacular') {
    require_once '../services/spoonacular.php';
    $recipe = spoonacularRandom();
    if (!$recipe) jsonResponse(['error' => 'No recipe found'], 404);
    jsonResponse(['id' => $recipe['id']]);                      # frontend expects { id: "..." }
}
# else: keep the original DB random logic, but return prefixed id
$query  = "SELECT pk_recipes FROM recipes ORDER BY RAND() LIMIT 1";
$result = mysqli_query($conn, $query);
if ($row = mysqli_fetch_assoc($result)) {
    jsonResponse(['id' => 'local-' . $row['pk_recipes']]);
} else {
    jsonResponse(['error' => 'No recipes found'], 404);
}
```

---

## 7. Frontend changes

The HTML stays as-is. Only `js/api.js`, `js/recipes.js` and `js/detail.js` change.

---

### 7.1 `frontend/js/api.js`

Add a `source` parameter to existing wrappers, and add a new `apiFetchUnifiedDetail()`
that calls the new `recipe.php` endpoint.

```javascript
// fetches recipes with optional filters; pass source = 'all' to also include external APIs
function apiFetchRecipes(params, callback, failCallback) {
    let url = API_BASE + 'recipes.php';
    const queryParams = [];
    if (params.category)   queryParams.push('category='   + params.category);
    if (params.difficulty) queryParams.push('difficulty=' + params.difficulty);
    if (params.ids)        queryParams.push('ids='        + params.ids);
    if (params.source)     queryParams.push('source='     + params.source); // NEW
    if (params.q)          queryParams.push('q='          + encodeURIComponent(params.q)); // NEW (used by externals)
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    $.getJSON(url, callback).fail(failCallback);
}

// fetches recipes whose name or description matches the search term across all sources
function apiFetchSearch(searchTerm, callback, source) {
    const src = source || 'all';                                                // default: all sources
    $.getJSON(API_BASE + 'search.php?q=' + encodeURIComponent(searchTerm) + '&source=' + src, callback);
}

// fetches recipes that contain ALL selected ingredients across all sources
function apiFetchFilterByIngredients(ingredientsStr, callback, failCallback, source) {
    const src = source || 'all';
    $.getJSON(API_BASE + 'filter.php?ingredients=' + ingredientsStr + '&source=' + src, callback)
     .fail(failCallback);
}

// NEW: fetches a single recipe from any source via the unified detail endpoint
// recipeId is a prefixed string (e.g. "local-5", "spoon-715769", "cnj-italian-wedding-soup")
function apiFetchUnifiedDetail(recipeId, callback, failCallback) {
    $.ajax({
        url:      API_BASE + 'recipe.php?id=' + encodeURIComponent(recipeId),
        type:     'GET',
        dataType: 'json',
        success:  callback,
        error:    failCallback
    });
}
```

---

### 7.2 `frontend/js/recipes.js`

Two changes:

1. The recipe ID used in `data-id` attributes is now the **prefixed** string (e.g.
   `local-5`). The render loop should use `recipe.id` directly (not `recipe.pk_recipes`).
2. Each card shows a small **source badge** so the user can see where the recipe came from.

Render snippet:

```javascript
// renders one recipe card; works for local, spoonacular and calorieninjas because the shape is unified
function renderRecipeCard(recipe) {
    const badge = recipe.categoryIcon || '';                                     // category emoji from JSON / unified shape
    const sourceLabel = recipe.source === 'local'         ? '🏠 Local'
                      : recipe.source === 'spoonacular'   ? '🥄 Spoonacular'
                      : recipe.source === 'calorieninjas' ? '🥗 CalorieNinjas'
                      :                                     '';
    const image = recipe.imageUrl
        ? '<img src="' + recipe.imageUrl + '" alt="" style="width:100%;max-height:160px;object-fit:cover;">'
        : '';

    return `
        <div class="recipe-card" data-id="${recipe.id}" style="border:1px solid #ccc;padding:10px;margin-bottom:10px;cursor:pointer;">
            ${image}
            <h3>${badge} ${recipe.name}</h3>
            <p>${recipe.description || ''}</p>
            <small>${sourceLabel} · ${recipe.preparationTime || ''} · ${recipe.ingredient_count} ingredients</small>
        </div>
    `;
}
```

The click handler stays the same — but it now reads a string ID:

```javascript
$(document).on('click', '.recipe-card', function () {
    const recipeId = $(this).data('id');                                         // string, e.g. "spoon-715769"
    showRecipeDetail(recipeId);
});
```

---

### 7.3 `frontend/js/detail.js`

Replace the call to `apiFetchRecipeDetail` with the new unified call. The render code
hardly changes because the shape is unified; only nutrition is added.

```javascript
function showRecipeDetail(recipeId) {
    apiFetchUnifiedDetail(recipeId, function (recipe) {
        $('#recipes-section').hide();
        $('#detail-section').show();

        const ingredientsHtml = (recipe.ingredients || []).map(ing => `
            <li>${ing.amount} ${ing.unit} ${ing.name}</li>
        `).join('');

        const nutritionHtml = recipe.nutrition ? `
            <div class="nutrition-box" style="border:1px solid #ccc;padding:10px;margin-top:10px;">
                <h4>Nutrition (CalorieNinjas)</h4>
                <ul>
                    <li>Calories: ${Math.round(recipe.nutrition.calories)} kcal</li>
                    <li>Protein:  ${Math.round(recipe.nutrition.protein_g)} g</li>
                    <li>Fat:      ${Math.round(recipe.nutrition.fat_total_g)} g</li>
                    <li>Carbs:    ${Math.round(recipe.nutrition.carbohydrates_total_g)} g</li>
                </ul>
            </div>
        ` : '';

        const sourceLabel = recipe.source === 'local'         ? '🏠 Local'
                          : recipe.source === 'spoonacular'   ? '🥄 Spoonacular'
                          : recipe.source === 'calorieninjas' ? '🥗 CalorieNinjas'
                          :                                     '';

        $('#recipe-detail').html(`
            <small>${sourceLabel}</small>
            <h2>${recipe.categoryIcon} ${recipe.name}</h2>
            ${recipe.imageUrl ? '<img src="' + recipe.imageUrl + '" style="max-width:400px;">' : ''}
            <p>${recipe.description || ''}</p>
            <p><b>Time:</b> ${recipe.preparationTime || '—'} · <b>Difficulty:</b> ${recipe.difficulty || '—'} ${recipe.difficultyStars || ''}</p>
            <h3>Ingredients</h3>
            <ul>${ingredientsHtml}</ul>
            ${nutritionHtml}
        `);
    }, function () {
        $('#recipe-detail').html('<p>Could not load recipe.</p>');
    });
}
```

---

## 8. Implementation order

| # | Step                                             | Why first                            |
|---|--------------------------------------------------|--------------------------------------|
| 1 | `config/api_keys.example.php` + `.gitignore`     | foundation, no logic yet             |
| 2 | `services/http.php`                              | reused by both APIs                  |
| 3 | `services/normalizer.php`                        | defines the shape every call returns |
| 4 | `services/calorieninjas.php` (simpler)           | quick win, single key in header      |
| 5 | `services/spoonacular.php`                       | richer data                          |
| 6 | `api/recipe.php` (unified detail)                | enables clicking external recipes    |
| 7 | Modify `search.php` + `recipes.php` (list mode)  | external recipes appear in lists     |
| 8 | Modify `filter.php`                              | ingredient-based search works too    |
| 9 | Update `api.js` + `recipes.js` + `detail.js`     | frontend wires it all together       |

---

## 9. Testing checklist

- [ ] `api_keys.php` is **not** in git (`git status` should ignore it)
- [ ] `GET /api/recipes.php?source=all&q=pasta` returns local + Spoonacular + CalorieNinjas
- [ ] `GET /api/search.php?q=pasta&source=all` returns merged list
- [ ] `GET /api/recipe.php?id=local-5` returns a local recipe with nutrition
- [ ] `GET /api/recipe.php?id=spoon-715769` returns a Spoonacular recipe with nutrition
- [ ] `GET /api/recipe.php?id=cnj-italian-wedding-soup` returns a CalorieNinjas recipe
- [ ] Frontend list shows source badges
- [ ] Clicking any card opens the detail view (works for all 3 sources)
- [ ] Filter sidebar still filters local recipes; with `source=all`, Spoonacular results
      also appear (CalorieNinjas is skipped — no ingredient endpoint)

---

## 10. Notes & caveats

- **Free-tier limits**: Spoonacular = 150 requests/day, CalorieNinjas = 10 000/month.
  When testing, prefer cached results (Browser-Cache, F12 → Disable cache off).
- **Image fallback**: CalorieNinjas does not return images. Cards without an image use
  only the title and category badge — that already looks fine in the current style.
- **Ingredient amounts** for CalorieNinjas: the API only returns a long ingredient text
  string. We split on commas and put the whole string into `name`. Amount/unit stay
  empty. That's acceptable because the nutrition endpoint understands the raw text.
- **Backward compatibility**: Without `?source=`, all endpoints behave exactly as
  before. External APIs are only called when explicitly requested.
