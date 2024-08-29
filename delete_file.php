<?php
// 引入prddos.php
require_once 'prddos.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['timestamp']) && isset($data['filename'])) {
        $timestamp = $data['timestamp'];
        $filename = $data['filename'];

        // 删除文件
        $filePath = 'files/' . $filename;
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // 读取files.json文件
        $files = json_decode(file_get_contents('files.json'), true);

        // 查找并删除对应的文件记录
        foreach ($files as $key => $file) {
            if ($file['timestamp'] == $timestamp && $file['filename'] == $filename) {
                unset($files[$key]);
                break;
            }
        }

        // 重新索引数组并保存到files.json
        $files = array_values($files);
        file_put_contents('files.json', json_encode($files, JSON_PRETTY_PRINT));

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
