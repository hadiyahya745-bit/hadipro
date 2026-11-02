/* ==========================================================================
   HADIPRO 4K - Main Application Controller
   Created for: hadiiyahya77
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Cyber Background Animation
  new window.CyberBackground();

  // 2. Initialize Video & Audio Engines
  const videoEl = document.getElementById('source-video');
  const canvasEl = document.getElementById('main-canvas');
  window.videoEngine.init(videoEl, canvasEl);

  // 3. UI Sound Bindings
  bindSoundEffects();

  // 4. File Upload & Drag-and-Drop
  bindFileUpload();

  // 5. Tool Tabs Switching
  bindToolTabs();

  // 6. Aspect Ratio Controls
  bindAspectRatios();

  // 7. Video Filter Sliders & Presets
  bindFiltersAndPresets();

  // 8. Visual FX Toggles
  bindFXToggles();

  // 9. Captions & Subtitles Engine Controls
  bindCaptionsUI();

  // 10. Timeline & Trimming Scrubber
  bindTimeline();

  // 11. Audio & SFX Board
  bindAudioTab();

  // 12. Watermark & Logo Controls
  bindWatermark();

  // 13. Export Suite & 4K Snapshot
  bindExportUI();

  // 14. Demo Video Generator Button
  bindDemoButton();

  // 15. Language Toggle (Kurdish Badini / English)
  bindLanguageToggle();

  // 16. Keyboard Shortcuts
  bindKeyboardShortcuts();
});

// --- Sound Effects Binding ---
function bindSoundEffects() {
  const audio = window.audioEngine;

  document.querySelectorAll('.btn, .aspect-btn, .tab-btn, .quality-card, .preset-card, .caption-style-card').forEach(el => {
    el.addEventListener('mouseenter', () => audio.playHover());
  });

  const muteBtn = document.getElementById('btn-mute-sound');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      muteBtn.classList.toggle('active', isMuted);
      muteBtn.innerHTML = isMuted ? '🔇 Deng Girtî' : '🔊 Dengê UI';
      if (!isMuted) audio.playClick();
    });
  }
}

// --- File Upload & Drag-and-Drop ---
function bindFileUpload() {
  const uploadBox = document.getElementById('upload-box');
  const fileInput = document.getElementById('file-upload-input');
  const uploadHero = document.getElementById('upload-hero');
  const studioLayout = document.getElementById('studio-layout');
  const newVideoBtn = document.getElementById('btn-new-video');

  const handleVideoFile = (file) => {
    if (!file || !file.type.startsWith('video/')) {
      alert("Ji kerema xwe pelê vîdyoyê hilbijêre (MP4, WEBM, MOV...)");
      return;
    }

    const url = URL.createObjectURL(file);
    loadVideoSource(url, file.name, (file.size / (1024 * 1024)).toFixed(1) + ' MB');
  };

  if (uploadBox && fileInput) {
    uploadBox.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleVideoFile(e.target.files[0]);
      }
    });

    uploadBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadBox.classList.add('drag-over');
    });

    uploadBox.addEventListener('dragleave', () => {
      uploadBox.classList.remove('drag-over');
    });

    uploadBox.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadBox.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleVideoFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (newVideoBtn) {
    newVideoBtn.addEventListener('click', () => {
      if (confirm("Tu dixwazî vîdyoyek nû bar bikî?")) {
        uploadHero.style.display = 'flex';
        studioLayout.style.display = 'none';
        window.videoEngine.pause();
        window.videoEngine.video.src = '';
        if (window.audioEngine) window.audioEngine.playWhoosh();
      }
    });
  }
}

function loadVideoSource(url, name = 'Video', size = '') {
  const video = window.videoEngine.video;
  const uploadHero = document.getElementById('upload-hero');
  const studioLayout = document.getElementById('studio-layout');
  const nameEl = document.getElementById('video-name-badge');
  const resBadge = document.getElementById('video-res-badge');

  video.src = url;
  video.load();

  uploadHero.style.display = 'none';
  studioLayout.style.display = 'flex';

  if (nameEl) nameEl.innerText = name;
  if (resBadge) resBadge.innerText = '4K Ready';

  window.captionsEngine.captions = [];
  window.captionsEngine.renderCaptionList();
  window.videoEngine.resetFilters();

  if (window.audioEngine) window.audioEngine.playExportSuccess();
}

// --- Tool Tabs ---
function bindToolTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${target}`);
      if (activeContent) activeContent.classList.add('active');

      if (window.audioEngine) window.audioEngine.playClick();
    });
  });
}

// --- Aspect Ratios ---
function bindAspectRatios() {
  document.querySelectorAll('.aspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.videoEngine.setAspectRatio(btn.dataset.aspect);
    });
  });
}

// --- Filters & Color Presets ---
function bindFiltersAndPresets() {
  const engine = window.videoEngine;

  // Preset Cards
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      engine.applyPreset(card.dataset.preset);
    });
  });

  const bindInput = (id, key, unit = '%') => {
    const range = document.getElementById(id);
    const label = document.getElementById(id + '-val');
    if (range) {
      range.addEventListener('input', (e) => {
        engine.filters[key] = parseFloat(e.target.value);
        if (label) label.innerText = e.target.value + unit;
      });
    }
  };

  bindInput('range-brightness', 'brightness', '%');
  bindInput('range-contrast', 'contrast', '%');
  bindInput('range-saturation', 'saturation', '%');
  bindInput('range-hue', 'hue', '°');
  bindInput('range-vignette', 'vignette', '%');
  bindInput('range-blur', 'blur', 'px');
  bindInput('range-sepia', 'sepia', '%');

  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      engine.resetFilters();
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
    });
  }
}

// --- Visual FX Toggles ---
function bindFXToggles() {
  const engine = window.videoEngine;
  const bindToggle = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        engine.fx[key] = e.target.checked;
        if (window.audioEngine) window.audioEngine.playTrim();
      });
    }
  };

  bindToggle('check-fx-glitch', 'glitch');
  bindToggle('check-fx-grain', 'grain');
  bindToggle('check-fx-shake', 'shake');
  bindToggle('check-fx-letterbox', 'letterbox');
  bindToggle('check-fx-scanlines', 'scanlines');
  bindToggle('check-fx-neonborder', 'neonBorder');

  // Speed Buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      engine.setSpeed(btn.dataset.speed);
    });
  });

  // Transform Controls
  const zoomRange = document.getElementById('range-zoom');
  if (zoomRange) {
    zoomRange.addEventListener('input', (e) => {
      engine.transform.zoom = parseFloat(e.target.value);
      document.getElementById('range-zoom-val').innerText = e.target.value + 'x';
    });
  }

  const rotateBtn = document.getElementById('btn-rotate-90');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      engine.transform.rotation = (engine.transform.rotation + 90) % 360;
      if (window.audioEngine) window.audioEngine.playAction();
    });
  }

  const flipHBtn = document.getElementById('btn-flip-h');
  if (flipHBtn) {
    flipHBtn.addEventListener('click', () => {
      engine.transform.flipH = !engine.transform.flipH;
      flipHBtn.classList.toggle('active', engine.transform.flipH);
      if (window.audioEngine) window.audioEngine.playTrim();
    });
  }
}

// --- Captions & Subtitles ---
function bindCaptionsUI() {
  const ce = window.captionsEngine;
  const ve = window.videoEngine;

  // Style Selection Cards
  document.querySelectorAll('.caption-style-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.caption-style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      ce.activeStyle = card.dataset.style;
      if (window.audioEngine) window.audioEngine.playClick();
    });
  });

  // Auto Captions Preset
  const autoBtn = document.getElementById('btn-auto-captions');
  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      const dur = ve.video?.duration || 10;
      ce.generateAutoCaptions(dur);
    });
  }

  // Add Caption Button
  const addBtn = document.getElementById('btn-add-caption');
  const textInput = document.getElementById('caption-input');
  const startInput = document.getElementById('caption-start');
  const endInput = document.getElementById('caption-end');

  if (addBtn && textInput) {
    addBtn.addEventListener('click', () => {
      const text = textInput.value;
      const start = parseFloat(startInput.value) || ve.video.currentTime;
      const end = parseFloat(endInput.value) || (start + 2.5);

      if (text.trim()) {
        ce.addCaption(start, end, text);
        textInput.value = '';
        startInput.value = (end + 0.2).toFixed(1);
        endInput.value = (end + 2.7).toFixed(1);
        if (window.audioEngine) window.audioEngine.playAction();
      }
    });
  }

  // Set Current Time Button
  const setStartBtn = document.getElementById('btn-set-cur-start');
  if (setStartBtn && startInput) {
    setStartBtn.addEventListener('click', () => {
      startInput.value = ve.video.currentTime.toFixed(1);
      if (window.audioEngine) window.audioEngine.playTrim();
    });
  }

  // Speech to Text Mic
  const micBtn = document.getElementById('btn-speech-mic');
  if (micBtn) {
    micBtn.addEventListener('click', () => ce.toggleSpeech());
  }

  // Font Size Slider
  const fontRange = document.getElementById('range-caption-size');
  if (fontRange) {
    fontRange.addEventListener('input', (e) => {
      ce.globalFontSize = parseInt(e.target.value);
      document.getElementById('range-caption-size-val').innerText = e.target.value + 'px';
    });
  }

  // Position Y Slider
  const posRange = document.getElementById('range-caption-posy');
  if (posRange) {
    posRange.addEventListener('input', (e) => {
      ce.globalPosY = parseInt(e.target.value);
      document.getElementById('range-caption-posy-val').innerText = e.target.value + '%';
    });
  }

  // Color Pickers
  const textColor = document.getElementById('caption-text-color');
  if (textColor) {
    textColor.addEventListener('input', (e) => { ce.globalTextColor = e.target.value; });
  }

  const hlColor = document.getElementById('caption-hl-color');
  if (hlColor) {
    hlColor.addEventListener('input', (e) => { ce.globalHighlightColor = e.target.value; });
  }

  // SRT Import / Export
  const importInput = document.getElementById('srt-import-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => ce.importSRT(ev.target.result);
        reader.readAsText(e.target.files[0]);
      }
    });
  }

  const exportSrtBtn = document.getElementById('btn-export-srt');
  if (exportSrtBtn) {
    exportSrtBtn.addEventListener('click', () => ce.exportSRT());
  }
}

// --- Timeline & Trimmer ---
function bindTimeline() {
  const ve = window.videoEngine;
  const container = document.getElementById('timeline-container');
  const handleStart = document.getElementById('trim-handle-start');
  const handleEnd = document.getElementById('trim-handle-end');
  const selRange = document.getElementById('timeline-selection-range');

  const updateRangeVisual = () => {
    if (!ve.video || !ve.video.duration) return;
    const dur = ve.video.duration;
    const left = (ve.trimStart / dur) * 100;
    const right = (ve.trimEnd / dur) * 100;

    if (handleStart) handleStart.style.left = `${left}%`;
    if (handleEnd) handleEnd.style.left = `${right}%`;
    if (selRange) {
      selRange.style.left = `${left}%`;
      selRange.style.width = `${Math.max(0, right - left)}%`;
    }
  };

  if (container) {
    container.addEventListener('click', (e) => {
      if (!ve.video || !ve.video.duration) return;
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      ve.seek(percent * ve.video.duration);
    });
  }

  // Handle Dragging Logic
  const setupDrag = (handle, isStart) => {
    if (!handle) return;
    let dragging = false;

    const onMove = (e) => {
      if (!dragging || !ve.video || !ve.video.duration) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = container.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = percent * ve.video.duration;

      if (isStart) {
        ve.trimStart = Math.min(time, ve.trimEnd - 0.5);
      } else {
        ve.trimEnd = Math.max(time, ve.trimStart + 0.5);
      }

      updateRangeVisual();
      ve.updateTimeDisplay();
    };

    const onUp = () => {
      if (dragging) {
        dragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        if (window.audioEngine) window.audioEngine.playTrim();
      }
    };

    const onDown = (e) => {
      e.stopPropagation();
      dragging = true;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove);
      document.addEventListener('touchend', onUp);
    };

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown);
  };

  setupDrag(handleStart, true);
  setupDrag(handleEnd, false);

  // Playback control buttons
  const playBtn = document.getElementById('btn-play-toggle');
  if (playBtn) playBtn.addEventListener('click', () => ve.togglePlay());

  const stepBackBtn = document.getElementById('btn-step-backward');
  if (stepBackBtn) stepBackBtn.addEventListener('click', () => ve.stepFrame(-1));

  const stepFwdBtn = document.getElementById('btn-step-forward');
  if (stepFwdBtn) stepFwdBtn.addEventListener('click', () => ve.stepFrame(1));

  const jumpBackBtn = document.getElementById('btn-jump-backward');
  if (jumpBackBtn) jumpBackBtn.addEventListener('click', () => ve.seek(ve.video.currentTime - 5));

  const jumpFwdBtn = document.getElementById('btn-jump-forward');
  if (jumpFwdBtn) jumpFwdBtn.addEventListener('click', () => ve.seek(ve.video.currentTime + 5));

  // Sync initial range when metadata loads
  ve.video.addEventListener('loadedmetadata', updateRangeVisual);
}

// --- Audio Tab & SFX Board ---
function bindAudioTab() {
  const audio = window.audioEngine;
  const ve = window.videoEngine;

  // SFX Buttons
  document.querySelectorAll('.sfx-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.triggerSFX(btn.dataset.sfx);
    });
  });

  // Cyber Beat Generator Toggle
  const beatBtn = document.getElementById('btn-cyber-beat');
  if (beatBtn) {
    beatBtn.addEventListener('click', () => {
      const isPlaying = audio.toggleCyberBeat();
      beatBtn.classList.toggle('active', isPlaying);
      beatBtn.innerHTML = isPlaying ? '⏹️ Muzîka Cyber Rawestîne' : '🎵 Muzîka Cyber Lêbide';
    });
  }

  // Volume Slider
  const volRange = document.getElementById('range-video-volume');
  if (volRange) {
    volRange.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      ve.setVolume(val);
      document.getElementById('range-video-volume-val').innerText = Math.round(val * 100) + '%';
    });
  }
}

// --- Watermark Tab ---
function bindWatermark() {
  const ve = window.videoEngine;

  const wmText = document.getElementById('watermark-text-input');
  if (wmText) {
    wmText.addEventListener('input', (e) => {
      ve.watermark.text = e.target.value;
    });
  }

  const wmEnable = document.getElementById('check-watermark-enable');
  if (wmEnable) {
    wmEnable.addEventListener('change', (e) => {
      ve.watermark.enabled = e.target.checked;
    });
  }

  const wmOpacity = document.getElementById('range-watermark-opacity');
  if (wmOpacity) {
    wmOpacity.addEventListener('input', (e) => {
      ve.watermark.opacity = parseFloat(e.target.value) / 100;
      document.getElementById('range-watermark-opacity-val').innerText = e.target.value + '%';
    });
  }

  const wmPos = document.getElementById('select-watermark-pos');
  if (wmPos) {
    wmPos.addEventListener('change', (e) => {
      ve.watermark.position = e.target.value;
    });
  }

  const logoInput = document.getElementById('watermark-logo-file');
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const img = new Image();
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = () => { ve.watermark.logoImage = img; };
      }
    });
  }
}

// --- Export UI ---
function bindExportUI() {
  const ee = window.exportEngine;

  const exportBtn = document.getElementById('btn-open-export');
  if (exportBtn) exportBtn.addEventListener('click', () => ee.openExportModal());

  const closeBtn = document.getElementById('btn-close-modal');
  if (closeBtn) closeBtn.addEventListener('click', () => ee.closeExportModal());

  const startBtn = document.getElementById('btn-start-export');
  if (startBtn) startBtn.addEventListener('click', () => ee.startExport());

  // Quality Cards
  document.querySelectorAll('.quality-card').forEach(card => {
    card.addEventListener('click', () => ee.selectQuality(card.dataset.res));
  });

  // 4K Snapshot Button
  const snapBtn = document.getElementById('btn-snapshot-4k');
  if (snapBtn) snapBtn.addEventListener('click', () => ee.capture4KSnapshot());
}

// --- Demo Video Button ---
function bindDemoButton() {
  const demoBtn = document.getElementById('btn-load-demo');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      demoBtn.disabled = true;
      demoBtn.innerHTML = '⏳ Çêkirina Vîdyoyê...';
      if (window.audioEngine) window.audioEngine.playWhoosh();

      window.generateDemoVideo((url) => {
        demoBtn.disabled = false;
        demoBtn.innerHTML = '🎬 Vîdyoya Nimûne ya 4K';
        loadVideoSource(url, "HadiPro_4K_Demo_Reel.webm", "4.2 MB");
        // Add sample captions automatically
        setTimeout(() => {
          window.captionsEngine.generateAutoCaptions(8);
        }, 300);
      });
    });
  }
}

// --- Language Switcher ---
function bindLanguageToggle() {
  const langBtn = document.getElementById('btn-lang-toggle');
  let currentLang = 'ku'; // Kurdish by default

  const dict = {
    ku: {
      uploadTitle: "Vîdyoya Xwe ya 4K Bar Bike",
      uploadSub: "Pelê vîdyoyê bikişîne vir an jî bitikîne da ku dest bi montaj û jêrsernavên 4K bikî",
      btnUpload: "Vîdyoyê Hilbijêre",
      btnDemo: "Bikaranîna Vîdyoya Nimûne",
      tabCaptions: "Jêrsernav",
      tabFilters: "Reng & Parzûn",
      tabFX: "Bandor",
      tabAudio: "Deng & SFX",
      tabLogo: "Logoy",
      btnExport: "Daxistina 4K UHD"
    },
    en: {
      uploadTitle: "Upload Your 4K Video",
      uploadSub: "Drag and drop your video file here or click to start editing and styling 4K captions",
      btnUpload: "Select Video File",
      btnDemo: "Try 4K Demo Video",
      tabCaptions: "Captions",
      tabFilters: "Color & Filters",
      tabFX: "Effects",
      tabAudio: "Audio & SFX",
      tabLogo: "Watermark",
      btnExport: "Export 4K UHD"
    }
  };

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'ku' ? 'en' : 'ku';
      langBtn.innerText = currentLang === 'ku' ? '🌐 Kurdî' : '🌐 English';

      const d = dict[currentLang];
      const ut = document.getElementById('text-upload-title');
      const us = document.getElementById('text-upload-sub');
      const bu = document.getElementById('text-btn-upload');
      const bd = document.getElementById('text-btn-demo');
      const be = document.getElementById('text-btn-export');

      if (ut) ut.innerText = d.uploadTitle;
      if (us) us.innerText = d.uploadSub;
      if (bu) bu.innerText = d.btnUpload;
      if (bd) bd.innerText = d.btnDemo;
      if (be) be.innerText = d.btnExport;

      if (window.audioEngine) window.audioEngine.playClick();
    });
  }
}

// --- Keyboard Shortcuts ---
function bindKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ignore if typing inside text inputs
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const ve = window.videoEngine;
    if (e.code === 'Space') {
      e.preventDefault();
      ve.togglePlay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      ve.seek(ve.video.currentTime - (e.shiftKey ? 5 : 1));
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      ve.seek(ve.video.currentTime + (e.shiftKey ? 5 : 1));
    } else if (e.code === 'KeyM') {
      ve.video.muted = !ve.video.muted;
    } else if (e.code === 'KeyS') {
      window.exportEngine.capture4KSnapshot();
    } else if (e.code === 'KeyE') {
      window.exportEngine.openExportModal();
    }
  });
}
