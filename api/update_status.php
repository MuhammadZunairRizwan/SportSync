<?php
session_start();

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['isAdmin']) || !$_SESSION['isAdmin']) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be an admin to update game status'
    ]);
    exit;
}

// Check if required fields are provided
if (!isset($_POST['gameId']) || !isset($_POST['status'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Game ID and status are required'
    ]);
    exit;
}

$gameId = $_POST['gameId'];
$status = $_POST['status'];

// Validate status
$validStatuses = ['upcoming', 'live', 'finished'];
if (!in_array($status, $validStatuses)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid status'
    ]);
    exit;
}

// Get games from file
$gamesFile = '../data/games.json';
$games = json_decode(file_get_contents($gamesFile), true);

// Find game
$gameIndex = -1;
foreach ($games as $index => $game) {
    if ($game['id'] == $gameId) {
        $gameIndex = $index;
        break;
    }
}

// Check if game exists
if ($gameIndex === -1) {
    echo json_encode([
        'success' => false,
        'message' => 'Game not found'
    ]);
    exit;
}

// Update status
$games[$gameIndex]['status'] = $status;

// Save games to file
file_put_contents($gamesFile, json_encode($games));

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
$statusText = ucfirst($status);
$newUpdate = [
    'id' => $newId,
    'gameId' => $gameId,
    'content' => "Game status changed to: {$statusText}",
    'timestamp' => date('Y-m-d H:i:s')
];

// Add update
$updates[] = $newUpdate;

// Save updates to file
file_put_contents($updatesFile, json_encode($updates));

echo json_encode([
    'success' => true
]);
?>
