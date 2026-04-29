<?php
require_once '../db.php';

$conn = connectDB();

$difficulties = loadJsonFile('difficulties.json');

$result = [];
if ($difficulties) {
    foreach ($difficulties as $difficulty) {
        $result[$difficulty['id']] = $difficulty['name'];
    }
}

jsonResponse($result);
mysqli_close($conn);
?>
