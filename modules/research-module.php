<?php
// modules/ResearchModule.php
class ResearchModule {
    private $config;
    
    public function __construct() {
        $this->loadConfigResearch();
    }
    
    private function loadConfigResearch() {
		$configPath = __DIR__ . '/../config/research-config.json';		
		$this->config = json_decode(file_get_contents($configPath), true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new Exception('Failed to load research game configuration');
		
		}	
		error_log(sprintf('[Marco] loadConfigResearch [%s]', print_r($this->config, true)));		
	}
    
    public function getActions() {
        error_log(sprintf('[Marco] getStatusResearch [%s]', print_r($this->config, true)));
		return $this->config;
    }
    
    public function processAction($action, $subAction, $gameState) {
        $actions = $this->getActions();
        if (!isset($actions[$action][$subAction])) {
			error_log(sprintf('[Marco] research : subAction [%s] does not exist for module [%s]', print_r($subAction, true), print_r($actions, true)));
            return $gameState;
        }
        error_log(sprintf('[Marco] research processAction [%s]', print_r($actions[$action][$subAction], true)));
        
        $actionConfig = $actions[$action][$subAction];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) 
		{
            $gameState['playerResources']['credits'] -= $actionConfig['cost'];
            
            $gameState['metrics']['economicImpactIndex']   += $actionConfig['economicImpactIndex'];
            $gameState['metrics']['circularEconomyIndex']  += $actionConfig['circularEconomyIndex'];
            $gameState['metrics']['climateEducationIndex'] += $actionConfig['climateEducationIndex'];
        }
        
        return $gameState;
    }
    
    public function update($gameState) {
        
		// Natural biodiversity decline
        $gameState['metrics']['climateEducationIndex'] -= 0.2;
        $gameState['metrics']['circularEconomyIndex']  -= 0.1;
        
        
        $gameState['metrics']['pollutionIndex']      -= $gameState['metrics']['climateEducationIndex']  * 0.2 + $gameState['metrics']['circularEconomyIndex']  * 0.1 ;
        
        return $gameState;
    }
}
