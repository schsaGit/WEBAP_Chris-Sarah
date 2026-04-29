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
// loads from BOTH local and spoonacular when no filter is active; falls back to local-only when category/difficulty is set
function loadRecipes(params = {}) {
    $('#recipes-container').html('Loading recipes...'); // shows a loading message while waiting for the API
    $('#no-results').hide(); // hides the "No recipes found" message while loading

    // only fall back to local-only when fetching by specific IDs (favorites);
    // category/difficulty are translated to spoonacular params on the backend
    const localOnly = !!params.ids;

    const onSuccess = function(data) {
        if (data.recipes && data.recipes.length > 0) {
            displayRecipes(data.recipes);
            $('#recipe-count').text(`(${data.count})`);
        } else {
            $('#recipes-container').html('');
            $('#no-results').show();
            $('#recipe-count').text('(0)');
        }
    };
    const onFail = function() { $('#recipes-container').html('Error loading recipes'); };

    if (localOnly) {
        // local-only path (filters or favorite IDs)
        apiFetchRecipes(params, function(data) {
            (data.recipes || []).forEach(tagLocalRecipe); // ensure every recipe has source + prefixed id
            onSuccess(data);
        }, onFail);
    } else {
        apiFetchRecipesCombined(params, onSuccess, onFail);
    }
}

// builds the HTML for a list of recipe cards and inserts them into the page
function displayRecipes(recipes) {
    let html = '';
    recipes.forEach(recipe => {
        // every recipe should have a string id like "local-7" or "spoon-640921"
        // (tagLocalRecipe in api.js ensures local recipes get one)
        const id = recipe.id || ('local-' + recipe.pk_recipes);
        const isSpoon = recipe.source === 'spoonacular';

        // small badge in the corner so users can tell at a glance which recipes are external
        const sourceBadge = isSpoon
            ? `<span class="recipe-source-badge spoon">SPOONACULAR</span>`
            : '';

        let imageHtml = '';
        if (recipe.imageUrl) {
            // onerror hides the image if spoonacular's CDN 404s (which happens occasionally)
            imageHtml = `<img src="${recipe.imageUrl}" alt="${recipe.name}" onerror="this.style.display='none'" style="width: 80px; height: 80px; object-fit: cover; float: left; margin-right: 15px; border-radius: 4px; border: 1px solid #ddd;">`;
        }

        html += `
            <div class="recipe-card" data-id="${id}">
                ${sourceBadge}
                ${imageHtml}
                <h3>${recipe.name}</h3>
                <p>${recipe.description || ''}</p>
                <div class="recipe-meta">
                    <small>⏱️ ${recipe.preparationTime}</small> |
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
        showRecipeDetail($(this).data('id')); // data-id is now the prefixed string id
    });
}
