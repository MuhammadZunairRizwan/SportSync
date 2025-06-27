<?php
session_start();

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be logged in to vote'
    ]);
    exit;
}

// Check if required fields are provided
if (!isset($_POST['gameId']) || !isset($_POST['team'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Game ID and team are required'
    ]);
    exit;
}

$gameId = $_POST['gameId'];
$team = $_POST['team'];

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

// Check if game is finished
if ($games[$gameIndex]['status'] === 'finished') {
    echo json_encode([
        'success' => false,
        'message' => 'Cannot vote on finished games'
    ]);
    exit;
}

// Check if user has already voted
$votesFile = '../data/votes.json';

// Create votes file if it doesn't exist
if (!file_exists($votesFile)) {
    file_put_contents($votesFile, json_encode([]));
}

$votes = json_decode(file_get_contents($votesFile), true);

foreach ($votes as $vote) {
    if ($vote['gameId'] == $gameId && $vote['username'] === $_SESSION['user']['username']) {
        echo json_encode([
            'success' => false,
            'message' => 'You have already voted on this game'
        ]);
        exit;
    }
}

// Add vote
$votes[] = [
    'gameId' => $gameId,
    'username' => $_SESSION['user']['username'],
    'team' => $team
];

// Save votes to file
file_put_contents($votesFile, json_encode($votes));

// Update game votes
if ($team === '1') {
    $games[$gameIndex]['team1Votes']++;
} else {
    $games[$gameIndex]['team2Votes']++;
}

// Save games to file
file_put_contents($gamesFile, json_encode($games));

echo json_encode([
    'success' => true,
    'team1Votes' => $games[$gameIndex]['team1Votes'],
    'team2Votes' => $games[$gameIndex]['team2Votes']
]);
?>
