<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = __DIR__ . '/availableGames';
if (!is_dir($baseDir)) {
    echo json_encode([]);
    exit;
}

$entries = array_values(array_filter(scandir($baseDir), function($name) use ($baseDir) {
    if ($name === '.' || $name === '..') return false;
    return is_dir($baseDir . '/' . $name);
}));

$imageExts = ['jpg','jpeg','png','gif','webp','bmp','tiff','svg'];
$result = [];

foreach ($entries as $folder) {
    $folderPath = $baseDir . '/' . $folder;
    $files = scandir($folderPath);
    $foundImage = null;
    $foundPDF = null;

    // look for game cover image
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $filePath = $folderPath . '/' . $file;
        if (!is_file($filePath)) continue;
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, $imageExts, true)) {
            $foundImage = $file;
            break; // first image in the subfolder is the one we want
        };
    };

    // is there a manual for this game?
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $filePath = $folderPath . '/' . $file;
        if (!is_file($filePath)) continue;
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if ($ext ==='pdf') {
            $foundPDF = $file;
            break; // first pdf in the subfolder is the one we want
        };
    };

    if ($foundImage !== null) {
        $result[] = [
            'title' => $folder,
            'image' => $foundImage,
            'manual' => $foundPDF
        ];
    };
};

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);