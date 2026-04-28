// ingredients.js - loads the ingredient filter panel, handles checkbox selection, and filters recipes

// fetches all ingredients from the API and builds the collapsible category panels
function loadIngredients() {
    apiFetchIngredients(function(data) {
        const ingredientsByCategory = {}; // will hold ingredients grouped by their category name

        // groups each ingredient into its category bucket
        data.forEach(ingredient => {
            const category = ingredient.category || 'Other'; // uses 'Other' if the ingredient has no category
            if (!ingredientsByCategory[category]) {
                ingredientsByCategory[category] = []; // creates the category bucket if it doesn't exist yet
            }
            ingredientsByCategory[category].push(ingredient);
        });

        const sortedCategories = Object.keys(ingredientsByCategory).sort(); // sorts categories alphabetically
        let html = '';

        // builds a collapsible section for each category
        sortedCategories.forEach(category => {
            html += `
                <div class="ingredient-category">
                    <div class="ingredient-category-header" data-category="${category}">
                        <strong>${category}</strong> <span class="toggle-icon">▶</span>
                    </div>
                    <div class="ingredient-category-items collapsed" data-category="${category}">
            `; // starts collapsed by default (the CSS 'collapsed' class hides the items)

            // adds a checkbox for each ingredient in this category, sorted alphabetically
            ingredientsByCategory[category]
                .sort((a, b) => a.name.localeCompare(b.name)) // localeCompare sorts strings correctly including special chars
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

        $('#ingredients-list').html(html); // inserts the full ingredient panel into the page

        // clicking a category header toggles its ingredient list open or closed
        $('.ingredient-category-header').click(function() {
            const category = $(this).data('category');
            const items = $(`.ingredient-category-items[data-category="${category}"]`);
            items.toggleClass('collapsed'); // adds or removes the CSS class that hides the items
            $(this).find('.toggle-icon').text(items.hasClass('collapsed') ? '▶' : '▼'); // updates the arrow icon
        });

        // when a checkbox is checked or unchecked, updates the selectedIngredients array
        $('.ingredient-item input[type="checkbox"]').change(function() {
            const id = $(this).closest('.ingredient-item').data('id'); // gets the ingredient ID from the parent element
            if ($(this).is(':checked')) {
                selectedIngredients.push(id); // adds the ID when checked
            } else {
                selectedIngredients = selectedIngredients.filter(i => i !== id); // removes the ID when unchecked
            }
            updateSelectedCount(); // updates the filter button label with the new count
        });

    }, function() {
        $('#ingredients-list').html('<p style="color: red;">Error loading ingredients</p>'); // shown if the API call fails
    });
}

// filters the recipe list to show only recipes that have ALL of the selected ingredients
function filterByIngredients() {
    if (selectedIngredients.length === 0) {
        alert('Please select at least one ingredient');
        return;
    }

    const ingredientsStr = selectedIngredients.join(','); // turns the array into a comma-separated string for the URL
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

                // shows which selected ingredients this recipe has, grouped by category
                if (recipe.matching_ingredients_by_category && Object.keys(recipe.matching_ingredients_by_category).length > 0) {
                    html += `<div style="background: #f9f9f9; padding: 8px; border-radius: 3px; margin-bottom: 8px;">`;
                    Object.keys(recipe.matching_ingredients_by_category).sort().forEach(category => {
                        const ingredients = recipe.matching_ingredients_by_category[category];
                        html += `<p style="margin: 4px 0;"><strong>${category}:</strong> ${ingredients.join(', ')}</p>`;
                    });
                    html += `</div>`;
                }

                // shows missing ingredients in red, or a green checkmark if none are missing
                if (recipe.missing_ingredients > 0) {
                    html += `<p style="color: #d9534f;"><small>❌ Missing: ${recipe.missing_list.join(', ')}</small></p>`;
                } else {
                    html += `<p style="color: #5cb85c;"><small>✓ All selected ingredients available!</small></p>`;
                }

                html += `</div>`;
            });

            $('#recipes-container').html(html);
            $('#recipe-count').text(`(${data.count})`);

            // clicking any result card opens that recipe's detail view
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

// updates the filter button label to show how many ingredients are currently selected
function updateSelectedCount() {
    const count = selectedIngredients.length;
    $('#filter-btn').text(count > 0 ? `Filter recipes (${count} ingredients)` : 'Filter recipes');
}
