<?php

// Read and decode JSON file safely
$jsonData = file_get_contents("countryBorders.geo.json");

if ($jsonData === false) {
    exit(json_encode(["error" => "Unable to read the JSON file."]));
}

$countries = json_decode($jsonData, true);

// Validate JSON structure
if (!isset($countries['features']) || !is_array($countries['features'])) {
    exit(json_encode(["error" => "Invalid JSON structure."]));
}

// Function to get country by code
function getCountryByCode($countryCode, $countries) {
    if (!$countryCode) {
        return null;
    }
    
    foreach ($countries['features'] as $country) {
        // Check if 'iso_a2' key exists and compare in a case-insensitive manner
        if (isset($country['properties']['iso_a2']) && strtoupper($country['properties']['iso_a2']) === strtoupper($countryCode)) {
            return $country;
        }
    }
    return null;
}

// Check if POST request contains 'countryCode'
if (!isset($_POST['countryCode']) || empty(trim($_POST['countryCode']))) {
    exit(json_encode(["error" => "No country code provided."]));
}

$countryCode = strtoupper(trim($_POST['countryCode']));
$result = getCountryByCode($countryCode, $countries);

// Set header for JSON response
header('Content-Type: application/json');

if ($result) {
    echo json_encode($result, JSON_PRETTY_PRINT);
} else {
    echo json_encode(["error" => "No country found with code: " . htmlspecialchars($countryCode)]);
}

?>
