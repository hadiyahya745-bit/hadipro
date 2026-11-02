/* ==========================================================================
   HADIPRO 4K - Audio Engine (Web Audio API Synthesizer & Visualizer)
   ========================================================================== */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.analyser = null;
    this.sourceNode = null;
    this.ambientInterval = null;
    this.isAmbientPlaying = false;
    this.bpm = 124;
    this.beatStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // --- UI Sound Effects ---

  playHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {}
  }

  playAction() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1080, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }

  playTrim() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  playWhoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2800, this.ctx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playGlitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const count = 4;
      for (let i = 0; i < count; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
        const freq = 150 + Math.random() * 2400;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.03);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (i + 1) * 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.03);
        osc.stop(this.ctx.currentTime + (i + 1) * 0.03);
      }
    } catch (e) {}
  }

  playExportSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Victory Arpeggio: C4, E4, G4, C5, E5
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.65);
    });
  }

  // --- Cinematic SFX Board ---

  triggerSFX(type) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    switch (type) {
      case 'boom': { // Cinematic Sub-Bass Impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(28, t + 1.2);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
        break;
      }
      case 'laser': { // Sci-Fi Laser Sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2400, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.22);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
        break;
      }
      case 'shutter': { // Camera Shutter Click
        this.playTrim();
        setTimeout(() => this.playClick(), 70);
        break;
      }
      case 'basshit': { // 808 Trap Kick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.4);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }
      case 'whoosh': {
        this.playWhoosh();
        break;
      }
      case 'glitch': {
        this.playGlitch();
        break;
      }
      default:
        this.playAction();
    }
  }

  // --- Cyber Beat Ambient Synthesizer ---

  toggleCyberBeat() {
    this.init();
    if (this.isAmbientPlaying) {
      clearInterval(this.ambientInterval);
      this.isAmbientPlaying = false;
      return false;
    } else {
      this.isAmbientPlaying = true;
      const stepDuration = (60 / this.bpm) / 4 * 1000; // 16th notes
      this.beatStep = 0;
      this.ambientInterval = setInterval(() => {
        this.tickCyberBeat();
      }, stepDuration);
      return true;
    }
  }

  tickCyberBeat() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const step = this.beatStep % 16;

    // Kick on steps 0, 4, 8, 12 (4-on-the-floor)
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    // Hi-Hat on offbeats (2, 6, 10, 14)
    if (step % 2 === 1) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(8000, t);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }

    // Cyber Synth Bass Note on steps 0, 3, 6, 10, 12
    if ([0, 3, 6, 10, 12].includes(step)) {
      const bassNotes = [55, 55, 65.41, 73.42, 55]; // A1, C2, D2
      const note = bassNotes[Math.floor(step / 3) % bassNotes.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    }

    this.beatStep++;
  }

  // Connect video element to analyser
  connectMediaElement(mediaElement) {
    this.init();
    if (!this.ctx || !this.analyser) return;
    try {
      if (!this.sourceNode) {
        this.sourceNode = this.ctx.createMediaElementSource(mediaElement);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    } catch (e) {
      // Element might already be connected
    }
  }

  getFrequencyData() {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

// Global instance
window.audioEngine = new AudioEngine();
