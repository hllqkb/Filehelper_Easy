<?php
// 设置 JSON 文件路径
$dataFile = 'links.json';

// 读取现有数据
if (file_exists($dataFile)) {
    $data = json_decode(file_get_contents($dataFile), true);
} else {
    $data = [];
}

// 获取短链接
$shortUrl = $_GET['shortUrl'];

// 检查短链接是否存在
if (isset($data[$shortUrl])) {
    $longUrl = $data[$shortUrl];
    header("Location: $longUrl");
    exit;
} else {
    echo "短链接不存在。";
    exit;
}
?>
