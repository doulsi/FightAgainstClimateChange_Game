
// game.js
let gameState = null;
let gameLoopInterval = null;
let gameEngine = null;
let metricsChart = null;

// Modify performAction to handle sub-action modal display
async function displaySubModal(action) {
    // Check if there are sub-actions; if so, display modal
    if (gameState[action]) {
        displaySubActions(action);
    } 
}

// Display modal for sub-actions
function displaySubActions(action) {
    const subActionsContainer = document.getElementById('subActionsContainer');
    subActionsContainer.innerHTML = '';  // Clear previous options if any
    console.error('displaySubActions: gameState:', gameState[action]);
	console.error('displaySubActions: action:', action);
	
    for (let key in gameState[action])
	{
		console.error('displaySubActions: key :', key);
		//console.error('displaySubActions: cost:', gameState[action][key].cost);
        const button         = document.createElement('button');
        button.textContent   = button.textContent = `${key} (${gameState[action][key].cost}$)`;
		button.onclick = (() => {
			return () => selectSubAction(action, key);
        })();
		
        button.className     = 'sub-action-btn';
		
		// Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = gameState[action][key].description || 'No description available';
        
        // Add tooltip to button
        button.appendChild(tooltip);
        subActionsContainer.appendChild(button);
    }
    
    document.getElementById('subActionModal').style.display = 'block';  // Show modal
}

// Process selected sub-action and make server call
async function selectSubAction(action, subAction) {
    closeModal();  // Close modal after selection
	console.error('selectSubAction: action:', action);
	console.error('selectSubAction: subAction:', subAction);
    await processAction(action, subAction);
}

// Process action using local game engine
async function processAction(action, subAction = null) {
    try {
        if (!gameEngine || !gameState) {
            throw new Error('Game engine not initialized');
        }
        
        // Process action through game engine
        gameState = gameEngine.processAction(action, subAction, gameState);
        
        // Save to localStorage
        //saveGameState();
        
        // Update display
        updateDisplay(gameState);
        
    } catch (error) {
        console.error('Error performing action:', error);
        showErrorMessage('Failed to perform action. Please try again.');
    }
}

// Close modal
function closeModal() {
    document.getElementById('subActionModal').style.display = 'none';
}


// Initialize Chart
function initializeChart() {
    const ctx = document.getElementById('metricsChart');
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }
    
    metricsChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature Change (°C)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }, {
                label: 'Biodiversity Index (%)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },{
                label: 'emissions (ppm)',
                data: [],
                borderColor: 'rgb(75, 255, 192)',
                tension: 0.1
            },{
                label: 'pollution Index (%)',
                data: [],
                borderColor: 'rgb(30, 150, 255)',
                tension: 0.1
            },{
                label: 'climateEducation Index (%)',
                data: [],
                borderColor: 'rgb(178, 100, 100)',
                tension: 0.1
            } ,{
                label: 'circularEconomy Index (%)',
                data: [],
                borderColor: 'rgb(35, 35, 35)',
                tension: 0.1
            }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Initialize display elements and game state
async function initializeGame() {
    try {
        // Show loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'loading-message';
        loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000;';
        loadingMsg.textContent = 'Loading game...';
        document.body.appendChild(loadingMsg);
        
        // Initialize chart first
        initializeChart();
        
        // Initialize game engine
        gameEngine = new GameEngine();
        await gameEngine.initialize();
        
        // Load game state from localStorage or create new
        //const savedState = loadGameState();
        //if (savedState) {
        //    gameState = savedState;
        //} else {
            gameState = await gameEngine.getInitialState();
            //saveGameState();
        //}
        
        console.log('[GAME.JS] initializeGame:', gameState);
        updateDisplay(gameState);
        
        // Start game loop
        gameLoopInterval = setInterval(gameLoop, 5000); // Update every 5 seconds
        
        // Add event listeners for UI interactions
        setupEventListeners();
        
        // Initialize tooltips and UI elements
        initializeUI();
        
        // Remove loading message
        const loadingEl = document.getElementById('loading-message');
        if (loadingEl) loadingEl.remove();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // Remove loading message if still present
        const loadingEl = document.getElementById('loading-message');
        if (loadingEl) loadingEl.remove();
        
        // Show detailed error message
        const errorMsg = `Failed to initialize game: ${error.message}. Please check the browser console for details.`;
        showErrorMessage(errorMsg);
        
        // Log full error for debugging
        console.error('Full error details:', error);
    }
}

function updateDisplay(state) {
    // Update year
    document.getElementById('current-year').textContent = state.year.toFixed(2);
    
    // Update resources with animation
    animateValueChange('#credits span', state.playerResources.credits);
    
    // Update meters with smooth transitions
    updateMeter('fossilfuels-bar', 'fossilfuels-value', 
                state.resources.fossilFuels, 200, 
                value => `${value.toFixed(1)}`);
    
    updateMeter('forests-bar', 'forests-value', 
                state.resources.forests, 200, 
                value => `${value.toFixed(1)}`);
    
    updateMeter('fisheries-bar', 'fisheries-value', 
                state.resources.fisheries, 200, 
                value => `${value.toFixed(1)}`);
	
	updateMeter('electricity-bar', 'electricity-value', 
                state.resources.electricity, 200, 
                value => `${value.toFixed(1)}`);
    
	// Update chart
	if (metricsChart && state.history) {
		// Generate labels based on history length
		const labels = state.history.temperature.map((_, index) => 
			state.year - (state.history.temperature.length - 1 - index) * 0.25
		);
		metricsChart.data.labels = labels;
		metricsChart.data.datasets[0].data = state.history.temperature;
		metricsChart.data.datasets[1].data = state.history.biodiversity;
		metricsChart.data.datasets[2].data = state.history.emissions;
		metricsChart.data.datasets[3].data = state.history.pollution;
		metricsChart.data.datasets[4].data = state.history.climateEducation;	
		metricsChart.data.datasets[5].data = state.history.circularEconomy;
		metricsChart.update();
	}
	
    // Update events log with animation
    //updateEventsLog(state.events);
      
}

