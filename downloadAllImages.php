<?php
declare(strict_types=1);

header('Content-Type: application/json');

function cleanExit(array $op): void {
    echo json_encode($op, JSON_PRETTY_PRINT), "\n";
    exit;
};
// Loads xemu_compat_list_20251126.json, downloads each 'image' URL into ./cache/ using the URL filename.

chdir('../');
$jsonFile = __DIR__ . '/xemu_compat_list_20251126.json';
$cacheDir = __DIR__ . '/cache';

if (!file_exists($jsonFile)) {
    $op = ['error' => 'JSON file not found'];
    cleanExit($op);
};

$json = file_get_contents($jsonFile);
$data = json_decode($json, true);
if (!is_array($data)) {
    $op = ['error' => 'Invalid JSON data'];
    cleanExit($op);
};

if (!is_dir($cacheDir)) {
    if (!mkdir($cacheDir, 0755, true)) {
        $op = [ 'error' => 'Failed to create cache directory'];
        cleanExit($op);
    };
};

function downloadToFile(string $url, string $dest): bool {
    file_put_contents($dest, file_get_contents($url));
    return file_exists($dest);
};

$total = 0;
$downloaded = 0;
$skipped = 0;
$failed = 0;
$failedNames = [];

foreach ($data as $idx => $item) {
    $total++;

    if (!is_array($item) || empty($item['image'])) {
        $skipped++;
        continue;
    }

    $url = $item['image'];
    $saveName = $item['title'];
    // basic URL validation
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        $skipped++;
        continue;
    }

    $filename = $saveName;
    if ($filename === '' || $filename === '.' || $filename === '..') {
        $skipped++;
        continue;
    }

    // sanitize filename
    $filename = preg_replace('/[^A-Za-z0-9._-]/u', '_', $filename);
    // get file extension from the URL
    $path = parse_url($url, PHP_URL_PATH);
    $ext = pathinfo($path, PATHINFO_EXTENSION);

    $dest = $cacheDir . DIRECTORY_SEPARATOR . $filename . '.' . $ext;


    // If file already exists, skip download
    if (file_exists($dest)) {
        $skipped++;
        continue;
    };

    $ok = downloadToFile($url, $dest);
    if ($ok) { $downloaded++; } else { $failed++; $failedNames[] = $saveName; };
}

// summary
$op = [
    'total' => $total,
    'downloaded' => $downloaded,
    'skipped' => $skipped,
    'failed' => $failed,
    'failed_names' => $failedNames
];

cleanExit($op);