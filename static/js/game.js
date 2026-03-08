// Advanced Snake Game Engine with Visual Effects
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.width = this.canvas.width / this.gridSize;
        this.height = this.canvas.height / this.gridSize;
        this.state = {
            snake: [{ x: 10, y: 10 }],
            food: { x: 15, y: 15 },
            foodType: 'normal',
            direction: 'right',
            nextDirection: 'right',
            score: 0,
            highScore: 0,
            level: 1,
            running: false,
            gridVisible: true,
            wallsEnabled: true,
            speed: 200 // ms per move
        };
        this.snakeColor = '#00ff9d';
        this.foodColors = {
            normal: '#ff2a6d',
            bonus: '#ffd700'
        };
        this.foodColor = this.foodColors.normal; // default for compatibility
        this.gridColor = 'rgba(255, 255, 255, 0.05)';
        this.lastMoveTime = 0;
        this.particles = [];
        this.init();
    }

    init() {
        // Initialize snake with 3 segments (head at right, moving right)
        this.state.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.placeFood();
        this.lastMoveTime = performance.now();
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('gridToggle', (e) => {
            this.state.gridVisible = e.detail.visible;
        });
        document.addEventListener('wallsToggle', (e) => {
            this.state.wallsEnabled = e.detail.enabled;
        });
        document.addEventListener('snakeColorChange', (e) => {
            this.snakeColor = e.detail.color;
        });
    }

    placeFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            };
        } while (this.isSnakeSegment(food.x, food.y));
        this.state.food = food;
        // 20% chance for bonus food
        this.state.foodType = Math.random() < 0.2 ? 'bonus' : 'normal';
    }

    isSnakeSegment(x, y) {
        return this.state.snake.some(segment => segment.x === x && segment.y === y);
    }

    drawGrid() {
        if (!this.state.gridVisible) return;
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        // Vertical lines
        for (let x = 0; x <= this.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        // Horizontal lines
        for (let y = 0; y <= this.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        const { snake } = this.state;
        const head = snake[0];
        // Draw each segment with rounded corners and gradient
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize;

            // Gradient from head to tail
            const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
            const intensity = 1 - (i / snake.length) * 0.7;
            gradient.addColorStop(0, this.adjustColor(this.snakeColor, intensity));
            gradient.addColorStop(1, this.adjustColor(this.snakeColor, intensity * 0.8));

            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = this.adjustColor(this.snakeColor, 1.2);
            this.ctx.lineWidth = 2;

            // Rounded rectangle
            const radius = 4;
            this.roundRect(x, y, size, size, radius);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw eyes on head
            if (i === 0) {
                this.drawSnakeEyes(x, y, size);
            }
        }

        // Glow effect for head
        this.ctx.shadowColor = this.snakeColor;
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = this.snakeColor;
        this.roundRect(head.x * this.gridSize, head.y * this.gridSize, this.gridSize, this.gridSize, 4);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawSnakeEyes(x, y, size) {
        const eyeSize = size / 5;
        const pupilSize = eyeSize / 2;
        const offset = size / 3;
        this.ctx.fillStyle = '#000';
        // Left eye (relative to direction)
        let leftEyeX = x + offset;
        let leftEyeY = y + offset;
        let rightEyeX = x + size - offset - eyeSize;
        let rightEyeY = y + offset;
        // Adjust eye position based on direction (optional)
        this.ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
        this.ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        // Pupils
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(leftEyeX + pupilSize / 2, leftEyeY + pupilSize / 2, pupilSize, pupilSize);
        this.ctx.fillRect(rightEyeX + pupilSize / 2, rightEyeY + pupilSize / 2, pupilSize, pupilSize);
    }

    drawFood() {
        const { food, foodType } = this.state;
        const x = food.x * this.gridSize;
        const y = food.y * this.gridSize;
        const size = this.gridSize;

        // Pulsating animation
        const pulse = Math.sin(performance.now() * 0.01) * 0.2 + 1;
        const pulseSize = size * pulse;

        // Determine color based on food type
        const color = this.foodColors[foodType] || this.foodColors.normal;

        // Gradient food
        const gradient = this.ctx.createRadialGradient(
            x + size / 2, y + size / 2, 0,
            x + size / 2, y + size / 2, size / 2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.adjustColor(color, 0.5));

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, pulseSize / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Outer glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    draw() {
        // Clear canvas with subtle gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(15, 15, 26, 0.9)');
        gradient.addColorStop(1, 'rgba(30, 30, 50, 0.9)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.drawSnake();
        this.drawFood();
        this.drawParticles();

        // Draw score on canvas (optional)
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.state.score}`, 10, 25);
        this.ctx.fillText(`HIGH: ${this.state.highScore}`, 10, 50);
    }

    update() {
        this.updateParticles();
        if (!this.state.running) return;

        const now = performance.now();
        if (now - this.lastMoveTime < this.state.speed) return;

        // Move snake
        this.state.direction = this.state.nextDirection;
        const head = { ...this.state.snake[0] };
        switch (this.state.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Wall collision
        if (this.state.wallsEnabled) {
            if (head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height) {
                this.gameOver();
                return;
            }
        } else {
            // Wrap around
            if (head.x < 0) head.x = this.width - 1;
            if (head.x >= this.width) head.x = 0;
            if (head.y < 0) head.y = this.height - 1;
            if (head.y >= this.height) head.y = 0;
        }

        // Self collision
        if (this.isSnakeSegment(head.x, head.y)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.state.snake.unshift(head);

        // Food collision
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            const points = this.state.foodType === 'bonus' ? 30 : 10;
            this.state.score += points;
            if (this.state.score > this.state.highScore) {
                this.state.highScore = this.state.score;
            }
            this.updateLevel();
            // Particle burst with food type color
            const color = this.foodColors[this.state.foodType] || this.foodColors.normal;
            this.createParticleBurst(this.state.food.x, this.state.food.y, 15, color);
            this.placeFood();
            // Emit eat event for sound
            document.dispatchEvent(new CustomEvent('foodEaten'));
        } else {
            // Remove tail if no food eaten
            this.state.snake.pop();
        }

        this.lastMoveTime = now;
    }

    gameOver() {
        this.state.running = false;
        document.dispatchEvent(new CustomEvent('gameOver', { detail: { score: this.state.score } }));
        // Particle burst at snake head
        if (this.state.snake.length > 0) {
            const head = this.state.snake[0];
            this.createParticleBurst(head.x, head.y, 30, '#ff0000');
        }
        // Show game over message via UI
        console.log('Game Over');
    }

    updateLevel() {
        const newLevel = Math.floor(this.state.score / 100) + 1;
        if (newLevel !== this.state.level) {
            this.state.level = newLevel;
            // Increase speed (decrease interval) by 20ms per level, minimum 50ms
            this.state.speed = Math.max(50, 200 - (this.state.level - 1) * 20);
            document.dispatchEvent(new CustomEvent('levelUp', { detail: { level: this.state.level, speed: this.state.speed } }));
        }
    }

    start() {
        this.state.running = true;
        this.lastMoveTime = performance.now();
    }

    pause() {
        this.state.running = !this.state.running;
    }

    reset() {
        this.state.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.state.direction = 'right';
        this.state.nextDirection = 'right';
        this.state.score = 0;
        this.state.level = 1;
        this.state.speed = 200;
        this.state.running = false;
        this.placeFood();
    }

    changeDirection(dir) {
        // Prevent 180‑degree turns
        const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
        if (opposites[dir] !== this.state.direction) {
            this.state.nextDirection = dir;
        }
    }

    // Utility to adjust color brightness
    adjustColor(hex, factor) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Rounded rectangle helper
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    // Particle system
    createParticleBurst(x, y, count = 15, color = this.foodColor) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }
}

export { GameEngine };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
