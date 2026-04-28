// ingredients.js - Ingredient panel, checkbox handling, and filter by ingredients

function loadIngredients() {
    apiFetchIngredients(function(data) {
        const ingredientsByCategory = {};

        data.forEach(ingredient => {
            const category = ingredient.category || 'Other';
            if (!ingredientsByCategory[category]) {
                ingredientsByCategory[category] = [];
            }
            ingredientsByCategory[category].push(ingredient);
        });

        const sortedCategories = Object.keys(ingredientsByCategory).sort();
        let html = '';

        sortedCategories.forEach(category => {
            html += `
                <div class="ingredient-category">
                    <div class="ingredient-category-header" data-category="${category}">
                        <strong>${category}</strong> <span class="toggle-icon">▶</span>
                    </div>
                    <div class="ingredient-category-items collapsed" data-category="${category}">
            `;
            ingredientsByCategory[category]
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(ingredient => {
                    html += `
                        <div class="ingredient-item" data-id="${ingredient.pk_ingredients}" data-category="${category}">
                            <input type="checkbox" id="ing-${ingredient.pk_ingredients}">
                            <label for="ing-${ingredient.pk_ingredients}">${ingredient.name}</label>
                        </div>
                    `;
                });
            html += `</div></div>`;
        });

        $('#ingredients-list').html(html);

        $('.ingredient-category-header').click(function() {
            const category = $(this).data('category');
            const items = $(`.ingredient-category-items[data-category="${category}"]`);
            items.toggleClass('collapsed');
            $(this).find('.toggle-icon').text(items.hasClass('collapsed') ? '▶' : '▼');
        });

        $('.ingredient-item input[type="checkbox"]').change(function() {
            const id = $(this).closest('.ingredient-item').data('id');
            if ($(this).is(':checked')) {
                selectedIngredients.push(id);
            } else {
                selectedIngredients = selectedIngredients.filter(i => i !== id);
            }
            updateSelectedCount();
        });

    }, function() {
        $('#ingredients-list').html('<p style="color: red;">Error loading ingredients</p>');
    });
}

function filterByIngredients() {
    if (selectedIngredients.length === 0) {
        alert('Please select at least one ingredient');
        return;
    }

    const ingredientsStr = selectedIngredients.join(',');
    $('#recipes-container').html('Searching recipes...');

    apiFetchFilterByIngredients(ingredientsStr, function(data) {
        if (data.recipes && data.recipes.length > 0) {
            let html = `<p><strong>${data.count} recipes</strong> found with selected ingredients:</p>`;

            data.recipes.forEach(recipe => {
                html += `
                    <div class="recipe-card" data-id="${recipe.pk_recipes}" style="border:1px solid #ddd; padding:10px; margin-bottom:10px; cursor:pointer; border-radius: 4px;">
                        <h3>${recipe.name}</h3>
                        <p>${recipe.description || ''}</p>
                        <div style="margin-bottom: 8px;">
                            <small>⏱️ ${recipe.preparationTime} min</small> | 
                            <small>Matching ingredients: ${recipe.matching_ingredients}/${recipe.total_ingredients}</small>
                        </div>
                `;

                if (recipe.matching_ingredients_by_category && Object.keys(recipe.matching_ingredients_by_category).length > 0) {
                    html += `<div style="background: #f9f9f9; padding: 8px; border-radius: 3px; margin-bottom: 8px;">`;
                    Object.keys(recipe.matching_ingredients_by_category).sort().forEach(category => {
                        const ingredients = recipe.matching_ingredients_by_category[category];
                        html += `<p style="margin: 4px 0;"><strong>${category}:</strong> ${ingredients.join(', ')}</p>`;
                    });
                    html += `</div>`;
                }

                if (recipe.missing_ingredients > 0) {
                    html += `<p style="color: #d9534f;"><small>❌ Missing: ${recipe.missing_list.join(', ')}</small></p>`;
                } else {
                    html += `<p style="color: #5cb85c;"><small>✓ All selected ingredients available!</small></p>`;
                }

                html += `</div>`;
            });

            $('#recipes-container').html(html);
            $('#recipe-count').text(`(${data.count})`);

            $('.recipe-card').click(function() {
                showRecipeDetail($(this).data('id'));
            });
        } else {
            $('#recipes-container').html('❌ No recipes found with selected ingredients');
            $('#recipe-count').text('(0)');
        }
    }, function() {
        $('#recipes-container').html('<p style="color: red;">Error loading filtered recipes</p>');
    });
}

function updateSelectedCount() {
    const count = selectedIngredients.length;
    $('#filter-btn').text(count > 0 ? `Filter recipes (${count} ingredients)` : 'Filter recipes');
}
