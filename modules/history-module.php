<?php
// modules/HistoryModule.php
class HistoryModule {
      
	private $config;
	
	public function __construct() {
        $config = NULL;
    }  
	      
    public function getActions() {
		return $this->config;
    }
    
    public function processAction($action, $subAction, $gameState) {
		return $gameState; 
    }
    
    public function update($gameState) 
	{
        // update history
       	$gameState['history']['biodiversity'][]        = $gameState['metrics']['biodiversityIndex'];
       	$gameState['history']['temperature'][]         = $gameState['metrics']['averageTemperature'];
       	$gameState['history']['emissions'][]           = $gameState['metrics']['ghgEmissions'];
       	$gameState['history']['pollution'][]           = $gameState['metrics']['pollutionIndex'];
       	$gameState['history']['climateEducation'][]    = $gameState['metrics']['climateEducationIndex'];
       	$gameState['history']['circularEconomy'][]     = $gameState['metrics']['circularEconomyIndex'];
		            
        return $gameState;
    }
}
