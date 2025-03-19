<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Validate and sanitize input
$lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;

if ($lat === null || $lng === null) {
    echo json_encode(["status" => ["code" => "400", "name" => "bad_request", "description" => "Invalid or missing parameters"]]);
    exit;
}

// API URL
$apiKey = "2cbd9fffd775e22cf66142d9d0b63c2c";
$url = "http://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lng&appid=$apiKey";

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

if (!isset($decode['list'])) {
    echo json_encode(["status" => ["code" => "500", "name" => "json_error", "description" => "Invalid JSON response"]]);
    exit;
}

// Prepare output
$output = [
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => $decode
];

// Send JSON response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output, JSON_PRETTY_PRINT);
?>
