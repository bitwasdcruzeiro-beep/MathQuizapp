// ============================================
//  MATHQUIZ — MAPA DE FASES (map.js)
// ============================================

const MapScreen = {

  OPERATORS: [
    { id: 'sum', label: 'Adição',         symbol: '+', phases: [1,2,3,4,5] },
    { id: 'sub', label: 'Subtração',      symbol: '−', phases: [6,7,8,9,10] },
    { id: 'mul', label: 'Multiplicação',  symbol: '×', phases: [11,12,13,14,15] },
    { id: 'div', label: 'Divisão',        symbol: '÷', phases: [16,17,18,19,20] },
  ],

  init(state) {
    this._render(state);
  },

  _render(state) {
    const screen = document.getElementById('screen-map');
    screen.innerHTML = this._buildHTML(state);
    this._bindEvents(state);
  },

  _buildHTML(state) {
    const totalScore = state.totalScore || 0;

    const sections = this.OPERATORS.map((op, idx) => {
      const completedInOp = op.phases.filter(id => state.phases[id - 1].completed).length;
      const progressPct   = (completedInOp / 5) * 100;

      const cards = op.phases.map(phaseId => {
        const phase = state.phases[phaseId - 1];
        const isLocked    = !phase.unlocked;
        const isCompleted = phase.completed;
        const isCurrent   = phaseId === state.currentPhase && !isCompleted;

        let stateClass = 'locked';
        if (isCompleted)    stateClass = 'completed';
        else if (!isLocked) stateClass = 'available';
        if (isCurrent)      stateClass += ' current';

        const stars = this._renderStars(phase.stars);
        const inner = isLocked
          ? `<span class="phase-lock-icon">🔒</span>`
          : `<span class="phase-number">${phaseId}</span>${stars}`;

        return `
          <div class="phase-card ${stateClass}"
               data-phase="${phaseId}"
               title="Fase ${phaseId}${isLocked ? ' — Bloqueada' : ''}">
            ${inner}
          </div>`;
      }).join('');

      const divider = idx < 3 ? '<div class="operator-divider"></div>' : '';

      return `
        <div class="operator-section" style="animation-delay:${idx * 0.1}s">
          <div class="operator-header">
            <div class="operator-icon ${op.id}">${op.symbol}</div>
            <div class="operator-info">
              <span class="operator-name">${op.label}</span>
              <span class="operator-progress-text">${completedInOp}/5 fases completas</span>
            </div>
            <div class="operator-progress-bar">
              <div class="operator-progress-fill ${op.id}" style="width:${progressPct}%"></div>
            </div>
          </div>
          <div class="phases-grid">${cards}</div>
        </div>
        ${divider}`;
    }).join('');

    return `
      <div class="map-header">
        <button class="btn-back-home" onclick="Game.goHome()">← Início</button>
        <span class="map-header-title">FASES</span>
        <div class="map-total-score">⭐ <span>${totalScore}</span> pts</div>
      </div>
      <div class="map-content">${sections}</div>`;
  },

  _renderStars(count) {
    const stars = [1,2,3].map(i =>
      `<span class="star ${i <= count ? 'filled' : ''}">★</span>`
    ).join('');
    return `<div class="phase-stars">${stars}</div>`;
  },

  _bindEvents(state) {
    document.querySelectorAll('.phase-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        const phaseId = parseInt(card.dataset.phase);
        Game.startPhase(phaseId);
      });
    });
  },

  // Atualiza o mapa sem re-renderizar tudo (chamado após terminar uma fase)
  refresh(state) {
    this._render(state);
  }
};
