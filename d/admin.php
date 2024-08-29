<?php
session_start();

// 设置 JSON 文件路径
$dataFile = 'links.json';

// 读取现有数据
if (file_exists($dataFile)) {
    $data = json_decode(file_get_contents($dataFile), true);
} else {
    $data = [];
}

// 处理登录
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $adminPassword = $_POST['adminPassword'];
    if ($adminPassword === 'hllqk') {
        $_SESSION['admin'] = true;
    } else {
        echo "管理员密码错误，请重新输入。";
        exit;
    }
}

// 检查是否已登录
if (!isset($_SESSION['admin'])) {
    echo "
    <!DOCTYPE html>
    <html lang='zh-CN'>
    <head>
        <meta charset='UTF-8'>
        <title>后台管理系统登录</title>
        <link href='https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css' rel='stylesheet'>
    </head>
    <body>
        <div class='container'>
            <h1 class='mt-5'>后台管理系统登录</h1>
            <form method='post'>
                <div class='mb-3'>
                    <label for='adminPassword' class='form-label'>管理员密码</label>
                    <input type='password' class='form-control' id='adminPassword' name='adminPassword' required>
                </div>
                <button type='submit' name='login' class='btn btn-primary'>登录</button>
            </form>
        </div>
        <script src='https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/js/bootstrap.bundle.min.js'></script>
    </body>
    </html>
    ";
    exit;
}

// 处理删除短链接
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete'])) {
    $shortUrl = $_POST['shortUrl'];
    if (isset($data[$shortUrl])) {
        unset($data[$shortUrl]);
        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
        echo "短链接已删除。";
    } else {
        echo "短链接不存在。";
    }
}

// 获取当前域名
$domain = $_SERVER['HTTP_HOST'];
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>后台管理系统</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1 class="mt-5">后台管理系统</h1>
        <table class="table table-striped mt-4">
            <thead>
                <tr>
                    <th>短链接</th>
                    <th>长链接</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($data as $shortUrl => $longUrl): ?>
                    <tr>
                        <td><a href="http://<?php echo $domain; ?>/d/redirect.php?shortUrl=<?php echo $shortUrl; ?>"><?php echo $shortUrl; ?></a></td>
                        <td><?php echo $longUrl; ?></td>
                        <td>
                            <form method="post">
                                <input type="hidden" name="shortUrl" value="<?php echo $shortUrl; ?>">
                                <button type="submit" name="delete" class="btn btn-danger btn-sm">删除</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <a href="index.html" class="btn btn-secondary mt-3">返回首页</a>
    </div>
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/js/bootstrap.bundle.min.js"></script>
</body>
</html>
