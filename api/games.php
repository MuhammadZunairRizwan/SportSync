<?php
header('Content-Type: application/json');

// In a real application, you would fetch games from a database
// For this example, we'll use a JSON file
$gamesFile = '../data/games.json';

// Create data directory if it doesn't exist
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Create games file if it doesn't exist
if (!file_exists($gamesFile)) {
    // Create sample games
    $sampleGames = [
        [
            'id' => 1,
            'sport' => 'Football',
            'team1' => 'Barcelona',
            'team2' => 'Real Madrid',
            'time' => date('Y-m-d H:i:s', strtotime('+2 days')),
            'status' => 'upcoming',
            'score1' => 0,
            'score2' => 0,
            'team1Votes' => 0,
            'team2Votes' => 0
        ],
        [
            'id' => 2,
            'sport' => 'Basketball',
            'team1' => 'Lakers',
            'team2' => 'Bulls',
            'time' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'status' => 'upcoming',
            'score1' => 0,
            'score2' => 0,
            'team1Votes' => 0,
            'team2Votes' => 0
        ],
        [
            'id' => 3,
            'sport' => 'Tennis',
            'team1' => 'Federer',
            'team2' => 'Nadal',
            'time' => date('Y-m-d H:i:s'),
            'status' => 'live',
            'score1' => 2,
            'score2' => 1,
            'team1Votes' => 15,
            'team2Votes' => 10
        ]
    ];
    
    file_put_contents($gamesFile, json_encode($sampleGames));
}

// Get games from file
$games = json_decode(file_get_contents($gamesFile), true);

// Return games
echo json_encode($games);
?>
