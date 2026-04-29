-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2026 at 08:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `recipe`
--

-- --------------------------------------------------------

--
-- Table structure for table `includes`
--

CREATE TABLE `includes` (
  `pkfk_recipe` int(11) NOT NULL,
  `pkfk_ingredient` int(11) NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `unit` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `includes`
--

INSERT INTO `includes` (`pkfk_recipe`, `pkfk_ingredient`, `amount`, `unit`) VALUES
(1, 1, 1.00, 'piece'),
(1, 2, 2.00, 'cloves'),
(1, 3, 800.00, 'g'),
(1, 4, 2.00, 'piece'),
(1, 13, 2.00, 'stalks'),
(1, 24, 500.00, 'g'),
(1, 40, 50.00, 'g'),
(1, 50, 400.00, 'g'),
(1, 61, 2.00, 'tbsp'),
(1, 64, 2.00, 'tsp'),
(1, 65, 1.00, 'tsp'),
(1, 78, 2.00, 'piece'),
(1, 88, 2.00, 'tbsp'),
(1, 93, 250.00, 'ml'),
(1, 96, 250.00, 'ml'),
(2, 1, 1.00, 'piece'),
(2, 2, 2.00, 'cloves'),
(2, 16, 100.00, 'g'),
(2, 23, 600.00, 'g'),
(2, 38, 400.00, 'ml'),
(2, 48, 300.00, 'g'),
(2, 60, 2.00, 'tbsp'),
(2, 64, 1.00, 'tsp'),
(2, 65, 0.50, 'tsp'),
(2, 69, 2.00, 'tbsp'),
(2, 83, 1.00, 'tbsp'),
(2, 84, 10.00, 'g'),
(2, 89, 200.00, 'g'),
(3, 2, 2.00, 'cloves'),
(3, 4, 2.00, 'piece'),
(3, 6, 1.00, 'piece'),
(3, 7, 1.00, 'piece'),
(3, 8, 100.00, 'g'),
(3, 48, 300.00, 'g'),
(3, 60, 2.00, 'tbsp'),
(3, 92, 100.00, 'ml'),
(3, 117, 1.00, 'tbsp'),
(3, 119, 1.00, 'tbsp'),
(3, 121, 3.00, 'tbsp'),
(3, 127, 1.00, 'tsp'),
(3, 136, 400.00, 'g'),
(4, 1, 1.00, 'piece'),
(4, 2, 2.00, 'cloves'),
(4, 3, 800.00, 'g'),
(4, 24, 500.00, 'g'),
(4, 33, 1000.00, 'ml'),
(4, 34, 100.00, 'g'),
(4, 40, 50.00, 'g'),
(4, 41, 200.00, 'g'),
(4, 51, 250.00, 'g'),
(4, 55, 100.00, 'g'),
(4, 61, 2.00, 'tbsp'),
(4, 77, 0.50, 'tsp'),
(4, 79, 2.00, 'tbsp'),
(4, 88, 2.00, 'tbsp'),
(5, 2, 1.00, 'clove'),
(5, 4, 2.00, 'piece'),
(5, 5, 200.00, 'g'),
(5, 6, 1.00, 'piece'),
(5, 7, 1.00, 'piece'),
(5, 30, 600.00, 'g'),
(5, 34, 50.00, 'g'),
(5, 61, 3.00, 'tbsp'),
(5, 64, 1.00, 'tsp'),
(5, 65, 0.50, 'tsp'),
(5, 80, 10.00, 'g'),
(5, 81, 10.00, 'g'),
(5, 100, 1.00, 'piece'),
(6, 1, 1.00, 'piece'),
(6, 2, 2.00, 'cloves'),
(6, 3, 800.00, 'g'),
(6, 6, 1.00, 'piece'),
(6, 15, 200.00, 'g'),
(6, 37, 200.00, 'ml'),
(6, 39, 100.00, 'g'),
(6, 60, 2.00, 'tbsp'),
(6, 67, 1.00, 'tsp'),
(6, 68, 1.00, 'tbsp'),
(6, 70, 2.00, 'tsp'),
(6, 92, 500.00, 'ml'),
(6, 138, 400.00, 'g'),
(6, 139, 400.00, 'g'),
(7, 1, 1.00, 'piece'),
(7, 6, 2.00, 'piece'),
(7, 23, 600.00, 'g'),
(7, 60, 3.00, 'tbsp'),
(7, 64, 1.00, 'tsp'),
(7, 67, 1.00, 'tsp'),
(7, 68, 2.00, 'tsp'),
(7, 70, 1.00, 'tsp'),
(7, 86, 1.00, 'tsp'),
(7, 101, 1.00, 'piece'),
(7, 128, 200.00, 'g'),
(7, 129, 200.00, 'g'),
(7, 130, 8.00, 'piece'),
(8, 1, 1.00, 'piece'),
(8, 2, 2.00, 'cloves'),
(8, 8, 400.00, 'g'),
(8, 34, 50.00, 'g'),
(8, 40, 100.00, 'g'),
(8, 48, 400.00, 'g'),
(8, 61, 2.00, 'tbsp'),
(8, 64, 1.00, 'tsp'),
(8, 65, 0.50, 'tsp'),
(8, 80, 10.00, 'g'),
(8, 92, 1000.00, 'ml'),
(8, 95, 150.00, 'ml'),
(8, 141, 20.00, 'g'),
(9, 1, 1.00, 'piece'),
(9, 8, 300.00, 'g'),
(9, 25, 600.00, 'g'),
(9, 34, 30.00, 'g'),
(9, 37, 200.00, 'ml'),
(9, 52, 400.00, 'g'),
(9, 60, 2.00, 'tbsp'),
(9, 64, 1.00, 'tsp'),
(9, 65, 0.50, 'tsp'),
(9, 67, 1.00, 'tsp'),
(9, 81, 10.00, 'g'),
(9, 88, 1.00, 'tbsp'),
(9, 93, 200.00, 'ml'),
(9, 126, 1.00, 'tsp'),
(10, 1, 0.50, 'piece'),
(10, 6, 1.00, 'piece'),
(10, 8, 100.00, 'g'),
(10, 41, 250.00, 'g'),
(10, 55, 500.00, 'g'),
(10, 61, 3.00, 'tbsp'),
(10, 64, 1.00, 'tsp'),
(10, 71, 2.00, 'tsp'),
(10, 72, 10.00, 'g'),
(10, 90, 200.00, 'g'),
(10, 118, 7.00, 'g'),
(10, 152, 50.00, 'g'),
(10, 153, 300.00, 'ml'),
(11, 2, 4.00, 'cloves'),
(11, 31, 500.00, 'g'),
(11, 34, 60.00, 'g'),
(11, 53, 400.00, 'g'),
(11, 61, 2.00, 'tbsp'),
(11, 64, 1.00, 'tsp'),
(11, 65, 0.50, 'tsp'),
(11, 80, 20.00, 'g'),
(11, 85, 0.50, 'tsp'),
(11, 95, 150.00, 'ml'),
(11, 100, 1.00, 'piece'),
(12, 1, 1.00, 'piece'),
(12, 2, 2.00, 'cloves'),
(12, 4, 2.00, 'piece'),
(12, 5, 400.00, 'g'),
(12, 9, 200.00, 'g'),
(12, 38, 400.00, 'ml'),
(12, 48, 300.00, 'g'),
(12, 60, 2.00, 'tbsp'),
(12, 69, 2.00, 'tbsp'),
(12, 83, 1.00, 'tbsp'),
(12, 92, 200.00, 'ml'),
(12, 101, 0.50, 'piece'),
(12, 137, 400.00, 'g'),
(13, 23, 600.00, 'g'),
(13, 40, 100.00, 'g'),
(13, 41, 200.00, 'g'),
(13, 50, 400.00, 'g'),
(13, 54, 150.00, 'g'),
(13, 55, 100.00, 'g'),
(13, 59, 2.00, 'piece'),
(13, 60, 4.00, 'tbsp'),
(13, 64, 1.00, 'tsp'),
(13, 65, 0.50, 'tsp'),
(13, 79, 2.00, 'tsp'),
(13, 86, 1.00, 'tsp'),
(13, 91, 500.00, 'g'),
(14, 1, 0.50, 'piece'),
(14, 3, 1.00, 'piece'),
(14, 21, 100.00, 'g'),
(14, 24, 500.00, 'g'),
(14, 39, 4.00, 'slices'),
(14, 64, 1.00, 'tsp'),
(14, 65, 0.50, 'tsp'),
(14, 122, 1.00, 'tsp'),
(14, 123, 4.00, 'tbsp'),
(14, 124, 2.00, 'tbsp'),
(14, 125, 2.00, 'tbsp'),
(14, 131, 4.00, 'piece'),
(14, 135, 8.00, 'slices'),
(15, 1, 1.00, 'piece'),
(15, 2, 2.00, 'cloves'),
(15, 3, 400.00, 'g'),
(15, 6, 4.00, 'piece'),
(15, 24, 300.00, 'g'),
(15, 39, 150.00, 'g'),
(15, 48, 200.00, 'g'),
(15, 61, 2.00, 'tbsp'),
(15, 64, 1.00, 'tsp'),
(15, 65, 0.50, 'tsp'),
(15, 79, 2.00, 'tsp'),
(15, 88, 2.00, 'tbsp'),
(16, 2, 1.00, 'head'),
(16, 5, 1000.00, 'g'),
(16, 33, 200.00, 'ml'),
(16, 34, 100.00, 'g'),
(16, 61, 1.00, 'tbsp'),
(16, 64, 1.00, 'tsp'),
(16, 66, 0.50, 'tsp'),
(16, 82, 10.00, 'g'),
(17, 1, 1.00, 'piece'),
(17, 4, 200.00, 'g'),
(17, 5, 300.00, 'g'),
(17, 6, 1.00, 'piece'),
(17, 7, 1.00, 'piece'),
(17, 61, 3.00, 'tbsp'),
(17, 64, 1.00, 'tsp'),
(17, 65, 0.50, 'tsp'),
(17, 73, 1.00, 'tbsp'),
(17, 74, 1.00, 'tbsp'),
(17, 143, 2.00, 'tbsp'),
(18, 2, 1.00, 'clove'),
(18, 22, 2.00, 'heads'),
(18, 40, 100.00, 'g'),
(18, 59, 1.00, 'piece'),
(18, 61, 150.00, 'ml'),
(18, 64, 0.50, 'tsp'),
(18, 65, 0.50, 'tsp'),
(18, 100, 1.00, 'piece'),
(18, 122, 1.00, 'tsp'),
(18, 126, 1.00, 'tsp'),
(18, 133, 150.00, 'g'),
(18, 142, 2.00, 'piece'),
(19, 1, 1.00, 'piece'),
(19, 34, 30.00, 'g'),
(19, 48, 400.00, 'g'),
(19, 64, 1.00, 'tsp'),
(19, 65, 0.50, 'tsp'),
(19, 78, 2.00, 'piece'),
(19, 80, 20.00, 'g'),
(19, 81, 10.00, 'g'),
(19, 92, 800.00, 'ml'),
(20, 2, 1.00, 'clove'),
(20, 9, 1000.00, 'g'),
(20, 33, 250.00, 'ml'),
(20, 34, 30.00, 'g'),
(20, 55, 30.00, 'g'),
(20, 64, 1.00, 'tsp'),
(20, 65, 0.50, 'tsp'),
(20, 77, 0.25, 'tsp'),
(21, 1, 1.00, 'piece'),
(21, 2, 2.00, 'cloves'),
(21, 3, 2000.00, 'g'),
(21, 35, 200.00, 'ml'),
(21, 40, 50.00, 'g'),
(21, 56, 1.00, 'tsp'),
(21, 61, 2.00, 'tbsp'),
(21, 64, 1.00, 'tsp'),
(21, 65, 0.50, 'tsp'),
(21, 72, 30.00, 'g'),
(21, 92, 500.00, 'ml'),
(22, 1, 1.00, 'piece'),
(22, 2, 2.00, 'cloves'),
(22, 3, 400.00, 'g'),
(22, 4, 2.00, 'piece'),
(22, 5, 200.00, 'g'),
(22, 9, 200.00, 'g'),
(22, 13, 2.00, 'stalks'),
(22, 17, 200.00, 'g'),
(22, 40, 50.00, 'g'),
(22, 49, 200.00, 'g'),
(22, 61, 3.00, 'tbsp'),
(22, 79, 2.00, 'tbsp'),
(22, 92, 2000.00, 'ml'),
(22, 140, 400.00, 'g'),
(23, 1, 1.00, 'piece'),
(23, 4, 4.00, 'piece'),
(23, 13, 4.00, 'stalks'),
(23, 26, 1.00, 'piece'),
(23, 52, 200.00, 'g'),
(23, 64, 2.00, 'tsp'),
(23, 65, 1.00, 'tsp'),
(23, 73, 1.00, 'tsp'),
(23, 78, 2.00, 'piece'),
(23, 80, 20.00, 'g'),
(23, 153, 3000.00, 'ml'),
(24, 1, 1.00, 'piece'),
(24, 2, 2.00, 'cloves'),
(24, 14, 1500.00, 'g'),
(24, 35, 100.00, 'ml'),
(24, 38, 200.00, 'ml'),
(24, 60, 2.00, 'tbsp'),
(24, 64, 1.00, 'tsp'),
(24, 65, 0.50, 'tsp'),
(24, 77, 0.50, 'tsp'),
(24, 83, 1.00, 'tbsp'),
(24, 92, 1000.00, 'ml'),
(24, 112, 30.00, 'g'),
(25, 1, 1500.00, 'g'),
(25, 34, 60.00, 'g'),
(25, 44, 400.00, 'g'),
(25, 55, 15.00, 'g'),
(25, 64, 1.00, 'tsp'),
(25, 65, 0.50, 'tsp'),
(25, 73, 1.00, 'tsp'),
(25, 78, 2.00, 'piece'),
(25, 93, 1500.00, 'ml'),
(25, 95, 200.00, 'ml'),
(25, 132, 1.00, 'piece'),
(26, 34, 200.00, 'g'),
(26, 55, 100.00, 'g'),
(26, 56, 300.00, 'g'),
(26, 59, 4.00, 'piece'),
(26, 64, 0.50, 'tsp'),
(26, 76, 2.00, 'tsp'),
(26, 97, 200.00, 'g'),
(26, 99, 30.00, 'g'),
(26, 108, 100.00, 'g'),
(27, 34, 225.00, 'g'),
(27, 55, 300.00, 'g'),
(27, 56, 150.00, 'g'),
(27, 59, 1.00, 'piece'),
(27, 64, 1.00, 'tsp'),
(27, 75, 2.00, 'tsp'),
(27, 100, 0.50, 'piece'),
(27, 102, 1500.00, 'g'),
(27, 117, 30.00, 'g'),
(27, 154, 120.00, 'ml'),
(28, 33, 120.00, 'ml'),
(28, 34, 150.00, 'g'),
(28, 55, 200.00, 'g'),
(28, 56, 150.00, 'g'),
(28, 58, 400.00, 'g'),
(28, 59, 3.00, 'piece'),
(28, 64, 0.50, 'tsp'),
(28, 76, 2.00, 'tsp'),
(28, 115, 2.00, 'tsp'),
(29, 34, 100.00, 'g'),
(29, 37, 240.00, 'ml'),
(29, 43, 900.00, 'g'),
(29, 56, 300.00, 'g'),
(29, 59, 3.00, 'piece'),
(29, 76, 1.00, 'tbsp'),
(29, 100, 1.00, 'piece'),
(29, 107, 300.00, 'g'),
(29, 134, 200.00, 'g'),
(30, 34, 225.00, 'g'),
(30, 55, 325.00, 'g'),
(30, 56, 100.00, 'g'),
(30, 57, 150.00, 'g'),
(30, 59, 2.00, 'piece'),
(30, 64, 0.50, 'tsp'),
(30, 76, 2.00, 'tsp'),
(30, 98, 350.00, 'g'),
(30, 116, 1.00, 'tsp');

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `pk_ingredients` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `category` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`pk_ingredients`, `name`, `category`) VALUES
(1, 'Onion', 'Vegetables'),
(2, 'Garlic', 'Vegetables'),
(3, 'Tomato', 'Vegetables'),
(4, 'Carrots', 'Vegetables'),
(5, 'Potatoes', 'Vegetables'),
(6, 'Bell Pepper', 'Vegetables'),
(7, 'Zucchini', 'Vegetables'),
(8, 'Mushrooms', 'Vegetables'),
(9, 'Spinach', 'Vegetables'),
(10, 'Broccoli', 'Vegetables'),
(11, 'Cauliflower', 'Vegetables'),
(12, 'Leek', 'Vegetables'),
(13, 'Celery', 'Vegetables'),
(14, 'Pumpkin', 'Vegetables'),
(15, 'Corn', 'Vegetables'),
(16, 'Peas', 'Vegetables'),
(17, 'Green Beans', 'Vegetables'),
(18, 'Eggplant', 'Vegetables'),
(19, 'Asparagus', 'Vegetables'),
(20, 'Brussels Sprouts', 'Vegetables'),
(21, 'Lettuce', 'Vegetables'),
(22, 'Romaine Lettuce', 'Vegetables'),
(23, 'Chicken Breast', 'Meat'),
(24, 'Ground Beef', 'Meat'),
(25, 'Beef Sirloin', 'Meat'),
(26, 'Whole Chicken', 'Meat'),
(27, 'Bacon', 'Meat'),
(28, 'Pork Tenderloin', 'Meat'),
(29, 'Sausages', 'Meat'),
(30, 'Salmon Fillet', 'Fish'),
(31, 'Shrimp', 'Fish'),
(32, 'Tuna', 'Fish'),
(33, 'Milk', 'Dairy'),
(34, 'Butter', 'Dairy'),
(35, 'Cream', 'Dairy'),
(36, 'Heavy Cream', 'Dairy'),
(37, 'Sour Cream', 'Dairy'),
(38, 'Coconut Milk', 'Dairy'),
(39, 'Cheese', 'Dairy'),
(40, 'Parmesan', 'Dairy'),
(41, 'Mozzarella', 'Dairy'),
(42, 'Feta Cheese', 'Dairy'),
(43, 'Cream Cheese', 'Dairy'),
(44, 'Gruyère Cheese', 'Dairy'),
(45, 'Cheddar Cheese', 'Dairy'),
(46, 'Ricotta', 'Dairy'),
(47, 'Yogurt', 'Dairy'),
(48, 'Rice', 'Basics'),
(49, 'Pasta', 'Basics'),
(50, 'Spaghetti', 'Basics'),
(51, 'Lasagna Sheets', 'Basics'),
(52, 'Egg Noodles', 'Basics'),
(53, 'Linguine', 'Basics'),
(54, 'Breadcrumbs', 'Basics'),
(55, 'Flour', 'Basics'),
(56, 'Sugar', 'Basics'),
(57, 'Brown Sugar', 'Basics'),
(58, 'Powdered Sugar', 'Basics'),
(59, 'Eggs', 'Basics'),
(60, 'Oil', 'Basics'),
(61, 'Olive Oil', 'Basics'),
(62, 'Vegetable Oil', 'Basics'),
(63, 'Sunflower Oil', 'Basics'),
(64, 'Salt', 'Spices'),
(65, 'Black Pepper', 'Spices'),
(66, 'White Pepper', 'Spices'),
(67, 'Paprika Powder', 'Spices'),
(68, 'Chili Powder', 'Spices'),
(69, 'Curry Powder', 'Spices'),
(70, 'Cumin', 'Spices'),
(71, 'Oregano', 'Spices'),
(72, 'Basil', 'Spices'),
(73, 'Thyme', 'Spices'),
(74, 'Rosemary', 'Spices'),
(75, 'Cinnamon', 'Spices'),
(76, 'Vanilla Extract', 'Spices'),
(77, 'Nutmeg', 'Spices'),
(78, 'Bay Leaves', 'Spices'),
(79, 'Italian Seasoning', 'Spices'),
(80, 'Parsley', 'Spices'),
(81, 'Dill', 'Spices'),
(82, 'Chives', 'Spices'),
(83, 'Ginger', 'Spices'),
(84, 'Cilantro', 'Spices'),
(85, 'Red Pepper Flakes', 'Spices'),
(86, 'Garlic Powder', 'Spices'),
(87, 'Onion Powder', 'Spices'),
(88, 'Tomato Paste', 'Other'),
(89, 'Tomato Puree', 'Other'),
(90, 'Tomato Sauce', 'Other'),
(91, 'Marinara Sauce', 'Other'),
(92, 'Vegetable Broth', 'Other'),
(93, 'Beef Broth', 'Other'),
(94, 'Chicken Broth', 'Other'),
(95, 'White Wine', 'Other'),
(96, 'Red Wine', 'Other'),
(97, 'Dark Chocolate', 'Other'),
(98, 'Chocolate Chips', 'Other'),
(99, 'Cocoa Powder', 'Other'),
(100, 'Lemon', 'Fruits'),
(101, 'Lime', 'Fruits'),
(102, 'Apple', 'Fruits'),
(103, 'Banana', 'Fruits'),
(104, 'Strawberries', 'Fruits'),
(105, 'Raspberries', 'Fruits'),
(106, 'Blueberries', 'Fruits'),
(107, 'Mixed Berries', 'Fruits'),
(108, 'Walnuts', 'Nuts'),
(109, 'Almonds', 'Nuts'),
(110, 'Hazelnuts', 'Nuts'),
(111, 'Pecans', 'Nuts'),
(112, 'Pumpkin Seeds', 'Nuts'),
(113, 'Oats', 'Grains'),
(114, 'Oatmeal', 'Grains'),
(115, 'Baking Powder', 'Baking'),
(116, 'Baking Soda', 'Baking'),
(117, 'Cornstarch', 'Baking'),
(118, 'Yeast', 'Baking'),
(119, 'Honey', 'Sweeteners'),
(120, 'Maple Syrup', 'Sweeteners'),
(121, 'Soy Sauce', 'Sauces'),
(122, 'Worcestershire Sauce', 'Sauces'),
(123, 'Ketchup', 'Sauces'),
(124, 'Mustard', 'Sauces'),
(125, 'Mayonnaise', 'Sauces'),
(126, 'Dijon Mustard', 'Sauces'),
(127, 'Sesame Oil', 'Sauces'),
(128, 'Guacamole', 'Sauces'),
(129, 'Salsa', 'Sauces'),
(130, 'Tortillas', 'Other'),
(131, 'Burger Buns', 'Other'),
(132, 'Baguette', 'Other'),
(133, 'Croutons', 'Other'),
(134, 'Graham Crackers', 'Other'),
(135, 'Pickles', 'Other'),
(136, 'Tofu', 'Other'),
(137, 'Chickpeas', 'Other'),
(138, 'Kidney Beans', 'Other'),
(139, 'Black Beans', 'Other'),
(140, 'Cannellini Beans', 'Other'),
(141, 'Porcini Mushrooms', 'Other'),
(142, 'Anchovy Fillets', 'Other'),
(143, 'Balsamic Glaze', 'Sauces'),
(144, 'Balsamic Vinegar', 'Sauces'),
(145, 'Apple Cider Vinegar', 'Sauces'),
(146, 'White Vinegar', 'Sauces'),
(147, 'Tahini', 'Sauces'),
(148, 'Fish Sauce', 'Sauces'),
(149, 'Oyster Sauce', 'Sauces'),
(150, 'Sriracha', 'Sauces'),
(151, 'Hot Sauce', 'Sauces'),
(152, 'Olives', 'Other'),
(153, 'Water', 'Other'),
(154, 'Ice Water', 'Other');

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `pk_recipes` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `preparationTime` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `difficulty` int(11) NOT NULL,
  `instructions` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`pk_recipes`, `name`, `description`, `imageUrl`, `preparationTime`, `category`, `difficulty`, `instructions`, `created`) VALUES
