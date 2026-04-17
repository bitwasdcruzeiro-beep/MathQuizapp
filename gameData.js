// ============================================
//  MATHQUIZ — GAME DATA
//  Configuração das fases, operadores e questões
// ============================================

const OPERATORS = {
  sum: {
    id: 'sum',
    symbol: '+',
    label: 'Adição',
    bg: '#0a0f2c',
    accentColor: '#4fc3f7',
    phases: [1, 2, 3, 4, 5]
  },
  sub: {
    id: 'sub',
    symbol: '-',
    label: 'Subtração',
    bg: '#1a0a3c',
    accentColor: '#c084fc',
    phases: [6, 7, 8, 9, 10]
  },
  mul: {
    id: 'mul',
    symbol: '×',
    label: 'Multiplicação',
    bg: '#1a0630',
    accentColor: '#e9d5ff',
    phases: [11, 12, 13, 14, 15]
  },
  div: {
    id: 'div',
    symbol: '÷',
    label: 'Divisão',
    bg: '#061a2c',
    accentColor: '#a8d4f5',
    phases: [16, 17, 18, 19, 20]
  }
};

// Gerador de questões por operador e nível de fase (1-5)
function generateQuestion(operator, phaseLevel) {
  let a, b, correct;

  switch (operator) {
    case 'sum':
      // Nível 1: 1+1 a 5+5 | Nível 5: 20+20 a 50+50
      a = rand(phaseLevel, phaseLevel * 10);
      b = rand(phaseLevel, phaseLevel * 10);
      correct = a + b;
      return buildQuestion(`${a} + ${b}`, correct);

    case 'sub':
      // Garante resultado positivo
      a = rand(phaseLevel * 5, phaseLevel * 15);
      b = rand(1, a);
      correct = a - b;
      return buildQuestion(`${a} - ${b}`, correct);

    case 'mul':
      // Nível 1: tabuada do 2 | Nível 5: até 12x12
      a = rand(2, phaseLevel + 3);
      b = rand(2, phaseLevel + 3);
      correct = a * b;
      return buildQuestion(`${a} × ${b}`, correct);

    case 'div':
      // Sempre divisão exata
      b = rand(2, phaseLevel + 2);
      correct = rand(2, phaseLevel + 3);
      a = b * correct;
      return buildQuestion(`${a} ÷ ${b}`, correct);
  }
}

function buildQuestion(expression, correct) {
  const options = generateOptions(correct);
  return { expression, correct, options };
}

function generateOptions(correct) {
  const opts = new Set([correct]);

  // Uma opção sempre próxima (±1 ou ±2)
  const close = correct + (Math.random() > 0.5 ? 1 : -1);
  if (close > 0) opts.add(close);

  // Outras opções aleatórias mas plausíveis
  while (opts.size < 4) {
    const offset = rand(-Math.max(3, Math.floor(correct * 0.3)), Math.max(3, Math.floor(correct * 0.3)));
    const candidate = correct + offset;
    if (candidate > 0 && candidate !== correct) opts.add(candidate);
  }

  return shuffle([...opts]);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Mapeia fase (1-20) para operador e nível interno (1-5)
function getPhaseInfo(phase) {
  if (phase <= 5)  return { operator: 'sum', level: phase };
  if (phase <= 10) return { operator: 'sub', level: phase - 5 };
  if (phase <= 15) return { operator: 'mul', level: phase - 10 };
  return { operator: 'div', level: phase - 15 };
}

// Questões por fase (5 questões cada)
function getPhaseQuestions(phase) {
  const { operator, level } = getPhaseInfo(phase);
  return Array.from({ length: 5 }, () => generateQuestion(operator, level));
}

// Estrelas baseado em acertos (0-5)
function calcStars(hits) {
  if (hits >= 5) return 3;
  if (hits >= 3) return 2;
  if (hits >= 1) return 1;
  return 0;
}

// Pontuação: acertos + bônus de tempo + combo
function calcScore(hits, timeBonus, comboBonus) {
  return (hits * 100) + timeBonus + comboBonus;
}
