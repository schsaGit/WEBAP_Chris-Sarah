<?php
# returns all ingredients from the database, sorted by category then name

require_once '../db.php'; # loads the shared helper functions

$conn = connectDB(); # opens the database connection

# fetches every ingredient with its ID, name, and category, sorted alphabetically within each category
$query = "SELECT pk_ingredients, name, category FROM ingredients ORDER BY category, name";
$result = mysqli_query($conn, $query); # runs the query against the database

$ingredients = [];
while ($row = mysqli_fetch_assoc($result)) {
    $ingredients[] = $row; # adds each ingredient row to the array
}

jsonResponse($ingredients); # sends the full list back to the browser as JSON
mysqli_close($conn); # closes the database connection
?>
