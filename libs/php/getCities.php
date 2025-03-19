<?php
 require "config.php"; 

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


// Validate and sanitize input
$countryCode = isset($_GET['countryCode']) ? trim($_GET['countryCode']) : '';

if (!$countryCode) {
    echo json_encode(["status" => ["code" => "400", "name" => "bad_request", "description" => "Invalid country code"]]);
    exit;
}

// API URL
$url = "http://api.geonames.org/searchJSON?country=" . urlencode($countryCode) . "&cities=cities15000&username=".GEONAMES_USERNAME."&maxRows=50";

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Check for cURL errors or HTTP errors
if (!$result || $httpCode !== 200) {
    echo json_encode(["status" => ["code" => "500", "name" => "error", "description" => "Failed to retrieve data"]]);
    exit;
}

// Decode JSON response
$decode = json_decode($result, true);

if (!isset($decode['geonames'])) {
    echo json_encode(["status" => ["code" => "500", "name" => "json_error", "description" => "Invalid JSON response"]]);
    exit;
}


$output = [
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => $decode['geonames']
];

// Send JSON response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output, JSON_PRETTY_PRINT);
?>
