<?php
session_start();

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['isAdmin']) || !$_SESSION['isAdmin']) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be an admin to update scores'
    ]);
    exit;
}

// Check if required fields are provided
if (!isset($_POST['gameId']) || !isset($_POST['score1']) || !isset($_POST['score2'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Game ID and scores are required'
    ]);
    exit;
}

$gameId = $_POST['gameId'];
$score1 = intval($_POST['score1']);
$score2 = intval($_POST['score2']);

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

// Update scores
$games[$gameIndex]['score1'] = $score1;
$games[$gameIndex]['score2'] = $score2;

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
$newUpdate = [
    'id' => $newId,
    'gameId' => $gameId,
    'content' => "Score updated: {$games[$gameIndex]['team1']} {$score1} - {$score2} {$games[$gameIndex]['team2']}",
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
