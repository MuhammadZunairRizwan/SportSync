<?php
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => $_SESSION['user'],
        'isAdmin' => isset($_SESSION['isAdmin']) ? $_SESSION['isAdmin'] : false
    ]);
} else {
    echo json_encode([
        'loggedIn' => false
    ]);
}
?>
