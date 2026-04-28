// state.js - shared variables used by all other JavaScript files in the app

const API_BASE = '../backend/api/'; // the base URL for all backend API requests

let selectedIngredients = []; // holds the IDs of ingredients the user has checked in the filter panel
let currentView = 'list';     // tracks whether the user is on the recipe list ('list') or a detail page ('detail')
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // loads saved favorite recipe IDs from the browser's localStorage (persists after refresh)
let difficulties = {}; // will be filled with difficulty data (e.g. { "1": "Easy" }) after the API responds
