CREATE DATABASE IF NOT EXISTS recipe;
USE recipe;

-- Recipes table
CREATE TABLE recipes (
    pk_recipes INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    imageUrl VARCHAR(255),
    preparationTime INT NOT NULL,
    category INT NOT NULL,
    difficulty INT NOT NULL,
    instructions TEXT NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table
CREATE TABLE ingredients (
    pk_ingredients INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(30)
);

-- Recipe ingredients relationship table
CREATE TABLE includes (
    pkfk_recipe INT NOT NULL,
    pkfk_ingredient INT NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    PRIMARY KEY (pkfk_recipe, pkfk_ingredient),
    FOREIGN KEY (pkfk_recipe) REFERENCES recipes(pk_recipes) ON DELETE CASCADE,
    FOREIGN KEY (pkfk_ingredient) REFERENCES ingredients(pk_ingredients) ON DELETE CASCADE
);
