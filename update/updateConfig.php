<?php
// GitHub仓库信息，要修改的内容

$repoOwner = 'hllqkb';//你的github用户名

$repoName = 'Filehelper_Easy';//你的github仓库名

$mixedToken='t0wjQ8ckPHacvZWBI5tSmUNpcldxM3BFNjVHdXp3cUsrNk5iNzlaNHk4aUdobUROOFJxdndybS9URS94OW5VakNmb2kzcHYzR1B0Uy9CRmw=';

//加密后的github AccessToken，前往/update/mix.php加密

//END











$encrypt_key = $repoName; 
$decryptedAccessToken = decryptString($mixedToken, $encrypt_key);

$accessToken = $decryptedAccessToken; 
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
