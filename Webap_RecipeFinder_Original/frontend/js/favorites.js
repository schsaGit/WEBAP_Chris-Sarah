// favorites.js - Favorites toggle and display

function toggleFavorite(recipeId) {
    if (favorites.includes(recipeId)) {
        favorites = favorites.filter(id => id !== recipeId);
    } else {
        favorites.push(recipeId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    $(`.favorite-heart-detail[data-id="${recipeId}"]`).text(
        favorites.includes(recipeId) ? '❤️' : '🤍'
    );
}

function showFavorites() {
    if (favorites.length === 0) {
        $('#recipes-container').html('<p>No favorites yet</p>');
        $('#recipe-count').text('(0)');
        return;
    }
    loadRecipes({ ids: favorites.join(',') });
}
