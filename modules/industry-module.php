<?php
// modules/EnergyModule.php
class IndustryModule {
    private $config;
    
    public function __construct() {
        $this->loadConfigIndustry();
    }
    
    private function loadConfigIndustry() {
		$configPath = __DIR__ . '/../config/industry-config.json';		
		$this->config = json_decode(file_get_contents($configPath), true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new Exception('Failed to load industry game configuration');		
		}	
		error_log(sprintf('[Marco] loadConfigEnergy [%s]', print_r($this->config, true)));		
	}
    
    public function getActions() {
		error_log(sprintf('[Marco] getStatusEnergy [%s]', print_r($this->config, true)));
		return $this->config;		
    }
    
    public function processAction($action, $subAction, $gameState) {
        $actions = $this->getActions();
        if (!isset($actions[$action][$subAction])) {
			error_log(sprintf('[Marco] industry : subAction [%s] does not exist for module [%s]', print_r($subAction, true), print_r($actions, true)));
            return $gameState;
        }
        
        $actionConfig = $actions[$action][$subAction];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) 
		{			
            $gameState['playerResources']['credits'] -= $actionConfig['cost'];        
            $gameState['resources']['electricity']   += $actionConfig['electricity'];			
            $gameState['resources']['fossilFuels']   += $actionConfig['fossilFuel'];			
        }
        
        return $gameState;
    }
    
    public function update($gameState) {
		
		$gameState['resources']['fossilFuels'] += 0.02;
                
        return $gameState;
    }
}
