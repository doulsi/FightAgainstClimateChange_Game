<?php


// engine/GameEngine.php
require_once 'modules/biodiversity-module.php';
require_once 'modules/energy-module.php';
require_once 'modules/research-module.php';
require_once 'modules/policy-module.php';
require_once 'modules/ghg-module.php';
require_once 'modules/history-module.php';

class GameEngine {
    private $config;
    private $modules;
    
    public function __construct() {
        $this->loadConfig();
        $this->initializeModules();
    }
    
    private function loadConfig() {
        $configPath   = __DIR__ . '/../config/game-config.json';
        $this->config = json_decode(file_get_contents($configPath), true);
		error_log(sprintf("[Marco] Game engine JSON [%s] initialized", print_r($this->config, true)));
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Failed to load game configuration');			
        }		
    }
    
    private function initializeModules() {
        $this->modules = [
            'biodiversity' => new BiodiversityModule(),
            'energy' 	   => new EnergyModule(),
            'research'     => new ResearchModule(),
            'policy'       => new PolicyModule(),
            'ghg'          => new GhgModule(),
            'history'      => new HistoryModule()
        ];
		error_log(sprintf("[Marco] Game engine initializeModules [%s] ", print_r($this->config, true)));

		foreach ($this->modules as $module) 
		{
			if($module->getActions() != NULL)			
			{
				$this->config['initialState'] += $module->getActions();	
			}	
		}
		error_log(sprintf("[Marco] Game engine module initialized [%s] ", print_r($this->config['initialState'], true)));
    }
    
    public function getInitialState() {
        return $this->config['initialState'];
    }
    
    public function processAction($action, $subAction, $gameState) {
		error_log(sprintf('[Marco] Game engine processAction Action: [%s], subAction: [%s] , gameState: [%s]', print_r($action, true),print_r($subAction, true),print_r($gameState, true)));
        // Determine which module should handle the action
        foreach ($this->modules as $module) 
		{
			$gameState = $module->processAction($action, $subAction, $gameState);         
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
        $gameState['playerResources']['credits'] += $this->config['updateIntervals']['credits'];
        
        return $gameState;
    }
   
}
