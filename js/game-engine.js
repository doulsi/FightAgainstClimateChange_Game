// JavaScript Game Engine - Replaces PHP game-engine.php
// Embedded configs to work locally without CORS issues
const EMBEDDED_CONFIGS = {
    gameConfig: {
        initialState: {
            year: 2024,
            resources: {
                fossilFuels: 100,
                forests: 68,
                fisheries: 50,
                freshWater: 30,
                electricity: 30
            },
            metrics: {
                averageTemperature: 1.2,
                biodiversityIndex: 40,
                populationBillions: 8.1,
                ghgEmissions: 100,
                circularEconomyIndex: 10,
                climateEducationIndex: 5,
                economicImpactIndex: -15,
                pollutionIndex: 75
            },
            economy: {
                globalGDP: 100,
                circularEconomy: 10
            },
            playerResources: {
                credits: 1000,
                research: 0,
                influence: 0
            },
            history: {
                temperature: [],
                biodiversity: [],
                emissions: [],
                pollution: [],
                climateEducation: [],
                circularEconomy: [],
                populationBillions: []
            }
        },
        updateIntervals: {
            gameLoop: 5000,
            credits: 200,
            yearIncrement: 0.25
        },
        winConditions: {
            pollutionIndex: 30,
            biodiversityIndex: 80
        },
        loseConditions: {
            maxGlobalTemperature: 2,
            minBiodiversityIndex: 20
        }
    },
    biodiversityConfig: {
        biodiversity_actions: {
            "Restore Wetlands": {
                cost: 200,
                fisheries: 0.5,
                forests: 0,
                description: "Increase fisheries by 0.5. Additionnal carbon sequestration and biodiversity restoration"
            },
            "Reforest Areas": {
                cost: 300,
                fisheries: 0,
                forests: 0.2,
                description: "Increase forest by 0.2. Additionnal carbon sequestration and biodiversity restoration"
            }
        }
    },
    industryConfig: {
        industry_actions: {
            "Build wind farm": {
                cost: 400,
                fossilFuel: -2.5,
                electricity: 2,
                description: "Decrease fossilFuel by 2.5, and increase electricity by 2"
            },
            "Build solar farms": {
                cost: 200,
                fossilFuel: -2.0,
                electricity: 1,
                description: "Decrease fossilFuel by 2.0, and increase electricity by 1"
            },
            "Build geothermal power plant": {
                cost: 100,
                fossilFuel: -1.3,
                electricity: 0.5,
                description: "Decrease fossilFuel by 1.3, and increase electricity by 0.5"
            },
            "Build nuclear power plant": {
                cost: 800,
                fossilFuel: -8,
                electricity: 8,
                description: "Decrease fossilFuel by 8, and increase electricity by 8"
            }
        }
    },
    researchConfig: {
        research_actions: {
            "Climate research": {
                cost: 200,
                economicImpactIndex: 0,
                circularEconomyIndex: 0.5,
                climateEducationIndex: 1.0,
                description: "Increase circular economy by 0.5 and climate education by 1.0"
            },
            "Frugality": {
                cost: 25,
                economicImpactIndex: -1,
                climateEducationIndex: 0,
                circularEconomyIndex: 0.1,
                description: "Increase circular economy by 0.1"
            },
            "Education": {
                cost: 800,
                economicImpactIndex: 8,
                climateEducationIndex: 8.0,
                circularEconomyIndex: 3.0,
                description: "Increase circular economy by 3, and climate education by 8"
            },
            "Recycling": {
                cost: 100,
                economicImpactIndex: 2,
                circularEconomyIndex: 4.0,
                climateEducationIndex: 0,
                description: "Increase circular economy by 4"
            }
        }
    },
    policyConfig: {
        policy_actions: {
            "Carbon tax": {
                cost: 400,
                pollutionIndex: -2,
                fossilFuels: -4,
                economicImpactIndex: -0.2,
                circularEconomyIndex: 0.2,
                description: "Reduce pollution by 2, fossilFuels by 4 and increase circual economy by 0.2"
            },
            "Ban plastic": {
                cost: 500,
                pollutionIndex: -5,
                fossilFuels: -2,
                economicImpactIndex: 2,
                circularEconomyIndex: 5,
                description: "Reduce pollution by 5, fossilFuels by 2 and increase circual economy by 5"
            },
            "Limite fossil fuel prospection": {
                cost: 2000,
                pollutionIndex: 0,
                fossilFuels: -40,
                economicImpactIndex: 6,
                circularEconomyIndex: 2.0,
                description: "Reduce fossilFuels by 40 and increase circual economy by 2"
            }
        }
    }
};

class GameEngine {
    constructor() {
        this.config = null;
        this.modules = {};
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        await this.loadConfig();
        await this.initializeModules();
        this.initialized = true;
    }

