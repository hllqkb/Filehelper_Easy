<?php
session_start();

// 检查是否有表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 读取当前配置
    $config = json_decode(file_get_contents('config.json'), true);

    // 更新配置内容
    $config['maxFileSize'] = $_POST['maxFileSize'];
    $config['allowedExtensions'] = explode(',', $_POST['allowedExtensions']);
    $config['IfIpLimit'] = isset($_POST['IfIpLimit']) ? true : false;
    $config['IpLimit'] = explode(',', $_POST['allowedIPs']);
    $config['web'] = isset($_POST['web']) ? true : false;
    $config['enableDdosProtection'] = isset($_POST['enableDdosProtection']) ? true : false; // 新增的配置项

    // 保存配置文件
    file_put_contents('config.json', json_encode($config, JSON_PRETTY_PRINT));

    // 设置cookie
    setcookie('enableRightClickDelete', isset($_POST['enableRightClickDelete']) ? 'true' : 'false', time() + (86400 * 30), "/"); // 86400 = 1 day

    $_SESSION['message'] = '配置已成功更新！';
    header('Location: admin.php');
    exit();
}

// 读取当前配置
$config = json_decode(file_get_contents('config.json'), true);
$maxFileSize = $config['maxFileSize'];
$allowedExtensions = implode(',', $config['allowedExtensions']);
$IfIpLimit = $config['IfIpLimit'];
$allowedIPs = implode(',', $config['IpLimit']);
$web = $config['web'];
$enableDdosProtection = isset($config['enableDdosProtection']) ? $config['enableDdosProtection'] : false; // 新增配置读取

// 读取cookie
$enableRightClickDelete = isset($_COOKIE['enableRightClickDelete']) ? $_COOKIE['enableRightClickDelete'] === 'true' : true; // 默认开启
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>配置管理</title>
    <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
    <div class="container">
        <h1 class="mt-5">配置管理</h1>
        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-success"><?php echo $_SESSION['message']; ?></div>
            <?php unset($_SESSION['message']); ?>
        <?php endif; ?>
        <form method="POST" action="admin.php">
            <div class="form-group">
                <label for="maxFileSize">最大上传文件大小（MB）</label>
                <input type="number" class="form-control" id="maxFileSize" name="maxFileSize" value="<?php echo $maxFileSize; ?>">
            </div>
            <div class="form-group">
                <label for="allowedExtensions">允许上传的文件类型（用逗号分隔）</label>
                <input type="text" class="form-control" id="allowedExtensions" name="allowedExtensions" value="<?php echo $allowedExtensions; ?>">
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="IfIpLimit" name="IfIpLimit" <?php echo $IfIpLimit ? 'checked' : ''; ?>>
                <label class="form-check-label" for="IfIpLimit">限制IP上传</label>
            </div>
            <div class="form-group">
                <label for="allowedIPs">允许的IP地址列表（用逗号分隔）</label>
                <input type="text" class="form-control" id="allowedIPs" name="allowedIPs" value="<?php echo $allowedIPs; ?>">
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="enableRightClickDelete" name="enableRightClickDelete" <?php echo $enableRightClickDelete ? 'checked' : ''; ?>>
                <label class="form-check-label" for="enableRightClickDelete">是否开启右键删除消息功能（本地）</label>
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="web" name="web" <?php echo $web ? 'checked' : ''; ?>>
                <label class="form-check-label" for="web">是否开启网站</label>
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="enableDdosProtection" name="enableDdosProtection" <?php echo $enableDdosProtection ? 'checked' : ''; ?>>
                <label class="form-check-label" for="enableDdosProtection">是否开启防DDoS</label>
            </div>
            <button type="submit" class="btn btn-primary">保存配置</button>
        </form>

        <!-- 新增的按钮行 -->
        <div class="mt-3 d-flex justify-content-start">
            <!-- “检查更新安装”按钮 -->
            <button id="checkUpdateBtn" class="btn btn-secondary mr-2">检查更新安装</button>
            <!-- “短链接”按钮 -->
            <button id="shortLinkBtn" class="btn btn-success" onclick="window.location.href='/d/'">短链接</button>
        </div>
        <div class="mt-3 d-flex justify-content-start">
            <button id="shortLinkBtn" class="btn btn-primary" onclick="window.location.href='../'">主页</button>
        </div>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/popper.js/2.5.4/umd/popper.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script>
        // JavaScript代码实现点击按钮后跳转到update/页面
        document.getElementById('checkUpdateBtn').addEventListener('click', function() {
            window.location.href = 'update/';
        });
    </script>
</body>
</html>
