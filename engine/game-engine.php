<?php


// engine/GameEngine.php
require_once 'modules/biodiversity-module.php';
require_once 'modules/energy-module.php';
require_once 'modules/research-module.php';
require_once 'modules/policy-module.php';

class GameEngine {
    private $config;
    private $modules;
    
    public function __construct() {
        $this->loadConfig();
        $this->initializeModules();
    }
    
    private function loadConfig() {
        $configPath = __DIR__ . '/../config/game-config.json';
        $this->config = json_decode(file_get_contents($configPath), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Failed to load game configuration');			
        }		
    }
    
    private function initializeModules() {
        $this->modules = [
            'biodiversity' => new BiodiversityModule($this->config),
            'energy' 	   => new EnergyModule($this->config),
            'research'     => new ResearchModule($this->config),
            'policy'       => new PolicyModule($this->config)
        ];
		error_log("[Marco] Modules initialized");
    }
    
    public function initializeState() {
        return $this->config['initialState'];
    }
    
    public function processAction($action, $subAction, $gameState) {
        // Determine which module should handle the action
        foreach ($this->modules as $module) {
            $actions = $module->getActions();
            if (isset($actions[$action])) {
                return $module->processAction($action, $gameState);
            }
        }
        return $gameState;
    }
    
    public function update($gameState) {
        // Increment year
        $gameState['year'] += $this->config['updateIntervals']['yearIncrement'];
        
        // Update through each module
        foreach ($this->modules as $module) {
            $gameState = $module->update($gameState);
        }
        
        // Add basic income
        $gameState['playerResources']['credits'] += 50;
        
        return $gameState;
    }
    
    public function checkGameConditions($gameState) {
        // Check win conditions
        if ($gameState['economy']['renewableEnergy'] >= $this->config['winConditions']['renewableEnergy'] && 
            $gameState['metrics']['biodiversityIndex'] >= $this->config['winConditions']['biodiversityIndex']) {
            return 'win';
        }
        
        // Check lose conditions
        if ($gameState['metrics']['globalTemperature'] >= $this->config['loseConditions']['maxGlobalTemperature'] || 
            $gameState['metrics']['biodiversityIndex'] <= $this->config['loseConditions']['minBiodiversityIndex']) {
            return 'lose';
        }
        
        return null;
    }
}
