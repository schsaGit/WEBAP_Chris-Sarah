<?php
require_once '../db.php';

$conn = connectDB();

$query = "SELECT pk_ingredients, name, category FROM ingredients ORDER BY category, name";
$result = mysqli_query($conn, $query);

$ingredients = [];
while ($row = mysqli_fetch_assoc($result)) {
    $ingredients[] = $row;
}

jsonResponse($ingredients);
mysqli_close($conn);
?>
