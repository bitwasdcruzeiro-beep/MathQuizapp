// ============================================
//  MATHQUIZ — TELA INICIAL (home.js)
// ============================================

const HomeScreen = {

  bubbleMessages: [
    'Vamos contar! 🚀',
    'Eu adoro matemática!',
    'Você consegue! 💪',
    'Pronto pra jogar?',
    'Calcule comigo! ⚡',
    'Seja um gênio! 🧠',
  ],

  bubbleTimer: null,

  init(state) {
    this._renderCharacterMood('idle');
    this._startBubbleCycle();
    this._updateButtons(state);
  },

  // ---- ATUALIZA BOTÕES conforme save ----
  _updateButtons(state) {
    const hasProgress = state.phases.some(p => p.completed);
    const btnContinue = document.getElementById('btn-continue');
    const savedInfo   = document.getElementById('saved-info');

    if (hasProgress) {
      btnContinue.style.display = 'inline-flex';
      savedInfo.style.display   = 'block';
      savedInfo.innerHTML =
        `Fase <span>${state.currentPhase}</span> · <span>${state.totalScore}</span> pts`;
    } else {
      btnContinue.style.display = 'none';
      savedInfo.style.display   = 'none';
    }
  },

  // ---- CICLO DE BALÕES DE FALA ----
  _startBubbleCycle() {
    this._showBubble();
    this.bubbleTimer = setInterval(() => this._showBubble(), 4500);
  },

  _showBubble() {
    const bubble = document.getElementById('speech-bubble');
    if (!bubble) return;

    // Fade out → troca texto → fade in
    bubble.style.opacity = '0';
    setTimeout(() => {
      const msgs = this.bubbleMessages;
      bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
      bubble.style.opacity = '1';
    }, 200);
  },

  stopBubbleCycle() {
    clearInterval(this.bubbleTimer);
  },

  // ---- REAÇÕES DO PERSONAGEM ----
  _renderCharacterMood(mood) {
    const svg = document.getElementById('character-svg');
    if (!svg) return;

    // Remove classes de reação
    svg.classList.remove('react-happy', 'react-sad');

    // Atualiza expressão facial no SVG
    const mouth    = document.getElementById('char-mouth');
    const eyeLeft  = document.getElementById('char-eye-left');
    const eyeRight = document.getElementById('char-eye-right');
    const blush    = document.getElementById('char-blush');

    if (!mouth) return;

    switch (mood) {
      case 'happy':
        mouth.setAttribute('d', 'M 38 68 Q 50 80 62 68');
        mouth.style.stroke = '#4fc3f7';
        eyeLeft.setAttribute('cy', '52');
        eyeRight.setAttribute('cy', '52');
        if (blush) blush.style.opacity = '1';
        svg.classList.add('react-happy');
        break;

      case 'sad':
        mouth.setAttribute('d', 'M 38 75 Q 50 65 62 75');
        mouth.style.stroke = '#c084fc';
        eyeLeft.setAttribute('cy', '55');
        eyeRight.setAttribute('cy', '55');
        if (blush) blush.style.opacity = '0';
        svg.classList.add('react-sad');
        break;

      default: // idle — sorriso neutro/feliz
        mouth.setAttribute('d', 'M 38 70 Q 50 80 62 70');
        mouth.style.stroke = '#4fc3f7';
        eyeLeft.setAttribute('cy', '52');
        eyeRight.setAttribute('cy', '52');
        if (blush) blush.style.opacity = '0.7';
        break;
    }
  },

  reactHappy() {
    this._renderCharacterMood('happy');
    setTimeout(() => this._renderCharacterMood('idle'), 2000);
  },

  reactSad() {
    this._renderCharacterMood('sad');
    setTimeout(() => this._renderCharacterMood('idle'), 2000);
  },

  // Chamado pelo Game quando vai para outra tela
  teardown() {
    this.stopBubbleCycle();
  }
};
