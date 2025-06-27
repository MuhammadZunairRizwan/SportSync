<?php
session_start();

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['isAdmin']) || !$_SESSION['isAdmin']) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be an admin to add updates'
    ]);
    exit;
}

// Check if required fields are provided
if (!isset($_POST['gameId']) || !isset($_POST['content'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Game ID and content are required'
    ]);
    exit;
}

$gameId = $_POST['gameId'];
$content = $_POST['content'];

// Get games from file
$gamesFile = '../data/games.json';
$games = json_decode(file_get_contents($gamesFile), true);

// Find game
$gameExists = false;
foreach ($games as $game) {
    if ($game['id'] == $gameId) {
        $gameExists = true;
        break;
    }
}

// Check if game exists
if (!$gameExists) {
    echo json_encode([
        'success' => false,
        'message' => 'Game not found'
    ]);
    exit;
}

// Add update
$updatesFile = '../data/updates.json';

// Create updates file if it doesn't exist
if (!file_exists($updatesFile)) {
    file_put_contents($updatesFile, json_encode([]));
}

$updates = json_decode(file_get_contents($updatesFile), true);

// Generate new ID
$newId = 1;
if (!empty($updates)) {
    $ids = array_column($updates, 'id');
    $newId = max($ids) + 1;
}

// Create update
$newUpdate = [
    'id' => $newId,
    'gameId' => $gameId,
    'content' => $content,
    'timestamp' => date('Y-m-d H:i:s')
];

// Add update
$updates[] = $newUpdate;

// Save updates to file
file_put_contents($updatesFile, json_encode($updates));

echo json_encode([
    'success' => true,
    'update' => $newUpdate
]);
?>
