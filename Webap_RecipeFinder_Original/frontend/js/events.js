// events.js - wires all buttons and inputs to their handler functions

function setupEventListeners() {
    // search button: searches BOTH local and spoonacular and merges the results
    $('#search-btn').click(function() {
        const searchTerm = $('#search-input').val();
        if (searchTerm) {
            $('#recipes-container').html('Searching...');
            $('#no-results').hide();

            apiFetchSearchCombined(searchTerm, function(data) {
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

    // pressing Enter in the search box triggers the search button click
    $('#search-input').keypress(function(e) {
        if (e.which === 13) $('#search-btn').click(); // 13 is the key code for the Enter key
    });

    // favorites button: shows only the recipes the user has saved as favorites
    $('#favorites-btn').click(showFavorites);

    // filter button: shows only recipes that contain ALL selected ingredients
    $('#filter-btn').click(filterByIngredients);

    // clear button: unchecks all ingredients, resets the count, and reloads all recipes
    $('#clear-btn').click(function() {
        selectedIngredients = [];
        $('.ingredient-item input[type="checkbox"]').prop('checked', false);
        updateSelectedCount();
        loadRecipes(); // reloads the full mixed list (local + spoonacular)
    });

    // category dropdown: reloads the recipe list filtered by the chosen category (local-only)
    $('#category-filter').change(function() {
        loadRecipes({ category: $(this).val(), difficulty: $('#difficulty-filter').val() });
    });

    // difficulty dropdown: reloads the recipe list filtered by the chosen difficulty (local-only)
    $('#difficulty-filter').change(function() {
        loadRecipes({ category: $('#category-filter').val(), difficulty: $(this).val() });
    });

    // random button: 50/50 picks a local or spoonacular random recipe and opens its detail view
    $('#random-btn').click(function() {
        const useSpoon = Math.random() < 0.5;

        if (useSpoon) {
            apiFetchSpoonRandom(function(data) {
                if (data && data.id) {
                    showRecipeDetail(data.id); // already prefixed with "spoon-"
                } else {
                    fallbackLocalRandom();
                }
            }, fallbackLocalRandom);
        } else {
            fallbackLocalRandom();
        }

        function fallbackLocalRandom() {
            apiFetchRandom(function(data) {
                if (data && data.pk_recipes) {
                    showRecipeDetail('local-' + data.pk_recipes); // convert to prefixed id
                } else {
                    alert('No recipe found');
                }
            }, function() { alert('Error loading random recipe'); });
        }
    });

    // back button: returns from the detail view to the recipe list
    $('#back-btn').click(showRecipeList);
}
