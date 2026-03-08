// Comprehensive Sound Manager using Howler.js with cross‑browser compatibility
class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;
        this.musicMuted = false;
        this.sfxMuted = false;
        this.globalVolume = 1.0;
        this.moveThrottleTime = 100; // ms between move sounds
        this.lastMovePlay = 0;
        this.audioUnlocked = false;
        this.soundsLoaded = 0;
        this.totalSounds = 6;
        
        // Define sound assets with fallback formats
        this.soundAssets = {
            bg_music: {
                src: ['/static/assets/sounds/bg_music.wav'],
                loop: true,
                volume: this.musicVolume
            },
            eat: {
                src: ['/static/assets/sounds/eat.wav'],
                volume: this.sfxVolume
            },
            move: {
                src: ['/static/assets/sounds/move.wav'],
                volume: this.sfxVolume * 0.5
            },
            game_over: {
                src: ['/static/assets/sounds/game_over.wav'],
                volume: this.sfxVolume
            },
            level_up: {
                src: ['/static/assets/sounds/level_up.wav'],
                volume: this.sfxVolume
            },
            click: {
                src: ['/static/assets/sounds/click.wav'],
                volume: this.sfxVolume * 0.7
            }
        };
        
        this.init();
    }
    
    init() {
        // Preload all sounds with HTML5 disabled for better performance
        for (const [name, config] of Object.entries(this.soundAssets)) {
            this.sounds[name] = new Howl({
                src: config.src,
                volume: config.volume,
                loop: config.loop || false,
                preload: true,
                html5: false,
                pool: 5,
                onload: () => {
                    this.soundsLoaded++;
                    console.log(`Sound "${name}" loaded (${this.soundsLoaded}/${this.totalSounds})`);
                },
                onloaderror: (id, err) => {
                    console.warn(`Sound "${name}" failed to load:`, err);
                    this.createFallbackSound(name);
                }
            });
        }
        
        // Unlock audio on first user interaction
        this.unlockAudio();
    }
    
    primeSounds() {
        // Prime all sounds by playing and immediately stopping (muted)
        // This ensures they're fully decoded and ready
        for (const [name, sound] of Object.entries(this.sounds)) {
            if (sound && typeof sound.play === 'function') {
                const id = sound.play();
                sound.stop(id);
            }
        }
        console.log('All sounds primed and ready');
    }
    
    createFallbackSound(name) {
        // Create a synthetic sound using Web Audio API as fallback
        // This ensures there's always some audio feedback even if files are missing
        const context = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(context.destination);
        
        let frequency = 440;
        let duration = 0.1;
        switch (name) {
            case 'eat': frequency = 800; duration = 0.05; break;
            case 'move': frequency = 300; duration = 0.03; break;
            case 'game_over': frequency = 200; duration = 0.5; break;
            case 'level_up': frequency = 1200; duration = 0.2; break;
            case 'click': frequency = 600; duration = 0.05; break;
            case 'bg_music':
                // Background music fallback: simple looping tone
                // We'll create a Howl with a generated sine wave data URL (not implemented)
                // For simplicity, skip fallback for bg_music
                return;
        }
        
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        gain.gain.setValueAtTime(0.1, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        
        // Store a play function that creates a new oscillator each time
        this.sounds[name] = {
            play: () => {
                const ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.connect(g);
                g.connect(ctx.destination);
                osc.frequency.setValueAtTime(frequency, ctx.currentTime);
                g.gain.setValueAtTime(0.1 * this.sfxVolume, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                osc.start();
                osc.stop(ctx.currentTime + duration);
                // Resume context if suspended
                if (ctx.state === 'suspended') ctx.resume();
            },
            stop: () => {},
            volume: (vol) => {}
        };
    }
    
    unlockAudio() {
        if (this.audioUnlocked) return;
        const unlock = () => {
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume();
            }
            this.audioUnlocked = true;
            this.primeSounds();
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
        
        // Listen for game events
        document.addEventListener('foodEaten', () => this.playEat());
        document.addEventListener('gameOver', () => this.playGameOver());
        document.addEventListener('levelUp', () => this.playLevelUp());
    }
    
    // Background music controls
    playBgMusic() {
        if (this.musicMuted) return;
        const bg = this.sounds.bg_music;
        if (bg && !bg.playing()) {
            bg.volume(this.musicVolume * this.globalVolume);
            bg.play();
        }
    }
    
    stopBgMusic() {
        const bg = this.sounds.bg_music;
        if (bg) bg.stop();
    }
    
    toggleBgMusic() {
        this.musicMuted = !this.musicMuted;
        if (this.musicMuted) {
            this.stopBgMusic();
        } else {
            this.playBgMusic();
        }
        this.updateUI();
        return !this.musicMuted;
    }
    
    // Sound effects controls
    playSfx(name, volume = 1.0) {
        if (this.sfxMuted || !this.sounds[name]) return;
        const sound = this.sounds[name];
        if (typeof sound.play !== 'function') return;
        // Throttle move sounds to avoid overwhelming audio
        if (name === 'move') {
            const now = Date.now();
            if (now - this.lastMovePlay < this.moveThrottleTime) return;
            this.lastMovePlay = now;
        }
        try {
            sound.volume((volume * this.sfxVolume * this.globalVolume) || 0.5);
            sound.play();
        } catch (e) {
            console.warn(`Error playing sound "${name}":`, e);
        }
    }
    
    toggleSfx() {
        this.sfxMuted = !this.sfxMuted;
        this.updateUI();
        return !this.sfxMuted;
    }
    
    // Volume control
    setVolume(level) {
        // level is between 0 and 1
        this.globalVolume = Math.max(0, Math.min(1, level));
        Howler.volume(this.globalVolume);
        // Update UI indicators
        document.dispatchEvent(new CustomEvent('soundVolumeChange', { detail: { level: this.globalVolume } }));
    }
    
    setMusicVolume(level) {
        this.musicVolume = level;
        const bg = this.sounds.bg_music;
        if (bg) bg.volume(this.musicVolume * this.globalVolume);
    }
    
    setSfxVolume(level) {
        this.sfxVolume = level;
    }
    
    muteAll() {
        Howler.mute(true);
    }
    
    unmuteAll() {
        Howler.mute(false);
    }
    
    // UI integration
    updateUI() {
        // Dispatch events for UI to update toggle button states
        document.dispatchEvent(new CustomEvent('musicToggle', { detail: { muted: this.musicMuted } }));
        document.dispatchEvent(new CustomEvent('sfxToggle', { detail: { muted: this.sfxMuted } }));
    }
    
    // Convenience methods for game events
    playEat() { this.playSfx('eat'); }
    playMove() { this.playSfx('move'); }
    playGameOver() { this.playSfx('game_over'); }
    playLevelUp() { this.playSfx('level_up'); }
    playClick() { this.playSfx('click'); }
}

// Create global instance
window.soundManager = new SoundManager();

export { SoundManager };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}