// api.js - All backend API calls

function apiFetchDifficulties(callback) {
    $.getJSON(API_BASE + 'difficulty.php', callback);
}

function apiFetchIngredients(callback, failCallback) {
    $.getJSON(API_BASE + 'ingredients.php', callback).fail(failCallback);
}

function apiFetchCategories(callback) {
    $.getJSON(API_BASE + 'categories.php', callback);
}

function apiFetchRecipes(params, callback, failCallback) {
    let url = API_BASE + 'recipes.php';
    const queryParams = [];
    if (params.category)   queryParams.push('category='   + params.category);
    if (params.difficulty) queryParams.push('difficulty=' + params.difficulty);
    if (params.ids)        queryParams.push('ids='        + params.ids);
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    $.getJSON(url, callback).fail(failCallback);
}

function apiFetchRecipeDetail(recipeId, callback, failCallback) {
    $.ajax({ url: API_BASE + 'recipes.php?id=' + recipeId, type: 'GET', dataType: 'json', success: callback, error: failCallback });
}

function apiFetchSimilarRecipes(recipeId, callback) {
    $.getJSON(API_BASE + 'similar.php?id=' + recipeId, callback);
}

function apiFetchFilterByIngredients(ingredientsStr, callback, failCallback) {
    $.getJSON(API_BASE + 'filter.php?ingredients=' + ingredientsStr, callback).fail(failCallback);
}

function apiFetchSearch(searchTerm, callback) {
    $.getJSON(API_BASE + 'search.php?q=' + encodeURIComponent(searchTerm), callback);
}

function apiFetchRandom(callback, failCallback) {
    $.getJSON(API_BASE + 'random.php', callback).fail(failCallback);
}

function apiCheckStatus() {
    $.get(API_BASE + 'recipes.php')
        .done(() => $('#api-status').text('API Status: Connected ✓'))
        .fail(() => $('#api-status').text('API Status: Error ✗'));
}
