<?php
// modules/BiodiversityModule.php
class BiodiversityModule {
   private $config;
      
	public function __construct() {
        $this->loadConfigBioDiversity();
    }  
	  
   private function loadConfigBioDiversity() {
        $configPath = __DIR__ . '/../config/biodiversity-config.json';		
        $this->config = json_decode(file_get_contents($configPath), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Failed to load biodiversity game configuration');
			
        }		
		error_log(sprintf('[Marco] loadConfigBioDiversity [%s]', print_r($this->config, true)));
    }
    
    public function getStatusBiodiversity() {
		error_log(sprintf('[Marco] getStatusBiodiversity [%s]', print_r($this->config, true)));
    }
    
    public function processAction($action, $gameState) {
        $actions = $this->getStatusBiodiversity();
        if (!isset($actions[$action])) {
            return $gameState;
        }
        
        $actionConfig = $actions[$action];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) {
            $gameState['playerResources']['credits'] -= $actionConfig['cost'];
            $gameState['resources']['forests'] += 0.5;
            $gameState['metrics']['biodiversityIndex'] += 0.2;
        }
        
        return $gameState;
    }
    
    public function update($gameState) {
        // Natural biodiversity decline
        $gameState['metrics']['biodiversityIndex'] -= 0.1;
        
        // Forest impact on biodiversity
        $gameState['metrics']['biodiversityIndex'] += 
            $gameState['resources']['forests'] * 0.001;
            
        return $gameState;
    }
}
