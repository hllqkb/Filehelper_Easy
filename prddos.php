<?php
// 配置项
// echo "配置项：";
define('ALLOW_TIME', 60); // 允许时间窗口（秒）
define('ALLOW_NUM', 30); // 允许请求次数
define('COOLDOWN_PERIOD', 600); // 冷却时间（秒）
// require_once('config.php');
// 获取当前IP
$ip = $_SERVER['REMOTE_ADDR'];

// 检查禁止IP
$forbidden_ips = file('.htaccess2', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if (in_array($ip, $forbidden_ips)) {
    die("⚠警告⚠:"."<br>"."你的IP地址已被封禁，如果你有疑问可以发邮箱到hllqk.cn联系!");
    header('Location: 404.html');
    exit();
}

// 防刷新机制
$time = time();
$forbid_file = 'log/forbidchk.dat';

if (file_exists($forbid_file)) {
    if ($time - filemtime($forbid_file) > ALLOW_TIME) {
        unlink($forbid_file);
    } else {
        $forbid_data = file($forbid_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($ip == $forbid_data[0]) {
            if ($time - $forbid_data[1] > COOLDOWN_PERIOD) {
                unlink($forbid_file);
            } elseif ($forbid_data[2] > ALLOW_NUM) {
                file_put_contents('.htaccess2', implode("\n", $forbidden_ips) . "\n$ip");
                unlink($forbid_file);
            } else {
                $forbid_data[2]++;
                file_put_contents($forbid_file, implode("\n", $forbid_data));
            }
        }
    }
}

// 记录请求
$log_file = 'log/ipdate.dat';
if (!file_exists('log')) {
    mkdir('log', 0777);
}
if (!file_exists($log_file)) {
    file_put_contents($log_file, '');
}

$uri = $_SERVER['REQUEST_URI'];
$check_ip = md5($ip);
$check_uri = md5($uri);
$yesno = true;
$ipdate = file($log_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$str = '';

foreach ($ipdate as $line) {
    $iptem = substr($line, 0, 32);
    $uritem = substr($line, 32, 32);
    $timetem = substr($line, 64, 10);
    $numtem = substr($line, 74);

    if ($time - $timetem < ALLOW_TIME) {
        if ($iptem != $check_ip) {
            $str .= $line . "\n";
        } else {
            $yesno = false;
            if ($uritem != $check_uri) {
                $str .= $check_ip . $check_uri . $time . "1\n";
            } elseif ($numtem < ALLOW_NUM) {
                $str .= $check_ip . $check_uri . $timetem . ($numtem + 1) . "\n";
            } else {
                if (!file_exists($forbid_file)) {
                    file_put_contents($forbid_file, "$ip\n$time\n1");
                }
                file_put_contents('log/forbided_ip.log', "$ip--".date("Y-m-d H:i:s", $time)."--" . $uri . "\n", FILE_APPEND);
                $timepass = $timetem + ALLOW_TIME - $time;
                die("⚠警告⚠"."<br>"."抱歉，你发起了太多次请求，请等待 " . $timepass . " 秒后继续");
                header('Location: 404.html');
                exit();
            }
        }
    }
}

if ($yesno) {
    $str .= $check_ip . $check_uri . $time . "1\n";
}

file_put_contents($log_file, $str);
?>
