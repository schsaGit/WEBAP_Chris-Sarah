// recipes.js - Load and display the recipe list

function loadDifficulties() {
    apiFetchDifficulties(function(data) {
        difficulties = data;
        let html = '<option value="">All Difficulties</option>';
        for (const [id, name] of Object.entries(data)) {
            html += `<option value="${id}">${name}</option>`;
        }
        $('#difficulty-filter').html(html);
    });
}

function loadCategories() {
    apiFetchCategories(function(data) {
        let html = '<option value="">All Categories</option>';
        for (const [id, name] of Object.entries(data)) {
            html += `<option value="${id}">${name}</option>`;
        }
        $('#category-filter').html(html);
    });
}

function loadRecipes(params = {}) {
    $('#recipes-container').html('Loading recipes...');
    $('#no-results').hide();

    apiFetchRecipes(params, function(data) {
        if (data.recipes && data.recipes.length > 0) {
            displayRecipes(data.recipes);
            $('#recipe-count').text(`(${data.count})`);
        } else {
            $('#recipes-container').html('');
            $('#no-results').show();
            $('#recipe-count').text('(0)');
        }
    }, function() {
        $('#recipes-container').html('Error loading recipes');
    });
}

function displayRecipes(recipes) {
    let html = '';
    recipes.forEach(recipe => {
        let imageHtml = '';
        if (recipe.imageUrl) {
            imageHtml = `<img src="${recipe.imageUrl}" alt="${recipe.name}" style="width: 80px; height: 80px; object-fit: cover; float: left; margin-right: 15px; border-radius: 4px; border: 1px solid #ddd;">`;
        }
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
    $('#recipes-container').html(html);

    $('.recipe-card').click(function() {
        showRecipeDetail($(this).data('id'));
    });
}
