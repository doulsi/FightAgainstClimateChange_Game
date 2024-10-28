<?php
// modules/ResearchModule.php
class ResearchModule {
    private $config;
    
    public function __construct($config) {
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
    
    public function getStatusResearch() {
        error_log(sprintf('[Marco] getStatusResearch [%s]', print_r($this->config, true)));
    }
    
    public function processAction($action, $subAction, $gameState) {
        $actions = $this->getStatusResearch();
        if (!isset($actions[$action])) {
            return $gameState;
        }
        
        $actionConfig = $actions[$action];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) {
            $gameState['playerResources']['credits'] -= $actionConfig['cost'];
            
            $subActionConfig = $actionConfig['subActions'][$subAction] ?? $actionConfig['subActions']['climate_research'];
            
            // Base research increase
            $gameState['playerResources']['research'] += $subActionConfig['researchEffect'];
            
            // Apply specific bonuses based on research type
            switch ($subAction) {
                case 'climate_research':
                    $gameState['metrics']['globalTemperature'] -= 0.01;
                    break;
                case 'green_tech':
                    $gameState['economy']['renewableEnergy'] *= (1 + $subActionConfig['efficiencyBonus']);
                    break;
                case 'education':
                    $gameState['playerResources']['influence'] += $subActionConfig['policySupport'];
                    break;
            }
        }
        
        return $gameState;
    }
    
    public function update($gameState) {
        // Research decay over time (knowledge needs updating)
        $gameState['playerResources']['research'] *= 0.95;
        
        // Research benefits
        if ($gameState['playerResources']['research'] > 0) {
            // Research improves efficiency of other actions
            $gameState['economy']['circularEconomy'] += 
                $gameState['playerResources']['research'] * 0.01;
        }
        
        return $gameState;
    }
}
