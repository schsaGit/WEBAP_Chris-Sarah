// events.js - wires all buttons and inputs to their handler functions

function setupEventListeners() {
    // search button: fetches recipes matching the text in the search input
    $('#search-btn').click(function() {
        const searchTerm = $('#search-input').val(); // reads the text the user typed
        if (searchTerm) {
            apiFetchSearch(searchTerm, function(data) {
                if (data.recipes && data.recipes.length > 0) {
                    displayRecipes(data.recipes);
                    $('#recipe-count').text(`(${data.count} for "${data.search_term}")`); // shows how many results were found
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
        selectedIngredients = []; // empties the selected ingredients array in state.js
        $('.ingredient-item input[type="checkbox"]').prop('checked', false); // unchecks every checkbox on the page
        updateSelectedCount(); // updates the filter button label to show 0 selected
        loadRecipes(); // reloads the full recipe list with no filters
    });

    // category dropdown: reloads the recipe list filtered by the chosen category (and current difficulty)
    $('#category-filter').change(function() {
        loadRecipes({ category: $(this).val(), difficulty: $('#difficulty-filter').val() });
    });

    // difficulty dropdown: reloads the recipe list filtered by the chosen difficulty (and current category)
    $('#difficulty-filter').change(function() {
        loadRecipes({ category: $('#category-filter').val(), difficulty: $(this).val() });
    });

    // random button: fetches a random recipe ID and opens its detail view
    $('#random-btn').click(function() {
        apiFetchRandom(function(data) {
            if (data && data.pk_recipes) {
                showRecipeDetail(data.pk_recipes); // opens the detail view for the random recipe
            } else {
                alert('No recipe found');
            }
        }, function() {
            alert('Error loading random recipe'); // shown if the API call fails
        });
    });

    // back button: returns from the detail view to the recipe list
    $('#back-btn').click(showRecipeList);
}
