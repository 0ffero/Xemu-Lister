<?php
header('Content-Type: application/json; charset=utf-8');
$path = 'D:/EMULATORS/xemu/xemu.exe';
if (!file_exists($path)) {
    echo json_encode(['error' => 'xemu.exe not found (' . $path . ')'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
};
$fso = new COM('Scripting.FileSystemObject');
$version = $fso->GetFileVersion($path);

if (substr_count($version, '.')===3) {
    $op = explode('.', $version);
    array_pop($op);
    $op = implode('.', $op);
};

echo json_encode(['xemu_version' => $op], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);