<?php
# returns the ID of one randomly chosen recipe

require_once '../db.php'; # loads the shared helper functions

$conn = connectDB(); # opens the database connection

# ORDER BY RAND() shuffles all rows randomly, LIMIT 1 takes just the first one
$query = "SELECT pk_recipes FROM recipes ORDER BY RAND() LIMIT 1";
$result = mysqli_query($conn, $query);

if ($row = mysqli_fetch_assoc($result)) {
    jsonResponse($row); # sends back the random recipe's ID (e.g. { "pk_recipes": 7 })
} else {
    jsonResponse(['error' => 'No recipes found'], 404); # sends a 404 error if the table is empty
}

mysqli_close($conn); # closes the database connection
?>
