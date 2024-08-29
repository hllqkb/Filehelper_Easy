<?php
// GitHub仓库信息
$repoOwner = 'hllqkb';
$repoName = 'Filehelper_Easy';
$accessToken = 'your_github_access_token'; // 替换为你的GitHub访问令牌

// 获取GitHub仓库的最新提交信息
function getLatestCommit($repoOwner, $repoName, $accessToken = '') {
    $url = "https://api.github.com/repos/$repoOwner/$repoName/commits";
    $headers = [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept: application/vnd.github.v3+json'
    ];
    if ($accessToken) {
        $headers[] = "Authorization: token $accessToken";
    }
    $context = stream_context_create([
        'http' => [
            'header' => $headers
        ]
    ]);
    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        logError('Failed to fetch GitHub commits');
        return false;
    }
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
        $zipContent = file_get_contents($zipUrl, false, $context);
        if ($zipContent === false) {
            logError('Failed to download latest code from GitHub');
            return;
        }
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
updateCodeIfNeeded($repoOwner, $repoName, $accessToken);
?>
