<?php
// game.php
session_start();
require_once 'engine/game-engine.php';

class GameController {
    private $engine;
    
   
	 public function __construct() 
	 {
		$this->engine               							   = new GameEngine();
		$_SESSION['gameState']      							   = $this->engine->getInitialState();
		$_SESSION['gameState']['history']['temperature'][]         = $_SESSION['gameState']['metrics']['averageTemperature'];
		$_SESSION['gameState']['history']['biodiversity'][]        = $_SESSION['gameState']['metrics']['biodiversityIndex'];
		$_SESSION['gameState']['history']['emissions'][]           = $_SESSION['gameState']['metrics']['ghgEmissions'];
		$_SESSION['gameState']['history']['pollution'][]  	       = $_SESSION['gameState']['metrics']['pollutionIndex'];
		$_SESSION['gameState']['history']['climateEducation'][]    = $_SESSION['gameState']['metrics']['climateEducationIndex'];
		$_SESSION['gameState']['history']['circularEconomy'][]     = $_SESSION['gameState']['metrics']['circularEconomyIndex'];
		
		$_SESSION['engine']         = serialize($this->engine);
		error_log(sprintf('[Marco]main controller: Constructeur [%s] ', print_r($_SESSION, true)));
		
    }
    
    public function handlePostRequest() 
	{
        $input = json_decode(file_get_contents('php://input'), true);
        
		$gameState    = $_SESSION['gameState'];
		$this->engine = unserialize($_SESSION['engine']); 
		error_log(sprintf('[Marco] INPUT handleRequest [%s] and gameSate [%s]', print_r($input, true), print_r($gameState, true)));
		if (isset($input['action'])) {
            $gameState = $this->engine->processAction(
                $input['action'],
                $input['subAction'] ?? null,
                $gameState
            );
			error_log(sprintf('[Marco] handleRequest process action [%s]', print_r($input, true)));
        } else {
			error_log(sprintf('[Marco] TEST handleRequest [%s] ', print_r($this->engine, true)));
            $gameState = $this->engine->update($gameState);
			error_log(sprintf('[Marco] Update: handleRequest [%s]', print_r($gameState, true)));
        }
        
        $_SESSION['gameState'] = $gameState;
        
        return $this->sendResponse($gameState);
    }
    
    public function sendResponse($data) {
        header('Content-Type: application/json');
        echo json_encode($data);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$controller             = new GameController();
	$_SESSION['controller'] = serialize($controller);
	return $controller->sendResponse($_SESSION['gameState']);
}


// Handle request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$controller = unserialize($_SESSION['controller']);
    $controller->handlePostRequest();
}
