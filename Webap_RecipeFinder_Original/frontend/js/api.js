// api.js - wrapper functions for every backend API endpoint

const SPOON_BASE = API_BASE + 'spoonacular/'; // base path for all spoonacular endpoints

// fetches all difficulty levels and calls the callback with the result
function apiFetchDifficulties(callback) {
    $.getJSON(API_BASE + 'difficulty.php', callback); // $.getJSON sends a GET request and parses the response as JSON
}

// fetches all ingredients; calls callback on success, failCallback on error
function apiFetchIngredients(callback, failCallback) {
    $.getJSON(API_BASE + 'ingredients.php', callback).fail(failCallback);
}

// fetches up to 3 local recipes that use the given ingredient ID
function apiFetchIngredientRecipeExamples(ingredientId, callback, failCallback) {
    $.getJSON(API_BASE + 'ingredient-recipes.php?id=' + ingredientId, callback).fail(failCallback);
}

// fetches all categories and calls the callback with the result
function apiFetchCategories(callback) {
    $.getJSON(API_BASE + 'categories.php', callback);
}

// fetches recipes with optional filters (category ID, difficulty ID, or a list of IDs)
function apiFetchRecipes(params, callback, failCallback) {
    let url = API_BASE + 'recipes.php';
    const queryParams = []; // builds the query string piece by piece
    if (params.category)   queryParams.push('category='   + params.category);
    if (params.difficulty) queryParams.push('difficulty=' + params.difficulty);
    if (params.ids)        queryParams.push('ids='        + params.ids); // comma-separated list of recipe IDs
    if (queryParams.length > 0) url += '?' + queryParams.join('&'); // joins all params with & (e.g. ?category=1&difficulty=2)
    $.getJSON(url, callback).fail(failCallback);
}

// fetches the full details for one recipe by its ID
function apiFetchRecipeDetail(recipeId, callback, failCallback) {
    $.ajax({ url: API_BASE + 'recipes.php?id=' + recipeId, type: 'GET', dataType: 'json', success: callback, error: failCallback });
}

// fetches recipes that are similar to the given recipe (based on shared ingredients)
function apiFetchSimilarRecipes(recipeId, callback) {
    $.getJSON(API_BASE + 'similar.php?id=' + recipeId, callback);
}

// fetches recipes that contain ALL of the selected ingredients (comma-separated IDs)
function apiFetchFilterByIngredients(ingredientsStr, callback, failCallback) {
    $.getJSON(API_BASE + 'filter.php?ingredients=' + ingredientsStr, callback).fail(failCallback);
}

// fetches recipes whose name or description matches the search term
function apiFetchSearch(searchTerm, callback) {
    $.getJSON(API_BASE + 'search.php?q=' + encodeURIComponent(searchTerm), callback); // encodeURIComponent makes the search term safe to put in a URL
}

// fetches the ID of a single randomly selected recipe
function apiFetchRandom(callback, failCallback) {
    $.getJSON(API_BASE + 'random.php', callback).fail(failCallback);
}

// checks if the backend API is reachable and updates the status indicator on the page
function apiCheckStatus() {
    $.get(API_BASE + 'recipes.php')
        .done(() => $('#api-status').text('API Status: Connected ✓')) // updates the #api-status element on success
        .fail(() => $('#api-status').text('API Status: Error ✗'));    // updates it on failure
}

// ── Spoonacular wrappers ──────────────────────────────────────
// each one mirrors a local apiFetch* function but hits the spoonacular folder

// searches spoonacular recipes by name
function apiFetchSpoonSearch(searchTerm, callback, failCallback) {
    $.getJSON(SPOON_BASE + 'search.php?q=' + encodeURIComponent(searchTerm), callback).fail(failCallback);
}

// fetches a list of spoonacular recipes (uses /recipes/random under the hood)
function apiFetchSpoonRecipes(callback, failCallback) {
    $.getJSON(SPOON_BASE + 'recipes.php', callback).fail(failCallback);
}

// fetches the full details for one spoonacular recipe by its prefixed ID (e.g. "spoon-640921")
function apiFetchSpoonRecipeDetail(recipeId, callback, failCallback) {
    $.ajax({ url: SPOON_BASE + 'recipes.php?id=' + recipeId, type: 'GET', dataType: 'json', success: callback, error: failCallback });
}

// fetches a single random spoonacular recipe ID
function apiFetchSpoonRandom(callback, failCallback) {
    $.getJSON(SPOON_BASE + 'random.php', callback).fail(failCallback);
}

// fetches spoonacular recipes by a comma-separated list of ingredient NAMES
function apiFetchSpoonFilterByIngredients(ingredientNames, callback, failCallback) {
    $.getJSON(SPOON_BASE + 'filter.php?ingredients=' + encodeURIComponent(ingredientNames), callback).fail(failCallback);
}

