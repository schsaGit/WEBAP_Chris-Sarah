// recipeForm.js - "Create Your Own Recipe" form
// The form appears in the detail section (same spot as recipe details) when the user clicks the button.
// On save it POSTs to create_recipe.php via jQuery AJAX using prepared statements on the server.
// Navigation back to the list is handled by the existing #back-btn in index.php — no second button needed.

// ── module-level state ────────────────────────────────────────────────────────
// allIngredients        — full list fetched once from ingredients.php
// recipeFormIngredients — array of { id, name, category, amount, unit }
//   (named distinctly to avoid clashing with the global selectedIngredients in state.js)
let allIngredients        = [];
let recipeFormIngredients = [];

// known categories for the "add new ingredient" mini-form
const INGREDIENT_CATEGORIES = [
    'Bakery', 'Dairy', 'Fish & Seafood', 'Fruit', 'Grains & Legumes',
    'Herbs & Spices', 'Meat & Poultry', 'Nuts & Seeds', 'Oils & Fats',
    'Sauces & Condiments', 'Spices', 'Sweeteners', 'Vegetables', 'Other'
];

// ── input field style helpers ─────────────────────────────────────────────────
const FIELD_STYLE  = 'padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1;';
const FOCUS_COLOR  = '#FA8112';
const BLUR_COLOR   = '#F5E7C6';

function bindFieldFocus(selector) {
    $(selector)
        .on('focus', function () { $(this).css('border-color', FOCUS_COLOR).css('outline', 'none'); })
        .on('blur',  function () { $(this).css('border-color', BLUR_COLOR); });
}

