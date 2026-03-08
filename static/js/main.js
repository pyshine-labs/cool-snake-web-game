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
        this.setupEventListeners();
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
                    this.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
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
        document.addEventListener('speedChange', (e) => this.changeSpeed(e.detail.speed));
        document.addEventListener('wallsChange', (e) => this.changeWalls(e.detail.wallsEnabled));
    }

    startGame() {
        this.engine.start();
        this.ui.updateStatus('Running');
        this.ui.toggleButtonState('start-btn', false);
    }

    togglePause() {
        this.engine.pause();
        const status = this.engine.state.running ? 'Running' : 'Paused';
        this.ui.updateStatus(status);
    }

    resetGame() {
        this.engine.reset();
        this.ui.updateStatus('Ready');
        this.ui.toggleButtonState('start-btn', true);
        this.ui.updateScore(0);
        this.ui.updateLevel(1);
    }

    changeDirection(direction) {
        this.engine.changeDirection(direction);
    }

    changeSnakeColor(color) {
        this.engine.snakeColor = color;
    }

    changeVolume(volume) {
        this.sound.setVolume(volume);
    }

    changeSpeed(speed) {
        this.engine.state.speed = 550 - speed;
    }

    changeWalls(wallsEnabled) {
        this.engine.state.wallsEnabled = wallsEnabled;
    }

    openSettings() {
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    updateUI() {
        this.ui.updateScore(this.engine.state.score);
        this.ui.updateHighScore(this.engine.state.highScore);
        this.ui.updateLevel(this.engine.state.level);
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