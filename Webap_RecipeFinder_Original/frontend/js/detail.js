// detail.js - Recipe detail view, similar recipes, and back navigation

// switches from the list view to the detail view and loads a single recipe's full data
// recipeId is now a prefixed string: "local-7" or "spoon-640921"
function showRecipeDetail(recipeId) {
    $('#recipes-section').hide(); // hides the recipe list
    $('#detail-section').show();  // shows the detail section
    $('#recipe-detail').html('Loading details...');
    currentView = 'detail';

    apiFetchRecipeDetailById(recipeId, function(recipe) {
        const id = recipe.id || ('local-' + recipe.pk_recipes); // safety fallback
        const isSpoon = recipe.source === 'spoonacular';
        const isFavorite = favorites.includes(id);
        const heartIcon = isFavorite ? '❤️' : '🤍';

        const sourceBadge = isSpoon
            ? `<span class="recipe-source-badge spoon detail">SPOONACULAR</span>`
            : '';

        let html = `
            <button class="favorite-heart-detail" data-id="${id}">${heartIcon}</button>
            ${sourceBadge}
            <div class="recipe-detail-header">
        `;

        if (recipe.imageUrl) {
            html += `
                <div class="recipe-detail-image">
                    <img src="${recipe.imageUrl}" alt="${recipe.name}" onerror="this.parentElement.style.display='none'">
                </div>
            `;
        }

        html += `
            <div class="recipe-detail-info">
                <h2>${recipe.name}</h2>
                <p><strong>Description:</strong> ${recipe.description || '-'}</p>
                <p><strong>Category:</strong> ${recipe.categoryIcon || ''} ${recipe.categoryName || 'Unknown'}</p>
                <p><strong>Difficulty:</strong> ${recipe.difficultyStars || ''} ${recipe.difficultyName || 'Unknown'}</p>
                <p><strong>Preparation time:</strong> ${recipe.preparationTime}</p>
            </div>
            </div>

            <div class="recipe-content">
                <div class="recipe-instructions">
                    <h3>Instructions:</h3>
                    <div style="white-space: pre-line; background:#f5f5f5; padding:10px; border:1px solid #ddd;">
                        ${recipe.instructions || '-'}
                    </div>
                </div>
        `;

        if (recipe.ingredients && recipe.ingredients.length > 0) {
            html += `
                <div class="recipe-ingredients">
                    <h3>Ingredients:</h3>
                    <ul>`;
            recipe.ingredients.forEach(ing => {
                const amount = ing.amount || '';
                const unit = ing.unit || '';
                html += `<li>${amount} ${unit} ${ing.name}</li>`;
            });
            html += `</ul>
                </div>`;
        }

        html += `</div>`;

        // debug button: opens the raw JSON for either backend
        const apiUrl = isSpoon
            ? `../backend/api/spoonacular/recipes.php?id=${id}`
            : `../backend/api/recipes.php?id=${id.replace('local-', '')}`;
        html += `<button onclick="window.open('${apiUrl}', '_blank')" style="margin-top: 20px;">Open API Endpoint</button>`;

        // for spoonacular recipes, add the required attribution link to the original source page
        if (isSpoon && recipe.sourceUrl) {
            html += ` <button onclick="window.open('${recipe.sourceUrl}', '_blank')" style="margin-top: 20px;">View on spoonacular.com ↗</button>`;
        }

        $('#recipe-detail').html(html);

        $('.favorite-heart-detail').click(function() {
            const favId = $(this).data('id');
            toggleFavorite(favId);
            $(this).text(favorites.includes(favId) ? '❤️' : '🤍');
        });

        // similar recipes only work for local recipes (similar.php uses the local DB)
        if (!isSpoon) {
            const numericId = String(id).replace('local-', '');
            loadSimilarRecipes(numericId);
        }

    }, function(xhr, status, error) {
        console.error('Error loading recipe:', status, error);
        $('#recipe-detail').html('<p style="color: red;">Error loading recipe details. Please try again.</p>');
    });
}

// fetches and displays recipes that share at least 3 ingredients with the current recipe
// only used for local recipes — similar.php queries the local database
function loadSimilarRecipes(recipeId) {
    apiFetchSimilarRecipes(recipeId, function(data) {
        if (data.similar_recipes && data.similar_recipes.length > 0) {
            let html = '<h3>Similar Recipes:</h3><div id="similar-recipes-container">';
            data.similar_recipes.forEach(recipe => {
                const id = 'local-' + recipe.pk_recipes; // similar recipes are always local
                html += `
                    <div class="similar-recipe-card" data-id="${id}">
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
