// detail.js - shows the full recipe detail view, similar recipes, and handles going back

// switches from the list view to the detail view and loads a single recipe's full data
function showRecipeDetail(recipeId) {
    $('#recipes-section').hide(); // hides the recipe list
    $('#detail-section').show();  // shows the detail section
    $('#recipe-detail').html('Loading details...'); // shows a loading message while waiting for the API
    currentView = 'detail'; // updates the shared state variable so other code knows which view is active

    apiFetchRecipeDetail(recipeId, function(recipe) {
        const isFavorite = favorites.includes(recipe.pk_recipes); // checks if this recipe is already in the favorites list
        const heartIcon = isFavorite ? '❤️' : '🤍'; // picks the right heart icon

        // starts building the detail HTML with the favorite heart button in the top-right corner
        let html = `
            <button class="favorite-heart-detail" data-id="${recipe.pk_recipes}">${heartIcon}</button>
            <div class="recipe-detail-header">
        `;

        // adds the recipe image if it has one
        if (recipe.imageUrl) {
            html += `
                <div class="recipe-detail-image">
                    <img src="${recipe.imageUrl}" alt="${recipe.name}">
                </div>
            `;
        }

        // adds the recipe title and key info (description, category, difficulty, prep time)
        html += `
            <div class="recipe-detail-info">
                <h2>${recipe.name}</h2>
                <p><strong>Description:</strong> ${recipe.description || '-'}</p>
                <p><strong>Category:</strong> ${recipe.categoryIcon || ''} ${recipe.categoryName || 'Unknown'}</p>
                <p><strong>Difficulty:</strong> ${recipe.difficultyStars || ''} ${recipe.difficultyName || 'Unknown'}</p>
                <p><strong>Preparation time:</strong> ${recipe.preparationTime} minutes</p>
            </div>
            </div>

            <div class="recipe-content">
                <div class="recipe-instructions">
                    <h3>Instructions:</h3>
                    <div style="white-space: pre-line; background:#f5f5f5; padding:10px; border:1px solid #ddd;">
                        ${recipe.instructions}
                    </div>
                </div>
        `;

        // adds the ingredients list if the recipe has any
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            html += `
                <div class="recipe-ingredients">
                    <h3>Ingredients:</h3>
                    <ul>`;
            recipe.ingredients.forEach(ing => {
                html += `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`; // one list item per ingredient
            });
            html += `</ul>
                </div>`;
        }

        html += `</div>`;
        html += `<button onclick="window.open('../backend/api/recipes.php?id=${recipeId}', '_blank')" style="margin-top: 20px;">Open API Endpoint</button>`; // debug button to view the raw JSON

        $('#recipe-detail').html(html); // inserts the full detail HTML into the page

        // wires the heart button to toggle this recipe's favorite status
        $('.favorite-heart-detail').click(function() {
            const id = $(this).data('id');
            toggleFavorite(id);
            $(this).text(favorites.includes(id) ? '❤️' : '🤍'); // updates the icon immediately
        });

        loadSimilarRecipes(recipeId); // loads the similar recipes section below the detail

    }, function(xhr, status, error) {
        console.error('Error loading recipe:', status, error);
        $('#recipe-detail').html('<p style="color: red;">Error loading recipe details. Please try again.</p>');
    });
}

// fetches and displays recipes that share at least 3 ingredients with the current recipe
function loadSimilarRecipes(recipeId) {
    apiFetchSimilarRecipes(recipeId, function(data) {
        if (data.similar_recipes && data.similar_recipes.length > 0) {
            let html = '<h3>Similar Recipes:</h3><div id="similar-recipes-container">';
            data.similar_recipes.forEach(recipe => {
                html += `
                    <div class="similar-recipe-card" data-id="${recipe.pk_recipes}">
                        <h4>${recipe.name}</h4>
                        <p style="font-size: 12px; color: #666; margin-bottom: 5px;">${recipe.description || ''}</p>
                        <small>⏱️ ${recipe.preparationTime} min</small><br>
                        <small style="color: #FA8112;">${recipe.matching_ingredients} shared ingredients</small>
                    </div>
                `;
            });
            html += '</div>';
            $('#recipe-detail').append(html); // appends the similar recipes below the existing detail content

            // clicking a similar recipe card opens that recipe's detail view
            $('.similar-recipe-card').click(function() {
                showRecipeDetail($(this).data('id'));
            });
        }
    });
}

// switches back from the detail view to the recipe list
function showRecipeList() {
    $('#detail-section').hide();  // hides the detail view
    $('#recipes-section').show(); // shows the recipe list again
    currentView = 'list'; // updates the shared state variable
}
