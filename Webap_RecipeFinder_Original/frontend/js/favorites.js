// favorites.js - handles adding/removing favorites and showing the favorites list
// favorites are stored as prefixed string IDs ("local-7", "spoon-640921") so we can mix sources

// adds or removes a recipe from favorites and saves the updated list to localStorage
function toggleFavorite(recipeId) {
    const id = String(recipeId);
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // updates the heart icon for the matching button (selector handles both string and number data attributes)
    $(`.favorite-heart-detail[data-id="${id}"]`).text(
        favorites.includes(id) ? '❤️' : '🤍'
    );
}

// loads and displays all favorited recipes — splits by source under the hood
function showFavorites() {
    if (favorites.length === 0) {
        $('#recipes-container').html('<p>No favorites yet</p>');
        $('#recipe-count').text('(0)');
        return;
    }

    $('#recipes-container').html('Loading favorites...');
    $('#no-results').hide();

    apiFetchRecipesByIds(favorites, function(data) {
        if (data.recipes && data.recipes.length > 0) {
            displayRecipes(data.recipes);
            $('#recipe-count').text(`(${data.count})`);
        } else {
            $('#recipes-container').html('');
            $('#no-results').show();
            $('#recipe-count').text('(0)');
        }
    });
}