// ── builds and shows the create-recipe form ───────────────────────────────────
function showRecipeForm() {
    $('#recipes-section').hide();
    $('#detail-section').show();
    currentView = 'detail';

    // reset state each time the form is opened
    allIngredients        = [];
    recipeFormIngredients = [];

    const html = `
        <h2 style="color:#FA8112; margin: 0 0 20px;">🍳 Create Your Own Recipe</h2>

        <div id="recipe-form-msg" style="display:none; margin-bottom:14px; padding:10px 14px; border-radius:4px; font-size:14px;"></div>

        <form id="user-recipe-form" autocomplete="off">

            <!-- Recipe name -->
            <div style="margin-bottom:14px;">
                <label for="rf-name" style="display:block; font-weight:bold; margin-bottom:4px;">Recipe Name *</label>
                <input type="text" id="rf-name" name="name" required
                       placeholder="e.g. Grandma's Lasagna"
                       style="width:100%; max-width:500px; ${FIELD_STYLE}">
            </div>

            <!-- Description -->
            <div style="margin-bottom:14px;">
                <label for="rf-desc" style="display:block; font-weight:bold; margin-bottom:4px;">Description</label>
                <textarea id="rf-desc" name="description" rows="3"
                          placeholder="Short description of your dish…"
                          style="width:100%; max-width:600px; ${FIELD_STYLE} resize:vertical;"></textarea>
                <small style="color:#888;">&#8220;<b>Created by &lt;you&gt;</b>&#8221; will be appended automatically.</small>
            </div>

            <!-- Image URL -->
            <div style="margin-bottom:14px;">
                <label for="rf-img" style="display:block; font-weight:bold; margin-bottom:4px;">Image URL</label>
                <input type="url" id="rf-img" name="imageUrl"
                       placeholder="https://example.com/my-dish.jpg"
                       style="width:100%; max-width:600px; ${FIELD_STYLE}">
                <small style="color:#888;">Paste a direct link to an image (optional).</small>
            </div>

            <!-- Preparation time -->
            <div style="margin-bottom:14px;">
                <label for="rf-time" style="display:block; font-weight:bold; margin-bottom:4px;">Preparation Time (minutes) *</label>
                <input type="number" id="rf-time" name="preparationTime" required min="1" max="9999"
                       placeholder="e.g. 45"
                       style="width:140px; ${FIELD_STYLE}">
            </div>

            <!-- Category + Difficulty side by side -->
            <div style="display:flex; gap:30px; flex-wrap:wrap; margin-bottom:14px;">
                <div>
                    <label for="rf-cat" style="display:block; font-weight:bold; margin-bottom:4px;">Category *</label>
                    <select id="rf-cat" name="category" required
                            style="${FIELD_STYLE} width:200px;">
                        <option value="">– choose –</option>
                        <option value="1">🍽️ Main Course</option>
                        <option value="2">🥗 Side Dish</option>
                        <option value="3">🍲 Soup</option>
                        <option value="4">🍰 Sweets</option>
                    </select>
                </div>
                <div>
                    <label for="rf-diff" style="display:block; font-weight:bold; margin-bottom:4px;">Difficulty *</label>
                    <select id="rf-diff" name="difficulty" required
                            style="${FIELD_STYLE} width:200px;">
                        <option value="">– choose –</option>
                        <option value="1">⭐ Easy</option>
                        <option value="2">⭐⭐ Medium</option>
                        <option value="3">⭐⭐⭐ Hard</option>
                    </select>
                </div>
            </div>

            <!-- Instructions -->
            <div style="margin-bottom:20px;">
                <label for="rf-inst" style="display:block; font-weight:bold; margin-bottom:4px;">Instructions *</label>
                <textarea id="rf-inst" name="instructions" rows="8" required
                          placeholder="1. Preheat oven to 180°C…&#10;2. Mix the ingredients…&#10;3. Bake for 30 minutes…"
                          style="width:100%; max-width:700px; ${FIELD_STYLE} resize:vertical;"></textarea>
            </div>

            <!-- ══ Ingredients picker ══════════════════════════════════════════ -->
            <div style="margin-bottom:24px;">
                <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:15px;">Ingredients</label>

                <!-- search box -->
                <input type="text" id="rf-ing-search"
                       placeholder="🔍 Search ingredients…"
                       style="width:100%; max-width:500px; ${FIELD_STYLE} margin-bottom:6px;">

                <!-- live results list -->
                <div id="rf-ing-results"
                     style="max-width:500px; border:2px solid #F5E7C6; border-radius:4px; background:#FAF3E1; display:none; max-height:220px; overflow-y:auto;"></div>

                <!-- "add new" mini-form (hidden by default) -->
                <div id="rf-new-ing-form"
                     style="display:none; max-width:500px; margin-top:10px; padding:14px; border:2px solid #FA8112; border-radius:4px; background:#fff8ee;">
                    <div style="font-weight:bold; margin-bottom:10px; color:#FA8112;">➕ New Ingredient</div>
                    <div style="margin-bottom:8px;">
                        <label style="display:block; font-size:13px; margin-bottom:3px;">Name</label>
                        <input type="text" id="rf-new-ing-name"
                               style="width:100%; ${FIELD_STYLE}">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:13px; margin-bottom:3px;">Category</label>
                        <select id="rf-new-ing-cat" style="${FIELD_STYLE} width:100%;">
                            <option value="">– choose –</option>
                            ${INGREDIENT_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button type="button" id="rf-new-ing-confirm"
                                style="background:#FA8112; color:#FAF3E1; border:none; padding:8px 18px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:13px;">
                            ✅ Confirm
                        </button>
                        <button type="button" id="rf-new-ing-cancel"
                                style="background:#e0d5c5; color:#555; border:none; padding:8px 18px; border-radius:4px; cursor:pointer; font-size:13px;">
                            ✖ Cancel
                        </button>
                    </div>
                    <div id="rf-new-ing-err" style="display:none; color:#721c24; font-size:13px; margin-top:8px;"></div>
                </div>

                <!-- selected ingredients table -->
                <div id="rf-selected-wrapper" style="display:none; margin-top:14px; max-width:600px;">
                    <div style="font-weight:bold; margin-bottom:6px; font-size:13px; color:#555;">Selected Ingredients</div>
                    <table id="rf-selected-table"
                           style="width:100%; border-collapse:collapse; font-size:13px;">
                        <thead>
                            <tr style="background:#F5E7C6; text-align:left;">
                                <th style="padding:6px 10px;">Ingredient</th>
                                <th style="padding:6px 10px;">Category</th>
                                <th style="padding:6px 10px; width:90px;">Amount</th>
                                <th style="padding:6px 10px; width:110px;">Unit</th>
                                <th style="padding:6px 4px;"></th>
                            </tr>
                        </thead>
                        <tbody id="rf-selected-body"></tbody>
                    </table>
                </div>
            </div>
            <!-- ════════════════════════════════════════════════════════════════ -->

            <!-- Save button -->
            <button type="submit" id="rf-save-btn"
                    style="background-color:#FA8112; color:#FAF3E1; border:none; padding:10px 28px; font-size:15px; font-weight:bold; border-radius:4px; cursor:pointer;">
                💾 Save Recipe
            </button>

        </form>
    `;

    $('#recipe-detail').html(html);

    bindFieldFocus('#user-recipe-form input, #user-recipe-form textarea, #user-recipe-form select');

    // fetch ingredient list, then wire up the search UI
    fetchIngredients();

    // ── form submit ────────────────────────────────────────────────────────────
    $('#user-recipe-form').submit(function (e) {
        e.preventDefault();

        const $btn = $('#rf-save-btn');
        const $msg = $('#recipe-form-msg');

        $btn.prop('disabled', true).text('Saving…');
        $msg.hide();

        // collect the form fields + the selected-ingredients JSON
        const formData = $(this).serializeArray();
        formData.push({ name: 'ingredients', value: JSON.stringify(
            recipeFormIngredients.map(i => ({ id: i.id, amount: i.amount, unit: i.unit }))
        )});

        $.ajax({
            url: '../backend/api/create_recipe.php',
            method: 'POST',
            data: formData,
            dataType: 'json',
            success: function (data) {
                $msg
                    .css({ 'background-color': '#d4edda', 'color': '#155724', 'border': '1px solid #c3e6cb' })
                    .text('✅ ' + data.message)
                    .show();

                $btn.prop('disabled', false).text('💾 Save Recipe');

                if (data.pk_recipes) {
                    setTimeout(function () {
                        showRecipeDetail('local-' + data.pk_recipes);
                    }, 1500);
                }
            },
            error: function (xhr) {
                let errMsg = 'Something went wrong. Please try again.';
                try {
                    const resp = JSON.parse(xhr.responseText);
                    if (resp.error) { errMsg = resp.error; }
                } catch (ex) { /* ignore */ }

                $msg
                    .css({ 'background-color': '#f8d7da', 'color': '#721c24', 'border': '1px solid #f5c6cb' })
                    .text('❌ ' + errMsg)
                    .show();

                $btn.prop('disabled', false).text('💾 Save Recipe');
            }
        });
    });
}

