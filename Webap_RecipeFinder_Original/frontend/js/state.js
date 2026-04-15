// state.js - Shared application state and constants

const API_BASE = '../backend/api/';
let selectedIngredients = [];
let currentView = 'list';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let difficulties = {};
