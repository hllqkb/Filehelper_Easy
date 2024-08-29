<?php
require_once 'updateConfig.php';
// 获取GitHub仓库的最新提交信息
function getLatestCommit($repoOwner, $repoName, $accessToken = '') {
    $url = "https://api.github.com/repos/$repoOwner/$repoName/commits";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 禁用SSL证书验证
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept: application/vnd.github.v3+json',
        'Authorization: token ' . $accessToken
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        logError('Failed to fetch GitHub commits: ' . curl_error($ch));
        curl_close($ch);
        return false;
    }
    curl_close($ch);
    $commits = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE || !isset($commits[0]['sha'])) {
        logError('Invalid JSON response from GitHub');
        return false;
    }
    return $commits[0]['sha']; // 返回最新提交的哈希值
}

function checkZipFileSize($zipFile) {
    if (!file_exists($zipFile)) {
        logError("Zip file does not exist: $zipFile");
        return false;
    }

    $fileSize = filesize($zipFile);
    if ($fileSize === 0) {
        logError("Zip file size is 0: $zipFile");
        return false;
    }

    return $fileSize;
}

// 获取本地文件的版本信息
function getLocalVersion() {
    $versionFile = '../update/version.txt';
    if (file_exists($versionFile)) {
        return file_get_contents($versionFile);
    }
    return '';
}

// 比较版本并更新代码
function updateCodeIfNeeded($repoOwner, $repoName, $accessToken = '') {
    $latestCommit = getLatestCommit($repoOwner, $repoName, $accessToken);
    if ($latestCommit === false) {
        logError('Failed to get latest commit from GitHub');
        return;
    }
    $localVersion = getLocalVersion();
    if ($latestCommit !== $localVersion) {
        // 下载最新代码并替换本地文件
        $zipUrl = "https://api.github.com/repos/$repoOwner/$repoName/zipball";
        $zipFile = __DIR__ . '/../latest_code.zip';

        $zipContent = file_get_contents($zipUrl, false, stream_context_create([
            'http' => [
                'header' => [
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                    'Accept: application/vnd.github.v3+json',
                    'Authorization: token ' . $accessToken
                ]
            ]
        ]));

        if ($zipContent === false) {
            logError('Failed to download latest code from GitHub');
            return;
        }

        file_put_contents($zipFile, $zipContent);

        if (!checkZipFileSize($zipFile)) {
            exit("Exiting due to invalid zip file size.\n");
        }

        $extractPath = '../'; // 设置临时目录
        $zip = new ZipArchive;
        $res = $zip->open($zipFile);
        if ($res === TRUE) {
            $zip->extractTo($extractPath);
            $firstFolder = $zip->getNameIndex(0);
            $tempDir = $extractPath . $firstFolder . '/';
            $rootDir = '../'; // 根目录路径
            $zip->close();
            unlink($zipFile);

            function moveFiles($source, $destination) {
                if (!is_dir($destination)) {
                    mkdir($destination, 0755, true);
                }
                $dir = opendir($source);
                while (false !== ($file = readdir($dir))) {
                    if (($file != '.') && ($file != '..')) {
                        if (is_dir($source . '/' . $file)) {
                            moveFiles($source . '/' . $file, $destination . '/' . $file);
                        } else {
                            rename($source . '/' . $file, $destination . '/' . $file);
                        }
                    }
                }
                closedir($dir);
                rmdir($source); // 删除源目录
            }

            moveFiles($tempDir, $rootDir);

        } else {
            logError('Failed to unzip the latest code');
            unlink($zipFile); // 删除失败的zip文件
            return;
        }
    }
    //更新完成后更新本地版本信息
    file_put_contents('../update/version.txt', $latestCommit); // 更新本地版本信息
}

// 错误日志记录函数
function logError($message) {
    error_log($message);
    echo $message . "\n";
}

// 执行更新检查
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update'])) {
    updateCodeIfNeeded($repoOwner, $repoName, $accessToken);
}

$latestCommit = getLatestCommit($repoOwner, $repoName, $accessToken);
$localVersion = getLocalVersion();
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>GitHub版本更新</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css" rel="stylesheet">
    
</head>
<body>
    <div class="container">
        <h1 class="mt-5">GitHub版本更新2.0</h1>
        <div class="card mt-4">
            <div class="card-header">
                版本信息
            </div>
            <div class="card-body">
                <p>远程版本: <?php echo $latestCommit; ?></p>
                <p>本地版本: <?php echo $localVersion; ?></p>
                <?php if ($latestCommit !== $localVersion): ?>
                    <div class="alert alert-warning" role="alert">
                        有新版本可用！
                    </div>
                    <form method="post">
                        <button type="submit" name="update" class="btn btn-primary">一键更新</button>
                    </form>
                    <button type="button" class="btn btn-secondary mt-3" data-bs-toggle="modal" data-bs-target="#configModal">配置修改</button>
                <?php else: ?>
                    <div class="alert alert-success" role="alert">
                        本地代码已是最新版本。
                    </div>
                <?php endif; ?>
            </div>
        </div>
       
    </div>

    <!-- 配置模态框 -->
    <div class="modal fade" id="configModal" tabindex="-1" aria-labelledby="configModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="configModalLabel">GitHub更新修改</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="post" action="saveConfig.php">
                    <div class="modal-body">
                        <textarea class="form-control" id="configText" name="configText" rows="20" style="white-space: pre-wrap;"><?php echo htmlspecialchars(file_get_contents('updateConfig.php')); ?></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="submit" class="btn btn-primary">保存</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/js/bootstrap.bundle.min.js"></script>
</body>
</html>
