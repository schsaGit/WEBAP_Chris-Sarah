$(document).ready(function() {
    const API_BASE = '../backend/api/';
    let selectedIngredients = [];
    let currentView = 'list';
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let difficulties = {};

    init();

    function init() {
        loadDifficulties();
        loadIngredients();
        loadCategories();
        loadRecipes();
        setupEventListeners();
        checkApiStatus();
    }

    function loadDifficulties() {
        $.getJSON(API_BASE + 'difficulty.php', function(data) {
            difficulties = data;
            let html = '<option value="">All Difficulties</option>';
            for (const [id, name] of Object.entries(data)) {
                html += `<option value="${id}">${name}</option>`;
            }
            $('#difficulty-filter').html(html);
        });
    }

    function checkApiStatus() {
        $.get(API_BASE + 'recipes.php')
            .done(() => $('#api-status').text('API Status: Connected ✓'))
            .fail(() => $('#api-status').text('API Status: Error ✗'));
    }

    function loadIngredients() {
        $.getJSON(API_BASE + 'ingredients.php', function(data) {
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
        }).fail(function() {
            $('#ingredients-list').html('<p style="color: red;">Error loading ingredients</p>');
        });
    }

    function loadCategories() {
        $.getJSON(API_BASE + 'categories.php', function(data) {
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

        let url = API_BASE + 'recipes.php';
        const queryParams = [];

        if (params.category) queryParams.push(`category=${params.category}`);
        if (params.difficulty) queryParams.push(`difficulty=${params.difficulty}`);
        if (params.ids) queryParams.push(`ids=${params.ids}`);

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }

        $.getJSON(url, function(data) {
            if (data.recipes && data.recipes.length > 0) {
                displayRecipes(data.recipes);
                $('#recipe-count').text(`(${data.count})`);
            } else {
                $('#recipes-container').html('');
                $('#no-results').show();
                $('#recipe-count').text('(0)');
            }
        }).fail(function() {
            $('#recipes-container').html('Error loading recipes');
        });
    }

    function displayRecipes(recipes) {
        let html = '';
        recipes.forEach(recipe => {
            let imageHtml = '';
            if (recipe.imageUrl) {
                imageHtml = `
                    <img src="${recipe.imageUrl}" 
                         alt="${recipe.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; float: left; margin-right: 15px; border-radius: 4px; border: 1px solid #ddd;">
                `;
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

        $('.recipe-card').click(function(e) {
            const recipeId = $(this).data('id');
            showRecipeDetail(recipeId);
        });
    }

    function toggleFavorite(recipeId) {
        if (favorites.includes(recipeId)) {
            favorites = favorites.filter(id => id !== recipeId);
        } else {
            favorites.push(recipeId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));

        $(`.favorite-heart-detail[data-id="${recipeId}"]`).text(
            favorites.includes(recipeId) ? '❤️' : '🤍'
        );
    }

    function showFavorites() {
        if (favorites.length === 0) {
            $('#recipes-container').html('<p>No favorites yet</p>');
            $('#recipe-count').text('(0)');
            return;
        }

        const favoriteIds = favorites.join(',');
        loadRecipes({ ids: favoriteIds });
    }

    function filterByIngredients() {
        if (selectedIngredients.length === 0) {
            alert('Please select at least one ingredient');
            return;
        }

        const ingredientsStr = selectedIngredients.join(',');
        $('#recipes-container').html('Searching recipes...');

        $.getJSON(API_BASE + 'filter.php?ingredients=' + ingredientsStr, function(data) {
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
                            html += `
                                <p style="margin: 4px 0;"><strong>${category}:</strong> ${ingredients.join(', ')}</p>
                            `;
                        });
                        html += `</div>`;
                    }

                    if (recipe.missing_ingredients > 0) {
                        html += `
                            <p style="color: #d9534f;"><small>❌ Missing: ${recipe.missing_list.join(', ')}</small></p>
                        `;
                    } else {
                        html += `<p style="color: #5cb85c;"><small>✓ All selected ingredients available!</small></p>`;
                    }

                    html += `</div>`;
                });

                $('#recipes-container').html(html);
                $('#recipe-count').text(`(${data.count})`);

                $('.recipe-card').click(function(e) {
                    const recipeId = $(this).data('id');
                    showRecipeDetail(recipeId);
                });
            } else {
                $('#recipes-container').html('❌ No recipes found with selected ingredients');
                $('#recipe-count').text('(0)');
            }
        }).fail(function() {
            $('#recipes-container').html('<p style="color: red;">Error loading filtered recipes</p>');
        });
    }

    function showRecipeDetail(recipeId) {
        $('#recipes-section').hide();
        $('#detail-section').show();
        $('#recipe-detail').html('Loading details...');
        currentView = 'detail';

        console.log('Loading recipe with ID:', recipeId);

        $.ajax({
            url: API_BASE + 'recipes.php?id=' + recipeId,
            type: 'GET',
            dataType: 'json',
            success: function(recipe) {
                console.log('Recipe loaded:', recipe);

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
                html +=`<button onclick="window.open('../backend/api/recipes.php?id=${recipeId}', '_blank')" style="margin-top: 20px;">Open API Endpoint</button>`;

                $('#recipe-detail').html(html);

                $('.favorite-heart-detail').click(function() {
                    const id = $(this).data('id');
                    toggleFavorite(id);
                    $(this).text(favorites.includes(id) ? '❤️' : '🤍');
                });

                loadSimilarRecipes(recipeId);
            },
            error: function(xhr, status, error) {
                console.error('Error loading recipe:', status, error);
                console.error('Response:', xhr.responseText);
                $('#recipe-detail').html('<p style="color: red;">Error loading recipe details. Please try again.</p>');
            }
        });
    }

    function loadSimilarRecipes(recipeId) {
        $.getJSON(API_BASE + 'similar.php?id=' + recipeId, function(data) {
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

                $('.similar-recipe-card').click(function(e) {
                    const id = $(this).data('id');
                    showRecipeDetail(id);
                });
            }
        });
    }

    function showRecipeList() {
        $('#detail-section').hide();
        $('#recipes-section').show();
        currentView = 'list';
    }

    function updateSelectedCount() {
        const count = selectedIngredients.length;
        const btnText = count > 0 ?
            `Filter recipes (${count} ingredients)` :
            'Filter recipes';
        $('#filter-btn').text(btnText);
    }

    function setupEventListeners() {
        $('#search-btn').click(function() {
            const searchTerm = $('#search-input').val();
            if (searchTerm) {
                $.getJSON(API_BASE + 'search.php?q=' + encodeURIComponent(searchTerm), function(data) {
                    if (data.recipes && data.recipes.length > 0) {
                        displayRecipes(data.recipes);
                        $('#recipe-count').text(`(${data.count} for "${data.search_term}")`);
                    } else {
                        $('#recipes-container').html(`No results for "${searchTerm}"`);
                        $('#recipe-count').text('');
                    }
                });
            }
        });

        $('#search-input').keypress(function(e) {
            if (e.which === 13) {
                $('#search-btn').click();
            }
        });

        $('#favorites-btn').click(showFavorites);

        $('#filter-btn').click(filterByIngredients);

        $('#clear-btn').click(function() {
            selectedIngredients = [];
            $('.ingredient-item input[type="checkbox"]').prop('checked', false);
            updateSelectedCount();
            loadRecipes();
        });

        $('#category-filter').change(function() {
            const category = $(this).val();
            const difficulty = $('#difficulty-filter').val();
            loadRecipes({ category, difficulty });
        });

        $('#difficulty-filter').change(function() {
            const difficulty = $(this).val();
            const category = $('#category-filter').val();
            loadRecipes({ category, difficulty });
        });

        $('#random-btn').click(function() {
            $.getJSON(API_BASE + 'random.php', function(data) {
                if (data && data.pk_recipes) {
                    showRecipeDetail(data.pk_recipes);
                } else {
                    alert('No recipe found');
                }
            }).fail(function() {
                alert('Error loading random recipe');
            });
        });

        $('#back-btn').click(showRecipeList);
    }
});