// ── fetch the full ingredients list once ──────────────────────────────────────
function fetchIngredients() {
    $.getJSON('../backend/api/ingredients.php', function (data) {
        allIngredients = data || [];
        wireIngredientSearch();
    }).fail(function () {
        // non-fatal — search just won't show results
        wireIngredientSearch();
    });
}

// ── wire up the live ingredient search ───────────────────────────────────────
function wireIngredientSearch() {
    const $search  = $('#rf-ing-search');
    const $results = $('#rf-ing-results');

    $search.on('input', function () {
        const q = $(this).val().trim().toLowerCase();
        renderSearchResults(q);
    });

    $search.on('focus', function () {
        const q = $(this).val().trim().toLowerCase();
        if (q.length > 0) { renderSearchResults(q); }
    });

    // close results when clicking outside
    $(document).on('mousedown.ingSearch', function (e) {
        if (!$(e.target).closest('#rf-ing-results, #rf-ing-search').length) {
            $results.hide();
        }
    });
}

// renders matching rows + optional "add new" button
function renderSearchResults(q) {
    const $results = $('#rf-ing-results');

    if (q === '') {
        $results.hide();
        return;
    }

    const matches = allIngredients.filter(i =>
        i.name.toLowerCase().includes(q)
    );

    let html = '';

    if (matches.length > 0) {
        matches.forEach(ing => {
            const alreadyAdded = recipeFormIngredients.some(s => s.id === parseInt(ing.pk_ingredients));
            html += `
                <div class="rf-ing-row"
                     data-id="${ing.pk_ingredients}"
                     data-name="${escapeAttr(ing.name)}"
                     data-category="${escapeAttr(ing.category)}"
                     style="display:flex; align-items:center; gap:8px; padding:7px 10px;
                            border-bottom:1px solid #F5E7C6; cursor:default;
                            ${alreadyAdded ? 'opacity:0.5;' : ''}">
                    <span style="flex:1; font-size:13px;">${escapeHtml(ing.name)}</span>
                    <span style="font-size:12px; color:#888; flex:0 0 120px;">${escapeHtml(ing.category)}</span>
                    <input type="number" min="0" step="any" placeholder="amount"
                           class="rf-row-amount"
                           style="width:70px; padding:4px 6px; border:1px solid #F5E7C6; border-radius:3px;
                                  font-size:12px; background:#FAF3E1;" ${alreadyAdded ? 'disabled' : ''}>
                    <input type="text" placeholder="unit"
                           class="rf-row-unit"
                           style="width:70px; padding:4px 6px; border:1px solid #F5E7C6; border-radius:3px;
                                  font-size:12px; background:#FAF3E1;" ${alreadyAdded ? 'disabled' : ''}>
                    <button type="button" class="rf-add-ing-btn"
                            style="background:#FA8112; color:#FAF3E1; border:none; padding:4px 10px;
                                   border-radius:3px; font-size:12px; font-weight:bold; cursor:pointer;
                                   white-space:nowrap;" ${alreadyAdded ? 'disabled' : ''}>
                        ${alreadyAdded ? '✓ Added' : '+ Add'}
                    </button>
                </div>`;
        });
    } else {
        html += `<div style="padding:8px 12px; font-size:13px; color:#888; font-style:italic;">No matches found.</div>`;
    }

    // exact-name match check (case-insensitive) to decide whether to show "add new"
    const exactMatch = allIngredients.some(i => i.name.toLowerCase() === q);
    if (!exactMatch) {
        html += `
            <div id="rf-add-new-btn"
                 style="padding:8px 12px; font-size:13px; color:#FA8112; font-weight:bold;
                        cursor:pointer; border-top:1px solid #F5E7C6; background:#fff8ee;">
                ➕ Add "${escapeHtml($('#rf-ing-search').val().trim())}" as new ingredient
            </div>`;
    }

    $results.html(html).show();

    // ── add button handler ─────────────────────────────────────────────────
    $results.find('.rf-add-ing-btn').on('click', function (e) {
        e.stopPropagation();
        const $row    = $(this).closest('.rf-ing-row');
        const id      = parseInt($row.data('id'));
        const name    = $row.data('name');
        const category = $row.data('category');
        const amount  = $row.find('.rf-row-amount').val().trim();
        const unit    = $row.find('.rf-row-unit').val().trim();

        addSelectedIngredient({ id, name, category, amount, unit });
        renderSearchResults($('#rf-ing-search').val().trim().toLowerCase());
    });

    // ── "add new" button handler ───────────────────────────────────────────
    $results.find('#rf-add-new-btn').on('click', function (e) {
        e.stopPropagation();
        openNewIngredientForm($('#rf-ing-search').val().trim());
        $results.hide();
    });
}

