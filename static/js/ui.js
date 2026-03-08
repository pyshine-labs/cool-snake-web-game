// Enhanced UI Controller with Theme Switching, Toasts, and Visual Effects
class UIController {
    constructor() {
        this.elements = this.gatherElements();
        this.toastContainer = null;
        this.initToasts();
        this.initTheme();
        this.initRippleEffects();
        this.initDirectionButtons();
        this.initSwipeDetection();
        this.initColorPicker();
        this.initVolumeSlider();
        this.initSpeedSlider();
        this.initWallsToggle();
        this.initParticleToggle();
        this.bindModalEvents();
    }

    gatherElements() {
        return {
            score: document.getElementById('score'),
            highScore: document.getElementById('high-score'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            soundToggle: document.getElementById('sound-toggle'),
            musicToggleBtn: document.getElementById('music-toggle-btn'),
            sfxToggleBtn: document.getElementById('sfx-toggle-btn'),
            gameStatus: document.getElementById('game-status'),
            level: document.getElementById('level'),
            themeToggle: document.getElementById('theme-toggle'),
            gridToggle: document.getElementById('grid-toggle'),
            wallsToggle: document.getElementById('walls-toggle'),
            particlesToggle: document.getElementById('particles-toggle'),
            speedSlider: document.getElementById('speed-slider'),
            volumeSlider: document.getElementById('volume-slider'),
            snakeColor: document.getElementById('snake-color'),
            canvas: document.getElementById('game-canvas'),
            fullscreenBtn: document.getElementById('fullscreen-btn'),
            helpBtn: document.getElementById('help-btn'),
            shareBtn: document.getElementById('share-btn'),
            statsBtn: document.getElementById('stats-btn')
        };
    }

    initTheme() {
        const toggle = this.elements.themeToggle;
        if (!toggle) return;
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        toggle.checked = currentTheme === 'light';
        toggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            this.showToast(`Switched to ${newTheme} theme`, 'success');
            // Save preference
            localStorage.setItem('snake-theme', newTheme);
        });
        // Load saved theme
        const saved = localStorage.getItem('snake-theme');
        if (saved && saved !== currentTheme) {
            document.body.setAttribute('data-theme', saved);
            toggle.checked = saved === 'light';
        }
    }

    initRippleEffects() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
            `;
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
        // Add CSS for ripple animation if not already present
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    initDirectionButtons() {
        document.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dir = btn.dataset.dir;
                this.triggerDirectionChange(dir);
                // Visual feedback
                btn.classList.add('active');
                setTimeout(() => btn.classList.remove('active'), 200);
            });
        });
    }

    initSwipeDetection() {
        const canvas = this.elements.canvas;
        if (!canvas) return;
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30; // pixels

        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            e.preventDefault(); // prevent scrolling
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // prevent scrolling while swiping
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            if (!touchStartX) return;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Determine primary direction
            if (Math.max(absX, absY) < minSwipeDistance) return; // too short

            let direction = '';
            if (absX > absY) {
                // Horizontal swipe
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                // Vertical swipe
                direction = deltaY > 0 ? 'down' : 'up';
            }

            this.triggerDirectionChange(direction);
            touchStartX = 0;
            touchStartY = 0;
        });
    }

    triggerDirectionChange(dir) {
        // Dispatch custom event for game engine
        const event = new CustomEvent('snakeDirection', { detail: { direction: dir } });
        document.dispatchEvent(event);
        this.showToast(`Direction: ${dir.toUpperCase()}`, 'info', 1000);
    }

    initColorPicker() {
        const picker = this.elements.snakeColor;
        if (!picker) return;
        picker.addEventListener('input', (e) => {
            const color = e.target.value;
            document.documentElement.style.setProperty('--primary-color', color);
            // Notify game engine about snake color change
            document.dispatchEvent(new CustomEvent('snakeColorChange', { detail: { color } }));
            this.showToast(`Snake color changed to ${color}`, 'info');
        });
    }

    initVolumeSlider() {
        const slider = this.elements.volumeSlider;
        if (!slider) return;
        slider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            // Dispatch volume change event
            document.dispatchEvent(new CustomEvent('volumeChange', { detail: { volume } }));
            // Update UI indicator
            const icon = slider.previousElementSibling?.querySelector('i');
            if (icon) {
                icon.className = volume === 0 ? 'fas fa-volume-mute' :
                    volume < 0.5 ? 'fas fa-volume-low' : 'fas fa-volume-high';
            }
        });
    }

    initSpeedSlider() {
        const slider = this.elements.speedSlider;
        if (!slider) return;
        slider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            document.dispatchEvent(new CustomEvent('speedChange', { detail: { speed } }));
        });
    }

    initWallsToggle() {
        const toggle = this.elements.wallsToggle;
        if (!toggle) return;
        toggle.addEventListener('change', (e) => {
            const wallsEnabled = e.target.checked;
            document.dispatchEvent(new CustomEvent('wallsChange', { detail: { wallsEnabled } }));
            this.showToast(`Wall collision ${wallsEnabled ? 'enabled' : 'disabled'}`, 'info');
        });
    }

    initParticleToggle() {
        const toggle = this.elements.particlesToggle;
        if (!toggle) return;
        toggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            document.querySelector('.particles').style.opacity = enabled ? '1' : '0';
            this.showToast(`Particles ${enabled ? 'enabled' : 'disabled'}`, 'info');
        });
    }

    bindModalEvents() {
        // Help button
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('instructionsModal'));
                modal.show();
            });
        }
        // Fullscreen button
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', this.toggleFullscreen);
        }
        // Share button
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => this.shareGame());
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.log);
        } else {
            document.exitFullscreen();
        }
    }

    shareGame() {
        if (navigator.share) {
            navigator.share({
                title: 'Snake Game',
                text: 'Check out this awesome modern Snake game!',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showToast('Link copied to clipboard!', 'success');
        }
    }

    initToasts() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        `;
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getIconForType(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;
        toast.style.cssText = `
            background: var(--surface-color);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 12px 16px;
            color: var(--text-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: toastSlideIn 0.3s ease;
            box-shadow: 0 5px 15px var(--shadow-color);
        `;
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => toast.remove());
        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        // Add CSS for animations if not present
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes toastSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .toast-close {
                    background: transparent;
                    border: none;
                    color: inherit;
                    font-size: 1.5rem;
                    cursor: pointer;
                    margin-left: 10px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateScore(score) {
        if (this.elements.score) {
            const old = parseInt(this.elements.score.textContent) || 0;
            this.elements.score.textContent = score;
            if (score > old) {
                this.elements.score.classList.add('score-update');
                setTimeout(() => this.elements.score.classList.remove('score-update'), 500);
            }
        }
    }

    updateHighScore(score) {
        if (this.elements.highScore) {
            this.elements.highScore.textContent = score;
            this.elements.highScore.classList.add('score-update');
            setTimeout(() => this.elements.highScore.classList.remove('score-update'), 500);
        }
    }

    updateStatus(status) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = status;
            // Change alert color based on status
            const alert = this.elements.gameStatus.closest('.alert');
            if (alert) {
                alert.className = 'alert';
                if (status.includes('Running')) alert.classList.add('alert-success');
                else if (status.includes('Paused')) alert.classList.add('alert-warning');
                else if (status.includes('Game Over')) alert.classList.add('alert-danger');
                else alert.classList.add('alert-dark');
            }
        }
    }

    updateLevel(level) {
        if (this.elements.level) {
            this.elements.level.textContent = level;
        }
    }

    toggleButtonState(buttonId, enabled) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.6';
        }
    }

    showMessage(text, type = 'info') {
        this.showToast(text, type);
    }

    // Utility to update speed display
    updateSpeedDisplay(speed) {
        const slider = this.elements.speedSlider;
        if (slider) {
            slider.value = speed;
        }
    }
}

export { UIController };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}