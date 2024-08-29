<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['configText'])) {
    $configText = $_POST['configText'];
    file_put_contents('updateConfig.php', $configText);
    echo "配置已保存。";
    echo "<script>setTimeout(\"location.href='../update/'\", 1000);</script>";
} else {
    echo "无效的请求。";
}
?>
