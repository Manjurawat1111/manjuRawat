<?php

// Read and decode JSON file
$jsonData = file_get_contents("countryBorders.geo.json");

if ($jsonData === false) {

    exit("Error: Unable to read the JSON file.");

}

$countries = json_decode($jsonData, true);

if ($countries === null) {
    exit("Error: Failed to decode JSON.");
}

$countryData = [];

// Check if 'features' exists in the JSON structure
if (isset($countries['features']) && is_array($countries['features'])) {
    foreach ($countries['features'] as $country) {
        if (isset($country['properties']['name'], $country['properties']['iso_a2'])) {
            $properties = [
                'name' => $country['properties']['name'],
                'code' => $country['properties']['iso_a2']
            ];
            $countryData[] = $properties;

        }
    }

}
usort($countryData, function($a, $b){
    return strcmp($a['name'], $b['name']);
});

// Output JSON
header('Content-Type: application/json');
echo json_encode($countryData, JSON_PRETTY_PRINT);

