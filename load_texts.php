<?php
header('Content-Type: application/json');

$log = json_decode(file_get_contents('texts.json'), true);
if (!$log) {
    $log = [];
}

echo json_encode($log);
?>
