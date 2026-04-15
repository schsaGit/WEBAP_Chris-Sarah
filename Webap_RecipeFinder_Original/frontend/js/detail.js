// detail.js - Recipe detail view, similar recipes, and back navigation

function showRecipeDetail(recipeId) {
    $('#recipes-section').hide();
    $('#detail-section').show();
    $('#recipe-detail').html('Loading details...');
    currentView = 'detail';

    apiFetchRecipeDetail(recipeId, function(recipe) {
        const isFavorite = favorites.includes(recipe.pk_recipes);
        const heartIcon = isFavorite ? '❤️' : '🤍';

        let html = `
            <button class="favorite-heart-detail" data-id="${recipe.pk_recipes}">${heartIcon}</button>
            <div class="recipe-detail-header">
        `;

        if (recipe.imageUrl) {
            html += `
                <div class="recipe-detail-image">
                    <img src="${recipe.imageUrl}" alt="${recipe.name}">
                </div>
            `;
        }

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

        if (recipe.ingredients && recipe.ingredients.length > 0) {
            html += `
                <div class="recipe-ingredients">
                    <h3>Ingredients:</h3>
                    <ul>`;
            recipe.ingredients.forEach(ing => {
                html += `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`;
            });
            html += `</ul>
                </div>`;
        }

        html += `</div>`;
        html += `<button onclick="window.open('../backend/api/recipes.php?id=${recipeId}', '_blank')" style="margin-top: 20px;">Open API Endpoint</button>`;

        $('#recipe-detail').html(html);

        $('.favorite-heart-detail').click(function() {
            const id = $(this).data('id');
            toggleFavorite(id);
            $(this).text(favorites.includes(id) ? '❤️' : '🤍');
        });

        loadSimilarRecipes(recipeId);

    }, function(xhr, status, error) {
        console.error('Error loading recipe:', status, error);
        $('#recipe-detail').html('<p style="color: red;">Error loading recipe details. Please try again.</p>');
    });
}

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
            $('#recipe-detail').append(html);

            $('.similar-recipe-card').click(function() {
                showRecipeDetail($(this).data('id'));
            });
        }
    });
}

function showRecipeList() {
    $('#detail-section').hide();
    $('#recipes-section').show();
    currentView = 'list';
}
