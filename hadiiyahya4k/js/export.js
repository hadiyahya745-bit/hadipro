/* ==========================================================================
   HADIPRO 4K - Ultra HD Video Exporter & MediaRecorder Pipeline
   ========================================================================== */

class ExportEngine {
  constructor() {
    this.selectedResolution = '4k'; // '4k', '2k', '1080p', '720p'
    this.selectedFps = 60;
    this.selectedBitrate = 50000000; // 50 Mbps default for 4K
    this.isExporting = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.exportCanvas = null;
    this.exportCtx = null;
  }

  getResolutionDimensions(resKey, aspect) {
    let w = 3840, h = 2160;

    if (resKey === '4k') {
      if (aspect === '9:16') { w = 2160; h = 3840; }
      else if (aspect === '1:1') { w = 2160; h = 2160; }
      else if (aspect === '4:5') { w = 2160; h = 2700; }
      else if (aspect === '21:9') { w = 5120; h = 2160; }
      else { w = 3840; h = 2160; }
    } else if (resKey === '2k') {
      if (aspect === '9:16') { w = 1440; h = 2560; }
      else if (aspect === '1:1') { w = 1440; h = 1440; }
      else if (aspect === '4:5') { w = 1440; h = 1800; }
      else if (aspect === '21:9') { w = 3440; h = 1440; }
      else { w = 2560; h = 1440; }
    } else if (resKey === '1080p') {
      if (aspect === '9:16') { w = 1080; h = 1920; }
      else if (aspect === '1:1') { w = 1080; h = 1080; }
      else if (aspect === '4:5') { w = 1080; h = 1350; }
      else if (aspect === '21:9') { w = 2560; h = 1080; }
      else { w = 1920; h = 1080; }
    } else { // 720p
      if (aspect === '9:16') { w = 720; h = 1280; }
      else if (aspect === '1:1') { w = 720; h = 720; }
      else if (aspect === '4:5') { w = 720; h = 900; }
      else if (aspect === '21:9') { w = 1680; h = 720; }
      else { w = 1280; h = 720; }
    }

    return { w, h };
  }

  openExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
      modal.classList.add('active');
      this.resetExportUI();
      if (window.audioEngine) window.audioEngine.playWhoosh();
    }
  }

  closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
      if (this.isExporting) {
        if (!confirm("Pêvajoya daxistinê berdewam e. Tu dixwazî betal bikî?")) return;
        this.cancelExport();
      }
      modal.classList.remove('active');
      if (window.audioEngine) window.audioEngine.playClick();
    }
  }

  selectQuality(qualityKey) {
    this.selectedResolution = qualityKey;
    document.querySelectorAll('.quality-card').forEach(card => {
      card.classList.toggle('active', card.dataset.res === qualityKey);
    });

    if (qualityKey === '4k') this.selectedBitrate = 50000000;
    else if (qualityKey === '2k') this.selectedBitrate = 25000000;
    else if (qualityKey === '1080p') this.selectedBitrate = 14000000;
    else this.selectedBitrate = 6000000;

    if (window.audioEngine) window.audioEngine.playClick();
  }

  resetExportUI() {
    const progressWrap = document.getElementById('export-progress-wrap');
    const resultBox = document.getElementById('export-result-box');
    const startBtn = document.getElementById('btn-start-export');
    const bar = document.getElementById('progress-bar-fill');
    const statusTxt = document.getElementById('export-status-text');
    const percentTxt = document.getElementById('export-percent-text');

    if (progressWrap) progressWrap.classList.remove('active');
    if (resultBox) resultBox.classList.remove('active');
    if (startBtn) {
      startBtn.style.display = 'inline-flex';
      startBtn.disabled = false;
      startBtn.innerText = '🔥 Destpêkirina Daxistina 4K';
    }
    if (bar) bar.style.width = '0%';
    if (statusTxt) statusTxt.innerText = 'Amadekirin...';
    if (percentTxt) percentTxt.innerText = '0%';
  }

  async startExport() {
    if (this.isExporting) return;
    const engine = window.videoEngine;
    if (!engine || !engine.video) return;

    this.isExporting = true;
    this.recordedChunks = [];

    const progressWrap = document.getElementById('export-progress-wrap');
    const startBtn = document.getElementById('btn-start-export');
    const resultBox = document.getElementById('export-result-box');
    const bar = document.getElementById('progress-bar-fill');
    const statusTxt = document.getElementById('export-status-text');
    const percentTxt = document.getElementById('export-percent-text');

    if (progressWrap) progressWrap.classList.add('active');
    if (resultBox) resultBox.classList.remove('active');
    if (startBtn) startBtn.style.display = 'none';

    // 1. Create Offscreen Canvas for Export
    const dims = this.getResolutionDimensions(this.selectedResolution, engine.aspectRatio);
    this.exportCanvas = document.createElement('canvas');
    this.exportCanvas.width = dims.w;
    this.exportCanvas.height = dims.h;
    this.exportCtx = this.exportCanvas.getContext('2d', { alpha: false });

    // 2. Setup Audio & Video Streams
    const fps = parseInt(document.getElementById('select-export-fps')?.value || 60);
    const canvasStream = this.exportCanvas.captureStream(fps);

    // Audio stream mixing
    let combinedStream = canvasStream;
    try {
      if (window.audioEngine && window.audioEngine.ctx) {
        const dest = window.audioEngine.ctx.createMediaStreamDestination();
        if (window.audioEngine.sourceNode) {
          window.audioEngine.sourceNode.connect(dest);
        }
        dest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      }
    } catch (e) {}

    // 3. Find Supported MimeType
    let mimeType = 'video/webm;codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: this.selectedBitrate
      });
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(combinedStream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.finishExport(mimeType);
    };

    // 4. Run Export Frame Loop
    const video = engine.video;
    const startT = engine.trimStart;
    const endT = engine.trimEnd;
    const duration = Math.max(0.1, endT - startT);

    video.pause();
    video.currentTime = startT;
    this.mediaRecorder.start(100);

    const onFrameTime = () => {
      if (!this.isExporting) return;

      const current = video.currentTime;
      const progress = Math.min(1.0, Math.max(0, (current - startT) / duration));
      const percent = Math.floor(progress * 100);

      if (bar) bar.style.width = `${percent}%`;
      if (percentTxt) percentTxt.innerText = `${percent}%`;
      if (statusTxt) statusTxt.innerText = `Çêkirina Çarçoveyan: ${engine.formatTime(current)} / ${engine.formatTime(endT)}`;

      // Render offscreen canvas with current parameters
      engine.renderFrame(this.exportCtx, dims.w, dims.h, current);

      if (current >= endT - 0.05) {
        // Complete
        video.removeEventListener('timeupdate', onFrameTime);
        video.pause();
        this.mediaRecorder.stop();
      }
    };

    video.addEventListener('timeupdate', onFrameTime);
    video.play().catch(() => {});
  }

  finishExport(mimeType) {
    this.isExporting = false;
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(this.recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);

    const resultBox = document.getElementById('export-result-box');
    const downloadBtn = document.getElementById('btn-download-video');
    const previewVideo = document.getElementById('export-preview-video');
    const progressWrap = document.getElementById('export-progress-wrap');

    if (progressWrap) progressWrap.classList.remove('active');
    if (resultBox) resultBox.classList.add('active');

    const fileName = `hadipro_4k_${this.selectedResolution}_${Date.now()}.${ext}`;

    if (downloadBtn) {
      downloadBtn.href = url;
      downloadBtn.download = fileName;
      downloadBtn.innerHTML = `⬇️ Vîdyoya ${this.selectedResolution.toUpperCase()} Daxîne (${(blob.size / (1024 * 1024)).toFixed(1)} MB)`;
    }

    if (previewVideo) {
      previewVideo.src = url;
      previewVideo.style.display = 'block';
    }

    if (window.audioEngine) {
      window.audioEngine.playExportSuccess();
    }
  }

  cancelExport() {
    this.isExporting = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.resetExportUI();
  }

  // High-Resolution 4K Snapshot PNG Download
  capture4KSnapshot() {
    const engine = window.videoEngine;
    if (!engine || !engine.video) return;

    const dims = this.getResolutionDimensions('4k', engine.aspectRatio);
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = dims.w;
    snapCanvas.height = dims.h;
    const snapCtx = snapCanvas.getContext('2d');

    engine.renderFrame(snapCtx, dims.w, dims.h, engine.video.currentTime);

    snapCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hadipro_4k_frame_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      if (window.audioEngine) window.audioEngine.playExportSuccess();
    }, 'image/png');
  }
}

// Global instance
window.exportEngine = new ExportEngine();
