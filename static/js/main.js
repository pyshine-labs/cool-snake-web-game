// Main entry point for Snake game with backend API integration
import { GameEngine } from './game.js';
import { SoundManager } from './sound.js';
import { UIController } from './ui.js';
import * as Utils from './utils.js';

class SnakeGame {
    constructor() {
        this.engine = new GameEngine('game-canvas');
        this.sound = new SoundManager();
        this.ui = new UIController();
        this.apiBase = '/api'; // Flask API base
        this.pollInterval = null;
        this.setupEventListeners();
        this.loadSounds();
        this.fetchInitialState();
        this.startPolling();
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls (arrow keys, WASD, space, escape)
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    if (!this.engine.state.running) this.startGame();
                    this.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    if (!this.engine.state.running) this.startGame();
                    this.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    if (!this.engine.state.running) this.startGame();
                    this.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    if (!this.engine.state.running) this.startGame();
                    this.changeDirection('right');
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'Escape':
                    this.openSettings();
                    break;
            }
        });

        // Button events
        if (this.ui.elements.startBtn) {
            this.ui.elements.startBtn.addEventListener('click', () => this.startGame());
        }
        if (this.ui.elements.pauseBtn) {
            this.ui.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        if (this.ui.elements.resetBtn) {
            this.ui.elements.resetBtn.addEventListener('click', () => this.resetGame());
        }
        if (this.ui.elements.soundToggle) {
            this.ui.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        }

        // Listen to custom events from UI controller
        document.addEventListener('snakeDirection', (e) => this.changeDirection(e.detail.direction));
        document.addEventListener('snakeColorChange', (e) => this.changeSnakeColor(e.detail.color));
        document.addEventListener('volumeChange', (e) => this.changeVolume(e.detail.volume));

        // Direction buttons already handled by UI controller
    }

    loadSounds() {
        // Sounds are preloaded by SoundManager constructor
    }

    // API integration methods
    async fetchInitialState() {
        try {
            const response = await fetch(`${this.apiBase}/game/state`);
            const data = await response.json();
            if (data.success) {
                this.syncWithServerState(data.state);
                this.ui.showToast('Game state loaded', 'success');
            }
        } catch (error) {
            console.error('Failed to fetch initial game state:', error);
            this.ui.showToast('Could not connect to server. Running offline.', 'warning');
        }
    }

    async startGame() {
        try {
            const response = await fetch(`${this.apiBase}/game/start`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                this.syncWithServerState(data.state);
                this.engine.start();
                this.ui.updateStatus('Running');
                this.ui.toggleButtonState('start-btn', false);
                this.ui.showToast('Game started!', 'success');
            }
        } catch (error) {
            console.error('Failed to start game via API:', error);
            // Fallback to client‑side start
            this.engine.start();
            this.ui.updateStatus('Running');
            this.ui.toggleButtonState('start-btn', false);
            this.ui.showToast('Game started (offline)', 'info');
        }
    }

    async togglePause() {
        try {
            const response = await fetch(`${this.apiBase}/game/pause`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                this.syncWithServerState(data.state);
                this.engine.pause();
                const status = data.state.status === 'PAUSED' ? 'Paused' : 'Running';
                this.ui.updateStatus(status);
                this.ui.showToast(`Game ${status.toLowerCase()}`, 'info');
            }
        } catch (error) {
            console.error('Failed to pause/resume via API:', error);
            // Fallback
            this.engine.pause();
            const status = this.engine.state.running ? 'Running' : 'Paused';
            this.ui.updateStatus(status);
        }
    }

    async resetGame() {
        try {
            const response = await fetch(`${this.apiBase}/game/reset`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                this.syncWithServerState(data.state);
                this.engine.reset(); // assuming reset method exists
                this.ui.updateStatus('Ready');
                this.ui.toggleButtonState('start-btn', true);
                this.ui.showToast('Game reset', 'info');
            }
        } catch (error) {
            console.error('Failed to reset game via API:', error);
            // Fallback
            this.engine.reset?.();
            this.ui.updateStatus('Ready');
            this.ui.toggleButtonState('start-btn', true);
            this.ui.showToast('Game reset (offline)', 'info');
        }
    }

    async changeDirection(direction) {
        // Update local engine immediately for responsiveness
        this.engine.changeDirection(direction);
        // Send to server
        try {
            const response = await fetch(`${this.apiBase}/game/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction })
            });
            const data = await response.json();
            if (!data.success) {
                console.warn('Server rejected direction:', data.error);
            }
        } catch (error) {
            // Silent fail, offline mode
        }
    }

    changeSnakeColor(color) {
        // Update CSS variable and engine's drawing color
        this.engine.snakeColor = color;
        this.ui.showToast(`Snake color updated`, 'success');
    }

    changeVolume(volume) {
        this.sound.setVolume(volume);
    }

    openSettings() {
        // Trigger settings modal
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    syncWithServerState(state) {
        // Update UI with server state
        if (state.score !== undefined) {
            this.ui.updateScore(state.score);
            this.engine.state.score = state.score;
        }
        if (state.highScore !== undefined) {
            this.ui.updateHighScore(state.highScore);
        }
        if (state.level !== undefined) {
            this.ui.updateLevel(state.level);
            this.engine.state.level = state.level;
        }
        if (state.speed !== undefined) {
            this.engine.state.speed = state.speed;
        }
        if (state.wall_wrap !== undefined) {
            this.engine.state.wallsEnabled = !state.wall_wrap;
        }
        if (state.status) {
            this.ui.updateStatus(state.status);
            this.engine.state.running = state.status === 'RUNNING';
        }
        // Optionally sync snake position, food etc. (if needed)
    }

    startPolling() {
        // Poll server for state updates every 5 seconds
        this.pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.apiBase}/game/state`);
                const data = await response.json();
                if (data.success) {
                    this.syncWithServerState(data.state);
                }
            } catch (error) {
                // ignore polling errors
            }
        }, 5000);
    }

    updateUI() {
        // Update score display from local engine (fallback)
        this.ui.updateScore(this.engine.state.score);
        // Update high score from server is done via polling
    }

    gameLoop() {
        this.engine.update();
        this.engine.draw();
        if (this.engine.state.running) {
            this.updateUI();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game = new SnakeGame();
    });
} else {
    window.game = new SnakeGame();
}