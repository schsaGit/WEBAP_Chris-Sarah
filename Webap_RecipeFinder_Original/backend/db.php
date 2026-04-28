<?php
# this file contains shared helper functions used by every API file in the backend

# opens a connection to the MySQL database and returns it
function connectDB() {
    $host = 'localhost';      # the server where the database runs (this machine)
    $username = 'root';       # the database user
    $password = '';           # no password for local development
    $database = 'recipe';     # the name of the database we want to use

    $conn = mysqli_connect($host, $username, $password, $database); # actually connects to the database

    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error()); # stops everything and shows the error if connection fails
    }

    mysqli_set_charset($conn, "utf8"); # makes sure special characters (like accents) are handled correctly
    return $conn; # gives the connection back to whoever called this function
}

# sends data back to the browser as JSON with an HTTP status code
function jsonResponse($data, $status = 200) {
    http_response_code($status); # sets the HTTP status (200 = OK, 500 = error, etc.)
    header('Content-Type: application/json'); # tells the browser the response is JSON
    echo json_encode($data, JSON_UNESCAPED_UNICODE); # converts the PHP array to a JSON string and prints it
    exit; # stops the script so nothing else gets added to the response
}

# reads a JSON file from the /data folder and returns it as a PHP array
function loadJsonFile($filename) {
    $path = __DIR__ . '/data/' . $filename; # builds the full path to the file (__DIR__ = the folder this file is in)
    if (!file_exists($path)) {
        return null; # returns nothing if the file doesn't exist
    }
    $content = file_get_contents($path); # reads the raw text of the file
    return json_decode($content, true); # converts the JSON text into a PHP array (true = associative array)
}
?>
