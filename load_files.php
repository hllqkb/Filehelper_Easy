<?php
header('Content-Type: application/json');

$log = json_decode(file_get_contents('files.json'), true);
if (!$log) {
    $log = [];
}

echo json_encode($log);
?>
