// ============================================
//  MATHQUIZ — AUDIO SYSTEM
// ============================================

const AudioSystem = {
  enabled: true,
  bgMusic: null,
  sounds: {},

  init(audioEnabled) {
    this.enabled = audioEnabled;
    // Os arquivos de áudio serão carregados quando existirem
    // Por enquanto, sistema preparado para receber os arquivos
    this._setupSounds();
    this._updateToggleBtn();
  },

  _setupSounds() {
    // Estrutura pronta — arquivos serão adicionados na etapa de assets
    const soundMap = {
      bgMusic:  'assets/audio/bg_music.mp3',
      victory:  'assets/audio/victory.mp3',
      defeat:   'assets/audio/defeat.mp3',
    };

    Object.entries(soundMap).forEach(([key, src]) => {
      const audio = new Audio(src);
      if (key === 'bgMusic') {
        audio.loop = true;
        audio.volume = 0.4;
        this.bgMusic = audio;
      } else {
        audio.volume = 0.8;
        this.sounds[key] = audio;
      }
    });
  },

  playBg() {
    if (!this.enabled || !this.bgMusic) return;
    this.bgMusic.currentTime = 0;
    this.bgMusic.play().catch(() => {});
  },

  stopBg() {
    if (this.bgMusic) this.bgMusic.pause();
  },

  play(name) {
    if (!this.enabled) return;
    const s = this.sounds[name];
    if (s) {
      s.currentTime = 0;
      s.play().catch(() => {});
    }
  },

  toggle(state) {
    this.enabled = state.audioEnabled;
    this._updateToggleBtn();
    if (this.enabled) {
      this.playBg();
    } else {
      this.stopBg();
      // Para todos os sons em andamento
      Object.values(this.sounds).forEach(s => { s.pause(); s.currentTime = 0; });
    }
  },

  _updateToggleBtn() {
    const btn = document.getElementById('audio-toggle');
    if (btn) btn.textContent = this.enabled ? '🔊' : '🔇';
  }
};
