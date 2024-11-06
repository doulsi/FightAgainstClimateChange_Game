<?php
// modules/PollutionModule.php
class PollutionModule {
      
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
		$gameState['metrics']['pollutionIndex'] += 0.5;
        $gameState['metrics']['pollutionIndex'] -= $gameState['metrics']['climateEducationIndex']  * 0.04 + $gameState['metrics']['circularEconomyIndex']  * 0.07 ;
		            
					
		if ( $gameState['metrics']['pollutionIndex'] < 15 )
		{
			 $gameState['metrics']['pollutionIndex'] = 15;
		}
        return $gameState;
    }
}