// ── selected-ingredient list management ──────────────────────────────────────
function addSelectedIngredient(ing) {
    if (recipeFormIngredients.some(s => s.id === ing.id)) { return; }
    recipeFormIngredients.push(ing);
    renderSelectedTable();
}

function removeSelectedIngredient(id) {
    recipeFormIngredients = recipeFormIngredients.filter(s => s.id !== id);
    renderSelectedTable();
}

function renderSelectedTable() {
    const $wrapper = $('#rf-selected-wrapper');
    const $body    = $('#rf-selected-body');

    if (recipeFormIngredients.length === 0) {
        $wrapper.hide();
        return;
    }

    $wrapper.show();

    const rows = recipeFormIngredients.map(ing => `
        <tr data-id="${ing.id}" style="border-bottom:1px solid #F5E7C6;">
            <td style="padding:6px 10px;">${escapeHtml(ing.name)}</td>
            <td style="padding:6px 10px; color:#888; font-size:12px;">${escapeHtml(ing.category)}</td>
            <td style="padding:6px 10px;">
                <input type="number" min="0" step="any" class="rf-sel-amount"
                       value="${escapeAttr(ing.amount)}"
                       style="width:75px; padding:4px 6px; border:1px solid #F5E7C6;
                              border-radius:3px; font-size:12px; background:#FAF3E1;">
            </td>
            <td style="padding:6px 10px;">
                <input type="text" class="rf-sel-unit"
                       value="${escapeAttr(ing.unit)}"
                       style="width:80px; padding:4px 6px; border:1px solid #F5E7C6;
                              border-radius:3px; font-size:12px; background:#FAF3E1;">
            </td>
            <td style="padding:6px 4px; text-align:center;">
                <button type="button" class="rf-remove-ing"
                        style="background:none; border:none; color:#c0392b; font-size:16px;
                               cursor:pointer; line-height:1;">✕</button>
            </td>
        </tr>`).join('');

    $body.html(rows);

    // keep amount/unit in sync with recipeFormIngredients as the user edits them
    $body.find('.rf-sel-amount').on('input', function () {
        const id = parseInt($(this).closest('tr').data('id'));
        const ing = recipeFormIngredients.find(s => s.id === id);
        if (ing) { ing.amount = $(this).val().trim(); }
    });

    $body.find('.rf-sel-unit').on('input', function () {
        const id = parseInt($(this).closest('tr').data('id'));
        const ing = recipeFormIngredients.find(s => s.id === id);
        if (ing) { ing.unit = $(this).val().trim(); }
    });

    $body.find('.rf-remove-ing').on('click', function () {
        const id = parseInt($(this).closest('tr').data('id'));
        removeSelectedIngredient(id);
    });
}

