/* ==========================================================================
   HADIPRO 4K - Background Cyber Movement & Procedural Demo Video
   ========================================================================== */

// --- Cyber Particle Network Background (Movement & Energy) ---
class CyberBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 55;
    this.mouse = { x: -1000, y: -1000 };

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.5
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connecting lines
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(255, 30, 66, ${0.18 * (1 - dist / 130)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }

    // Draw and move particles
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse reaction
      const mdx = this.mouse.x - p.x;
      const mdy = this.mouse.y - p.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 100) {
        p.x -= (mdx / mdist) * 1.5;
        p.y -= (mdy / mdist) * 1.5;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 30, 66, ${p.alpha})`;
      this.ctx.shadowColor = '#ff1e42';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// --- Procedural 4K Demo Video Generator ---
async function generateDemoVideo(callback) {
  const width = 1280;
  const height = 720;
  const fps = 30;
  const durationSec = 8;
  const totalFrames = fps * durationSec;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Audio Synth for demo
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const actx = new AudioCtx();
  const dest = actx.createMediaStreamDestination();

  // Create synth beat oscillator
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, actx.currentTime);
  gain.gain.setValueAtTime(0.12, actx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  const stream = canvas.captureStream(fps);
  dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];

  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    osc.stop();
    actx.close();
    const blob = new Blob(chunks, { type: mimeType });
    const videoUrl = URL.createObjectURL(blob);
    callback(videoUrl);
  };

  recorder.start();

  let frame = 0;
  const renderInterval = setInterval(() => {
    if (frame >= totalFrames) {
      clearInterval(renderInterval);
      recorder.stop();
      return;
    }

    const t = frame / fps;
    const progress = frame / totalFrames;

    // Draw Cyber Background
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
    grad.addColorStop(0, '#2d0812');
    grad.addColorStop(0.6, '#0f0f18');
    grad.addColorStop(1, '#050508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Animated Grid
    ctx.strokeStyle = 'rgba(255, 30, 66, 0.2)';
    ctx.lineWidth = 1;
    const gridOffset = (frame * 3) % 40;
    for (let x = gridOffset; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = gridOffset; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Rotating Neon Ring
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(t * 1.5);
    ctx.strokeStyle = '#ff1e42';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff1e42';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(0, 0, 160 + Math.sin(t * 4) * 20, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();

    // Center Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 52px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff1e42';
    ctx.shadowBlur = 30;
    ctx.fillText('HADIPRO 4K', width / 2, height / 2 - 20);

    ctx.font = '800 24px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ff3355';
    ctx.shadowBlur = 15;
    ctx.fillText('ULTRA HD VIDEO STUDIO', width / 2, height / 2 + 35);

    // Countdown Timer Display
    const remaining = (durationSec - t).toFixed(1);
    ctx.font = '700 22px monospace';
    ctx.fillStyle = '#a3a3b5';
    ctx.shadowBlur = 0;
    ctx.fillText(`⏱ DEMO REEL: 00:0${Math.floor(t)} | 60 FPS ULTRA`, width / 2, height - 60);

    // Audio Pitch variation in beat
    osc.frequency.setValueAtTime(110 + Math.sin(t * 8) * 40, actx.currentTime);

    frame++;
  }, 1000 / fps);
}

window.CyberBackground = CyberBackground;
window.generateDemoVideo = generateDemoVideo;
