<?php
// GitHub仓库信息
$repoOwner = 'hllqkb';
$repoName = 'Filehelper_Easy';
$accessToken = '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'; // 替换为你的GitHub访问令牌

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

// 获取本地文件的版本信息
function getLocalVersion() {
    $versionFile = 'version.txt';
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
        $zipFile = 'latest_code.zip';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $zipUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 禁用SSL证书验证
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept: application/vnd.github.v3+json',
            'Authorization: token ' . $accessToken
        ]);
        $zipContent = curl_exec($ch);
        if ($zipContent === false) {
            logError('Failed to download latest code from GitHub: ' . curl_error($ch));
            curl_close($ch);
            return;
        }
        curl_close($ch);
        file_put_contents($zipFile, $zipContent);

        // 解压并替换本地文件（假设使用ZipArchive扩展）
        $zip = new ZipArchive;
        if ($zip->open($zipFile) === true) {
            $zip->extractTo(__DIR__);
            $zip->close();
            unlink($zipFile);

            // 更新本地版本文件
            file_put_contents('version.txt', $latestCommit);
            echo "Code updated successfully to version $latestCommit";
        } else {
            logError('Failed to unzip the latest code');
        }
    } else {
        echo "Local code is up to date";
    }
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
        <h1 class="mt-5">GitHub版本更新</h1>
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
                <?php else: ?>
                    <div class="alert alert-success" role="alert">
                        本地代码已是最新版本。
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.1.3/js/bootstrap.bundle.min.js"></script>
</body>
</html>
