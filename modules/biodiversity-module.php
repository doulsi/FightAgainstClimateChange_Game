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
    
    public function getActions() {
		error_log(sprintf('[Marco] getActions Biodiversity [%s]', print_r($this->config, true)));
		return $this->config;
    }
    
    public function processAction($action, $subAction, $gameState) {
        $actions = $this->getActions();
        if (!isset($actions[$action][$subAction])) {
			error_log(sprintf('[Marco] biodiversity : subAction [%s] does not exist for module [%s]', print_r($subAction, true), print_r($actions, true)));
            return $gameState;
        }
        error_log(sprintf('[Marco] biodiversity processAction [%s]', print_r($actions[$action][$subAction], true)));

        $actionConfig = $actions[$action][$subAction];
        if ($gameState['playerResources']['credits'] >= $actionConfig['cost']) 
		{
            $gameState['playerResources']['credits']    -= $actionConfig['cost'];
            $gameState['metrics']['biodiversityIndex']  += $actionConfig['biodiversityIndex'];
            $gameState['metrics']['pollutionIndex']     += $actionConfig['pollutionIndex'];
			
			$gameState['resources']['forests']          +=  $actionConfig['forests'];
			$gameState['resources']['fisheries']        +=  $actionConfig['fisheries'];

        }
        
        return $gameState;
    }
    
    public function update($gameState) 
	{
  
        // Forest & fisheries impact on biodiversity and pollution
        $gameState['metrics']['biodiversityIndex']   += $gameState['resources']['forests']      * 0.001;
        $gameState['metrics']['biodiversityIndex']   += $gameState['resources']['fisheries']    * 0.001;
        $gameState['metrics']['pollutionIndex']      -= $gameState['resources']['forests']      * 0.01 + $gameState['resources']['fisheries'] * 0.01;
            
			
		$gameState['metrics']['biodiversityIndex']  -= $gameState['metrics']['pollutionIndex'] * 0.01;
		
		$gameState['history']['biodiversity'][] = $gameState['metrics']['biodiversityIndex'];
        return $gameState;
    }
}
