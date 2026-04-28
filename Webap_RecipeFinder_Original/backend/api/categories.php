<?php
require_once '../db.php';

$conn = connectDB();

$categories = loadJsonFile('categories.json');

$result = [];
if ($categories) {
    foreach ($categories as $category) {
        $result[$category['id']] = $category['name'];
    }
}

jsonResponse($result);
mysqli_close($conn);
?>
