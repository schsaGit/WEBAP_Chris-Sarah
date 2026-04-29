Recipe Finder
A full-stack web application that lets users browse, search, filter, favorite, and create recipes. Recipes are pulled from a local MySQL database and the external Spoonacular API, then merged into a single unified view.
Built as a school web-application project by Chris & Sarah.

Table of Contents

Features
Tech Stack
Project Structure
Getting Started (XAMPP)
Database Schema
Configuration
API Reference

Local Recipe API
Spoonacular Proxy API
Authentication Pages
Admin API
User-generated content
Generic CRUD demo (api.php)


Authentication & Roles
Frontend Architecture
Authors


Features

Browse all recipes with category, difficulty, and ingredient filters
Full-text search across recipe name and description (with relevance ranking)
Find recipes that contain all selected ingredients
"Similar recipes" suggestions based on shared ingredients
Random-recipe button
Favorites (stored client-side)
User registration / login (cookie session, hashed passwords)
Account settings (change password, sign out)
"Create your own recipe" form for logged-in users
Add new ingredients on the fly
Administrator dashboard for managing users and recipes
External Spoonacular results merged seamlessly with local recipes


Tech Stack
LayerTechnologyFrontendHTML5, CSS3, vanilla JavaScript, jQuery 3.7BackendPHP 8 (no framework)DatabaseMySQL / MariaDB (mysqli)External APISpoonacular Food APIServerApache (XAMPP)

Project Structure
WEBAP_Chris-Sarah/
└── Webap_RecipeFinder_Original/
    ├── frontend/
    │   ├── index.php              # Main entry point (with auth-aware buttons)
    │   ├── index.html             # Static fallback
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       ├── state.js           # Shared global state
    │       ├── api.js             # All AJAX wrappers
    │       ├── recipes.js         # Recipe list rendering
    │       ├── ingredients.js     # Ingredient filter panel
    │       ├── detail.js          # Single-recipe detail view
    │       ├── favorites.js       # Favorites (localStorage)
    │       ├── recipeForm.js      # "Create your own recipe" form
    │       ├── admin.js           # Admin dashboard logic
    │       ├── events.js          # Click/input wiring
    │       └── app.js             # Entry point
    └── backend/
        ├── db.php                 # connectDB(), jsonResponse(), loadJsonFile()
        ├── admin.php              # Admin dashboard page (PHP-rendered)
        ├── config/
        │   └── api_keys.php       # SPOONACULAR_KEY (NOT committed)
        ├── data/
        │   ├── categories.json    # Category id → {name, icon}
        │   └── difficulties.json  # Difficulty id → {name, stars, color}
        └── api/
            ├── api.php            # Generic CRUD demo router
            ├── get.php / post.php / put.php / delete.php
            ├── recipes.php        # Recipe list / detail
            ├── ingredients.php
            ├── ingredient-recipes.php
            ├── categories.php
            ├── difficulty.php
            ├── search.php
            ├── filter.php
            ├── random.php
            ├── similar.php
            ├── login.php
            ├── register.php
            ├── settings.php
            ├── administrator.php  # Admin REST endpoints
            ├── add_ingredient.php
            ├── create_recipe.php
            └── spoonacular/
                ├── _client.php    # Shared Spoonacular HTTP helper
                ├── recipes.php
                ├── search.php
                ├── filter.php
                └── random.php

Getting Started (XAMPP)
1. Prerequisites

XAMPP (Apache + MySQL + PHP 8+)
A free Spoonacular API key from https://spoonacular.com/food-api

