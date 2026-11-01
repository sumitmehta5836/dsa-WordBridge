/**
 * ============================================================================
 * WORDBRIDGE: Procedural Web Audio Sound Synthesizer
 * Generates tactile sound effects for keystrokes, flips, undos, and victories
 * ============================================================================
 */

class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
        if (!this.enabled) return;
        try {
            this.init();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio context policy safe guard
        }
    }

    keyPress() {
        this.playTone(420, 'triangle', 0.04, 0.08);
    }

    wordChange() {
        if (!this.enabled) return;
        this.init();
        this.playTone(480, 'sine', 0.07, 0.16);
        setTimeout(() => this.playTone(620, 'sine', 0.09, 0.18), 45);
    }

    deleteKey() {
        this.playTone(280, 'triangle', 0.05, 0.08);
    }

    validMove() {
        if (!this.enabled) return;
        this.init();
        // Play bright ascending two-tone chord
        this.playTone(523.25, 'sine', 0.12, 0.18); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.2), 80); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.22), 160); // G5
    }

    invalidMove() {
        if (!this.enabled) return;
        this.init();
        // Low dissonant buzz
        this.playTone(180, 'sawtooth', 0.15, 0.2);
        setTimeout(() => this.playTone(140, 'sawtooth', 0.2, 0.22), 80);
    }

    undo() {
        if (!this.enabled) return;
        this.init();
        // Descending pitch glide
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    redo() {
        if (!this.enabled) return;
        this.init();
        // Ascending pitch glide
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    hint() {
        if (!this.enabled) return;
        this.init();
        this.playTone(784, 'sine', 0.1, 0.15);
        setTimeout(() => this.playTone(1046.5, 'sine', 0.2, 0.2), 90);
    }

    victory() {
        if (!this.enabled) return;
        this.init();
        // Fanfare arpeggio: C - E - G - C6 with sustained chord
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'triangle', idx === notes.length - 1 ? 0.8 : 0.25, 0.25);
            }, idx * 120);
        });
    }
}

window.sound = new SoundSynthesizer();
