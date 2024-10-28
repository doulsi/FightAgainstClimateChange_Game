<?php
// modules/EnergyModule.php
class EnergyModule {
    private $config;
    
    public function __construct($config) {
        $this->loadConfigEnergy();
    }
    
    private function loadConfigEnergy() {
		$configPath = __DIR__ . '/../config/energy-config.json';		
		$this->config = json_decode(file_get_contents($configPath), true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new Exception('Failed to load energy game configuration');		
		}	
		error_log(sprintf('[Marco] loadConfigEnergy [%s]', print_r($this->config, true)));		
	}
    
    public function getStatusEnergy() {
		error_log(sprintf('[Marco] getStatusEnergy [%s]', print_r($this->config, true)));		
    }
    
    public function processAction($action, $subAction, $gameState) {
        $actions = $this->getStatusEnergy();
        if (!isset($actions[$action])) {
            return $gameState;
        }
        
        $actionConfig = $actions[$action];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) {
            $gameState['playerResources']['credits'] -= $actionConfig['cost'];
            
            $subActionConfig = $actionConfig['subActions'][$subAction] ?? $actionConfig['subActions']['solar_farms'];
            
            $gameState['economy']['renewableEnergy'] += $subActionConfig['energyEffect'];
            $gameState['metrics']['pollutionLevel'] -= $subActionConfig['pollutionEffect'] ?? 1.0;
            
            // Update fossil fuel dependency
            $gameState['resources']['fossilFuels'] -= $subActionConfig['energyEffect'] * 0.5;
        }
        
        return $gameState;
    }
    
    public function update($gameState) {
        // Natural energy demand increase
        $gameState['resources']['electricity'] += 0.1;
        
        // Temperature impact from fossil fuels
        $fossilFuelImpact = (100 - $gameState['economy']['renewableEnergy']) * 0.0001;
        $gameState['metrics']['globalTemperature'] += $fossilFuelImpact;
        
        return $gameState;
    }
}
