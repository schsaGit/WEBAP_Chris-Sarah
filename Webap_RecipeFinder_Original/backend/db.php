<?php
// Database connection
function connectDB() {
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $database = 'recipe';

    $conn = mysqli_connect($host, $username, $password, $database);

    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    mysqli_set_charset($conn, "utf8");
    return $conn;
}

// Send JSON response
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Load JSON file
function loadJsonFile($filename) {
    $path = __DIR__ . '/data/' . $filename;
    if (!file_exists($path)) {
        return null;
    }
    $content = file_get_contents($path);
    return json_decode($content, true);
}
?>
