<?php
header('Content-Type: application/json');

$allowedTypes = [
    'image/jpeg', 'image/png', 'application/pdf',
    'application/vnd.android.package-archive', // apk
    'text/plain', // txt
    'video/mp4', // mp4
    'audio/mpeg', // mp3
    'application/octet-stream', // exe
    'application/zip', // zip
    'application/x-rar-compressed' // rar
];

if (isset($_FILES['file']) && in_array($_FILES['file']['type'], $allowedTypes)) {
    $targetDir = 'files/';
    $targetFile = $targetDir . basename($_FILES['file']['name']);

    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        $timestamp = date('Y-m-d H:i:s');
        $log = json_decode(file_get_contents('files.json'), true);
        if (!$log) {
            $log = [];
        }

        $log[] = [
            'filename' => basename($_FILES['file']['name']),
            'timestamp' => $timestamp
        ];

        file_put_contents('files.json', json_encode($log));

        echo json_encode(['status' => 'success', 'message' => 'File uploaded successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type']);
}
?>
