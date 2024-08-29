<?php
//header('Content-Type: application/json');
require 'prddos.php';
// 读取 config.json 文件内容
$jsonContent = file_get_contents('config.json');

// 解析 JSON 数据为 PHP 数组
$configArray = json_decode($jsonContent, true);

// 检查是否解析成功
if (json_last_error() === JSON_ERROR_NONE && is_array($configArray)) {
    // 遍历数组并将每个键值对赋值给对应的 PHP 变量
    foreach ($configArray as $key => $value) {
        // 使用变量变量语法将键名作为变量名，值作为变量值
        $$key = $value;
    }
} else {
    // 处理 JSON 解析错误
   // echo 'Error parsing config.json';
}
if ($web==false){
    header("location:404.html");
    }
// 示例：输出配置值
//print_r($IpLimit); // 假设 config.json 中有 "exampleKey": "exampleValue"

?>
