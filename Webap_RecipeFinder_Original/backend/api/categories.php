<?php
# returns all recipe categories as a JSON object (e.g. { "1": "Main Course", "2": "Side Dish" })

require_once '../db.php'; # loads the shared helper functions (connectDB, jsonResponse, loadJsonFile)

$conn = connectDB(); # opens the database connection (not used here, but kept for consistency)

$categories = loadJsonFile('categories.json'); # reads the categories from the JSON file in /data

$result = [];
if ($categories) {
    foreach ($categories as $category) {
        $result[$category['id']] = $category['name']; # maps each category's ID to its name
    }
}

jsonResponse($result); # sends the result back to the browser as JSON
mysqli_close($conn); # closes the database connection
?>
