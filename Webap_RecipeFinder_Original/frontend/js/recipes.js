// recipes.js - loads and displays the recipe list, and fills the category/difficulty dropdowns

// fetches difficulty levels from the API and fills the difficulty dropdown
function loadDifficulties() {
    apiFetchDifficulties(function(data) {
        difficulties = data; // saves the difficulty data to the shared state variable so other files can use it
        let html = '<option value="">All Difficulties</option>';
        for (const [id, name] of Object.entries(data)) {
            html += `<option value="${id}">${name}</option>`; // adds one dropdown option per difficulty level
        }
        $('#difficulty-filter').html(html); // inserts all options into the dropdown element
    });
}

// fetches categories from the API and fills the category dropdown
function loadCategories() {
    apiFetchCategories(function(data) {
        let html = '<option value="">All Categories</option>';
        for (const [id, name] of Object.entries(data)) {
            html += `<option value="${id}">${name}</option>`; // adds one dropdown option per category
        }
        $('#category-filter').html(html); // inserts all options into the dropdown element
    });
}

// fetches recipes from the API (with optional filters) and displays them as cards
function loadRecipes(params = {}) {
    $('#recipes-container').html('Loading recipes...'); // shows a loading message while waiting for the API
    $('#no-results').hide(); // hides the "No recipes found" message while loading

    apiFetchRecipes(params, function(data) {
        if (data.recipes && data.recipes.length > 0) {
            displayRecipes(data.recipes); // passes the recipe list to the display function
            $('#recipe-count').text(`(${data.count})`); // shows the number of results next to the heading
        } else {
            $('#recipes-container').html('');
            $('#no-results').show(); // shows "No recipes found" when the list is empty
            $('#recipe-count').text('(0)');
        }
    }, function() {
        $('#recipes-container').html('Error loading recipes'); // shows an error message if the API call fails
    });
}

// builds the HTML for a list of recipe cards and inserts them into the page
function displayRecipes(recipes) {
    let html = '';
    recipes.forEach(recipe => {
        let imageHtml = '';
        if (recipe.imageUrl) {
            // creates an image tag only if the recipe has an image URL
            imageHtml = `<img src="${recipe.imageUrl}" alt="${recipe.name}" style="width: 80px; height: 80px; object-fit: cover; float: left; margin-right: 15px; border-radius: 4px; border: 1px solid #ddd;">`;
        }
        // builds the card HTML for each recipe using template literals (the backtick strings)
        html += `
            <div class="recipe-card" data-id="${recipe.pk_recipes}">
                ${imageHtml}
                <h3>${recipe.name}</h3>
                <p>${recipe.description || ''}</p>
                <div class="recipe-meta">
                    <small>⏱️ ${recipe.preparationTime} min</small> |
                    <small>Ingredients: ${recipe.ingredient_count || '?'}</small>
                </div>
                <div class="recipe-tags">
                    <span class="recipe-category">${recipe.categoryIcon || ''} ${recipe.categoryName || 'Unknown'}</span>
                    <span class="recipe-difficulty">${recipe.difficultyStars || ''}</span>
                </div>
            </div>
        `;
    });
    $('#recipes-container').html(html); // inserts all the card HTML into the page at once

    // attaches a click handler to every card so clicking opens that recipe's detail view
    $('.recipe-card').click(function() {
        showRecipeDetail($(this).data('id')); // data-id holds the recipe's database ID
    });
}
