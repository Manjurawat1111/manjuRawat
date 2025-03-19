<?php
	require "config.php";
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url = "http://api.geonames.org/countryInfoJSON?username=".GEONAMES_USERNAME;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	// Execute request and capture response
	$result = curl_exec($ch);

	// Check for cURL errors
	if (curl_errno($ch)) {
	    $output['status']['code'] = "500";
	    $output['status']['name'] = "error";
	    $output['status']['description'] = "cURL Error: " . curl_error($ch);
	} else {
	    $decode = json_decode($result, true);

	    // Ensure the 'geonames' key exists before using it
	    if (isset($decode['geonames'])) {
	        $output['status']['code'] = "200";
	        $output['status']['name'] = "ok";
	        $output['status']['description'] = "success";
	        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	        $output['data'] = $decode['geonames'];
	    } else {
	        $output['status']['code'] = "500";
	        $output['status']['name'] = "error";
	        $output['status']['description'] = "Invalid API response structure";
	    }
	}

	// Close cURL session
	curl_close($ch);

	// Return JSON response
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output, JSON_PRETTY_PRINT);
?>
