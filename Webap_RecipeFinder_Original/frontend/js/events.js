// events.js - All event listener setup

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

    $('#search-input').keypress(function(e) {
        if (e.which === 13) $('#search-btn').click();
    });

    $('#favorites-btn').click(showFavorites);

    // "Create Your Own Recipe" button — only rendered by index.php when the user is logged in,
    // so this handler is a no-op for guests (the element simply doesn't exist in the DOM)
    $('#create-recipe-btn').click(function() {
        showRecipeForm(); // defined in recipeForm.js
    });

    // filter button: shows only recipes that contain ALL selected ingredients
    $('#filter-btn').click(filterByIngredients);

    // clear button: unchecks all ingredients, resets the count, clears the search bar, and reloads all recipes
    $('#clear-btn').click(function() {
        selectedIngredients = [];
        $('.ingredient-item input[type="checkbox"]').prop('checked', false);
        $('#ingredient-search').val('');
        renderIngredients('');
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

    // back button: returns from the detail view (or the create-form) to the recipe list
    $('#back-btn').click(showRecipeList);
}