// ── inline "add new ingredient" mini-form ────────────────────────────────────
function openNewIngredientForm(prefillName) {
    const $form = $('#rf-new-ing-form');
    $('#rf-new-ing-name').val(prefillName);
    $('#rf-new-ing-cat').val('');
    $('#rf-new-ing-err').hide().text('');
    $form.show();

    bindFieldFocus('#rf-new-ing-name, #rf-new-ing-cat');

    // cancel
    $('#rf-new-ing-cancel').off('click').on('click', function () {
        $form.hide();
    });

    // confirm — save via AJAX, then auto-add to selected list
    $('#rf-new-ing-confirm').off('click').on('click', function () {
        const name     = $('#rf-new-ing-name').val().trim();
        const category = $('#rf-new-ing-cat').val();
        const $err     = $('#rf-new-ing-err');

        if (!name) {
            $err.text('Please enter a name.').show();
            return;
        }
        if (!category) {
            $err.text('Please choose a category.').show();
            return;
        }

        const $btn = $(this);
        $btn.prop('disabled', true).text('Saving…');
        $err.hide();

        $.ajax({
            url: '../backend/api/add_ingredient.php',
            method: 'POST',
            data: { name, category },
            dataType: 'json',
            success: function (data) {
                // push into local list so search finds it immediately
                const newIng = {
                    pk_ingredients: String(data.pk_ingredients),
                    name:     data.name,
                    category: data.category
                };
                allIngredients.push(newIng);
                allIngredients.sort((a, b) => a.name.localeCompare(b.name));

                // auto-add to selected with blank amount/unit
                addSelectedIngredient({
                    id:       data.pk_ingredients,
                    name:     data.name,
                    category: data.category,
                    amount:   '',
                    unit:     ''
                });

                $form.hide();
                $('#rf-ing-search').val('');
                $('#rf-ing-results').hide();

                $btn.prop('disabled', false).text('✅ Confirm');
            },
            error: function (xhr) {
                let errMsg = 'Failed to save ingredient.';
                try {
                    const resp = JSON.parse(xhr.responseText);
                    if (resp.error) { errMsg = resp.error; }
                } catch (ex) { /* ignore */ }
                $err.text(errMsg).show();
                $btn.prop('disabled', false).text('✅ Confirm');
            }
        });
    });
}

// ── small HTML-escaping helpers ───────────────────────────────────────────────
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return String(str ?? '').replace(/"/g, '&quot;');
}
