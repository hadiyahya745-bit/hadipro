/* ==========================================================================
   HADIPRO 4K - Core Video & Canvas Render Engine
   ========================================================================== */

class VideoEngine {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.aspectRatio = '16:9'; // '16:9', '9:16', '1:1', '4:5', '21:9'
    
    // Trim points
    this.trimStart = 0;
    this.trimEnd = 0;
    this.isPlaying = false;

    // Filters
    this.filters = {
      brightness: 100, // %
      contrast: 100,   // %
      saturation: 100, // %
      hue: 0,          // deg
      blur: 0,         // px
      sepia: 0,        // %
      invert: 0,       // %
      vignette: 0,     // %
      sharpness: 0     // %
    };

    // Special FX toggles
    this.fx = {
      glitch: false,
      grain: false,
      shake: false,
      letterbox: false,
      scanlines: false,
      neonBorder: false
    };

    // Transform
    this.transform = {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      flipV: false
    };

    // Watermark
    this.watermark = {
      enabled: true,
      text: "HADIPRO 4K | hadiiyahya77",
      fontSize: 24,
      opacity: 0.85,
      position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
      logoImage: null
    };

    // Filmstrip thumbnails
    this.thumbnails = [];
  }

  init(videoEl, canvasEl) {
    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    this.bindVideoEvents();
    this.startRenderLoop();
  }

  bindVideoEvents() {
    this.video.addEventListener('loadedmetadata', () => {
      this.trimStart = 0;
      this.trimEnd = this.video.duration;
      this.updateCanvasResolution();
      this.updateTimeDisplay();
      this.generateFilmstrip();
      if (window.captionsEngine) {
        window.captionsEngine.renderTimelineMarkers();
      }
    });

    this.video.addEventListener('timeupdate', () => {
      if (this.video.currentTime >= this.trimEnd) {
        this.video.currentTime = this.trimStart;
        if (!this.video.loop && !this.isPlaying) {
          this.pause();
        }
      }
      if (this.video.currentTime < this.trimStart) {
        this.video.currentTime = this.trimStart;
      }
      this.updateTimeDisplay();
      this.updatePlayheadPosition();
    });

    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayButton();
      if (window.audioEngine) {
        window.audioEngine.connectMediaElement(this.video);
      }
    });

    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayButton();
    });
  }

  updateCanvasResolution() {
    if (!this.canvas) return;

    let targetW = 1920;
    let targetH = 1080;

    switch (this.aspectRatio) {
      case '16:9':
        targetW = 1920; targetH = 1080;
        break;
      case '9:16':
        targetW = 1080; targetH = 1920;
        break;
      case '1:1':
        targetW = 1080; targetH = 1080;
        break;
      case '4:5':
        targetW = 1080; targetH = 1350;
        break;
      case '21:9':
        targetW = 2560; targetH = 1080;
        break;
    }

    this.canvas.width = targetW;
    this.canvas.height = targetH;
  }

  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    this.updateCanvasResolution();
    if (window.audioEngine) window.audioEngine.playAction();
  }

  play() {
    if (this.video) {
      if (this.video.currentTime >= this.trimEnd) {
        this.video.currentTime = this.trimStart;
      }
      this.video.play().catch(() => {});
      this.isPlaying = true;
      this.updatePlayButton();
      if (window.audioEngine) window.audioEngine.playClick();
    }
  }

  pause() {
    if (this.video) {
      this.video.pause();
      this.isPlaying = false;
      this.updatePlayButton();
      if (window.audioEngine) window.audioEngine.playClick();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(time) {
    if (this.video) {
      this.video.currentTime = Math.max(0, Math.min(this.video.duration, time));
      this.updateTimeDisplay();
      this.updatePlayheadPosition();
    }
  }

  stepFrame(frames) {
    if (this.video) {
      const step = (1 / 30) * frames;
      this.seek(this.video.currentTime + step);
      if (window.audioEngine) window.audioEngine.playTrim();
    }
  }

  setSpeed(rate) {
    if (this.video) {
      this.video.playbackRate = parseFloat(rate);
      if (window.audioEngine) window.audioEngine.playAction();
    }
  }

  setVolume(vol) {
    if (this.video) {
      this.video.volume = Math.min(1.0, Math.max(0.0, vol));
    }
  }

  // --- Render Loop ---

  startRenderLoop() {
    const loop = () => {
      this.renderFrame(this.ctx, this.canvas.width, this.canvas.height, this.video.currentTime);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  renderFrame(ctx, width, height, currentTime) {
    if (!this.video || this.video.readyState < 2) {
      // Clear black
      ctx.fillStyle = '#07070a';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    ctx.save();

    // 1. Camera Shake calculation
    let shakeX = 0;
    let shakeY = 0;
    if (this.fx.shake) {
      shakeX = (Math.random() - 0.5) * 16;
      shakeY = (Math.random() - 0.5) * 16;
      ctx.translate(shakeX, shakeY);
    }

    // 2. Set Canvas Filters
    ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation}%) hue-rotate(${this.filters.hue}deg) blur(${this.filters.blur}px) sepia(${this.filters.sepia}%) invert(${this.filters.invert}%)`;

    // 3. Clear Canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(-10, -10, width + 20, height + 20);

    // 4. Transformations (Zoom, Pan, Rotate, Flip)
    ctx.save();
    ctx.translate(width / 2 + this.transform.panX, height / 2 + this.transform.panY);
    ctx.scale(
      (this.transform.flipH ? -1 : 1) * this.transform.zoom,
      (this.transform.flipV ? -1 : 1) * this.transform.zoom
    );
    if (this.transform.rotation) {
      ctx.rotate((this.transform.rotation * Math.PI) / 180);
    }

    // Aspect ratio fitting (Cover mode)
    const videoAspect = this.video.videoWidth / this.video.videoHeight;
    const canvasAspect = width / height;
    let drawW, drawH;

    if (canvasAspect > videoAspect) {
      drawW = width;
      drawH = width / videoAspect;
    } else {
      drawH = height;
      drawW = height * videoAspect;
    }

    ctx.drawImage(this.video, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore(); // Restore transform

    // Reset filter for overlays
    ctx.filter = 'none';

    // 5. RGB Glitch Split Effect
    if (this.fx.glitch && Math.random() > 0.4) {
      this.drawGlitch(ctx, width, height);
    }

    // 6. Film Grain
    if (this.fx.grain) {
      this.drawGrain(ctx, width, height);
    }

    // 7. Vignette
    if (this.filters.vignette > 0) {
      this.drawVignette(ctx, width, height, this.filters.vignette);
    }

    // 8. Cyber Scanlines
    if (this.fx.scanlines) {
      this.drawScanlines(ctx, width, height);
    }

    // 9. Letterbox (Cinemascope 2.39:1 bars)
    if (this.fx.letterbox) {
      const barH = height * 0.12;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barH);
      ctx.fillRect(0, height - barH, width, barH);
    }

    // 10. Glowing Red Neon Border
    if (this.fx.neonBorder) {
      ctx.strokeStyle = '#ff1e42';
      ctx.lineWidth = Math.max(6, width * 0.008);
      ctx.shadowColor = '#ff1e42';
      ctx.shadowBlur = 30;
      ctx.strokeRect(0, 0, width, height);
      ctx.shadowBlur = 0;
    }

    // 11. Watermark & Logo
    this.drawWatermark(ctx, width, height);

    // 12. Captions & Subtitles Engine
    if (window.captionsEngine) {
      window.captionsEngine.draw(ctx, width, height, currentTime);
    }

    // 13. Audio Equalizer Waveform Overlay
    this.drawAudioVisualizer(ctx, width, height);

    ctx.restore();
  }

  // --- FX Draw Helpers ---

  drawGlitch(ctx, width, height) {
    const sliceCount = 6;
    for (let i = 0; i < sliceCount; i++) {
      const sy = Math.random() * height;
      const sh = 10 + Math.random() * 50;
      const offset = (Math.random() - 0.5) * 35;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 30, 66, 0.35)';
      ctx.fillRect(0, sy, width, sh);
      ctx.drawImage(this.canvas, 0, sy, width, sh, offset, sy, width, sh);
      ctx.restore();
    }
  }

  drawGrain(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const count = 450;
    for (let i = 0; i < count; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      const gs = Math.random() * 2.5;
      ctx.fillRect(gx, gy, gs, gs);
    }
    ctx.restore();
  }

  drawVignette(ctx, width, height, amount) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.25,
      width / 2, height / 2, width * 0.72
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${amount / 100})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  drawScanlines(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 30, 66, 0.035)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
    ctx.restore();
  }

  drawWatermark(ctx, width, height) {
    if (!this.watermark.enabled) return;

    ctx.save();
    ctx.globalAlpha = this.watermark.opacity;

    // If custom image logo uploaded
    if (this.watermark.logoImage) {
      const logoW = Math.max(60, width * 0.12);
      const logoH = (logoW / this.watermark.logoImage.width) * this.watermark.logoImage.height;
      const pad = width * 0.03;
      let lx = pad, ly = pad;
      if (this.watermark.position.includes('right')) lx = width - logoW - pad;
      if (this.watermark.position.includes('bottom')) ly = height - logoH - pad;
      ctx.drawImage(this.watermark.logoImage, lx, ly, logoW, logoH);
    }

    // Text Watermark
    if (this.watermark.text) {
      const scale = width / 1920;
      const size = Math.max(14, this.watermark.fontSize * scale);
      ctx.font = `800 ${size}px "Segoe UI", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff1e42';
      ctx.shadowBlur = 12;

      const pad = width * 0.025;
      let tx = pad, ty = pad + size;

      if (this.watermark.position === 'bottom-right') {
        ctx.textAlign = 'right';
        tx = width - pad;
        ty = height - pad;
      } else if (this.watermark.position === 'bottom-left') {
        ctx.textAlign = 'left';
        tx = pad;
        ty = height - pad;
      } else if (this.watermark.position === 'top-right') {
        ctx.textAlign = 'right';
        tx = width - pad;
        ty = pad + size;
      } else {
        ctx.textAlign = 'left';
        tx = pad;
        ty = pad + size;
      }

      ctx.fillText(this.watermark.text, tx, ty);
    }

    ctx.restore();
  }

  drawAudioVisualizer(ctx, width, height) {
    if (!window.audioEngine) return;
    const freq = window.audioEngine.getFrequencyData();
    if (!freq || freq.length === 0) return;

    ctx.save();
    const barCount = 48;
    const barWidth = width / barCount;
    const maxBarHeight = height * 0.12;

    for (let i = 0; i < barCount; i++) {
      const val = freq[i % freq.length] / 255;
      const h = val * maxBarHeight;
      const x = i * barWidth;
      const y = height - h;

      const grad = ctx.createLinearGradient(0, y, 0, height);
      grad.addColorStop(0, 'rgba(255, 30, 66, 0.7)');
      grad.addColorStop(1, 'rgba(140, 13, 30, 0.2)');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y, barWidth - 4, h);
    }
    ctx.restore();
  }

  // --- Filmstrip Generation ---

  generateFilmstrip() {
    const strip = document.getElementById('timeline-filmstrip');
    if (!strip || !this.video || !this.video.duration) return;

    strip.innerHTML = '';
    const frameCount = 12;
    const duration = this.video.duration;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = 160;
    captureCanvas.height = 90;
    const captureCtx = captureCanvas.getContext('2d');

    const tempVideo = document.createElement('video');
    tempVideo.src = this.video.src;
    tempVideo.muted = true;

    let index = 0;
    const grabFrame = () => {
      if (index >= frameCount) return;
      const time = (index / frameCount) * duration;
      tempVideo.currentTime = time;
    };

    tempVideo.addEventListener('seeked', () => {
      captureCtx.drawImage(tempVideo, 0, 0, captureCanvas.width, captureCanvas.height);
      const img = document.createElement('img');
      img.src = captureCanvas.toDataURL('image/jpeg', 0.6);
      img.className = 'timeline-thumb';
      strip.appendChild(img);
      index++;
      grabFrame();
    });

    tempVideo.addEventListener('loadeddata', () => {
      grabFrame();
    });
  }

  // --- UI Sync ---

  updateTimeDisplay() {
    const curEl = document.getElementById('time-current');
    const durEl = document.getElementById('time-duration');
    const trimInfo = document.getElementById('timeline-trim-info');

    if (curEl && this.video) {
      curEl.innerText = this.formatTime(this.video.currentTime);
    }
    if (durEl && this.video) {
      durEl.innerText = this.formatTime(this.video.duration || 0);
    }
    if (trimInfo && this.video) {
      const selDur = Math.max(0, this.trimEnd - this.trimStart);
      trimInfo.innerHTML = `Dirêjahî: <span>${this.formatTime(selDur)}</span> (${this.formatTime(this.trimStart)} - ${this.formatTime(this.trimEnd)})`;
    }
  }

  updatePlayheadPosition() {
    const playhead = document.getElementById('timeline-playhead');
    const container = document.getElementById('timeline-container');
    if (!playhead || !container || !this.video || !this.video.duration) return;

    const percent = (this.video.currentTime / this.video.duration) * 100;
    playhead.style.left = `${Math.min(100, Math.max(0, percent))}%`;
  }

  updatePlayButton() {
    const btn = document.getElementById('btn-play-toggle');
    if (btn) {
      btn.innerHTML = this.isPlaying ? '⏸️ Rawestîne' : '▶️ Lêbide';
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '00:00.00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  // Presets Application
  applyPreset(presetName) {
    switch (presetName) {
      case 'cinema':
        this.filters.brightness = 105;
        this.filters.contrast = 135;
        this.filters.saturation = 125;
        this.filters.hue = 0;
        this.filters.vignette = 40;
        this.fx.letterbox = true;
        break;
      case 'cyberpunk':
        this.filters.brightness = 100;
        this.filters.contrast = 150;
        this.filters.saturation = 180;
        this.filters.hue = 330;
        this.filters.vignette = 50;
        this.fx.glitch = true;
        this.fx.scanlines = true;
        break;
      case 'noir':
        this.filters.brightness = 90;
        this.filters.contrast = 175;
        this.filters.saturation = 0;
        this.filters.vignette = 65;
        this.fx.grain = true;
        break;
      case 'vibrant':
        this.filters.brightness = 105;
        this.filters.contrast = 120;
        this.filters.saturation = 175;
        this.filters.vignette = 20;
        break;
      case 'warm':
        this.filters.brightness = 100;
        this.filters.contrast = 110;
        this.filters.saturation = 130;
        this.filters.sepia = 40;
        this.filters.hue = 350;
        break;
      case 'horror':
        this.filters.brightness = 85;
        this.filters.contrast = 190;
        this.filters.saturation = 70;
        this.filters.hue = 345;
        this.filters.vignette = 80;
        this.fx.grain = true;
        break;
      default:
        this.resetFilters();
    }

    this.syncFilterInputs();
    if (window.audioEngine) window.audioEngine.playAction();
  }

  resetFilters() {
    this.filters = {
      brightness: 100, contrast: 100, saturation: 100, hue: 0,
      blur: 0, sepia: 0, invert: 0, vignette: 0, sharpness: 0
    };
    this.fx = { glitch: false, grain: false, shake: false, letterbox: false, scanlines: false, neonBorder: false };
    this.syncFilterInputs();
    if (window.audioEngine) window.audioEngine.playTrim();
  }

  syncFilterInputs() {
    const bindRange = (id, val) => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(id + '-val');
      if (el) el.value = val;
      if (valEl) valEl.innerText = val + (id.includes('hue') ? '°' : id.includes('blur') ? 'px' : '%');
    };

    bindRange('range-brightness', this.filters.brightness);
    bindRange('range-contrast', this.filters.contrast);
    bindRange('range-saturation', this.filters.saturation);
    bindRange('range-hue', this.filters.hue);
    bindRange('range-vignette', this.filters.vignette);
    bindRange('range-blur', this.filters.blur);
    bindRange('range-sepia', this.filters.sepia);
  }
}

// Global instance
window.videoEngine = new VideoEngine();