2. Clone the repository
bashgit clone https://github.com/<your-org>/WEBAP_Chris-Sarah.git
cd WEBAP_Chris-Sarah
Copy or symlink the Webap_RecipeFinder_Original folder into the XAMPP htdocs directory (e.g. C:\xampp\htdocs\Webap_RecipeFinder_Original).
3. Start Apache and MySQL
Open the XAMPP control panel and start both services.
4. Create the database
Open http://localhost/phpmyadmin, create a database named recipe, then run the SQL from the Database Schema section below.
5. Configure the Spoonacular key
Edit Webap_RecipeFinder_Original/backend/config/api_keys.php and replace the placeholder:
php<?php
define('SPOONACULAR_KEY', 'your-real-spoonacular-key-here');
?>

The default DB credentials in backend/db.php are root / no password / recipe — fine for a local XAMPP install.

6. Open the app
Visit:
http://localhost/Webap_RecipeFinder_Original/frontend/index.php
You should see the recipe list. The footer reads API Status: Connected ✓ when everything is wired up.

Database Schema
The app uses a MySQL database called recipe with four tables. The schema below is inferred from the SQL queries in the codebase.
sqlCREATE DATABASE IF NOT EXISTS recipe
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE recipe;

-- ─────────────────────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE Users (
    pk_userId   INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(64)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,           -- bcrypt hash from password_hash()
    name        VARCHAR(128) NULL,
    pfp         VARCHAR(255) NULL,               -- profile picture URL
    role        ENUM('user', 'administrator') NOT NULL DEFAULT 'user',
    created     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- Recipes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE recipes (
    pk_recipes      INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT NULL,
    imageUrl        VARCHAR(512) NULL,
    preparationTime INT NOT NULL,                -- minutes
    category        INT NOT NULL,                -- 1=Main 2=Side 3=Soup 4=Dessert
    difficulty      INT NOT NULL,                -- 1=Easy 2=Medium 3=Hard
    instructions    TEXT NOT NULL,
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- Ingredients
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ingredients (
    pk_ingredients INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(128) NOT NULL UNIQUE,
    category       VARCHAR(64) NULL              -- e.g. 'Vegetable', 'Dairy', …
);

-- ─────────────────────────────────────────────────────────────
-- Recipe ↔ Ingredient join table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE includes (
    pkfk_recipe     INT NOT NULL,
    pkfk_ingredient INT NOT NULL,
    amount          VARCHAR(32) NULL,            -- "200", "1/2", "to taste"
    unit            VARCHAR(32) NULL,            -- "g", "ml", "tbsp"
    PRIMARY KEY (pkfk_recipe, pkfk_ingredient),
    FOREIGN KEY (pkfk_recipe)     REFERENCES recipes(pk_recipes)         ON DELETE CASCADE,
    FOREIGN KEY (pkfk_ingredient) REFERENCES ingredients(pk_ingredients) ON DELETE CASCADE
);
Categories and difficulties are not stored in DB tables — they live in JSON files at backend/data/categories.json and backend/data/difficulties.json.

Configuration
FilePurposebackend/db.phpMySQL host / user / password / db namebackend/config/api_keys.phpSPOONACULAR_KEY constantbackend/data/categories.jsonCategory id → display name + emoji iconbackend/data/difficulties.jsonDifficulty id → name, star rating, badge color
Cookies set by the app:
CookieSet byLifetimeContentsuserlogin.php / register.php90 daysThe numeric pk_userId

API Reference
All endpoints live under:
http://localhost/Webap_RecipeFinder_Original/backend/api/
Every JSON endpoint returns Content-Type: application/json and standard HTTP status codes (200, 201, 400, 401, 403, 404, 405, 409, 422, 500, 502).
Local Recipe API
GET /recipes.php
List recipes, optionally filtered.
Query params
ParamTypeDescriptioncategoryintOptional. Filter by category id (1–4).difficultyintOptional. Filter by difficulty id (1–3).idsstringOptional. Comma-separated list of recipe ids (used for favorites).
Example
GET /backend/api/recipes.php?category=1&difficulty=2
Response 200
json{
  "count": 2,
  "recipes": [
    {
      "pk_recipes": 7,
      "name": "Spaghetti Bolognese",
      "description": "Classic Italian pasta with rich meat sauce.",
      "imageUrl": "https://…/bolognese.jpg",
      "preparationTime": 45,
      "category": 1,
      "difficulty": 2,
      "instructions": "1. Heat oil…",
      "categoryName": "Main Course",
      "categoryIcon": "🍽️",
      "difficultyName": "Medium",
      "difficultyStars": "⭐⭐",
      "ingredient_count": 9
    }
  ]
}
GET /recipes.php?id={id}
Get the full detail of a single recipe (including its ingredient list).
Response 200
json{
  "pk_recipes": 7,
  "name": "Spaghetti Bolognese",
  "description": "…",
  "imageUrl": "…",
  "preparationTime": 45,
  "category": 1,
  "difficulty": 2,
  "instructions": "1. Heat oil…",
  "categoryName": "Main Course",
  "categoryIcon": "🍽️",
  "difficultyName": "Medium",
  "difficultyStars": "⭐⭐",
  "ingredients": [
    { "pk_ingredients": 12, "name": "Onion", "category": "Vegetable", "amount": "1", "unit": "pc" },
    { "pk_ingredients": 18, "name": "Ground beef", "category": "Meat",  "amount": "500", "unit": "g" }
  ]
}
Errors: 404 { "error": "Recipe not found" }

GET /search.php?q={term}
Full-text search by recipe name or description (with relevance ranking — name matches are ranked above description matches).
Example
GET /backend/api/search.php?q=pasta
Response 200
json{
  "count": 3,
  "search_term": "pasta",
  "recipes": [ /* same shape as recipes.php list */ ]
}
Errors: 400 { "error": "Search term is missing" }

GET /filter.php?ingredients={ids}
Find recipes that contain all the supplied ingredient IDs.
Example
GET /backend/api/filter.php?ingredients=1,5,12
Response 200
json{
  "count": 1,
  "selected_ingredients_count": 3,
  "recipes": [
    {
      "pk_recipes": 7,
      "name": "Spaghetti Bolognese",
      "description": "…",
      "preparationTime": 45,
      "category": 1,
      "difficulty": 2,
      "total_ingredients": 9,
      "matching_ingredients": 3,
      "missing_ingredients": 6,
      "missing_list": ["Garlic", "Carrot", "..."],
      "matching_ingredients_by_category": {
        "Vegetable": ["Onion", "Tomato"],
        "Meat":      ["Ground beef"]
      }
    }
  ]
}
Errors: 400 { "error": "No ingredients selected" } / 400 { "error": "Invalid ingredient IDs" }

GET /similar.php?id={id}
Returns up to 5 recipes that share at least 3 ingredients with the given recipe, sorted by overlap.
Response 200
json{
  "count": 2,
  "similar_recipes": [
    {
      "pk_recipes": 11,
      "name": "Lasagna",
      "description": "…",
      "imageUrl": "…",
      "preparationTime": 60,
      "category": 1,
      "difficulty": 3,
      "matching_ingredients": 5
    }
  ]
}

GET /random.php
Returns the id of one randomly chosen local recipe.
Response 200
json{ "pk_recipes": 14 }
Errors: 404 { "error": "No recipes found" }

GET /categories.php
json{ "1": "Main Course", "2": "Side Dish", "3": "Soup", "4": "Sweets/Dessert" }
GET /difficulty.php
json{ "1": "Easy", "2": "Medium", "3": "Hard" }
GET /ingredients.php
Returns every ingredient sorted by category then name.
json[
  { "pk_ingredients": 1, "name": "Apple",  "category": "Fruit"     },
  { "pk_ingredients": 2, "name": "Banana", "category": "Fruit"     },
  { "pk_ingredients": 3, "name": "Beef",   "category": "Meat"      }
]
GET /ingredient-recipes.php?id={ingredientId}
Up to 3 example local recipes that use the given ingredient.
json{
  "recipes": [
    { "pk_recipes": 7,  "name": "Spaghetti Bolognese" },
    { "pk_recipes": 11, "name": "Lasagna" }
  ]
}

Spoonacular Proxy API
These endpoints proxy spoonacular.com/food-api and normalize the responses into the same shape as the local API. Recipe ids are prefixed with spoon- (e.g. spoon-640921).
Base path: /backend/api/spoonacular/
GET /spoonacular/recipes.php
List view — returns 12 random recipes when no filter is given, otherwise a filtered set.
Query params
ParamTypeDescriptioncategoryintOptional. Maps 1→main course, 2→side dish, 3→soup, 4→dessert.difficultyintOptional. Maps to readyInMinutes ranges (<20, <60, ≥60).numberintOptional (random mode only). 1–20, defaults to 12.
Response 200
json{
  "count": 12,
  "recipes": [
    {
      "id": "spoon-640921",
      "source": "spoonacular",
      "name": "Cucumber Salad",
      "description": "A crisp summer side…",
      "imageUrl": "https://img.spoonacular.com/…",
      "preparationTime": "15 min",
      "category": "side dish",
      "categoryName": "Side dish",
      "categoryIcon": "🥄",
      "difficulty": "Easy",
      "difficultyName": "Easy",
      "difficultyStars": "⭐",
      "ingredient_count": 6,
      "ingredients": [],
      "instructions": "",
      "sourceUrl": "https://spoonacular.com/recipes/cucumber-salad-640921"
    }
  ]
}
GET /spoonacular/recipes.php?id=spoon-{id}
Full detail of a single Spoonacular recipe (ingredients[] and instructions populated).
GET /spoonacular/search.php?q={term}
Same envelope as local search.php.
GET /spoonacular/filter.php?ingredients={names}
Comma-separated ingredient names (Spoonacular doesn't use ids). Same envelope as local filter.php, plus the matching_ingredients / missing_list fields.
GET /spoonacular/random.php
json{ "id": "spoon-640921", "name": "Cucumber Salad" }
Errors (any spoonacular endpoint)

400 { "error": "..." } — bad request
502 { "error": "Spoonacular request failed", "code": <httpCode> } — upstream error


Authentication Pages
These return HTML, not JSON — they're meant to be loaded directly in the browser via index.php?page=….
POST /login.php (or /index.php?page=login)
FieldTypeRequiredusernamestringyespasswordstringyesloginhiddenyes
On success, sets the user cookie (90 days) and redirects to index.php.
POST /register.php (or /index.php?page=register)
FieldTypeRequirednamestringyesusernamestringyespasswordstringyesregisterhiddenyes
Creates a new user with role user, sets the cookie, redirects to index.php.
GET /index.php?logout=1
Clears the user cookie and redirects back to the home page.
GET /settings.php
Renders the account-settings page. Requires the user cookie.
POST /settings.php — sign out
Body: BUTTON_signout=1 → destroys the session and clears the cookie.
POST /settings.php — change password
FieldRequiredBUTTON_change_passwordyesDATA_current_passwordyesDATA_new_passwordyesDATA_confirm_passwordyes
Password rules: 5–20 chars, at least one digit, at least one special character.

Admin API
All admin endpoints require the caller's user cookie to belong to a user with role = 'administrator'. Otherwise:

Not logged in → 401 { "error": "You must be logged in." }
Logged in but not admin → 403 { "error": "Administrator access required." }

Base path: /backend/api/administrator.php?resource={resource}
Users — ?resource=users
MethodBody / QueryDescriptionGET—List all usersPOSTusername, password, name, pfp, roleCreate userPUTid, username, name, pfp, role, password?Update user (password optional)DELETEidDelete user (cannot delete yourself)
Example: list users
GET /backend/api/administrator.php?resource=users
json{
  "users": [
    { "pk_userId": 1, "username": "sarah", "name": "Sarah", "pfp": "…", "role": "administrator", "created": "2026-01-12 10:14:02" }
  ]
}
Recipes — ?resource=recipes
MethodBody / QueryDescriptionGET—List all recipes (raw, no enrichment)POSTname, description, imageUrl, preparationTime, category, difficulty, instructionsCreate recipePUTid + same fields as POSTUpdate recipeDELETEidDelete recipe
Example: create recipe
httpPOST /backend/api/administrator.php?resource=recipes
Content-Type: application/json
Cookie: user=1

{
  "name": "Tomato Soup",
  "description": "Warming and creamy.",
  "imageUrl": "",
  "preparationTime": 30,
  "category": 3,
  "difficulty": 1,
  "instructions": "1. Sauté onion…"
}
json{ "message": "Recipe created.", "id": 42 }

User-generated content
Both endpoints below require the user cookie (any logged-in user).
POST /create_recipe.php
Form-encoded payload from the "Create Your Own Recipe" form.
FieldTypeRequiredNotesnamestringyesMust be unique.descriptionstringno"Created by <username>." is appended automatically.imageUrlstringnoMust be a valid http(s) URL when provided.preparationTimeintyesPositive minutes.categoryintyes1–4.difficultyintyes1–3.instructionsstringyesingredientsstringnoJSON array [{ "id": 1, "amount": "200", "unit": "g" }, …].
Response 201
json{ "success": true, "message": "Recipe \"Tomato Soup\" saved successfully!", "pk_recipes": 42 }
Errors: 401, 405, 409 (duplicate name), 422 (validation), 500.
POST /add_ingredient.php
Adds a new ingredient inline from the recipe form.
FieldRequirednameyescategoryyes
Response 201
json{ "success": true, "pk_ingredients": 88, "name": "Miso paste", "category": "Asian" }
Errors: 401, 405, 409 (duplicate), 422.

Generic CRUD demo (api.php)
/backend/api/api.php is a small in-memory CRUD demo (no DB) that dispatches by HTTP method to get.php, post.php, put.php, or delete.php. It exposes a hard-coded list of three "items" and is not used by the recipe app — it's kept as a reference for the generic CRUD pattern.
MethodBehaviourGETReturns all items, or one if ?infotype=…&id=… is passed.POSTForm-encoded name + beschreibung → echoes back a fake new item.PUTJSON body { id, name, beschreibung } (or ?id=…) → echoes back the update.DELETE?id=… → echoes back a deletion confirmation.

Authentication & Roles

Passwords are hashed with PHP's password_hash(..., PASSWORD_DEFAULT) (bcrypt) and verified with password_verify.
The session is a single cookie called user containing the pk_userId. It's set with a 90-day lifetime and the path /.
All authentication-aware endpoints simply check $_COOKIE['user']; if absent or non-numeric they reject the request.
Two roles exist: user (default) and administrator. The administrator dashboard at /backend/admin.php and every endpoint in administrator.php enforce the role server-side.


Note: the cookie is not signed/encrypted. For a production deployment you'd want a proper session token (PHP sessions or a JWT) and CSRF protection on the state-changing endpoints.


Frontend Architecture
The frontend is intentionally framework-free. Scripts are loaded in dependency order from frontend/index.php:

state.js — shared globals (current view, selected filters, …)
api.js — every AJAX call, plus the combined local + Spoonacular wrappers
recipes.js — list view rendering
ingredients.js — ingredient sidebar
detail.js — single-recipe detail view
favorites.js — favorites stored in localStorage
recipeForm.js — "create your own recipe" form (only used when logged in)
events.js — event wiring
app.js — bootstraps the app

Local and Spoonacular results are tagged with source (local / spoonacular) and prefixed ids (local-7, spoon-640921) so they can coexist in a single list.

Authors

Chris
Sarah

A school project on full-stack web development — building a recipe app from scratch with PHP, MySQL, and vanilla JavaScript, and integrating with the external Spoonacular API.