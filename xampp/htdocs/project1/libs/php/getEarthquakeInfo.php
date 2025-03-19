<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Validate and sanitize input
$north = isset($_GET['north']) ? floatval($_GET['north']) : null;
$south = isset($_GET['south']) ? floatval($_GET['south']) : null;
$east = isset($_GET['east']) ? floatval($_GET['east']) : null;
$west = isset($_GET['west']) ? floatval($_GET['west']) : null;

if ($north === null || $south === null || $east === null || $west === null) {
    echo json_encode(["status" => ["code" => "400", "name" => "bad_request", "description" => "Invalid or missing parameters"]]);
    exit;
}

// API URL
$url = "http://api.geonames.org/earthquakesJSON?north=$north&south=$south&east=$east&west=$west&username=manjurawat1111";

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

if (!isset($decode['earthquakes'])) {
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
    "data" => $decode['earthquakes']
];

// Send JSON response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output, JSON_PRETTY_PRINT);
?>