    async loadConfig() {
        try {
            // Try to fetch from server first (works on GitHub Pages)
            const response = await fetch('config/game-config.json');
            if (response.ok) {
                this.config = await response.json();
                return;
            }
        } catch (error) {
            // Fallback to embedded config (works locally)
            console.log('Using embedded config (local file mode)');
        }
        
        // Use embedded config as fallback
        this.config = EMBEDDED_CONFIGS.gameConfig;
    }

    async initializeModules() {
        this.modules = {
            biodiversity: new BiodiversityModule(),
            industry: new IndustryModule(),
            research: new ResearchModule(),
            policy: new PolicyModule(),
            ghg: new GhgModule(),
            pollution: new PollutionModule(),
            history: new HistoryModule()
        };
		
        // Initialize all modules
        for (const [key, module] of Object.entries(this.modules)) {
            await module.initialize();
            const actions = module.getActions();
            if (actions) {
                // Merge module actions into initial state
                Object.assign(this.config.initialState, actions);
            }
        }
		
    }

    getInitialState() {
        const initialState = JSON.parse(JSON.stringify(this.config.initialState));       
		
		
        // Initialize history arrays with initial values
        initialState.history.temperature.push(initialState.metrics.averageTemperature);
        initialState.history.biodiversity.push(initialState.metrics.biodiversityIndex);
        initialState.history.emissions.push(initialState.metrics.ghgEmissions);
        initialState.history.pollution.push(initialState.metrics.pollutionIndex);
        initialState.history.climateEducation.push(initialState.metrics.climateEducationIndex);
        initialState.history.circularEconomy.push(initialState.metrics.circularEconomyIndex);
        
        return initialState;
    }

    processAction(action, subAction, gameState) {
        // Process action through all modules
        let updatedState = gameState;
        for (const module of Object.values(this.modules)) {
            updatedState = module.processAction(action, subAction, updatedState);
        }
        return updatedState;
    }

    update(gameState) {
        // Increment year
        gameState.year += this.config.updateIntervals.yearIncrement;
        
        // Update through each module
        let updatedState = gameState;
        for (const module of Object.values(this.modules)) {
            updatedState = module.update(updatedState);
        }
        
        // Add basic income
        updatedState.playerResources.credits += this.config.updateIntervals.credits;
        
        return updatedState;
    }
}

// Base Module Class
class BaseModule {
    constructor() {
        this.config = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        await this.loadConfig();
        this.initialized = true;
    }

    async loadConfig() {
        // Override in subclasses
    }

    getActions() {
        return this.config;
    }

    processAction(action, subAction, gameState) {
        return gameState;
    }

    update(gameState) {
        return gameState;
    }
}

// Biodiversity Module
class BiodiversityModule extends BaseModule {
    async loadConfig() {
        try {
            // Try to fetch from server first (works on GitHub Pages)
            const response = await fetch('config/biodiversity-config.json');
            if (response.ok) {
                this.config = await response.json();
                return;
            }
        } catch (error) {
            // Fallback to embedded config (works locally)
        }
        
        // Use embedded config as fallback
        this.config = EMBEDDED_CONFIGS.biodiversityConfig;
    }

    processAction(action, subAction, gameState) {
        if (!this.config || !this.config[action] || !this.config[action][subAction]) {
            return gameState;
        }

        const actionConfig = this.config[action][subAction];
        if (gameState.playerResources.credits >= actionConfig.cost) {
            gameState.playerResources.credits -= actionConfig.cost;
            gameState.resources.forests += actionConfig.forests || 0;
            gameState.resources.fisheries += actionConfig.fisheries || 0;
        }

        return gameState;
    }

    update(gameState) {
        // Forest & fisheries and pollution impact on biodiversity
        gameState.metrics.biodiversityIndex += gameState.resources.forests * 0.04 + gameState.resources.fisheries * 0.008;
        gameState.metrics.biodiversityIndex -= gameState.metrics.pollutionIndex * 0.05;
        
        return gameState;
    }
}

// Industry Module
class IndustryModule extends BaseModule {
    async loadConfig() {
        try {
            // Try to fetch from server first (works on GitHub Pages)
            const response = await fetch('config/industry-config.json');
            if (response.ok) {
                this.config = await response.json();
                return;
            }
        } catch (error) {
            // Fallback to embedded config (works locally)
        }
        
        // Use embedded config as fallback
        this.config = EMBEDDED_CONFIGS.industryConfig;
    }

    processAction(action, subAction, gameState) {
        if (!this.config || !this.config[action] || !this.config[action][subAction]) {
            return gameState;
        }

        const actionConfig = this.config[action][subAction];
        if (gameState.playerResources.credits >= actionConfig.cost) {
            gameState.playerResources.credits -= actionConfig.cost;
            gameState.resources.electricity += actionConfig.electricity || 0;
            gameState.resources.fossilFuels += actionConfig.fossilFuel || 0;
        }

        return gameState;
    }

