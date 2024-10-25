<?php
// game.php
session_start();

class GameState {
    public $year;
    public $resources;
    public $metrics;
    public $economy;
    public $playerResources;
    public $events;

    public function __construct() {
        // Initialize game state if not exists
        if (!isset($_SESSION['gameState'])) {
            $this->initializeState();
        } else {
            $this->loadState();
        }
    }

    private function initializeState() {
        $_SESSION['gameState'] = [
            'year' => 2024,
            'resources' => [
                'fossilFuels' => 100,
                'forests' => 68,
                'fisheries' => 50,
                'freshWater' => 70
            ],
            'metrics' => [
                'globalTemperature' => 1.2,
                'biodiversityIndex' => 68,
                'populationBillions' => 8.1,
                'pollutionLevel' => 75
            ],
            'economy' => [
                'globalGDP' => 100,
                'renewableEnergy' => 15,
                'circularEconomy' => 10
            ],
            'playerResources' => [
                'credits' => 1000,
                'research' => 0,
                'influence' => 0
            ],
            'events' => []
        ];
        $this->loadState();
    }

    private function loadState() {
        $state = $_SESSION['gameState'];
        $this->year = $state['year'];
        $this->resources = $state['resources'];
        $this->metrics = $state['metrics'];
        $this->economy = $state['economy'];
        $this->playerResources = $state['playerResources'];
        $this->events = $state['events'];
    }

    public function saveState() {
        $_SESSION['gameState'] = [
            'year' => $this->year,
            'resources' => $this->resources,
            'metrics' => $this->metrics,
            'economy' => $this->economy,
            'playerResources' => $this->playerResources,
            'events' => $this->events
        ];
    }

    public function performAction($action) {
        switch ($action) {
            case 'plant_trees':
                if ($this->playerResources['credits'] >= 100) {
                    $this->playerResources['credits'] -= 100;
                    $this->resources['forests'] += 0.5;
                    $this->metrics['biodiversityIndex'] += 0.2;
                    $this->addEvent("Planted trees: Forest cover increased by 0.5%");
                }
                break;
            
            case 'renewable_energy':
                if ($this->playerResources['credits'] >= 500) {
                    $this->playerResources['credits'] -= 500;
                    $this->economy['renewableEnergy'] += 2;
                    $this->metrics['pollutionLevel'] -= 1;
                    $this->addEvent("Built solar farm: Renewable energy share increased by 2%");
                }
                break;

            case 'research':
                if ($this->playerResources['credits'] >= 200) {
                    $this->playerResources['credits'] -= 200;
                    $this->playerResources['research'] += 1;
                    $this->addEvent("Funded research: Research level increased");
                }
                break;

            case 'policy':
                if ($this->playerResources['credits'] >= 300) {
                    $this->playerResources['credits'] -= 300;
                    $this->playerResources['influence'] += 1;
                    $this->addEvent("Influenced policy: Political influence increased");
                }
                break;
        }
        $this->saveState();
        return $this->getGameState();
    }

    private function addEvent($message) {
        array_unshift($this->events, [
            'time' => date('H:i:s'),
            'message' => $message
        ]);
        if (count($this->events) > 10) {
            array_pop($this->events);
        }
    }

    public function updateGame() {
        // Update game state based on time passing
        $this->year += 0.25; // Quarter year
        
        // Update metrics based on current state
        $this->updateMetrics();
        
        // Add resources based on time
        $this->playerResources['credits'] += 50; // Basic income
        
        $this->saveState();
        return $this->getGameState();
    }

    private function updateMetrics() {
        // Simplified system dynamics model
        $this->metrics['globalTemperature'] += (100 - $this->economy['renewableEnergy']) * 0.0001;
        $this->metrics['biodiversityIndex'] -= 0.1;
        $this->metrics['pollutionLevel'] += 0.2;
        
        // Apply positive effects from player actions
        $this->metrics['pollutionLevel'] -= $this->economy['renewableEnergy'] * 0.01;
        $this->metrics['biodiversityIndex'] += $this->resources['forests'] * 0.001;
    }

    public function getGameState() {
        return [
            'year' => $this->year,
            'resources' => $this->resources,
            'metrics' => $this->metrics,
            'economy' => $this->economy,
            'playerResources' => $this->playerResources,
            'events' => $this->events
        ];
    }
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $game = new GameState();
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action'])) {
        $response = $game->performAction($data['action']);
    } else {
        $response = $game->updateGame();
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>
