// ============================================
//  MATHQUIZ — TELA DE QUIZ (quiz.js)
// ============================================

const QuizScreen = {

  // ── Estado interno ──────────────────────────────────────────
  phaseId:       null,
  questions:     [],
  currentQ:      0,
  lives:         3,
  hits:          0,
  totalTimeBonus: 0,
  combo:         0,
  maxCombo:      0,
  currentScore:  0,
  timerInterval: null,
  timeLeft:      15,
  TIMER_MAX:     15,
  locked:        false,   // bloqueia cliques durante feedback
  operatorInfo:  null,

  // ── Init ────────────────────────────────────────────────────
  init(state, phaseId) {
    this._reset(phaseId);
    this.questions    = getPhaseQuestions(phaseId);
    this.operatorInfo = getPhaseInfo(phaseId);
    this._render();
    this._showQuestion();
  },

  _reset(phaseId) {
    clearInterval(this.timerInterval);
    this.phaseId        = phaseId;
    this.questions      = [];
    this.currentQ       = 0;
    this.lives          = 3;
    this.hits           = 0;
    this.totalTimeBonus = 0;
    this.combo          = 0;
    this.maxCombo       = 0;
    this.currentScore   = 0;
    this.timeLeft       = this.TIMER_MAX;
    this.locked         = false;
  },

  // ── Render inicial do HTML da tela ──────────────────────────
  _render() {
    const opData  = OPERATORS[this.operatorInfo.operator];
    const screen  = document.getElementById('screen-quiz');

    screen.innerHTML = `
      <!-- HEADER -->
      <div class="quiz-header">
        <button class="quiz-btn-back" onclick="QuizScreen._confirmBack()">← Mapa</button>
        <div class="quiz-op-badge ${this.operatorInfo.operator}">
          <span class="quiz-op-symbol">${opData.symbol}</span>
          <span class="quiz-op-label">${opData.label}</span>
        </div>
        <div class="quiz-header-right">
          <div class="quiz-lives" id="quiz-lives"></div>
          <div class="quiz-score-display">
            <span class="quiz-score-label">pts</span>
            <span class="quiz-score-value" id="quiz-score-value">0</span>
          </div>
        </div>
      </div>

      <!-- PROGRESSO DE QUESTÕES -->
      <div class="quiz-progress-wrap">
        <div class="quiz-progress-steps" id="quiz-progress-steps"></div>
        <span class="quiz-progress-text" id="quiz-progress-text">1 / 5</span>
      </div>

      <!-- TIMER -->
      <div class="quiz-timer-wrap">
        <div class="quiz-timer-bar" id="quiz-timer-bar">
          <div class="quiz-timer-fill" id="quiz-timer-fill"></div>
        </div>
        <span class="quiz-timer-num" id="quiz-timer-num">15</span>
      </div>

      <!-- ÁREA DA QUESTÃO -->
      <div class="quiz-question-area">
        <div class="quiz-combo" id="quiz-combo" style="opacity:0"></div>
        <div class="quiz-question-card" id="quiz-question-card">
          <p class="quiz-expression" id="quiz-expression">…</p>
        </div>
      </div>

      <!-- GRADE DE RESPOSTAS -->
      <div class="quiz-answers-grid" id="quiz-answers-grid"></div>

      <!-- POPUP DE FEEDBACK -->
      <div class="quiz-feedback-popup" id="quiz-feedback-popup" style="display:none">
        <div class="quiz-feedback-inner" id="quiz-feedback-inner">
          <div class="quiz-feedback-icon" id="quiz-feedback-icon"></div>
          <div class="quiz-feedback-msg"  id="quiz-feedback-msg"></div>
          <div class="quiz-feedback-sub"  id="quiz-feedback-sub"></div>
        </div>
      </div>
    `;

    this._updateLives();
    this._updateProgressSteps();
  },

  // ── Mostra questão atual ─────────────────────────────────────
  _showQuestion() {
    if (this.currentQ >= this.questions.length) {
      this._endPhase();
      return;
    }

    this.locked   = false;
    this.timeLeft = this.TIMER_MAX;

    const q = this.questions[this.currentQ];

    // Expressão
    const exprEl = document.getElementById('quiz-expression');
    exprEl.textContent = q.expression + ' = ?';
    exprEl.classList.remove('pop');
    void exprEl.offsetWidth;
    exprEl.classList.add('pop');

    // Progresso
    document.getElementById('quiz-progress-text').textContent =
      `${this.currentQ + 1} / ${this.questions.length}`;
    this._updateProgressSteps();

    // Botões de resposta
    const grid = document.getElementById('quiz-answers-grid');
    grid.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = 'quiz-answer-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => this._answer(opt, q.correct, btn));
      grid.appendChild(btn);
    });

    // Timer
    this._startTimer();
  },

  // ── Timer ────────────────────────────────────────────────────
  _startTimer() {
    clearInterval(this.timerInterval);
    this._updateTimerUI();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this._updateTimerUI();

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this._timeUp();
      }
    }, 1000);
  },

  _updateTimerUI() {
    const fill    = document.getElementById('quiz-timer-fill');
    const numEl   = document.getElementById('quiz-timer-num');
    if (!fill || !numEl) return;

    const pct     = (this.timeLeft / this.TIMER_MAX) * 100;
    fill.style.width = pct + '%';
    numEl.textContent = this.timeLeft;

    // Muda cor nos últimos 5s
    const danger  = this.timeLeft <= 5;
    fill.classList.toggle('danger', danger);
    numEl.classList.toggle('danger', danger);
  },

  _timeUp() {
    if (this.locked) return;
    this.locked = true;
    this.combo  = 0;
    this._updateCombo();
    this._loseLife();

    // Destaca resposta correta
    this._highlightCorrect(this.questions[this.currentQ].correct);

    this._showFeedback(false, 0, null, true);
  },

  // ── Resposta ─────────────────────────────────────────────────
  _answer(chosen, correct, btn) {
    if (this.locked) return;
    this.locked = true;
    clearInterval(this.timerInterval);

    const isCorrect = chosen === correct;

    if (isCorrect) {
      this.hits++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      // Bônus de tempo: até 50pts proporcional ao tempo restante
      const tBonus = Math.floor((this.timeLeft / this.TIMER_MAX) * 50);
      // Bônus de combo: +20pts por acerto consecutivo além do 1º
      const cBonus = Math.max(0, (this.combo - 1) * 20);
      const pts    = 100 + tBonus + cBonus;

      this.totalTimeBonus += tBonus;
      this.currentScore   += pts;

      btn.classList.add('correct');
      this._updateScore();
      this._updateCombo();
      this._showFeedback(true, pts);
    } else {
      this.combo = 0;
      this._updateCombo();
      btn.classList.add('wrong');
      this._highlightCorrect(correct);
      this._loseLife();
      this._showFeedback(false, 0, correct);
    }
  },

  _highlightCorrect(correct) {
    document.querySelectorAll('.quiz-answer-btn').forEach(b => {
      if (parseInt(b.textContent) === correct || b.textContent == correct) {
        b.classList.add('correct');
      }
    });
  },

  // ── Vidas ────────────────────────────────────────────────────
  _loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this._updateLives();
  },

  _updateLives() {
    const el = document.getElementById('quiz-lives');
    if (!el) return;
    el.innerHTML = [1,2,3].map(i =>
      `<span class="quiz-heart ${i <= this.lives ? 'alive' : 'lost'}">❤</span>`
    ).join('');
  },

  // ── Score ────────────────────────────────────────────────────
  _updateScore() {
    const el = document.getElementById('quiz-score-value');
    if (el) el.textContent = this.currentScore;
  },

  // ── Combo display ─────────────────────────────────────────────
  _updateCombo() {
    const el = document.getElementById('quiz-combo');
    if (!el) return;
    if (this.combo >= 2) {
      el.textContent = `🔥 COMBO ×${this.combo}`;
      el.style.opacity = '1';
      el.classList.remove('combo-pop');
      void el.offsetWidth;
      el.classList.add('combo-pop');
    } else {
      el.style.opacity = '0';
    }
  },

  // ── Progresso steps ──────────────────────────────────────────
  _updateProgressSteps() {
    const el = document.getElementById('quiz-progress-steps');
    if (!el) return;
    el.innerHTML = this.questions.map((_, i) => {
      let cls = 'step';
      if (i < this.currentQ) cls += ' done';
      else if (i === this.currentQ) cls += ' active';
      return `<span class="${cls}"></span>`;
    }).join('');
  },

  // ── Feedback popup ───────────────────────────────────────────
  _showFeedback(correct, pts, wrongAnswer = null, timeout = false) {
    const popup = document.getElementById('quiz-feedback-popup');
    const inner = document.getElementById('quiz-feedback-inner');
    const icon  = document.getElementById('quiz-feedback-icon');
    const msg   = document.getElementById('quiz-feedback-msg');
    const sub   = document.getElementById('quiz-feedback-sub');

    if (correct) {
      inner.className = 'quiz-feedback-inner correct';
      icon.textContent = '✓';
      msg.textContent  = 'Correto!';
      sub.textContent  = `+${pts} pontos${this.combo >= 2 ? ` · Combo ×${this.combo}!` : ''}`;
    } else if (timeout) {
      inner.className = 'quiz-feedback-inner wrong';
      icon.textContent = '⏱';
      msg.textContent  = 'Tempo esgotado!';
      sub.textContent  = this.lives > 0
        ? `Resta${this.lives === 1 ? '' : 'm'} ${this.lives} vida${this.lives === 1 ? '' : 's'}`
        : 'Sem vidas!';
    } else {
      inner.className = 'quiz-feedback-inner wrong';
      icon.textContent = '✕';
      msg.textContent  = 'Errado!';
      sub.textContent  = `Resposta: ${wrongAnswer}`;
    }

    popup.style.display = 'flex';
    // força reflow para animação
    void popup.offsetWidth;
    popup.classList.add('visible');

    setTimeout(() => {
      popup.classList.remove('visible');
      setTimeout(() => {
        popup.style.display = 'none';
        this._afterFeedback();
      }, 250);
    }, 1200);
  },

  _afterFeedback() {
    // Sem vidas → falhou
    if (this.lives <= 0) {
      Game.failPhase(this.phaseId);
      return;
    }

    this.currentQ++;

    if (this.currentQ >= this.questions.length) {
      this._endPhase();
    } else {
      this._showQuestion();
    }
  },

  // ── Fim de fase ──────────────────────────────────────────────
  _endPhase() {
    clearInterval(this.timerInterval);
    // comboBonus = acertos × combo máximo atingido × 10
    const comboBonus = this.maxCombo * this.hits * 10;
    Game.finishPhase(this.phaseId, this.hits, this.totalTimeBonus, comboBonus);
  },

  // ── Voltar ao mapa ───────────────────────────────────────────
  _confirmBack() {
    clearInterval(this.timerInterval);
    // Confirmação simples — em versão futura pode virar modal
    if (confirm('Deseja sair da fase? O progresso será perdido.')) {
      Game.goMap();
    } else {
      // Retoma timer
      this._startTimer();
    }
  },

  // ── Teardown ─────────────────────────────────────────────────
  teardown() {
    clearInterval(this.timerInterval);
  }
};
