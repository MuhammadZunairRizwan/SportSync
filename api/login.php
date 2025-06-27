<?php
session_start();

header('Content-Type: application/json');

// In a real application, you would validate against a database
// For this example, we'll use a JSON file to store users
$usersFile = '../data/users.json';

// Create data directory if it doesn't exist
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Create users file if it doesn't exist
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, json_encode([
        [
            'username' => 'admin',
            'password' => password_hash('admin', PASSWORD_DEFAULT),
            'isAdmin' => true
        ]
    ]));
}

// Get users from file
$users = json_decode(file_get_contents($usersFile), true);

// Check if username and password are provided
if (!isset($_POST['username']) || !isset($_POST['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Username and password are required'
    ]);
    exit;
}

$username = $_POST['username'];
$password = $_POST['password'];

// Find user
$user = null;
foreach ($users as $u) {
    if ($u['username'] === $username) {
        $user = $u;
        break;
    }
}

// Check if user exists and password is correct
if ($user && password_verify($password, $user['password'])) {
    // Set session
    $_SESSION['user'] = [
        'username' => $user['username']
    ];
    
    // Set admin status if applicable
    if (isset($user['isAdmin']) && $user['isAdmin']) {
        $_SESSION['isAdmin'] = true;
    }
    
    echo json_encode([
        'success' => true,
        'user' => $_SESSION['user'],
        'isAdmin' => isset($_SESSION['isAdmin']) ? $_SESSION['isAdmin'] : false
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid username or password'
    ]);
}
?>
