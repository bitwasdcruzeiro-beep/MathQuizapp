// ============================================
//  MATHQUIZ — SAVE SYSTEM (localStorage)
// ============================================

const SAVE_KEY = 'mathquiz_save';

const SaveSystem = {

  // Estado inicial zerado
  defaultState() {
    return {
      currentPhase: 1,
      totalScore: 0,
      audioEnabled: true,
      phases: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        unlocked: i === 0,   // apenas fase 1 desbloqueada no início
        completed: false,
        stars: 0,
        score: 0
      }))
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : this.defaultState();
    } catch {
      return this.defaultState();
    }
  },

  save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Erro ao salvar progresso:', e);
    }
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    return this.defaultState();
  },

  // Atualiza resultado de uma fase e desbloqueia a próxima
  updatePhase(state, phaseId, stars, score) {
    const phase = state.phases[phaseId - 1];
    phase.completed = true;
    phase.stars = Math.max(phase.stars, stars);  // mantém melhor resultado
    phase.score = Math.max(phase.score, score);

    // Desbloqueia próxima fase
    if (phaseId < 20) {
      state.phases[phaseId].unlocked = true;
    }

    state.totalScore = state.phases.reduce((acc, p) => acc + p.score, 0);
    state.currentPhase = Math.min(phaseId + 1, 20);

    this.save(state);
    return state;
  },

  toggleAudio(state) {
    state.audioEnabled = !state.audioEnabled;
    this.save(state);
    return state;
  }
};
