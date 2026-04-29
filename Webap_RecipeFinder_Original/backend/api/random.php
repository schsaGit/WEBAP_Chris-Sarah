<?php
require_once '../db.php';

$conn = connectDB();

$query = "SELECT pk_recipes FROM recipes ORDER BY RAND() LIMIT 1";
$result = mysqli_query($conn, $query);

if ($row = mysqli_fetch_assoc($result)) {
    jsonResponse($row);
} else {
    jsonResponse(['error' => 'No recipes found'], 404);
}

mysqli_close($conn);
?>
