const ADMIN_API = '../backend/api/administrator.php';
let users = [];
let recipes = [];

function showAdminMessage(message, isError = false) {
    $('#admin-message').text(message).toggleClass('admin-error', isError).show();
}

function adminRequest(resource, method, data, success) {
    $.ajax({
        url: ADMIN_API + '?resource=' + resource,
        type: method,
        data: method === 'GET' ? undefined : JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: success,
        error: function (xhr) {
            const response = xhr.responseJSON || {};
            showAdminMessage(response.error || 'Admin request failed.', true);
        }
    });
}

function clearUserForm() {
    $('#user-id').val('');
    $('#user-name').val('');
    $('#user-username').val('');
    $('#user-password').val('');
    $('#user-pfp').val('');
    $('#user-role').val('user');
}

function clearRecipeForm() {
    $('#recipe-id').val('');
    $('#recipe-name').val('');
    $('#recipe-description').val('');
    $('#recipe-image').val('');
    $('#recipe-time').val('');
    $('#recipe-category').val('1');
    $('#recipe-difficulty').val('1');
    $('#recipe-instructions').val('');
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char];
    });
}

function renderUsers() {
    const rows = users.map(user => `
        <tr>
            <td>${user.pk_userId}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.name || '')}</td>
            <td>${escapeHtml(user.role || 'user')}</td>
            <td>
                <button type="button" class="edit-user" data-id="${user.pk_userId}">Edit</button>
                <button type="button" class="delete-user" data-id="${user.pk_userId}">Delete</button>
            </td>
        </tr>
    `);

    $('#users-table').html(rows.join(''));
}

function renderRecipes() {
    const rows = recipes.map(recipe => `
        <tr>
            <td>${recipe.pk_recipes}</td>
            <td>${escapeHtml(recipe.name)}</td>
            <td>${recipe.preparationTime} min</td>
            <td>
                <button type="button" class="edit-recipe" data-id="${recipe.pk_recipes}">Edit</button>
                <button type="button" class="delete-recipe" data-id="${recipe.pk_recipes}">Delete</button>
            </td>
        </tr>
    `);

    $('#recipes-table').html(rows.join(''));
}

function loadUsers() {
    adminRequest('users', 'GET', null, function (data) {
        users = data.users || [];
        renderUsers();
    });
}

function loadRecipes() {
    adminRequest('recipes', 'GET', null, function (data) {
        recipes = data.recipes || [];
        renderRecipes();
    });
}

$('#user-form').on('submit', function (event) {
    event.preventDefault();

    const id = $('#user-id').val();
    const data = {
        id: id,
        name: $('#user-name').val(),
        username: $('#user-username').val(),
        password: $('#user-password').val(),
        pfp: $('#user-pfp').val(),
        role: $('#user-role').val()
    };

    adminRequest('users', id ? 'PUT' : 'POST', data, function (response) {
        showAdminMessage(response.message);
        clearUserForm();
        loadUsers();
    });
});

$('#recipe-form').on('submit', function (event) {
    event.preventDefault();

    const id = $('#recipe-id').val();
    const data = {
        id: id,
        name: $('#recipe-name').val(),
        description: $('#recipe-description').val(),
        imageUrl: $('#recipe-image').val(),
        preparationTime: $('#recipe-time').val(),
        category: $('#recipe-category').val(),
        difficulty: $('#recipe-difficulty').val(),
        instructions: $('#recipe-instructions').val()
    };

    adminRequest('recipes', id ? 'PUT' : 'POST', data, function (response) {
        showAdminMessage(response.message);
        clearRecipeForm();
        loadRecipes();
    });
});

$(document).on('click', '.edit-user', function () {
    const id = Number($(this).data('id'));
    const user = users.find(item => Number(item.pk_userId) === id);
    if (!user) return;

    $('#user-id').val(user.pk_userId);
    $('#user-name').val(user.name || '');
    $('#user-username').val(user.username || '');
    $('#user-password').val('');
    $('#user-pfp').val(user.pfp || '');
    $('#user-role').val(user.role || 'user');
});

$(document).on('click', '.delete-user', function () {
    const id = Number($(this).data('id'));
    if (!confirm('Delete this user?')) return;

    adminRequest('users', 'DELETE', { id: id }, function (response) {
        showAdminMessage(response.message);
        loadUsers();
    });
});

$(document).on('click', '.edit-recipe', function () {
    const id = Number($(this).data('id'));
    const recipe = recipes.find(item => Number(item.pk_recipes) === id);
    if (!recipe) return;

    $('#recipe-id').val(recipe.pk_recipes);
    $('#recipe-name').val(recipe.name || '');
    $('#recipe-description').val(recipe.description || '');
    $('#recipe-image').val(recipe.imageUrl || '');
    $('#recipe-time').val(recipe.preparationTime || '');
    $('#recipe-category').val(recipe.category || '1');
    $('#recipe-difficulty').val(recipe.difficulty || '1');
    $('#recipe-instructions').val(recipe.instructions || '');
});

$(document).on('click', '.delete-recipe', function () {
    const id = Number($(this).data('id'));
    if (!confirm('Delete this recipe?')) return;

    adminRequest('recipes', 'DELETE', { id: id }, function (response) {
        showAdminMessage(response.message);
        loadRecipes();
    });
});

$('#clear-user-form').on('click', clearUserForm);
$('#clear-recipe-form').on('click', clearRecipeForm);

loadUsers();
loadRecipes();
