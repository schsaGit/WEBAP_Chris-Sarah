// app.js - Entry point: initialises the application

$(document).ready(function() {
    function init() {
        loadDifficulties();
        loadIngredients();
        loadCategories();
        loadRecipes();
        setupEventListeners();
        apiCheckStatus();
    }

    init();
});
