// app.js - entry point that starts the application once the page is fully loaded

$(document).ready(function() { // jQuery's way of waiting until the HTML is fully loaded before running code
    function init() {
        loadDifficulties();    // fetches difficulty levels and fills the dropdown
        loadIngredients();     // fetches all ingredients and builds the filter panel
        loadCategories();      // fetches categories and fills the dropdown
        loadRecipes();         // fetches and displays all recipes in the list
        setupEventListeners(); // wires all buttons and inputs to their handler functions
        apiCheckStatus();      // checks if the backend is reachable and updates the status indicator
    }

    init(); // kicks everything off
});
