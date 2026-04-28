// favorites.js - handles adding/removing favorites and showing the favorites list

// adds or removes a recipe from favorites and saves the updated list to localStorage
function toggleFavorite(recipeId) {
    if (favorites.includes(recipeId)) {
        favorites = favorites.filter(id => id !== recipeId); // removes the recipe ID from the array
    } else {
        favorites.push(recipeId); // adds the recipe ID to the array
    }
    localStorage.setItem('favorites', JSON.stringify(favorites)); // saves the updated array to the browser (survives page refresh)

    // updates the heart icon on the page: filled heart if favorited, empty heart if not
    $(`.favorite-heart-detail[data-id="${recipeId}"]`).text(
        favorites.includes(recipeId) ? '❤️' : '🤍'
    );
}

// loads and displays all favorited recipes in the recipe list
function showFavorites() {
    if (favorites.length === 0) {
        $('#recipes-container').html('<p>No favorites yet</p>'); // shows a message if there are no favorites
        $('#recipe-count').text('(0)');
        return;
    }
    loadRecipes({ ids: favorites.join(',') }); // passes the favorite IDs to loadRecipes, which fetches and displays them
}
