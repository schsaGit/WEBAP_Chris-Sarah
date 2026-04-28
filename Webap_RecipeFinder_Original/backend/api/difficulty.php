<?php
# returns all difficulty levels as a JSON object (e.g. { "1": "Easy", "2": "Medium", "3": "Hard" })

require_once '../db.php'; # loads the shared helper functions (connectDB, jsonResponse, loadJsonFile)

$conn = connectDB(); # opens the database connection (not used here, but kept for consistency)

$difficulties = loadJsonFile('difficulties.json'); # reads the difficulty levels from the JSON file in /data

$result = [];
if ($difficulties) {
    foreach ($difficulties as $difficulty) {
        $result[$difficulty['id']] = $difficulty['name']; # maps each difficulty's ID to its name
    }
}

jsonResponse($result); # sends the result back to the browser as JSON
mysqli_close($conn); # closes the database connection
?>
