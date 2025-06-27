<?php
session_start();

header('Content-Type: application/json');

// In a real application, you would store users in a database
// For this example, we'll use a JSON file
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

// Check if username already exists
foreach ($users as $user) {
    if ($user['username'] === $username) {
        echo json_encode([
            'success' => false,
            'message' => 'Username already exists'
        ]);
        exit;
    }
}

// Add new user
$users[] = [
    'username' => $username,
    'password' => password_hash($password, PASSWORD_DEFAULT),
    'isAdmin' => false
];

// Save users to file
file_put_contents($usersFile, json_encode($users));

echo json_encode([
    'success' => true,
    'message' => 'User registered successfully'
]);
?>
