// state.js - shared variables used by all other JavaScript files in the app

const API_BASE = '../backend/api/'; // the base URL for all backend API requests

let selectedIngredients = []; // holds the IDs of ingredients the user has checked in the filter panel
let currentView = 'list';     // tracks whether the user is on the recipe list ('list') or a detail page ('detail')
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // loads saved favorite recipe IDs from the browser's localStorage (persists after refresh)

// migration: old favorites were stored as plain integers (e.g. 7) — convert to "local-7" so we can mix sources
favorites = favorites.map(id => (typeof id === 'number' ? 'local-' + id : id));
localStorage.setItem('favorites', JSON.stringify(favorites));
let difficulties = {}; // will be filled with difficulty data (e.g. { "1": "Easy" }) after the API responds
