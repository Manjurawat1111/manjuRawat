<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);



// API endpoint
$url = "https://restcountries.com/v3.1/name/" . $_GET['country'] . "?fullText=true";

// Initialize cURL session
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url,
]);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($result === false) {
    http_response_code(500);
    echo json_encode([
        "status" => [
            "code" => "500",
            "name" => "error",
            "description" => $curlError ?: "Failed to retrieve data"
        ]
    ]);
  exit;
}

$decode = json_decode($result, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        "status" => [
            "code" => "500",
            "name" => "json_error",
            "description" => "Error decoding JSON response"
        ]
    ]);
    exit;
}


$output = [
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => $decode
];

// Send response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output, JSON_PRETTY_PRINT);
?>
