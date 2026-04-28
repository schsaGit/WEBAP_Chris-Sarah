// api.js - wrapper functions for every backend API endpoint

// fetches all difficulty levels and calls the callback with the result
function apiFetchDifficulties(callback) {
    $.getJSON(API_BASE + 'difficulty.php', callback); // $.getJSON sends a GET request and parses the response as JSON
}

// fetches all ingredients; calls callback on success, failCallback on error
function apiFetchIngredients(callback, failCallback) {
    $.getJSON(API_BASE + 'ingredients.php', callback).fail(failCallback);
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
