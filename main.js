// ============================================
//  MATHQUIZ — GAME CONTROLLER (main.js)
// ============================================

const Game = {
  state: null,

  init() {
    this.state = SaveSystem.load();
    Particles.init();
    AudioSystem.init(this.state.audioEnabled);
    this._bindAudioToggle();
    this.showScreen('screen-home');
    HomeScreen.init(this.state);
    AudioSystem.playBg();
  },

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.opacity = '0';
    });

    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      target.getBoundingClientRect(); // força reflow
      requestAnimationFrame(() => {
        target.style.opacity = '1';
      });
    }
  },

  _bindAudioToggle() {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.state = SaveSystem.toggleAudio(this.state);
      AudioSystem.toggle(this.state);
    });
  },

  // Botão JOGAR (começa do zero / vai ao mapa)
  startGame() {
    HomeScreen.teardown();
    MapScreen.init(this.state);
    this.showScreen('screen-map');
  },

  // Botão CONTINUAR (vai direto ao mapa na fase atual)
  continueGame() {
    HomeScreen.teardown();
    MapScreen.init(this.state);
    this.showScreen('screen-map');
  },

  // Botão voltar do mapa
  goHome() {
    this.showScreen('screen-home');
    HomeScreen.init(this.state);
  },

  startPhase(phaseId) {
    const phaseData = this.state.phases[phaseId - 1];
    if (!phaseData.unlocked) return;
    console.log(`Iniciando fase ${phaseId}`);
    // Aqui você vai plugar a tela de quiz no futuro
    this.showScreen('screen-quiz');
  },

  finishPhase(phaseId, hits, timeBonus, comboBonus) {
    const stars = calcStars(hits);
    const score = calcScore(hits, timeBonus, comboBonus);
    this.state = SaveSystem.updatePhase(this.state, phaseId, stars, score);
    MapScreen.refresh(this.state);
    this.showScreen('screen-result');
  }
};

document.addEventListener('DOMContentLoaded', () => Game.init());
