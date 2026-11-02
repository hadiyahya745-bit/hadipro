/* ==========================================================================
   HADIPRO 4K - Captions & Subtitles Engine
   ========================================================================== */

class CaptionsEngine {
  constructor() {
    this.captions = [];
    this.activeStyle = 'hormozi'; // 'hormozi', 'neon', 'cinematic', 'karaoke', 'comic'
    this.globalFontSize = 38;
    this.globalTextColor = '#ffffff';
    this.globalHighlightColor = '#ff1e42';
    this.globalPosY = 80; // % from top
    this.globalPosX = 50; // % from left (center)
    this.isUppercase = true;
    this.showBox = true;
    this.selectedCaptionId = null;
    this.recognition = null;
    this.isListening = false;

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ku-IQ'; // Kurdish or fallback

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const textInput = document.getElementById('caption-input');
        if (textInput && transcript) {
          textInput.value = transcript.trim();
        }
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        this.updateMicBtn();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicBtn();
      };
    }
  }

  toggleSpeech() {
    if (!this.recognition) {
      alert("Pêveka Deng bo Nivîsê (Speech Recognition) di vî gerokî de nayê piştgirî kirin. Ji kerema xwe Chrome bikar bîne.");
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        this.isListening = false;
      }
    }
    this.updateMicBtn();
  }

  updateMicBtn() {
    const btn = document.getElementById('btn-speech-mic');
    if (btn) {
      if (this.isListening) {
        btn.classList.add('active');
        btn.innerHTML = '🛑 Qisê Bike...';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '🎤 Deng bo Nivîsê';
      }
    }
  }

  addCaption(start, end, text, style = null) {
    if (!text || text.trim() === '') return null;
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const item = {
      id,
      start: parseFloat(start) || 0,
      end: parseFloat(end) || 3,
      text: text.trim(),
      style: style || this.activeStyle,
      fontSize: this.globalFontSize,
      color: this.globalTextColor,
      highlightColor: this.globalHighlightColor,
      posX: this.globalPosX,
      posY: this.globalPosY
    };
    this.captions.push(item);
    this.sortCaptions();
    this.renderCaptionList();
    this.renderTimelineMarkers();
    return item;
  }

  deleteCaption(id) {
    this.captions = this.captions.filter(c => c.id !== id);
    if (this.selectedCaptionId === id) this.selectedCaptionId = null;
    this.renderCaptionList();
    this.renderTimelineMarkers();
  }

  updateCaption(id, updates) {
    const item = this.captions.find(c => c.id === id);
    if (item) {
      Object.assign(item, updates);
      this.sortCaptions();
      this.renderCaptionList();
      this.renderTimelineMarkers();
    }
  }

  sortCaptions() {
    this.captions.sort((a, b) => a.start - b.start);
  }

  // Generate Preset Demo Captions matching duration
  generateAutoCaptions(duration = 10) {
    this.captions = [];
    const presets = [
      { start: 0.0, end: Math.min(2.5, duration), text: "HADIPRO 4K VIDEO EDITOR 🔥" },
      { start: Math.min(2.8, duration), end: Math.min(5.5, duration), text: "HERÎ BAŞTIRÎN MONTAJ 🚀" },
      { start: Math.min(5.8, duration), end: Math.min(8.5, duration), text: "ULTRA HD & CAPTION STYLE ⚡" },
      { start: Math.min(8.8, duration), end: Math.min(duration, 12.0), text: "DIRUSTKIRIN: [hadiiyahya77] 👑" }
    ];

    presets.forEach(p => {
      if (p.start < duration) {
        this.addCaption(p.start, Math.min(p.end, duration), p.text, this.activeStyle);
      }
    });

    if (window.audioEngine) window.audioEngine.playAction();
  }

  // Render on main video canvas
  draw(ctx, canvasWidth, canvasHeight, currentTime) {
    if (this.captions.length === 0) return;

    // Find active caption for currentTime
    const active = this.captions.find(c => currentTime >= c.start && currentTime <= c.end);
    if (!active) return;

    ctx.save();

    let text = active.text;
    if (this.isUppercase) text = text.toUpperCase();

    const scale = canvasWidth / 1920; // responsive scale
    const fontSize = Math.max(16, (active.fontSize || this.globalFontSize) * scale * 1.5);
    const x = (active.posX !== undefined ? active.posX : this.globalPosX) * (canvasWidth / 100);
    const y = (active.posY !== undefined ? active.posY : this.globalPosY) * (canvasHeight / 100);

    const style = active.style || this.activeStyle;
    const progress = (currentTime - active.start) / Math.max(0.1, active.end - active.start);

    switch (style) {
      case 'hormozi':
        this.drawHormozi(ctx, text, x, y, fontSize, active, progress);
        break;
      case 'neon':
        this.drawNeon(ctx, text, x, y, fontSize, active);
        break;
      case 'cinematic':
        this.drawCinematic(ctx, text, x, y, fontSize, active);
        break;
      case 'karaoke':
        this.drawKaraoke(ctx, text, x, y, fontSize, active, progress);
        break;
      case 'comic':
        this.drawComic(ctx, text, x, y, fontSize, active);
        break;
      default:
        this.drawHormozi(ctx, text, x, y, fontSize, active, progress);
    }

    ctx.restore();
  }

  drawHormozi(ctx, text, x, y, fontSize, item, progress) {
    ctx.font = `900 ${fontSize}px "Impact", "Montserrat", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = text.split(' ');
    const activeWordIdx = Math.min(words.length - 1, Math.floor(progress * words.length));

    // Measure total width
    const wordWidths = words.map(w => ctx.measureText(w + ' ').width);
    const totalWidth = wordWidths.reduce((a, b) => a + b, 0);

    let startX = x - totalWidth / 2;

    words.forEach((word, idx) => {
      const wWidth = wordWidths[idx];
      const isWordActive = idx === activeWordIdx;
      const wordCenter = startX + wWidth / 2;

      ctx.save();
      if (isWordActive) {
        // High impact bounce
        const bounce = 1.0 + Math.sin(progress * Math.PI * 8) * 0.08;
        ctx.translate(wordCenter, y);
        ctx.scale(bounce, bounce);
        ctx.translate(-wordCenter, -y);

        // Highlight box
        const padX = fontSize * 0.35;
        const padY = fontSize * 0.25;
        ctx.fillStyle = item.highlightColor || this.globalHighlightColor;
        ctx.shadowColor = item.highlightColor || '#ff1e42';
        ctx.shadowBlur = 18;

        ctx.beginPath();
        const r = 8;
        const bx = wordCenter - wWidth / 2 - padX / 2;
        const by = y - fontSize / 2 - padY / 2;
        const bw = wWidth + padX;
        const bh = fontSize + padY;
        ctx.roundRect(bx, by, bw, bh, r);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = fontSize * 0.12;
        ctx.strokeText(word, wordCenter, y);
        ctx.fillText(word, wordCenter, y);
      } else {
        ctx.fillStyle = item.color || this.globalTextColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = fontSize * 0.14;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.strokeText(word, wordCenter, y);
        ctx.fillText(word, wordCenter, y);
      }
      ctx.restore();

      startX += wWidth;
    });
  }

  drawNeon(ctx, text, x, y, fontSize, item) {
    ctx.font = `800 ${fontSize}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = item.highlightColor || '#ff1e42';
    ctx.shadowBlur = 30;

    ctx.strokeStyle = item.highlightColor || '#ff1e42';
    ctx.lineWidth = fontSize * 0.08;
    ctx.strokeText(text, x, y);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);

    ctx.shadowBlur = 10;
    ctx.fillText(text, x, y);
  }

  drawCinematic(ctx, text, x, y, fontSize, item) {
    ctx.font = `600 ${fontSize * 0.85}px "Georgia", "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(text);
    const pad = fontSize * 0.4;

    // Dark semi-transparent pill backing
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(x - metrics.width / 2 - pad, y - fontSize * 0.6, metrics.width + pad * 2, fontSize * 1.2, 8);
    ctx.fill();

    ctx.fillStyle = item.color || '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(text, x, y);
  }

  drawKaraoke(ctx, text, x, y, fontSize, item, progress) {
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(text);
    const left = x - metrics.width / 2;

    // Background text in dim color
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = fontSize * 0.12;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    // Mask for revealed highlighted text
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, y - fontSize, metrics.width * progress, fontSize * 2);
    ctx.clip();

    ctx.fillStyle = item.highlightColor || '#ff1e42';
    ctx.shadowColor = item.highlightColor || '#ff1e42';
    ctx.shadowBlur = 16;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  drawComic(ctx, text, x, y, fontSize, item) {
    ctx.font = `900 ${fontSize}px "Impact", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3D Offset Shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x + 6, y + 6);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = fontSize * 0.15;
    ctx.strokeText(text, x, y);

    ctx.fillStyle = item.highlightColor || '#ffd166';
    ctx.fillText(text, x, y);
  }

  // --- UI Rendering ---

  renderCaptionList() {
    const container = document.getElementById('captions-list');
    if (!container) return;

    if (this.captions.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.8rem;">
        Hêşta tu jêrsernav nehatine zêdekirin.<br>Bişkoja "Jêrsernavên Xweber" an "Zêde bike" bitikîne!
      </div>`;
      return;
    }

    container.innerHTML = this.captions.map(c => `
      <div class="caption-item ${this.selectedCaptionId === c.id ? 'active' : ''}" data-id="${c.id}">
        <div class="caption-item-info" onclick="captionsEngine.seekToCaption('${c.id}')">
          <div class="caption-item-text">${c.text}</div>
          <div class="caption-item-time">⏱ ${c.start.toFixed(1)}s - ${c.end.toFixed(1)}s</div>
        </div>
        <div class="caption-item-actions">
          <button class="btn btn-icon" style="width:28px;height:28px;" onclick="captionsEngine.deleteCaption('${c.id}')" title="Jê bibe">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  renderTimelineMarkers() {
    const track = document.getElementById('timeline-captions-track');
    const video = document.getElementById('source-video');
    if (!track || !video || !video.duration) return;

    const dur = video.duration;
    track.innerHTML = this.captions.map(c => {
      const left = (c.start / dur) * 100;
      const width = Math.max(2, ((c.end - c.start) / dur) * 100);
      return `<div class="caption-marker" style="left:${left}%; width:${width}%;" title="${c.text}">
        ${c.text}
      </div>`;
    }).join('');
  }

  seekToCaption(id) {
    const c = this.captions.find(item => item.id === id);
    if (c) {
      const video = document.getElementById('source-video');
      if (video) {
        video.currentTime = c.start;
        if (window.audioEngine) window.audioEngine.playClick();
      }
    }
  }

  // Import SRT file
  importSRT(fileText) {
    const srtRegex = /\d+\r?\n(\d{2}:\d{2}:\d{2}[,\.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,\.]\d{3})\r?\n([\s\S]*?)(?=\r?\n\r?\n|\$)/g;
    let match;
    this.captions = [];

    const parseTime = (timeStr) => {
      const parts = timeStr.replace(',', '.').split(':');
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    };

    while ((match = srtRegex.exec(fileText)) !== null) {
      const start = parseTime(match[1]);
      const end = parseTime(match[2]);
      const text = match[3].replace(/<[^>]*>/g, '').replace(/\r?\n/g, ' ').trim();
      if (text) {
        this.addCaption(start, end, text);
      }
    }

    if (window.audioEngine) window.audioEngine.playAction();
  }

  // Export to SRT format
  exportSRT() {
    const formatTime = (seconds) => {
      const pad = (n, z = 2) => String(Math.floor(n)).padStart(z, '0');
      const h = pad(seconds / 3600);
      const m = pad((seconds % 3600) / 60);
      const s = pad(seconds % 60);
      const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
      return `${h}:${m}:${s},${ms}`;
    };

    let srt = '';
    this.captions.forEach((c, idx) => {
      srt += `${idx + 1}\n${formatTime(c.start)} --> ${formatTime(c.end)}\n${c.text}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hadipro_captions_${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Global instance
window.captionsEngine = new CaptionsEngine();
