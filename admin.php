<?php
session_start();

// 检查是否有表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $configContent = file_get_contents('config.php');

    // 更新配置内容
    $configContent = preg_replace('/(\$maxFileSize = )(\d+ \* \d+ \* \d+;)/', '${1}' . $_POST['maxFileSize'] . ';', $configContent);
    $configContent = preg_replace('/(\$allowedExtensions = array$)(.*)($;)/', '${1}' . $_POST['allowedExtensions'] . '${3}', $configContent);
    $configContent = preg_replace('/(\$IfIpLimit=)(TRUE|FALSE;)/', '${1}' . ($_POST['IfIpLimit'] ? 'TRUE' : 'FALSE') . ';', $configContent);
    $configContent = preg_replace('/(\$allowedIPs = $)(.*)(\$;)/', '${1}' . $_POST['allowedIPs'] . '${3}', $configContent);

    // 保存配置文件
    file_put_contents('config.php', $configContent);

    $_SESSION['message'] = '配置已成功更新！';
    header('Location: admin.php');
    exit();
}

// 读取当前配置
$configContent = file_get_contents('config.php');
preg_match('/(\$maxFileSize = )(\d+ \* \d+ \* \d+;)/', $configContent, $maxFileSizeMatch);
preg_match('/(\$allowedExtensions = array$)(.*)($;)/', $configContent, $allowedExtensionsMatch);
preg_match('/(\$IfIpLimit=)(TRUE|FALSE;)/', $configContent, $IfIpLimitMatch);
preg_match('/(\$allowedIPs = $)(.*)(\$;)/', $configContent, $allowedIPsMatch);

$maxFileSize = str_replace(';', '', $maxFileSizeMatch[2]);
$allowedExtensions = str_replace(['array(', ');'], '', $allowedExtensionsMatch[0]);
$IfIpLimit = $IfIpLimitMatch[2] === 'TRUE';
$allowedIPs = str_replace(['[', ']'], '', $allowedIPsMatch[0]);

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
                <input type="number" class="form-control" id="maxFileSize" name="maxFileSize">
            </div>
            <div class="form-group">
                <label for="allowedExtensions">允许上传的文件类型</label>
                <input type="text" class="form-control" id="allowedExtensions" name="allowedExtensions">
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="IfIpLimit" name="IfIpLimit">
                <label class="form-check-label" for="IfIpLimit">限制IP上传</label>
            </div>
            <div class="form-group">
                <label for="allowedIPs">允许的IP地址列表</label>
                <input type="text" class="form-control" id="allowedIPs" name="allowedIPs">
            </div>
            <button type="submit" class="btn btn-primary">保存配置</button>
        </form>
    </div>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/popper.js/2.5.4/umd/popper.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script>
        $(document).ready(function() {
            // 设置表单值
            $('#maxFileSize').val(<?php echo $maxFileSize; ?>);
            $('#allowedExtensions').val('<?php echo $allowedExtensions; ?>');
            $('#IfIpLimit').prop('checked', <?php echo $IfIpLimit ? 'true' : 'false'; ?>);
            $('#allowedIPs').val('<?php echo $allowedIPs; ?>');
        });
    </script>
</body>
</html>