(1, 'Spaghetti Bolognese', 'A classic Italian pasta dish featuring rich, slow-cooked meat sauce made with ground beef, tomatoes, onions, and aromatic herbs, served over perfectly al dente spaghetti.', 'https://supervalu.ie/image/var/files/real-food/recipes/Uploaded-2020/spaghetti-bolognese-recipe.jpg', 75, 1, 2, '1. Finely chop 1 large onion, 2 carrots, and 2 celery stalks\n2. Heat 2 tablespoons olive oil in a large pot over medium heat\n3. Add the chopped vegetables and cook until softened (about 10 minutes)\n4. Add 500g ground beef and cook until browned\n5. Stir in 2 tablespoons tomato paste and cook for 2 minutes\n6. Add 800g canned tomatoes, 250ml red wine, and 250ml beef broth\n7. Season with salt, pepper, and 2 bay leaves\n8. Simmer uncovered for 45-60 minutes until thickened\n9. Cook 400g spaghetti according to package directions\n10. Serve sauce over spaghetti with grated Parmesan cheese', '2026-01-27 15:13:20'),
(2, 'Chicken Curry', 'Aromatic Indian-style chicken curry with tender chicken pieces simmered in a creamy, spiced tomato sauce, served with basmati rice and naan bread.', 'https://www.allrecipes.com/thmb/n_0kMGogNFnpJhGhGCf8cNoFqo4=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/46822-Indian-Chicken-Curry-PICS-Beauty-4x3-9535b806e7dc4f1da14f8ddb7a6367a4.jpg', 50, 1, 2, '1. Cut 600g chicken breast into bite-sized pieces\n2. Heat 2 tablespoons oil in a large pan over medium-high heat\n3. Add 1 chopped onion and cook until golden\n4. Add 2 minced garlic cloves and 1 tablespoon grated ginger\n5. Stir in 2 tablespoons curry powder and cook for 1 minute\n6. Add chicken pieces and cook until lightly browned\n7. Pour in 400ml coconut milk and 200g tomato puree\n8. Season with 1 teaspoon salt and 1/2 teaspoon pepper\n9. Simmer for 25-30 minutes until chicken is cooked through\n10. Stir in 100g frozen peas and cook for 5 more minutes\n11. Serve with rice and fresh cilantro', '2026-01-27 15:13:20'),
(3, 'Vegetable Stir Fry', 'Colorful Asian-inspired stir-fry with crisp vegetables and tofu in a savory sauce, perfect for a quick and healthy weeknight dinner.', 'https://natashaskitchen.com/wp-content/uploads/2020/08/Vegetable-Stir-Fry-SQ-500x500.jpg', 30, 1, 1, '1. Press 400g firm tofu for 15 minutes, then cut into cubes\n2. Prepare vegetables: slice 1 bell pepper, 2 carrots, 1 zucchini, and 100g mushrooms\n3. Mix sauce: 3 tablespoons soy sauce, 1 tablespoon honey, 1 teaspoon sesame oil, 1 tablespoon cornstarch, 100ml vegetable broth\n4. Heat 2 tablespoons oil in a wok over high heat\n5. Add tofu and cook until golden brown on all sides\n6. Remove tofu and add all vegetables to the wok\n7. Stir-fry for 5-7 minutes until crisp-tender\n8. Return tofu to wok and pour sauce over\n9. Cook for 2-3 minutes until sauce thickens\n10. Serve immediately with rice or noodles', '2026-01-27 15:13:20'),
(4, 'Beef Lasagna', 'Hearty Italian lasagna with layers of rich meat sauce, creamy béchamel, and melted cheese, baked to golden perfection.', 'https://assets.bonappetit.com/photos/656f48d75b552734225041ba/2:3/w_2086,h_3129,c_limit/20231120-WEB-Lasanga-6422.jpg', 90, 1, 3, '1. Prepare meat sauce: cook 500g ground beef with 1 chopped onion and 2 minced garlic cloves\n2. Add 800g crushed tomatoes, 2 tablespoons tomato paste, and Italian herbs\n3. Simmer for 30 minutes\n4. Prepare béchamel: melt 100g butter, whisk in 100g flour, gradually add 1 liter milk\n5. Cook until thickened, season with salt, pepper, and nutmeg\n6. Preheat oven to 180°C (350°F)\n7. In a baking dish, layer meat sauce, lasagna sheets, and béchamel\n8. Repeat layers, finishing with béchamel\n9. Top with 200g grated mozzarella and 50g Parmesan\n10. Bake for 45 minutes until golden and bubbly\n11. Let rest for 15 minutes before serving', '2026-01-27 15:13:20'),
(5, 'Salmon with Roasted Vegetables', 'Healthy baked salmon fillets with seasonal roasted vegetables and lemon herb butter, a perfect balanced meal.', 'https://hungryfoodie.com/wp-content/uploads/2023/09/Sheet-Pan-Salmon-and-Vegetables-21.jpg', 40, 1, 1, '1. Preheat oven to 200°C (400°F)\n2. Cut vegetables: 2 carrots, 1 zucchini, 1 bell pepper, 200g potatoes\n3. Toss vegetables with 2 tablespoons olive oil, salt, and pepper\n4. Spread on baking sheet and roast for 20 minutes\n5. Season 4 salmon fillets with salt, pepper, and lemon zest\n6. Make herb butter: mix 50g softened butter with chopped dill and parsley\n7. After 20 minutes, push vegetables aside and add salmon to baking sheet\n8. Top each fillet with herb butter\n9. Return to oven for 12-15 minutes until salmon flakes easily\n10. Serve with lemon wedges', '2026-01-27 15:13:20'),
(6, 'Vegetarian Chili', 'Hearty meatless chili packed with beans, vegetables, and spices, perfect for cold days.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhl5ZjVFubaCj-4BotBcoGdOCkWLZlEt9yeA&s', 60, 1, 2, '1. Heat 2 tablespoons oil in a large pot over medium heat\n2. Add 1 chopped onion, 1 bell pepper, and 2 minced garlic cloves\n3. Cook until softened (about 8 minutes)\n4. Add 1 tablespoon chili powder, 2 teaspoons cumin, 1 teaspoon paprika\n5. Stir in 800g canned tomatoes, 400g kidney beans, 400g black beans\n6. Add 500ml vegetable broth and 200g corn kernels\n7. Bring to boil, then reduce heat and simmer for 45 minutes\n8. Season with salt and pepper to taste\n9. Serve with sour cream, shredded cheese, and tortilla chips', '2026-01-27 15:13:20'),
(7, 'Chicken Fajitas', 'Sizzling Mexican-style chicken strips with bell peppers and onions, served with warm tortillas and fresh toppings.', 'https://www.tasteofhome.com/wp-content/uploads/2018/01/Flavorful-Chicken-Fajitas_EXPS_CIW19_12540_B08_30_6b-e1722260583441.jpg', 35, 1, 2, '1. Cut 600g chicken breast into thin strips\n2. Slice 2 bell peppers and 1 large onion into strips\n3. Mix marinade: 2 tablespoons lime juice, 1 tablespoon oil, 2 teaspoons chili powder, 1 teaspoon cumin, 1 teaspoon paprika\n4. Marinate chicken for 15 minutes\n5. Heat 1 tablespoon oil in a large skillet over high heat\n6. Cook chicken until browned and cooked through (6-8 minutes)\n7. Remove chicken and add vegetables to skillet\n8. Cook until tender-crisp (about 5 minutes)\n9. Return chicken to skillet and toss with vegetables\n10. Serve with warm tortillas, guacamole, and salsa', '2026-01-27 15:13:20'),
(8, 'Mushroom Risotto', 'Creamy Italian risotto with mixed mushrooms, Parmesan cheese, and white wine, a comforting vegetarian dish.', 'https://www.allrecipes.com/thmb/9d8yV77PRL3wbRwcpAIxtZPdi5Q=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/85389-gourmet-mushroom-risotto-DDMFS-4x3-a8a80a8deb064c6a8f15452b808a0258.jpg', 45, 1, 2, '1. Soak 20g dried porcini mushrooms in 500ml hot water\n2. Chop 400g mixed fresh mushrooms\n3. Heat 2 tablespoons butter and 1 tablespoon oil in a large pan\n4. Cook mushrooms until golden, then remove from pan\n5. In same pan, cook 1 finely chopped onion until soft\n6. Add 400g Arborio rice and toast for 2 minutes\n7. Add 150ml white wine and cook until absorbed\n8. Gradually add mushroom soaking liquid (strained) and hot vegetable broth\n9. Stir constantly, adding liquid as absorbed\n10. After 20 minutes, stir in cooked mushrooms and 100g grated Parmesan\n11. Season with salt, pepper, and fresh parsley', '2026-01-27 15:13:20'),
(9, 'Beef Stroganoff', 'Classic Russian dish with tender beef strips in a creamy mushroom sauce, served over egg noodles.', 'https://www.gimmesomeoven.com/wp-content/uploads/2020/10/Beef-Stroganoff-Recipe-9.jpg', 40, 1, 2, '1. Cut 600g beef sirloin into thin strips\n2. Season with salt and pepper\n3. Heat 2 tablespoons oil in a large skillet over high heat\n4. Sear beef in batches until browned (about 2 minutes per batch)\n5. Remove beef and reduce heat to medium\n6. Add 1 sliced onion and cook until soft\n7. Add 300g sliced mushrooms and cook until golden\n8. Stir in 1 tablespoon tomato paste and 1 teaspoon paprika\n9. Add 200ml beef broth and simmer for 5 minutes\n10. Stir in 200ml sour cream and return beef to pan\n11. Heat through but do not boil\n12. Serve over egg noodles with fresh dill', '2026-01-27 15:13:20'),
(10, 'Vegetable Pizza', 'Homemade pizza with tomato sauce, mozzarella, and fresh seasonal vegetables.', 'https://www.liveeatlearn.com/wp-content/uploads/2025/09/Veggie-Pizza-12.jpg', 50, 1, 2, '1. Prepare dough: mix 500g flour, 7g yeast, 1 teaspoon salt, 300ml warm water\n2. Knead for 10 minutes, then let rise for 1 hour\n3. Preheat oven to 250°C (480°F)\n4. Roll out dough on floured surface\n5. Spread 200g tomato sauce over dough\n6. Top with 250g grated mozzarella\n7. Arrange sliced vegetables: bell peppers, mushrooms, onions, olives\n8. Drizzle with olive oil and sprinkle with oregano\n9. Bake for 12-15 minutes until crust is golden\n10. Garnish with fresh basil leaves', '2026-01-27 15:13:20'),
(11, 'Shrimp Scampi', 'Garlic butter shrimp with white wine and lemon, served over linguine pasta.', 'https://natashaskitchen.com/wp-content/uploads/2025/07/Shrimp-Scampi-5.jpg', 25, 1, 2, '1. Cook 400g linguine according to package directions\n2. Peel and devein 500g large shrimp\n3. Heat 4 tablespoons butter in a large skillet over medium heat\n4. Add 4 minced garlic cloves and cook for 1 minute\n5. Add shrimp and cook until pink (2-3 minutes per side)\n6. Remove shrimp and add 150ml white wine to skillet\n7. Cook until reduced by half\n8. Add juice of 1 lemon and 2 tablespoons chopped parsley\n9. Return shrimp to skillet and toss to coat\n10. Serve shrimp and sauce over linguine', '2026-01-27 15:13:20'),
(12, 'Vegetable Curry', 'Flavorful vegetarian curry with chickpeas, potatoes, and spinach in coconut milk.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8aVdOLmYUG959DDTOgQiZHqkrzFuqCAQw2g&s', 45, 1, 2, '1. Heat 2 tablespoons oil in a large pot over medium heat\n2. Add 1 chopped onion and cook until soft\n3. Add 2 minced garlic cloves and 1 tablespoon grated ginger\n4. Stir in 2 tablespoons curry powder and cook for 30 seconds\n5. Add 400g diced potatoes, 2 diced carrots, and 400g chickpeas\n6. Pour in 400ml coconut milk and 200ml vegetable broth\n7. Simmer for 25 minutes until potatoes are tender\n8. Stir in 200g fresh spinach and cook until wilted\n9. Season with salt and lime juice\n10. Serve with rice and naan bread', '2026-01-27 15:13:20'),
(13, 'Chicken Parmesan', 'Crispy breaded chicken cutlets topped with marinara sauce and melted mozzarella cheese.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfMWWcbG1oPmsAk76HiHm2uhqHuHINvDRT4A&s', 50, 1, 3, '1. Preheat oven to 200°C (400°F)\n2. Pound 4 chicken breasts to even thickness\n3. Set up breading station: flour, beaten eggs, breadcrumbs with Parmesan\n4. Dredge chicken in flour, then egg, then breadcrumbs\n5. Heat oil in large skillet and fry chicken until golden (4-5 minutes per side)\n6. Place chicken in baking dish\n7. Top each with marinara sauce and mozzarella slices\n8. Bake for 15-20 minutes until cheese is melted and bubbly\n9. Serve with spaghetti and extra sauce', '2026-01-27 15:13:20'),
(14, 'Beef Burgers', 'Juicy homemade beef burgers with all the classic toppings, served with crispy fries.', 'https://realfood.tesco.com/media/images/Burger-31LGH-a296a356-020c-4969-86e8-d8c26139f83f-0-1400x919.jpg', 35, 1, 1, '1. Mix 500g ground beef with 1 teaspoon salt, 1/2 teaspoon pepper, 1 teaspoon Worcestershire sauce\n2. Form into 4 patties, indent center with thumb\n3. Preheat grill or skillet over medium-high heat\n4. Cook burgers for 4-5 minutes per side for medium\n5. Toast burger buns\n6. Assemble burgers with lettuce, tomato, onion, pickles\n7. Add cheese if desired during last minute of cooking\n8. Serve with ketchup, mustard, mayonnaise\n9. Accompany with French fries or salad', '2026-01-27 15:13:20'),
(15, 'Stuffed Bell Peppers', 'Bell peppers filled with seasoned rice, ground beef, and tomatoes, baked with cheese topping.', 'https://tyberrymuch.com/wp-content/uploads/2020/09/vegan-stuffed-peppers-recipe.jpg', 60, 1, 2, '1. Preheat oven to 190°C (375°F)\n2. Cut tops off 4 bell peppers, remove seeds\n3. Cook 200g rice according to package directions\n4. Brown 300g ground beef with 1 chopped onion\n5. Mix cooked rice, beef, 400g canned tomatoes, and herbs\n6. Stuff peppers with mixture\n7. Place in baking dish with 2cm water at bottom\n8. Cover with foil and bake for 40 minutes\n9. Remove foil, top with cheese, bake 10 more minutes\n10. Let cool 5 minutes before serving', '2026-01-27 15:13:20'),
(16, 'Garlic Mashed Potatoes', 'Creamy mashed potatoes with roasted garlic and butter, perfect comfort food.', NULL, 30, 2, 1, '1. Peel and quarter 1kg potatoes\n2. Boil in salted water until tender (15-20 minutes)\n3. Roast 1 head garlic: cut top off, drizzle with oil, wrap in foil, bake at 200°C for 30 minutes\n4. Drain potatoes and return to pot\n5. Squeeze roasted garlic into potatoes\n6. Add 100g butter and 200ml warm milk\n7. Mash until smooth\n8. Season with salt and white pepper\n9. Stir in chopped chives before serving', '2026-01-27 15:13:20'),
(17, 'Roasted Vegetables', 'Seasonal vegetables roasted with herbs and olive oil until caramelized.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwDbN46_gPvdmBht3XrMUHrU3OpSMTDxmK7g&s', 40, 2, 1, '1. Preheat oven to 220°C (425°F)\n2. Cut vegetables: potatoes, carrots, bell peppers, zucchini, onions\n3. Toss with 3 tablespoons olive oil\n4. Season with salt, pepper, rosemary, and thyme\n5. Spread in single layer on baking sheet\n6. Roast for 30-35 minutes, stirring halfway\n7. Vegetables should be tender and browned\n8. Drizzle with balsamic glaze before serving', '2026-01-27 15:13:20'),
(18, 'Caesar Salad', 'Classic salad with crisp romaine lettuce, croutons, Parmesan, and creamy dressing.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1yMsL3-aDiWbwhBk0ID96W0lhYDNB19Mk-g&s', 20, 2, 1, '1. Wash and tear 2 heads romaine lettuce\n2. Make croutons: cube bread, toss with oil and garlic, bake at 180°C for 10 minutes\n3. Prepare dressing: blend 1 egg yolk, 2 anchovy fillets, 1 garlic clove, lemon juice, Dijon mustard\n4. Slowly whisk in 150ml olive oil until emulsified\n5. Add 50g grated Parmesan to dressing\n6. Toss lettuce with dressing\n7. Top with croutons, extra Parmesan, and black pepper\n8. Optional: add grilled chicken for main course salad', '2026-01-27 15:13:20'),
(19, 'Herb Rice Pilaf', 'Fragrant rice cooked with onions, herbs, and vegetable broth.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-MVvgW-2RIjzBOCoCL2TMAuTNWsw-eOV80w&s', 25, 2, 1, '1. Rinse 400g long-grain rice\n2. Heat 2 tablespoons butter in saucepan\n3. Cook 1 chopped onion until soft\n4. Add rice and cook for 2 minutes until translucent\n5. Pour in 800ml vegetable broth\n6. Add 2 bay leaves and 1 teaspoon salt\n7. Bring to boil, then reduce to simmer\n8. Cover and cook for 18-20 minutes\n9. Remove from heat, let stand 5 minutes\n10. Fluff with fork and stir in chopped parsley and dill', '2026-01-27 15:13:20'),
(20, 'Creamed Spinach', 'Creamy spinach side dish with garlic and nutmeg, classic steak accompaniment.', NULL, 20, 2, 1, '1. Wash 1kg fresh spinach\n2. Heat large pot over medium heat\n3. Add spinach in batches, wilting each addition\n4. Drain spinach and squeeze out excess water\n5. Chop spinach coarsely\n6. Melt 2 tablespoons butter in saucepan\n7. Cook 1 minced garlic clove for 1 minute\n8. Stir in 2 tablespoons flour and cook for 1 minute\n9. Gradually whisk in 250ml milk\n10. Cook until thickened\n11. Stir in spinach, nutmeg, salt, and pepper\n12. Heat through and serve', '2026-01-27 15:13:20'),
(21, 'Tomato Basil Soup', 'Creamy tomato soup with fresh basil and Parmesan crisps, perfect with grilled cheese.', 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/tomato-soup-recipe.jpg', 35, 3, 1, '1. Heat 2 tablespoons olive oil in large pot\n2. Cook 1 chopped onion until soft\n3. Add 2 minced garlic cloves\n4. Pour in 2kg canned tomatoes with juices\n5. Add 500ml vegetable broth\n6. Simmer for 25 minutes\n7. Blend soup until smooth with immersion blender\n8. Stir in 200ml cream\n9. Add 1/2 cup chopped fresh basil\n10. Season with salt and pepper\n11. Serve with Parmesan crisps or croutons', '2026-01-27 15:13:20'),
(22, 'Minestrone Soup', 'Hearty Italian vegetable soup with pasta and beans, packed with nutrients.', 'https://nyssaskitchen.com/wp-content/uploads/2023/12/Gluten-Free-Minestrone-Soup-27.jpg', 60, 3, 2, '1. Heat 3 tablespoons olive oil in large pot\n2. Cook 1 chopped onion, 2 carrots, 2 celery stalks for 10 minutes\n3. Add 2 minced garlic cloves\n4. Pour in 2 liters vegetable broth\n5. Add 400g canned tomatoes, 200g green beans, 2 diced potatoes\n6. Simmer for 30 minutes\n7. Add 200g small pasta and 400g cannellini beans\n8. Cook 10 more minutes until pasta is al dente\n9. Stir in 200g chopped spinach\n10. Season with salt, pepper, and Italian herbs\n11. Serve with grated Parmesan', '2026-01-27 15:13:20'),
(23, 'Chicken Noodle Soup', 'Comforting homemade chicken soup with vegetables and egg noodles.', NULL, 75, 3, 2, '1. Place 1 whole chicken in large pot\n2. Cover with water, add 1 onion, 2 carrots, 2 celery stalks\n3. Bring to boil, then simmer for 1 hour\n4. Remove chicken, strain broth\n5. Shred chicken meat, discard skin and bones\n6. Return broth to pot, bring to simmer\n7. Add 2 sliced carrots, 2 sliced celery stalks\n8. Cook for 15 minutes until vegetables are tender\n9. Add 200g egg noodles and cook 8-10 minutes\n10. Return chicken to pot\n11. Season with salt, pepper, and parsley\n12. Serve hot with crusty bread', '2026-01-27 15:13:20'),
(24, 'Pumpkin Soup', 'Velvety smooth pumpkin soup with ginger and coconut milk, garnished with pumpkin seeds.', NULL, 45, 3, 1, '1. Peel and cube 1.5kg pumpkin\n2. Heat 2 tablespoons oil in large pot\n3. Cook 1 chopped onion until soft\n4. Add 2 minced garlic cloves and 1 tablespoon grated ginger\n5. Add pumpkin cubes and cook for 5 minutes\n6. Pour in 1 liter vegetable broth\n7. Simmer for 25 minutes until pumpkin is tender\n8. Blend soup until smooth\n9. Stir in 200ml coconut milk\n10. Season with salt, pepper, and nutmeg\n11. Garnish with roasted pumpkin seeds and cream', '2026-01-27 15:13:20'),
(25, 'French Onion Soup', 'Rich beef broth soup with caramelized onions, topped with toasted bread and melted Gruyère.', 'https://www.recipetineats.com/tachyon/2018/11/French-Onion-Soup_1.jpg', 90, 3, 3, '1. Slice 1.5kg onions thinly\n2. Melt 4 tablespoons butter in large pot\n3. Add onions and cook over low heat for 45 minutes until caramelized\n4. Stir in 1 tablespoon flour\n5. Add 200ml white wine and cook until reduced by half\n6. Pour in 1.5 liters beef broth\n7. Simmer for 30 minutes\n8. Preheat broiler\n9. Ladle soup into oven-safe bowls\n10. Top with toasted baguette slices\n11. Cover with 100g grated Gruyère cheese per bowl\n12. Broil until cheese is melted and bubbly', '2026-01-27 15:13:20'),
(26, 'Chocolate Brownies', 'Rich, fudgy chocolate brownies with walnuts, perfect with vanilla ice cream.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRohCyJxMq1h0yhVWZbAnvCW_qKJemnRLL2Nw&s', 45, 4, 1, '1. Preheat oven to 180°C (350°F)\n2. Line 20x20cm baking pan with parchment\n3. Melt 200g dark chocolate and 200g butter over double boiler\n4. In bowl, whisk 4 eggs and 300g sugar until pale\n5. Gradually whisk in chocolate mixture\n6. Sift in 100g flour and 30g cocoa powder\n7. Fold gently until just combined\n8. Stir in 100g chopped walnuts\n9. Pour batter into prepared pan\n10. Bake for 25-30 minutes until set but still fudgy\n11. Cool completely before cutting into squares', '2026-01-27 15:13:20'),
(27, 'Apple Pie', 'Classic American apple pie with flaky crust and cinnamon-spiced apple filling.', 'https://www.southernliving.com/thmb/bbDY1d_ySIrCFcq8WNBkR-3x6pU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/2589601_Mailb_Mailbox_Apple_Pie_003-da802ff7a8984b2fa9aa0535997ab246.jpg', 90, 4, 3, '1. Prepare pie crust: mix 300g flour, 1 teaspoon salt, 225g cold butter, 6-8 tablespoons ice water\n2. Chill dough for 30 minutes\n3. Peel and slice 1.5kg apples\n4. Toss apples with 150g sugar, 2 teaspoons cinnamon, 30g flour, lemon juice\n5. Roll out bottom crust and place in pie dish\n6. Add apple filling, dot with 2 tablespoons butter\n7. Roll out top crust, place over filling\n8. Crimp edges and cut steam vents\n9. Brush with egg wash, sprinkle with sugar\n10. Bake at 200°C (400°F) for 20 minutes\n11. Reduce to 180°C (350°F) and bake 40 more minutes\n12. Cool completely before serving', '2026-01-27 15:13:20'),
(28, 'Vanilla Cupcakes', 'Light and fluffy vanilla cupcakes with buttercream frosting, perfect for celebrations.', 'https://www.mybakingaddiction.com/wp-content/uploads/2011/07/unwrapped-vanilla-cupcake-700x1050.jpg', 40, 4, 2, '1. Preheat oven to 180°C (350°F)\n2. Line muffin tin with 12 cupcake liners\n3. Cream 150g butter and 150g sugar until light and fluffy\n4. Add 3 eggs one at a time\n5. Mix in 2 teaspoons vanilla extract\n6. Sift 200g flour with 2 teaspoons baking powder\n7. Alternate adding flour mixture and 120ml milk\n8. Divide batter among liners\n9. Bake for 18-20 minutes until golden\n10. Cool completely\n11. Make frosting: beat 200g butter until creamy, gradually add 400g powdered sugar and 2 teaspoons vanilla\n12. Pipe frosting onto cooled cupcakes', '2026-01-27 15:13:20'),
(29, 'Berry Cheesecake', 'Creamy New York-style cheesecake with berry topping and graham cracker crust.', 'https://img.delicious.com.au/WD-sxPh2/del/2016/05/jamie-olivers-baked-berry-cheesecake-30767-2.jpg', 180, 4, 3, '1. Make crust: mix 200g crushed graham crackers with 100g melted butter and 50g sugar\n2. Press into springform pan, bake at 180°C for 10 minutes\n3. Beat 900g cream cheese until smooth\n4. Gradually add 250g sugar\n5. Add 3 eggs one at a time\n6. Mix in 240ml sour cream, 1 tablespoon vanilla, lemon zest\n7. Pour over crust\n8. Bake at 160°C (325°F) for 60-70 minutes\n9. Turn off oven, let cool in oven for 1 hour\n10. Chill overnight\n11. Top with fresh berries before serving', '2026-01-27 15:13:20'),
(30, 'Chocolate Chip Cookies', 'Classic chewy chocolate chip cookies with crisp edges and soft centers.', 'https://www.allrecipes.com/thmb/JCMYBY68TG5gPrZLIx8x_AgcVRg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/9827-chocolate-chocolate-chip-cookies-i--DDMFS-092-4x3-c8227481fd804270a50256498cf8f05f.jpg', 30, 4, 1, '1. Preheat oven to 190°C (375°F)\n2. Line baking sheets with parchment\n3. Cream 225g butter with 150g brown sugar and 100g white sugar\n4. Add 2 eggs and 2 teaspoons vanilla\n5. Sift 325g flour with 1 teaspoon baking soda and 1/2 teaspoon salt\n6. Gradually add dry ingredients to wet\n7. Stir in 350g chocolate chips\n8. Drop tablespoonfuls onto baking sheets\n9. Bake for 9-11 minutes until golden\n10. Cool on baking sheet for 5 minutes\n11. Transfer to wire rack to cool completely', '2026-01-27 15:13:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `pk_userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` varchar(255) NOT NULL,
  `pfp` varchar(255) NOT NULL DEFAULT 'https://shorturl.at/jkuPe',
  `role` enum('user','administrator') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`pk_userId`, `username`, `password`, `created`, `name`, `pfp`, `role`) VALUES
(1, 'masmu123', 'pass123', '2026-04-15 10:21:52', 'Max Mustermann', 'https://shorturl.at/jkuPe', 'administrator'),
(2, 'masmu', '$2y$10$QdszpePskXfGrQp9enWm.OifdUqVZCvKA22xeR5LcQBVJb6QZjhTu', '2026-04-15 10:45:37', 'max', 'https://shorturl.at/jkuPe', 'user'),
(3, 'masu', '$2y$10$3y0cPX1H5GIB9yL2q6T9y.ApHhQD/pNOgo8rG1aZjirwxea.WyRgy', '2026-04-15 10:57:50', 'Max', 'https://shorturl.at/jkuPe', 'user'),
(4, 'barch473', '$2y$10$YDjHcM0Mo4AvO9yYihhAlejfiL9mJhoaiaCaJNnKvLsq7xWoaCyU6', '2026-04-21 08:25:40', 'barch473', 'https://shorturl.at/jkuPe', 'administrator'),
(5, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', '2026-04-29 00:00:00', 'Administrator', 'https://shorturl.at/jkuPe', 'administrator');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `includes`
--
ALTER TABLE `includes`
  ADD PRIMARY KEY (`pkfk_recipe`,`pkfk_ingredient`),
  ADD KEY `pkfk_ingredient` (`pkfk_ingredient`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`pk_ingredients`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`pk_recipes`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`pk_userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `pk_ingredients` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `pk_recipes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `pk_userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `includes`
--
ALTER TABLE `includes`
  ADD CONSTRAINT `includes_ibfk_1` FOREIGN KEY (`pkfk_recipe`) REFERENCES `recipes` (`pk_recipes`) ON DELETE CASCADE,
  ADD CONSTRAINT `includes_ibfk_2` FOREIGN KEY (`pkfk_ingredient`) REFERENCES `ingredients` (`pk_ingredients`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