// adds source/id fields to a local recipe object so it matches the spoonacular shape
function tagLocalRecipe(r) {
    if (!r.source) r.source = 'local';
    if (!r.id)     r.id     = 'local-' + r.pk_recipes;
}

// wraps a jQuery deferred so it always resolves (never rejects), turning failures into empty results
// this prevents $.when from short-circuiting when one of the parallel requests fails
function safeReq(deferred) {
    return deferred.then(
        function (data) { return data; },
        function ()     { return { recipes: [] }; }
    );
}

// runs both local and spoonacular search in parallel and merges the results
// callback receives a single { count, search_term, recipes } object with both sources
function apiFetchSearchCombined(searchTerm, callback) {
    const localReq = safeReq($.getJSON(API_BASE + 'search.php?q=' + encodeURIComponent(searchTerm)));
    const spoonReq = safeReq($.getJSON(SPOON_BASE + 'search.php?q=' + encodeURIComponent(searchTerm)));

    $.when(localReq, spoonReq).done(function (localData, spoonData) {
        const localRecipes = (localData && localData.recipes) ? localData.recipes : [];
        const spoonRecipes = (spoonData && spoonData.recipes) ? spoonData.recipes : [];

        localRecipes.forEach(tagLocalRecipe);
        const merged = localRecipes.concat(spoonRecipes);
        callback({ count: merged.length, search_term: searchTerm, recipes: merged });
    });
}

// fetches a list of local + spoonacular recipes in parallel and merges them
// passes category/difficulty filters to BOTH endpoints (spoonacular maps them internally)
function apiFetchRecipesCombined(params, callback, failCallback) {
    let localUrl = API_BASE + 'recipes.php';
    let spoonUrl = SPOON_BASE + 'recipes.php';
    const queryParams = [];
    if (params.category)   queryParams.push('category='   + params.category);
    if (params.difficulty) queryParams.push('difficulty=' + params.difficulty);
    if (queryParams.length > 0) {
        const qs = '?' + queryParams.join('&');
        localUrl += qs;
        spoonUrl += qs;
    }

    const localReq = safeReq($.getJSON(localUrl));
    const spoonReq = safeReq($.getJSON(spoonUrl));

    $.when(localReq, spoonReq).done(function (localData, spoonData) {
        const localRecipes = (localData && localData.recipes) ? localData.recipes : [];
        const spoonRecipes = (spoonData && spoonData.recipes) ? spoonData.recipes : [];

        if (localRecipes.length === 0 && spoonRecipes.length === 0 && failCallback) {
            failCallback();
            return;
        }

        localRecipes.forEach(tagLocalRecipe);
        const merged = localRecipes.concat(spoonRecipes);
        callback({ count: merged.length, recipes: merged });
    });
}

// loads recipes for a list of prefixed IDs (used for favorites)
// splits the IDs by source, fetches each source separately, and merges
function apiFetchRecipesByIds(prefixedIds, callback) {
    const localIds = prefixedIds.filter(id => String(id).startsWith('local-')).map(id => id.replace('local-', ''));
    const spoonIds = prefixedIds.filter(id => String(id).startsWith('spoon-'));

    const reqs = [];
    if (localIds.length > 0) {
        reqs.push(safeReq($.getJSON(API_BASE + 'recipes.php?ids=' + localIds.join(','))));
    }
    spoonIds.forEach(id => {
        reqs.push(safeReq($.getJSON(SPOON_BASE + 'recipes.php?id=' + id)));
    });

    if (reqs.length === 0) {
        callback({ count: 0, recipes: [] });
        return;
    }

    $.when.apply($, reqs).done(function () {
        const results = (reqs.length === 1) ? [arguments[0]] : Array.prototype.slice.call(arguments);
        const recipes = [];

        results.forEach(data => {
            if (!data) return;
            if (data.recipes) {
                data.recipes.forEach(r => { tagLocalRecipe(r); recipes.push(r); });
            } else if (data.id) {
                recipes.push(data); // single spoonacular detail
            }
        });

        callback({ count: recipes.length, recipes: recipes });
    });
}

// fetches one recipe's detail by prefixed ID, routing to the right backend
function apiFetchRecipeDetailById(prefixedId, callback, failCallback) {
    if (String(prefixedId).startsWith('spoon-')) {
        apiFetchSpoonRecipeDetail(prefixedId, callback, failCallback);
    } else {
        const numericId = String(prefixedId).replace('local-', '');
        apiFetchRecipeDetail(numericId, function (recipe) {
            tagLocalRecipe(recipe);
            callback(recipe);
        }, failCallback);
    }
}
