<?php
/*
 * getLatestVersionNumberFromLiveSite.php
 *
 * Fetches the latest version number of Xemu from the live site (https://xemu.app/)
 * and outputs it in JSON format.
 *
 */
header('Content-Type: application/json');

$html = file_get_contents('https://xemu.app/');

preg_match('/Version [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,5} \([a-zA-Z]{3} [0-9]{1,2}, [0-9]{4}\)/', $html, $matches);
if (count($matches) === 0) {
    $op = [ 'error' => 'Could not find version number on live site.' ];
    exit();
};

$versionString = $matches[0];

$op = [ 'version' => $versionString ];

echo json_encode($op, JSON_PRETTY_PRINT), "\n";