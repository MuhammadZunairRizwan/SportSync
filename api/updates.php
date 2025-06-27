<?php
header('Content-Type: application/json');

// Check if game ID is provided
if (!isset($_GET['gameId'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Game ID is required'
    ]);
    exit;
}

$gameId = $_GET['gameId'];

// In a real application, you would fetch updates from a database
// For this example, we'll use a JSON file
$updatesFile = '../data/updates.json';

// Create data directory if it doesn't exist
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Create updates file if it doesn't exist
if (!file_exists($updatesFile)) {
    // Create sample updates
    $sampleUpdates = [
        [
            'id' => 1,
            'gameId' => 3,
            'content' => 'Game has started!',
            'timestamp' => date('Y-m-d H:i:s', strtotime('-30 minutes'))
        ],
        [
            'id' => 2,
            'gameId' => 3,
            'content' => 'Federer scores a point!',
            'timestamp' => date('Y-m-d H:i:s', strtotime('-20 minutes'))
        ],
        [
            'id' => 3,
            'gameId' => 3,
            'content' => 'Nadal scores a point!',
            'timestamp' => date('Y-m-d H:i:s', strtotime('-10 minutes'))
        ]
    ];
    
    file_put_contents($updatesFile, json_encode($sampleUpdates));
}

// Get updates from file
$allUpdates = json_decode(file_get_contents($updatesFile), true);

// Filter updates for the specified game
$gameUpdates = array_filter($allUpdates, function($update) use ($gameId) {
    return $update['gameId'] == $gameId;
});

// Sort updates by timestamp
usort($gameUpdates, function($a, $b) {
    return strtotime($a['timestamp']) - strtotime($b['timestamp']);
});

// Return updates
echo json_encode(array_values($gameUpdates));
?>
