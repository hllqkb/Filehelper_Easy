<?php
header('Content-Type: application/json');
require_once 'config.php';
$allowedTypes = [
    'image/jpeg', 'image/png', 'application/pdf',
    'application/vnd.android.package-archive', // apk
    'text/plain', // txt
    'video/mp4', // mp4
    'audio/mpeg', // mp3
    'application/octet-stream', // exe
    'application/zip', // zip
    'application/x-zip-compressed', // zip
    'application/x-rar-compressed' // rar
];

if($IfIpLimit){
   //ip限制

   
   //检查IP地址是否在允许列表中
    if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs)) {
       echo json_encode(['status' => 'error', 'message' => 'Access denied']);
       exit;
    } 
}else{
//无限制
}


if (isset($_FILES['file'])) {
    $fileExtension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);

    // 检查文件扩展名是否在允许列表中
    if (!in_array($fileExtension, $allowedExtensions)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type']);
        exit;
    }

    // 检查文件MIME类型是否在允许列表中
    if (!in_array($_FILES['file']['type'], $allowedTypes)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type']);
        exit;
    }

    // 检查文件大小
    if ($_FILES['file']['size'] > $maxFileSize) {
        echo json_encode(['status' => 'error', 'message' => 'File size exceeds limit']);
        exit;
    }

    $targetDir = 'files/';

    // 检查目标目录是否存在，不存在则创建
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $originalFileName = basename($_FILES['file']['name']);
    $targetFile = $targetDir . $originalFileName;

    // 检查文件是否已存在
    if (file_exists($targetFile)) {
        echo json_encode(['status' => 'error', 'message' => 'File already exists']);
        exit;
    }

    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        $timestamp = date('Y-m-d H:i:s');
        $log = json_decode(file_get_contents('files.json'), true);
        if (!$log) {
            $log = [];
        }

        $log[] = [
            'filename' => $originalFileName,
            'timestamp' => $timestamp
        ];

        file_put_contents('files.json', json_encode($log));

        echo json_encode(['status' => 'success', 'message' => 'File uploaded successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
}
?>
