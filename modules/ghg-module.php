<?php
// modules/BiodiversityModule.php
class GhgModule {
      
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
        // ghgEmissions impact from energy 
        $gameState['metrics']['ghgEmissions']       += $gameState['resources']['fossilFuels'] * 0.1 + $gameState['resources']['electricity'] * 0.001 ; 
		
		$gameState['metrics']['ghgEmissions']       -= $gameState['resources']['forests'] * 0.05 + $gameState['resources']['fisheries'] * 0.04 ;
		$gameState['metrics']['averageTemperature'] +=  $gameState['metrics']['ghgEmissions'] * 0.0001;
		            
        return $gameState;
    }
}
