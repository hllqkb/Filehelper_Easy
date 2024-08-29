<?php
// GitHub仓库信息
$repoOwner = 'your_github_username';
$repoName = 'Filehelper_Easy';
$accessToken = 'your_github_access_token'; // 可选，用于私有仓库

// 获取GitHub仓库的最新提交信息
function getLatestCommit($repoOwner, $repoName, $accessToken = '') {
    $url = "https://api.github.com/repos/$repoOwner/$repoName/commits";
    $headers = ['User-Agent: PHP'];
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
        die('Failed to fetch GitHub commits');
    }
    $commits = json_decode($response, true);
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
    $localVersion = getLocalVersion();

    if ($latestCommit !== $localVersion) {
        // 下载最新代码并替换本地文件
        $zipUrl = "https://api.github.com/repos/$repoOwner/$repoName/zipball";
        $zipFile = 'latest_code.zip';
        file_put_contents($zipFile, file_get_contents($zipUrl));

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
            echo "Failed to unzip the latest code";
        }
    } else {
        echo "Local code is up to date";
    }
}

// 执行更新检查
updateCodeIfNeeded($repoOwner, $repoName, $accessToken);
?>
