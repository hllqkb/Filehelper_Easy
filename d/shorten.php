<?php
// 设置 JSON 文件路径
$dataFile = 'links.json';

// 读取现有数据
if (file_exists($dataFile)) {
    $data = json_decode(file_get_contents($dataFile), true);
} else {
    $data = [];
}

// 处理表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $longUrl = $_POST['longUrl'];
    $customShortUrl = $_POST['customShortUrl'];
    $password = $_POST['password'];

    // 验证游客密码
    if (!isset($_SESSION['admin']) && $password !== 'hllqk') {
        echo "密码错误，请重新输入。";
        exit;
    }

    // 生成短链接
    if (!empty($customShortUrl)) {
        // 检查自定义短链接是否已存在
        if (isset($data[$customShortUrl])) {
            echo "自定义短链接已存在，请选择其他短链接。";
            exit;
        }
        $shortUrl = $customShortUrl;
    } else {
        // 生成随机短链接
        do {
            $shortUrl = substr(md5(uniqid(mt_rand(), true)), 0, 6);
        } while (isset($data[$shortUrl]));
    }

    // 保存短链接
    $data[$shortUrl] = $longUrl;
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

    // 获取当前域名
    $domain = $_SERVER['HTTP_HOST'];

    // 显示生成的短链接
    echo "短链接已生成: <a href='http://$domain/d/redirect.php?shortUrl=$shortUrl'>http://$domain/d/redirect.php?shortUrl=$shortUrl</a>";
    exit;
}
?>
