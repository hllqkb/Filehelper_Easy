<?php
header('Content-Type: application/json');
// 引入prddos.php
require_once 'prddos.php';
// 从PHP输入流中获取原始POST数据，不然无法获取
$rawData = file_get_contents('php://input');
// 解码JSON数据
$data = json_decode($rawData, true);
// 确保 $_POST['text'] 存在并且不是空字符串
if (isset($data['text']) && !empty($data['text'])) {
    $text = $data['text'];
    $timestamp = date('Y-m-d H:i:s');

    $log = json_decode(file_get_contents('texts.json'), true);
    if (!$log) {
        $log = [];
    }

    $log[] = [
        'text' => $text,
        'timestamp' => $timestamp
    ];

    file_put_contents('texts.json', json_encode($log));

    echo json_encode(['status' => 'success', 'message' => 'Text saved successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Text is null or empty']);
}
?>
