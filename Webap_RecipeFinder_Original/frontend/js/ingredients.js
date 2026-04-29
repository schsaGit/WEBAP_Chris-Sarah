// ingredients.js - loads the ingredient filter panel, handles checkbox selection, and filters recipes

// exposed so events.js can call renderIngredients('') on clear
let renderIngredients = function() {};
let ingredientRecipeExamples = {}; // caches example recipes for each ingredient ID

function getIngredientExampleHtml(ingredientId) {
    const recipes = ingredientRecipeExamples[ingredientId];
    if (recipes === undefined || recipes === null) {
        return '<div class="ingredient-recipe-examples">Loading examples...</div>';
    }
    if (recipes.length === 0) {
        return '<div class="ingredient-recipe-examples empty">No recipe examples</div>';
    }
    const names = recipes.map(r => r.name);
    return `<div class="ingredient-recipe-examples">Used in: ${names.join(', ')}</div>`;
}

function fetchIngredientRecipeExamples(ingredientId) {
    if (ingredientRecipeExamples.hasOwnProperty(ingredientId)) {
        return;
    }

    ingredientRecipeExamples[ingredientId] = null; // mark as loading
    apiFetchIngredientRecipeExamples(ingredientId, function(data) {
        const recipes = (data && data.recipes) ? data.recipes : [];
        ingredientRecipeExamples[ingredientId] = recipes;
        $(`#ingredient-examples-${ingredientId}`).html(getIngredientExampleHtml(ingredientId));
    }, function() {
        ingredientRecipeExamples[ingredientId] = [];
        $(`#ingredient-examples-${ingredientId}`).html('<div class="ingredient-recipe-examples empty">No recipe examples</div>');
    });
}

function refreshVisibleIngredientExamples() {
    $('.ingredient-item').each(function() {
        const ingredientId = parseInt($(this).data('id'), 10);
        if (Number.isNaN(ingredientId)) return;
        const placeholder = $(`#ingredient-examples-${ingredientId}`);
        if (ingredientRecipeExamples.hasOwnProperty(ingredientId)) {
            placeholder.html(getIngredientExampleHtml(ingredientId));
        } else {
            fetchIngredientRecipeExamples(ingredientId);
        }
    });
}

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

        // sort each category's ingredients alphabetically once and store for reuse during search
        const sortedCategories = Object.keys(ingredientsByCategory).sort();
        sortedCategories.forEach(category => {
            ingredientsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
        });

        // inject the search bar above the scrollable ingredient list, matching its width
        if ($('#ingredient-search').length === 0) {
            $('<input>', {
                type: 'text',
                id: 'ingredient-search',
                placeholder: 'Search ingredients...'
            }).insertBefore('#ingredients-list');
        }

        // builds the full ingredient HTML from the grouped data
        // when totalVisible > 10 the category headers are shown; otherwise they are hidden
        function buildIngredientHTML(filter) {
            filter = (filter || '').toLowerCase().trim();
            let html = '';
            let totalVisible = 0;

            // first pass: count how many items will be visible so we know whether to show categories
            sortedCategories.forEach(category => {
                ingredientsByCategory[category].forEach(ingredient => {
                    if (!filter || ingredient.name.toLowerCase().includes(filter)) {
                        totalVisible++;
                    }
                });
            });

            const showCategories = totalVisible > 10;

            sortedCategories.forEach(category => {
                const matchingIngredients = ingredientsByCategory[category].filter(ingredient =>
                    !filter || ingredient.name.toLowerCase().includes(filter)
                );

                if (matchingIngredients.length === 0) return; // skip categories with no visible items

                if (showCategories) {
                    // when there are many results keep the collapsible category headers
                    // open by default while filtering so the user sees the results immediately
                    const isFiltering = filter.length > 0;
                    html += `
                        <div class="ingredient-category">
                            <div class="ingredient-category-header" data-category="${category}">
                                <strong>${category}</strong> <span class="toggle-icon">${isFiltering ? '▼' : '▶'}</span>
                            </div>
                            <div class="ingredient-category-items${isFiltering ? '' : ' collapsed'}" data-category="${category}">
                    `;
                    matchingIngredients.forEach(ingredient => {
                        const checked = selectedIngredients.includes(parseInt(ingredient.pk_ingredients, 10)) ? 'checked' : '';
                        html += `
                            <div class="ingredient-item" data-id="${ingredient.pk_ingredients}" data-name="${ingredient.name}" data-category="${category}">
                                <input type="checkbox" id="ing-${ingredient.pk_ingredients}" ${checked}>
                                <label for="ing-${ingredient.pk_ingredients}">${ingredient.name}</label>
                                <div class="ingredient-recipe-examples" id="ingredient-examples-${ingredient.pk_ingredients}">Loading examples...</div>
                            </div>
                        `;
                    });
                    html += `</div></div>`;
                } else {
                    // when 10 or fewer items match, show them flat without category wrappers
                    matchingIngredients.forEach(ingredient => {
                        const checked = selectedIngredients.includes(parseInt(ingredient.pk_ingredients, 10)) ? 'checked' : '';
                        html += `
                            <div class="ingredient-item" data-id="${ingredient.pk_ingredients}" data-name="${ingredient.name}" data-category="${category}">
                                <input type="checkbox" id="ing-${ingredient.pk_ingredients}" ${checked}>
                                <label for="ing-${ingredient.pk_ingredients}">${ingredient.name}</label>
                                <div class="ingredient-recipe-examples" id="ingredient-examples-${ingredient.pk_ingredients}">Loading examples...</div>
                            </div>
                        `;
                    });
                }
            });

            if (html === '') {
                html = '<p style="color:#888; font-size:13px; padding:4px;">No ingredients found</p>';
            }

            return html;
        }

        // renders the list and re-wires all event listeners
        renderIngredients = function(filter) {
            $('#ingredients-list').html(buildIngredientHTML(filter));

            // clicking a category header toggles its ingredient list open or closed
            $('.ingredient-category-header').click(function() {
                const category = $(this).data('category');
                const items = $(`.ingredient-category-items[data-category="${category}"]`);
                items.toggleClass('collapsed');
                $(this).find('.toggle-icon').text(items.hasClass('collapsed') ? '▶' : '▼');
            });

            // when a checkbox is checked or unchecked, updates the selectedIngredients array
            $('.ingredient-item input[type="checkbox"]').change(function() {
                const id = parseInt($(this).closest('.ingredient-item').data('id'), 10);
                if ($(this).is(':checked')) {
                    if (!selectedIngredients.includes(id)) selectedIngredients.push(id);
                } else {
                    selectedIngredients = selectedIngredients.filter(i => i !== id);
                }
                updateSelectedCount();
            });

            refreshVisibleIngredientExamples();
        }

        // initial render with no filter
        renderIngredients('');

        // wire the search bar — re-render dynamically on every keystroke
        // unbind first to avoid stacking handlers if loadIngredients is ever called again
        $('#ingredient-search').off('input').on('input', function() {
            renderIngredients($(this).val());
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
