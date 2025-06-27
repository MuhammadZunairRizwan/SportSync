<?php
session_start();

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be logged in to add a game'
    ]);
    exit;
}

// Check if required fields are provided
if (!isset($_POST['sport']) || !isset($_POST['team1']) || !isset($_POST['team2']) || !isset($_POST['time'])) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

// Get games from file
$gamesFile = '../data/games.json';
$games = json_decode(file_get_contents($gamesFile), true);

// Generate new ID
$newId = 1;
if (!empty($games)) {
    $ids = array_column($games, 'id');
    $newId = max($ids) + 1;
}

// Create new game
$newGame = [
    'id' => $newId,
    'sport' => $_POST['sport'],
    'team1' => $_POST['team1'],
    'team2' => $_POST['team2'],
    'time' => $_POST['time'],
    'status' => 'upcoming',
    'score1' => 0,
    'score2' => 0,
    'team1Votes' => 0,
    'team2Votes' => 0
];

// Add game to array
$games[] = $newGame;

// Save games to file
file_put_contents($gamesFile, json_encode($games));

echo json_encode([
    'success' => true,
    'game' => $newGame
]);
?>
