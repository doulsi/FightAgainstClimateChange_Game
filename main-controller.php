<?php
// game.php
session_start();
require_once 'engine/game-engine.php';

class GameController {
    private $engine;
    
    public function __construct() {
        $this->engine               = new GameEngine();
		$_SESSION['gameState']      = $this->engine->initializeState();
		error_log(sprintf('[Marco] main controller [%s]', print_r($this->engine, true)));
    }
    
    public function handleRequest() {
        $input = json_decode(file_get_contents('php://input'), true);
        error_log(sprintf('[Marco] handleRequest [%s]', print_r($input, true)));
        /*if (!isset($_SESSION['gameState'])) {
            $_SESSION['gameState'] = $this->engine->initializeState();
			error_log(sprintf('[Marco] KIWI handleRequest [%s]', print_r($this->engine, true)));
        }*/
        
        $gameState = $_SESSION['gameState'];
        
        if (isset($input['action'])) {
            $gameState = $this->engine->processAction(
                $input['action'],
                $input['subAction'] ?? null,
                $gameState
            );
			error_log('[Marco] Process Action Main controller');
        } else {
            $gameState = $this->engine->update($gameState);
			error_log(sprintf('[Marco] BANANA: handleRequest [%s]', print_r($gameState, true)));
        }
        
        // Check win/lose conditions
        $gameStatus = $this->engine->checkGameConditions($gameState);
        if ($gameStatus) {
            $gameState['status'] = $gameStatus;
        }
        
        $_SESSION['gameState'] = $gameState;
        
        return $this->sendResponse($gameState);
    }
    
    private function sendResponse($data) {
        header('Content-Type: application/json');
        echo json_encode($data);
    }
}
// Handle request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$controller = new GameController();
    $controller->handleRequest();
	error_log("[Marco] POST");
}
