<?php
// 引入prddos.php
require_once 'prddos.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['timestamp']) && isset($data['text'])) {
        $timestamp = $data['timestamp'];
        $text = $data['text'];

        // 读取texts.json文件
        $texts = json_decode(file_get_contents('texts.json'), true);

        // 查找并删除对应的消息
        foreach ($texts as $key => $message) {
            if ($message['timestamp'] == $timestamp && $message['text'] == $text) {
                unset($texts[$key]);
                break;
            }
        }

        // 重新索引数组并保存到texts.json
        $texts = array_values($texts);
        file_put_contents('texts.json', json_encode($texts, JSON_PRETTY_PRINT));

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