function updateMeter(barId, valueId, value, max, formatFunction) {
    const bar          = document.getElementById(barId);
    const valueDisplay = document.getElementById(valueId);
    const percentage   = (value / max) * 100;
    
    // Smooth transition for the bar
    bar.style.transition = 'width 0.5s ease-in-out';
    bar.style.width = `${percentage}%`;
    
    // Update color based on value
    if (percentage > 80) {
        bar.style.backgroundColor = '#e74c3c'; // Red for critical
    } else if (percentage > 60) {
        bar.style.backgroundColor = '#f1c40f'; // Yellow for warning
    } else {
        bar.style.backgroundColor = '#2ecc71'; // Green for good
    }
    
    // Update value display
    valueDisplay.textContent = formatFunction(value);
}

function animateValueChange(selector, newValue) {
    const element = document.querySelector(selector);
    const currentValue = parseInt(element.textContent);
    const difference = newValue - currentValue;
    const steps = 20;
    const stepValue = difference / steps;
    let currentStep = 0;
    
    const animation = setInterval(() => {
        if (currentStep < steps) {
            const interpolatedValue = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = interpolatedValue;
            currentStep++;
        } else {
            element.textContent = newValue;
            clearInterval(animation);
        }
    }, 25);
}

function updateEventsLog(events) {
    const eventsContainer = document.getElementById('events-container');
    const newEvents = events.map(event => 
        `<div class="event-entry" style="opacity: 0">
            <span class="event-time">[${event.time}]</span>
            <span class="event-message">${event.message}</span>
        </div>`
    ).join('');
    
    eventsContainer.innerHTML = newEvents;
    
    // Fade in new events
    const eventEntries = eventsContainer.getElementsByClassName('event-entry');
    Array.from(eventEntries).forEach((entry, index) => {
        setTimeout(() => {
            entry.style.transition = 'opacity 0.5s ease-in-out';
            entry.style.opacity = '1';
        }, index * 100);
    });
}
async function gameLoop() {
    try {
        if (!gameEngine || !gameState) {
            throw new Error('Game engine not initialized');
        }
        
        // Update game state through engine
        gameState = gameEngine.update(gameState);
        
        // Save to localStorage
        //saveGameState();
        
        // Update display
        updateDisplay(gameState);
		
    } catch (error) {
        console.error('Error in game loop:', error);
        clearInterval(gameLoopInterval);
        showErrorMessage('Game loop error. Please refresh the page.');
    }
}

function showGameOver(result) {
    const message = result === 'win' 
        ? 'Congratulations! You\'ve successfully reversed climate change!'
        : 'Game Over: The environmental damage has become irreversible.';
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-modal ${result}">
            <h2>${result === 'win' ? '🌍 Victory!' : '🌋 Game Over'}</h2>
            <p>${message}</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function showLoadingIndicator() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
}

function hideLoadingIndicator() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function showActionFeedback(action, success) {
    const feedback = document.createElement('div');
    feedback.className = `action-feedback ${success ? 'success' : 'error'}`;
    feedback.textContent = success 
        ? `Successfully performed ${action.replace('_', ' ')}!`
        : `Failed to perform ${action.replace('_', ' ')}`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function setupEventListeners() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'p': togglePause(); break;
        }
    });
    
    // Add mobile touch support
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
}

function initializeUI() {
    // Add tooltips to action buttons
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(button => {
        button.setAttribute('title', button.textContent);
    });	
}

// LocalStorage management functions
function saveGameState() {
    try {
        localStorage.setItem('climateGameState', JSON.stringify(gameState));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

function loadGameState() {
    //try {
    //    const saved = localStorage.getItem('climateGameState');
    //    return saved ? JSON.parse(saved) : null;
    //} catch (error) {
    //    console.error('Error loading game state:', error);
        return null;
    //}
}

// Clear game state if coming from external referrer
if (document.referrer === '') {
    localStorage.removeItem('climateGameState');
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', initializeGame);

// Add pause functionality
let isPaused = false;
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameLoopInterval);
        showPauseIndicator();
    } else {
        gameLoopInterval = setInterval(gameLoop, 5000);
        hidePauseIndicator();
    }
}

function showPauseIndicator() {
    const pause = document.createElement('div');
    pause.id = 'pause-indicator';
    pause.textContent = 'PAUSED';
    document.body.appendChild(pause);
}

function hidePauseIndicator() {
    const pause = document.getElementById('pause-indicator');
    if (pause) pause.remove();
}

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(evt) {
    touchStartX = evt.touches[0].clientX;
    touchStartY = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!touchStartX || !touchStartY) return;
    
    const xDiff = touchStartX - evt.touches[0].clientX;
    const yDiff = touchStartY - evt.touches[0].clientY;
    
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            // Swipe left
        } else {
            // Swipe right
        }
    }
    
    touchStartX = null;
    touchStartY = null;
}

document.addEventListener("scroll", function () {
        const storySection = document.querySelector(".story-section");
        const rect = storySection.getBoundingClientRect();
        // Check if the section is in the viewport
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            storySection.classList.add("visible");
        }
    });




