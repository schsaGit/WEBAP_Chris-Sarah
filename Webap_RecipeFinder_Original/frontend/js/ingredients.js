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
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(ingredient => {
                    // data-name is added so we can send the names to spoonacular's filter endpoint
                    html += `
                        <div class="ingredient-item" data-id="${ingredient.pk_ingredients}" data-name="${ingredient.name}" data-category="${category}">
                            <input type="checkbox" id="ing-${ingredient.pk_ingredients}">
                            <label for="ing-${ingredient.pk_ingredients}">${ingredient.name}</label>
                        </div>
                    `;
                });
            html += `</div></div>`;
        });

        $('#ingredients-list').html(html);

        // clicking a category header toggles its ingredient list open or closed
        $('.ingredient-category-header').click(function() {
            const category = $(this).data('category');
            const items = $(`.ingredient-category-items[data-category="${category}"]`);
            items.toggleClass('collapsed');
            $(this).find('.toggle-icon').text(items.hasClass('collapsed') ? '▶' : '▼');
        });

        // when a checkbox is checked or unchecked, updates the selectedIngredients array
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

// filters the recipe list to show only recipes that have ALL of the selected ingredients
// runs the local filter (by ID) and the spoonacular filter (by NAME) in parallel and merges
function filterByIngredients() {
    if (selectedIngredients.length === 0) {
        alert('Please select at least one ingredient');
        return;
    }

    // collect IDs (for local) and names (for spoonacular) from the currently checked rows
    const ingredientsStr = selectedIngredients.join(',');
    const names = [];
    $('.ingredient-item input[type="checkbox"]:checked').each(function() {
        const name = $(this).closest('.ingredient-item').data('name');
        if (name) names.push(name);
    });
    const namesStr = names.join(',');

    $('#recipes-container').html('Searching recipes...');
    $('#no-results').hide();

    // safeReq prevents one failing source from collapsing the merged result
    const localReq = safeReq($.getJSON(API_BASE + 'filter.php?ingredients=' + ingredientsStr));
    const spoonReq = safeReq($.getJSON(SPOON_BASE + 'filter.php?ingredients=' + encodeURIComponent(namesStr)));

    $.when(localReq, spoonReq).done(function (localData, spoonData) {
        const localRecipes = (localData && localData.recipes) ? localData.recipes : [];
        const spoonRecipes = (spoonData && spoonData.recipes) ? spoonData.recipes : [];

        localRecipes.forEach(tagLocalRecipe); // ensure local recipes get prefixed id + source

        const merged = localRecipes.concat(spoonRecipes);

        if (merged.length === 0) {
            $('#recipes-container').html('❌ No recipes found with selected ingredients');
            $('#recipe-count').text('(0)');
            return;
        }

        let html = `<p><strong>${merged.length} recipes</strong> found with selected ingredients:</p>`;

        merged.forEach(recipe => {
            const id = recipe.id || ('local-' + recipe.pk_recipes);
            const isSpoon = recipe.source === 'spoonacular';
            const sourceBadge = isSpoon
                ? `<span class="recipe-source-badge spoon">SPOONACULAR</span>`
                : '';

            // spoonacular's preparationTime can be missing here since findByIngredients is a slim response
            const prep = recipe.preparationTime && recipe.preparationTime !== '? min'
                ? recipe.preparationTime
                : '–';

            html += `
                <div class="recipe-card" data-id="${id}" style="border:1px solid #ddd; padding:10px; margin-bottom:10px; cursor:pointer; border-radius: 4px; position: relative;">
                    ${sourceBadge}
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description || ''}</p>
                    <div style="margin-bottom: 8px;">
                        <small>⏱️ ${prep}</small> |
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
                html += `<p style="color: #d9534f;"><small>❌ Missing: ${(recipe.missing_list || []).join(', ')}</small></p>`;
            } else {
                html += `<p style="color: #5cb85c;"><small>✓ All selected ingredients available!</small></p>`;
            }

            html += `</div>`;
        });

        $('#recipes-container').html(html);
        $('#recipe-count').text(`(${merged.length})`);

        // clicking any result card opens that recipe's detail view (routing handled by showRecipeDetail)
        $('.recipe-card').click(function() {
            showRecipeDetail($(this).data('id'));
        });
    });
}

// updates the filter button label to show how many ingredients are currently selected
function updateSelectedCount() {
    const count = selectedIngredients.length;
    $('#filter-btn').text(count > 0 ? `Filter recipes (${count} ingredients)` : 'Filter recipes');
}
