// events.js - All event listener setup

function setupEventListeners() {
    $('#search-btn').click(function() {
        const searchTerm = $('#search-input').val();
        if (searchTerm) {
            apiFetchSearch(searchTerm, function(data) {
                if (data.recipes && data.recipes.length > 0) {
                    displayRecipes(data.recipes);
                    $('#recipe-count').text(`(${data.count} for "${data.search_term}")`);
                } else {
                    $('#recipes-container').html(`No results for "${searchTerm}"`);
                    $('#recipe-count').text('');
                }
            });
        }
    });

    $('#search-input').keypress(function(e) {
        if (e.which === 13) $('#search-btn').click();
    });

    $('#favorites-btn').click(showFavorites);

    $('#filter-btn').click(filterByIngredients);

    $('#clear-btn').click(function() {
        selectedIngredients = [];
        $('.ingredient-item input[type="checkbox"]').prop('checked', false);
        updateSelectedCount();
        loadRecipes();
    });

    $('#category-filter').change(function() {
        loadRecipes({ category: $(this).val(), difficulty: $('#difficulty-filter').val() });
    });

    $('#difficulty-filter').change(function() {
        loadRecipes({ category: $('#category-filter').val(), difficulty: $(this).val() });
    });

    $('#random-btn').click(function() {
        apiFetchRandom(function(data) {
            if (data && data.pk_recipes) {
                showRecipeDetail(data.pk_recipes);
            } else {
                alert('No recipe found');
            }
        }, function() {
            alert('Error loading random recipe');
        });
    });

    $('#back-btn').click(showRecipeList);
}
