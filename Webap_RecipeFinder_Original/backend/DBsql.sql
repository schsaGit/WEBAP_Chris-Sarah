-- creates the database if it doesn't exist yet, then switches to it
CREATE DATABASE IF NOT EXISTS recipe;
USE recipe;

-- stores all recipes: title, description, image, prep time, category, difficulty, and cooking steps
CREATE TABLE recipes (
    pk_recipes INT PRIMARY KEY AUTO_INCREMENT, -- unique ID for each recipe, auto-increments so you don't set it manually
    name VARCHAR(100) NOT NULL UNIQUE,          -- the recipe's name (max 100 chars, must be unique)
    description TEXT,                           -- a short summary of the dish (optional)
    imageUrl VARCHAR(255),                      -- URL to an image of the dish (optional)
    preparationTime INT NOT NULL,               -- how many minutes the recipe takes to make
    category INT NOT NULL,                      -- links to a category (1=Main Course, 2=Side Dish, 3=Soup, 4=Sweets)
    difficulty INT NOT NULL,                    -- links to a difficulty level (1=Easy, 2=Medium, 3=Hard)
    instructions TEXT NOT NULL,                 -- the full step-by-step cooking instructions
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- automatically records when the recipe was added
);

-- stores all available ingredients with a name and category (e.g. Vegetables, Meat, Dairy)
CREATE TABLE ingredients (
    pk_ingredients INT PRIMARY KEY AUTO_INCREMENT, -- unique ID for each ingredient
    name VARCHAR(50) NOT NULL UNIQUE,              -- the ingredient's name (must be unique across the table)
    category VARCHAR(30)                           -- the ingredient group (e.g. 'Vegetables', 'Spices') — optional
);

-- links recipes to their ingredients (many-to-many relationship between recipes and ingredients)
-- one recipe can have many ingredients, and one ingredient can appear in many recipes
CREATE TABLE includes (
    pkfk_recipe INT NOT NULL,        -- the ID of the recipe (references recipes.pk_recipes)
    pkfk_ingredient INT NOT NULL,    -- the ID of the ingredient (references ingredients.pk_ingredients)
    amount DECIMAL(8,2) NOT NULL,    -- how much of the ingredient is needed (e.g. 2.50)
    unit VARCHAR(20) NOT NULL,       -- the unit of measurement (e.g. 'g', 'ml', 'tbsp')
    PRIMARY KEY (pkfk_recipe, pkfk_ingredient), -- the combination of recipe + ingredient must be unique
    FOREIGN KEY (pkfk_recipe) REFERENCES recipes(pk_recipes) ON DELETE CASCADE,       -- if a recipe is deleted, its ingredient links are also deleted
    FOREIGN KEY (pkfk_ingredient) REFERENCES ingredients(pk_ingredients) ON DELETE CASCADE -- if an ingredient is deleted, its recipe links are also deleted
);