    update(gameState) {
        gameState.resources.fossilFuels += 0.02;
        return gameState;
    }
}

// Research Module
class ResearchModule extends BaseModule {
    async loadConfig() {
        try {
            // Try to fetch from server first (works on GitHub Pages)
            const response = await fetch('config/research-config.json');
            if (response.ok) {
                this.config = await response.json();
                return;
            }
        } catch (error) {
            // Fallback to embedded config (works locally)
        }
        
        // Use embedded config as fallback
        this.config = EMBEDDED_CONFIGS.researchConfig;
    }

    processAction(action, subAction, gameState) {
        if (!this.config || !this.config[action] || !this.config[action][subAction]) {
            return gameState;
        }

        const actionConfig = this.config[action][subAction];
        if (gameState.playerResources.credits >= actionConfig.cost) {
            gameState.playerResources.credits -= actionConfig.cost;
            gameState.metrics.economicImpactIndex += actionConfig.economicImpactIndex || 0;
            gameState.metrics.circularEconomyIndex += actionConfig.circularEconomyIndex || 0;
            gameState.metrics.climateEducationIndex += actionConfig.climateEducationIndex || 0;
        }

        return gameState;
    }

    update(gameState) {
        // Natural decline
        gameState.metrics.climateEducationIndex -= 0.2;
        gameState.metrics.circularEconomyIndex -= 0.1;
        
        return gameState;
    }
}

// Policy Module
class PolicyModule extends BaseModule {
    async loadConfig() {
        try {
            // Try to fetch from server first (works on GitHub Pages)
            const response = await fetch('config/policy-config.json');
            if (response.ok) {
                this.config = await response.json();
                return;
            }
        } catch (error) {
            // Fallback to embedded config (works locally)
        }
        
        // Use embedded config as fallback
        this.config = EMBEDDED_CONFIGS.policyConfig;
    }

    processAction(action, subAction, gameState) {
        if (!this.config || !this.config[action] || !this.config[action][subAction]) {
            return gameState;
        }

        const actionConfig = this.config[action][subAction];
        if (gameState.playerResources.credits >= actionConfig.cost) {
            gameState.playerResources.credits -= actionConfig.cost;
            
            const educationBonus = 0.001 * gameState.metrics.climateEducationIndex;
            gameState.metrics.pollutionIndex += (actionConfig.pollutionIndex || 0) + educationBonus;
            gameState.metrics.economicImpactIndex += (actionConfig.economicImpactIndex || 0) + educationBonus;
            gameState.metrics.circularEconomyIndex += (actionConfig.circularEconomyIndex || 0) + educationBonus;
            gameState.resources.fossilFuels += actionConfig.fossilFuels || 0;
        }

        return gameState;
    }

    update(gameState) {
        return gameState;
    }
}

// GHG Module
class GhgModule extends BaseModule {
    async loadConfig() {
        // No config file for GHG module
        this.config = null;
    }

    update(gameState) {
        // GHG emissions impact from industry
        gameState.metrics.ghgEmissions += gameState.resources.fossilFuels * 0.1 + gameState.resources.electricity * 0.001;
        gameState.metrics.ghgEmissions -= gameState.resources.forests * 0.05 + gameState.resources.fisheries * 0.04;
        gameState.metrics.averageTemperature += gameState.metrics.ghgEmissions * 0.0001;
        
        return gameState;
    }
}

// Pollution Module
class PollutionModule extends BaseModule {
    async loadConfig() {
        // No config file for pollution module
        this.config = null;
    }

    update(gameState) {
        gameState.metrics.pollutionIndex += 0.5;
        gameState.metrics.pollutionIndex -= gameState.metrics.climateEducationIndex * 0.04 + gameState.metrics.circularEconomyIndex * 0.07;
        
        if (gameState.metrics.pollutionIndex < 15) {
            gameState.metrics.pollutionIndex = 15;
        }
        
        return gameState;
    }
}

// History Module
class HistoryModule extends BaseModule {
    async loadConfig() {
        // No config file for history module
        this.config = null;
    }

    update(gameState) {
		
        // Update history
        gameState.history.biodiversity.push(gameState.metrics.biodiversityIndex);
        gameState.history.temperature.push(gameState.metrics.averageTemperature);
        gameState.history.emissions.push(gameState.metrics.ghgEmissions);
        gameState.history.pollution.push(gameState.metrics.pollutionIndex);
        gameState.history.climateEducation.push(gameState.metrics.climateEducationIndex);
        gameState.history.circularEconomy.push(gameState.metrics.circularEconomyIndex);
        
        return gameState;
    }
}
