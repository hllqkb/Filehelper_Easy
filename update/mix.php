<?php
$repoOwner = 'hllqkb';
$repoName = 'Filehelper_Easy';
$encrypt_key = $repoName; 

function encryptString($string, $key) {
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = openssl_random_pseudo_bytes($ivlen);
    $encrypted = openssl_encrypt($string, $cipher, $key, $options=0, $iv);
    return base64_encode($iv . $encrypted);
}

function decryptString($encryptedString, $key) {
    $c = base64_decode($encryptedString);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    $encrypted = substr($c, $ivlen);
    $decrypted = openssl_decrypt($encrypted, $cipher, $key, $options=0, $iv);
    return $decrypted;
}
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>字符串加密/解密工具</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1 class="text-center">字符串加密/解密工具</h1>
        
        <!-- 加密部分 -->
        <form method="post" class="mb-4">
            <h2>加密字符串</h2>
            <div class="mb-3">
                <label for="inputString" class="form-label">输入要加密的字符串：</label>
                <input type="text" class="form-control" id="inputString" name="inputString" required>
            </div>
            <button type="submit" class="btn btn-primary">加密</button>
        </form>

        <?php if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['inputString'])): ?>
            <?php
            $inputString = $_POST['inputString'];
            $encryptedString = encryptString($inputString, $encrypt_key);
            ?>
            <div class="mt-4">
                <label for="output" class="form-label">加密后的字符串：</label>
                <textarea class="form-control" id="output" rows="3" readonly><?php echo htmlspecialchars($encryptedString); ?></textarea>
            </div>
        <?php endif; ?>

        <!-- 解密部分 -->
        <form method="post" class="mt-5">
            <h2>解密字符串</h2>
            <div class="mb-3">
                <label for="encryptedString" class="form-label">输入要解密的字符串：</label>
                <input type="text" class="form-control" id="encryptedString" name="encryptedString" required>
            </div>
            <button type="submit" class="btn btn-success">解密</button>
        </form>

        <?php if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['encryptedString'])): ?>
            <?php
            $encryptedString = $_POST['encryptedString'];
            $decryptedString = decryptString($encryptedString, $encrypt_key);
            ?>
            <div class="mt-4">
                <label for="decryptedOutput" class="form-label">解密后的字符串：</label>
                <textarea class="form-control" id="decryptedOutput" rows="3" readonly><?php echo htmlspecialchars($decryptedString); ?></textarea>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
