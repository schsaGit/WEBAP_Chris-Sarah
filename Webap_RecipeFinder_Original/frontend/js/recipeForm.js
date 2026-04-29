// recipeForm.js - "Create Your Own Recipe" form
// The form appears in the detail section (same spot as recipe details) when the user clicks the button.
// On save it POSTs to create_recipe.php via jQuery AJAX using prepared statements on the server.
// Navigation back to the list is handled by the existing #back-btn in index.php — no second button needed.

// builds and shows the create-recipe form inside #detail-section / #recipe-detail
function showRecipeForm() {
    $('#recipes-section').hide();   // hide the list, just like when a detail is opened
    $('#detail-section').show();
    currentView = 'detail';

    const html = `
        <h2 style="color:#FA8112; margin: 0 0 20px;">🍳 Create Your Own Recipe</h2>

        <div id="recipe-form-msg" style="display:none; margin-bottom:14px; padding:10px 14px; border-radius:4px; font-size:14px;"></div>

        <form id="user-recipe-form" autocomplete="off">

            <!-- Recipe name -->
            <div style="margin-bottom:14px;">
                <label for="rf-name" style="display:block; font-weight:bold; margin-bottom:4px;">Recipe Name *</label>
                <input type="text" id="rf-name" name="name" required
                       placeholder="e.g. Grandma's Lasagna"
                       style="width:100%; max-width:500px; padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1;">
            </div>

            <!-- Description -->
            <div style="margin-bottom:14px;">
                <label for="rf-desc" style="display:block; font-weight:bold; margin-bottom:4px;">Description</label>
                <textarea id="rf-desc" name="description" rows="3"
                          placeholder="Short description of your dish…"
                          style="width:100%; max-width:600px; padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1; resize:vertical;"></textarea>
                <small style="color:#888;">&#8220;<b>Created by &lt;you&gt;</b>&#8221; will be appended automatically.</small>
            </div>

            <!-- Image URL -->
            <div style="margin-bottom:14px;">
                <label for="rf-img" style="display:block; font-weight:bold; margin-bottom:4px;">Image URL</label>
                <input type="url" id="rf-img" name="imageUrl"
                       placeholder="https://example.com/my-dish.jpg"
                       style="width:100%; max-width:600px; padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1;">
                <small style="color:#888;">Paste a direct link to an image (optional).</small>
            </div>

            <!-- Preparation time -->
            <div style="margin-bottom:14px;">
                <label for="rf-time" style="display:block; font-weight:bold; margin-bottom:4px;">Preparation Time (minutes) *</label>
                <input type="number" id="rf-time" name="preparationTime" required min="1" max="9999"
                       placeholder="e.g. 45"
                       style="width:140px; padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1;">
            </div>

            <!-- Category + Difficulty side by side -->
            <div style="display:flex; gap:30px; flex-wrap:wrap; margin-bottom:14px;">

                <div>
                    <label for="rf-cat" style="display:block; font-weight:bold; margin-bottom:4px;">Category *</label>
                    <select id="rf-cat" name="category" required
                            style="padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1; width:200px;">
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
                            style="padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1; width:200px;">
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
                          style="width:100%; max-width:700px; padding:9px 12px; border:2px solid #F5E7C6; border-radius:4px; font-size:14px; background:#FAF3E1; resize:vertical;"></textarea>
            </div>

            <!-- Save button -->
            <button type="submit" id="rf-save-btn"
                    style="background-color:#FA8112; color:#FAF3E1; border:none; padding:10px 28px; font-size:15px; font-weight:bold; border-radius:4px; cursor:pointer;">
                💾 Save Recipe
            </button>

        </form>
    `;

    $('#recipe-detail').html(html);

    // ── focus helpers — match the global focus style from style.css ────────
    $('#user-recipe-form input, #user-recipe-form textarea, #user-recipe-form select').on('focus', function () {
        $(this).css('border-color', '#FA8112').css('outline', 'none');
    }).on('blur', function () {
        $(this).css('border-color', '#F5E7C6');
    });

    // ── form submit ────────────────────────────────────────────────────────
    $('#user-recipe-form').submit(function (e) {
        e.preventDefault(); // stop the default browser page-reload behaviour

        const $btn = $('#rf-save-btn');
        const $msg = $('#recipe-form-msg');

        $btn.prop('disabled', true).text('Saving…');
        $msg.hide();

        $.ajax({
            url: '../backend/api/create_recipe.php',
            method: 'POST',
            data: $(this).serialize(), // serialises all named form fields automatically
            dataType: 'json',
            success: function (data) {
                // show green success message
                $msg
                    .css({ 'background-color': '#d4edda', 'color': '#155724', 'border': '1px solid #c3e6cb' })
                    .text('✅ ' + data.message)
                    .show();

                $btn.prop('disabled', false).text('💾 Save Recipe');

                // jump straight to the new recipe's detail view after a short pause
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
                } catch (ex) { /* ignore parse errors */ }

                $msg
                    .css({ 'background-color': '#f8d7da', 'color': '#721c24', 'border': '1px solid #f5c6cb' })
                    .text('❌ ' + errMsg)
                    .show();

                $btn.prop('disabled', false).text('💾 Save Recipe');
            }
        });
    });
}
