// game.js
let gameState = null;
let gameLoopInterval = null;

// Initialize display elements and game state
async function initializeGame() {
    try {
        // Initial game state fetch
        const response = await fetch('game.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ update: true })
        });
        
        gameState = await response.json();
        updateDisplay(gameState);
        
        // Start game loop
        gameLoopInterval = setInterval(gameLoop, 5000); // Update every 5 seconds
        
        // Add event listeners for UI interactions
        setupEventListeners();
        
        // Initialize tooltips and UI elements
        initializeUI();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
}

function updateDisplay(state) {
    // Update year
    document.getElementById('current-year').textContent = state.year.toFixed(2);
    
    // Update resources with animation
    animateValueChange('#credits span', state.playerResources.credits);
    animateValueChange('#research span', state.playerResources.research);
    animateValueChange('#influence span', state.playerResources.influence);
    
    // Update meters with smooth transitions
    updateMeter('temperature-bar', 'temperature-value', 
                state.metrics.globalTemperature, 2, 
                value => `+${value.toFixed(1)}°C`);
    
    updateMeter('biodiversity-bar', 'biodiversity-value', 
                state.metrics.biodiversityIndex, 100, 
                value => `${value.toFixed(1)}%`);
    
    updateMeter('renewable-bar', 'renewable-value', 
                state.economy.renewableEnergy, 100, 
                value => `${value.toFixed(1)}%`);
    
    // Update events log with animation
    updateEventsLog(state.events);
    
    // Update button states
    updateActionButtons(state.playerResources.credits);
    
    // Check win/lose conditions
    checkGameConditions(state);
}

function updateMeter(barId, valueId, value, max, formatFunction) {
    const bar = document.getElementById(barId);
    const valueDisplay = document.getElementById(valueId);
    const percentage = (value / max) * 100;
    
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

function updateActionButtons(credits) {
    const actions = {
        'plant_trees': 100,
        'renewable_energy': 500,
        'research': 200,
        'policy': 300
    };
    
    for (const [action, cost] of Object.entries(actions)) {
        const button = document.querySelector(`button[onclick="performAction('${action}')"]`);
        button.disabled = credits < cost;
        
        // Update button appearance based on affordability
        if (credits >= cost) {
            button.classList.remove('disabled');
            button.classList.add('available');
        } else {
            button.classList.remove('available');
            button.classList.add('disabled');
        }
    }
}

async function performAction(action) {
    try {
        // Disable all action buttons during action
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(button => button.disabled = true);
        
        // Show loading indicator
        showLoadingIndicator();
        
        const response = await fetch('game.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: action })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        gameState = await response.json();
        updateDisplay(gameState);
        
        // Show action feedback
        showActionFeedback(action, true);
    } catch (error) {
        console.error('Error performing action:', error);
        showActionFeedback(action, false);
    } finally {
        // Hide loading indicator
        hideLoadingIndicator();
        
        // Re-enable buttons
        updateActionButtons(gameState.playerResources.credits);
    }
}

async function gameLoop() {
    try {
        const response = await fetch('game.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ update: true })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        gameState = await response.json();
        updateDisplay(gameState);
    } catch (error) {
        console.error('Error in game loop:', error);
        clearInterval(gameLoopInterval);
        showErrorMessage('Game loop error. Please refresh the page.');
    }
}

function checkGameConditions(state) {
    // Check win conditions
    if (state.economy.renewableEnergy >= 90 && state.metrics.biodiversityIndex >= 80) {
        showGameOver('win');
        clearInterval(gameLoopInterval);
    }
    
    // Check lose conditions
    if (state.metrics.globalTemperature >= 2 || state.metrics.biodiversityIndex <= 20) {
        showGameOver('lose');
        clearInterval(gameLoopInterval);
    }
	
	/*
	
	*/
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
            case '1': performAction('plant_trees'); break;
            case '2': performAction('renewable_energy'); break;
            case '3': performAction('research'); break;
            case '4': performAction('policy'); break;
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

/*-- Monetize with Google adSence
function initAdsense() {
    try {
        // Initialize all ad units
        const adElements = document.querySelectorAll('.adsbygoogle');
        adElements.forEach((ad) => {
            (adsbygoogle = window.adsbygoogle || []).push({});
        });
    } catch (error) {
        console.error('Error initializing AdSense:', error);
    }
}
*/

// Add to the existing initializeGame function
async function initializeGame() {
    try {
        // Existing initialization code...
        
        /* Monetize with Google adSence
        initAdsense();        
        // Refresh ads periodically
        setInterval(refreshAds, 30000); // Refresh every 30 seconds
		*/
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
}

/* Monetize with Google adSence
function refreshAds() {
    try {
        const adElements = document.querySelectorAll('.adsbygoogle');
        adElements.forEach((ad) => {
            // Clear existing ad
            ad.innerHTML = '';
            // Push new ad
            (adsbygoogle = window.adsbygoogle || []).push({});
        });
    } catch (error) {
        console.error('Error refreshing ads:', error);
    }
}
*/



