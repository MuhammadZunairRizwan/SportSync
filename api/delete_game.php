<?php
session_start();

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['isAdmin']) || !$_SESSION['isAdmin']) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be an admin to delete games'
    ]);
    exit;
}

// Check if game ID is provided
if (!isset($_POST['gameId'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Game ID is required'
    ]);
    exit;
}

$gameId = $_POST['gameId'];

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

// Remove game
array_splice($games, $gameIndex, 1);

// Save games to file
file_put_contents($gamesFile, json_encode($games));

// Delete related updates
$updatesFile = '../data/updates.json';
if (file_exists($updatesFile)) {
    $updates = json_decode(file_get_contents($updatesFile), true);
    
    // Filter out updates for this game
    $updates = array_filter($updates, function($update) use ($gameId) {
        return $update['gameId'] != $gameId;
    });
    
    // Save updates to file
    file_put_contents($updatesFile, json_encode(array_values($updates)));
}

// Delete related votes
$votesFile = '../data/votes.json';
if (file_exists($votesFile)) {
    $votes = json_decode(file_get_contents($votesFile), true);
    
    // Filter out votes for this game
    $votes = array_filter($votes, function($vote) use ($gameId) {
        return $vote['gameId'] != $gameId;
    });
    
    // Save votes to file
    file_put_contents($votesFile, json_encode(array_values($votes)));
}

echo json_encode([
    'success' => true
]);
?>
