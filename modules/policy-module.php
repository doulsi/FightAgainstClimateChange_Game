<?php
// modules/PolicyModule.php
class PolicyModule {
    private $config;
    
    public function __construct() {
        $this->loadConfigPolicy();
    }
	private function loadConfigPolicy() {
		$configPath = __DIR__ . '/../config/policy-config.json';		
		$this->config = json_decode(file_get_contents($configPath), true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new Exception('Failed to load policy game configuration');		
		}	
		error_log(sprintf('[Marco] loadConfigPolicy [%s]', print_r($this->config, true)));		
	}
    
    public function getActions() {
        error_log(sprintf('[Marco] getStatusPolicy [%s]', print_r($this->config, true)));
		return $this->config;
    }
        
    public function processAction($action, $subAction, $gameState) {
        $actions = $this->getActions();
        if (!isset($actions[$action][$subAction])) {
			error_log(sprintf('[Marco] policy : subAction [%s] does not exist for module [%s]', print_r($subAction, true), print_r($actions, true)));
            return $gameState;
        }
        error_log(sprintf('[Marco] policy processAction [%s]', print_r($actions[$action][$subAction], true)));
        
        $actionConfig = $actions[$action][$subAction];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) 
		{
            $gameState['playerResources']['credits'] -= $actionConfig['cost'];
            
            $gameState['metrics']['pollutionIndex']       += $actionConfig['pollutionIndex'] + (0.001 * $gameState['metrics']['climateEducationIndex']);
			$gameState['metrics']['economicImpactIndex']  += $actionConfig['economicImpactIndex'] + (0.001 * $gameState['metrics']['climateEducationIndex']);
			$gameState['metrics']['circularEconomyIndex'] += $actionConfig['circularEconomyIndex'] + (0.001 * $gameState['metrics']['climateEducationIndex']);
			$gameState['resources']['fossilFuels']        += $actionConfig['fossilFuels'];
			
        }
        
        return $gameState;
    }
    
    public function update($gameState) {
        
		
        
        return $gameState;
    }
}
