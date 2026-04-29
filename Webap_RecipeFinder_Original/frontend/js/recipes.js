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

// fetches recipes from the API (with optional filters) and displays them as cards
// loads from BOTH local and spoonacular when no filter is active; falls back to local-only when category/difficulty is set
function loadRecipes(params = {}) {
    $('#recipes-container').html('Loading recipes...');
    $('#no-results').hide();

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
    $('#recipes-container').html(html);

    $('.recipe-card').click(function() {
        showRecipeDetail($(this).data('id')); // data-id is now the prefixed string id
    });
}
