/* =============================================================
   Treinos — O plano de treino embutido

   Este ficheiro é o plano em si: dias, exercícios, séries, alvo de
   repetições e a carga de partida de cada um. É o único sítio a
   mexer quando revemos o plano ao fim da semana — sobe `versao`,
   actualiza `revisto` e escreve o que mudou em `notasDaRevisao`.

   Campos de cada exercício:
     ex        id do exercício no catálogo (js/exercises.js)
     series    séries de trabalho (o aquecimento fica de fora)
     reps      [mínimo, máximo] do alvo
     kg        carga de partida — o chão, não o tecto
     inc       incremento desta máquina/halteres (sobrepõe o catálogo)
     max       regista o que der, sem número previsto (peso do corpo)
     nota      linha a mostrar no cartão do exercício
     troca     alternativa e quando a usar
   ============================================================= */
(function (global) {
  'use strict';

  const PLANO = {
    id: 'nuno-2026-09',
    nome: 'Plano do Nuno',
    versao: 2,
    criadoEm: '2026-09-05',
    revisto: '2026-09-06',
    origem: 'Construído a partir dos 23 treinos registados entre 31 de Julho e 6 de Setembro de 2026',
    semanas: 8,                 // não mudar exercícios antes disto
    rotacao: 'Quatro dias em roda, sem estarem presos a dias da semana',
    descanso: { composto: 180, isolamento: 90 },
    rir: [1, 2],                // deixar 1 a 2 em reserva; última série de cada exercício 0 a 1
    notasDaRevisao: 'Versão 2. O histórico mostrou 20 séries de peito por semana contra 10 de '
      + 'costas — o dobro do que devia ser, e ao contrário do que as fotos pedem. As costas passam '
      + 'de 10 para 17 séries e de uma para duas sessões por semana; o peito desce para 10. '
      + 'Deltoide posterior sobe de 2 para 6, lateral de 6 para 8. As pernas deixam de ser um dia '
      + 'à sorte e passam a estar escritas. A roda passa de cinco para quatro dias, porque treinas '
      + '4,2 vezes por semana e assim fechas uma volta por semana. Quase todos os exercícios de '
      + 'polia foram trocados por halteres e máquinas, para as cargas deixarem de saltar.',

    regras: [
      'A mesma carga em todas as séries de trabalho. As repetições vão cair de série para série — é assim mesmo. Nos teus registos, 78% dos exercícios subiam a carga série a série: isso faz com que só a última série conte a sério e é o que tem escondido o teu progresso.',
      'As cargas escritas são o chão, não o tecto. Vieram dos teus registos. Se uma série sair fácil, acrescenta repetições — não pares no número impresso.',
      'Dupla progressão: chega ao topo do intervalo em todas as séries, sobe um incremento e recomeça no fundo do intervalo.',
      'Deixa 1 a 2 repetições em reserva em todas as séries, menos na última de cada exercício, onde podes ir a 0 ou 1.',
      'Nas polias, usa sempre a mesma máquina para o mesmo exercício e escreve nas notas qual foi. Duas polias com relações diferentes fazem os números saltar para o dobro, e a app fica sem saber se subiste ou desceste.',
      'Não trocar de exercícios durante 8 semanas. Registar todas as séries. Descanso de 2 a 3 minutos nos compostos, 90 segundos nos isolamentos.',
      'Para ganhar músculo a 72 kg, come acima da manutenção e dorme. Se o peso não subir umas 2 a 3 centenas de gramas por semana, não é o treino que está a travar.'
    ],

    /* Séries por rotação previstas por grupo */
    volumeAlvo: [
      { k: 'dorsais', nome: 'Dorsais', musculos: ['dorsais'], alvo: 17 },
      { k: 'peito', nome: 'Peito', musculos: ['peito'], alvo: 10 },
      { k: 'deltoide_lat', nome: 'Deltoide lateral', musculos: ['deltoide_lat'], alvo: 8 },
      { k: 'deltoide_post', nome: 'Deltoide posterior', musculos: ['deltoide_post'], alvo: 6 },
      { k: 'deltoide_ant', nome: 'Deltoide anterior', musculos: ['deltoide_ant'], alvo: 4 },
      { k: 'trapezio', nome: 'Trapézio', musculos: ['trapezio'], alvo: 3 },
      { k: 'biceps', nome: 'Bíceps', musculos: ['biceps'], alvo: 6 },
      { k: 'triceps', nome: 'Tríceps', musculos: ['triceps'], alvo: 6 },
      { k: 'quadriceps', nome: 'Quadríceps', musculos: ['quadriceps'], alvo: 9 },
      { k: 'isquiotibiais', nome: 'Isquiotibiais', musculos: ['isquiotibiais'], alvo: 4 },
      { k: 'gemeos', nome: 'Gémeos', musculos: ['gemeos'], alvo: 4 },
      { k: 'abdominais', nome: 'Abdominais', musculos: ['abdominais'], alvo: 3 }
    ],

    /* Ponto de controlo: são as costas que têm de se mexer nestas 8 semanas */
    controlo: {
      semana: 4,
      exercicios: ['puxada-frontal', 'remada-maquina'],
      texto: 'As costas são a prioridade deste plano. Se a puxada à frente e a remada na máquina '
        + 'não tiverem subido um degrau até aqui, o travão é a comida ou o sono, não o plano.'
    },

    dias: [
      {
        k: 'A',
        nome: 'Costas e bíceps',
        aquecimento: 'Puxada à frente 39 × 12 antes de começar.',
        nota: 'O dia mais importante do plano. Puxa com os cotovelos, não com as mãos.',
        exercicios: [
          { ex: 'puxada-frontal', series: 4, reps: [6, 10], kg: 52, inc: 7 },
          { ex: 'remada-maquina', series: 4, reps: [8, 12], kg: 52, inc: 7 },
          { ex: 'remada-baixa-polia', series: 3, reps: [10, 12], kg: 52, inc: 7, nota: 'Pega em V, junto ao corpo' },
          { ex: 'crucifixo-invertido-polia-uni', series: 3, reps: [12, 15], kg: 9, inc: 2.5, nota: 'Escreve nas notas qual das polias usaste' },
          { ex: 'rosca-inclinada', series: 3, reps: [8, 12], kg: 12, inc: 2 },
          { ex: 'rosca-martelo', series: 3, reps: [10, 14], kg: 12, inc: 2 }
        ]
      },
      {
        k: 'B',
        nome: 'Peito, tríceps e deltoide lateral',
        aquecimento: 'Supino inclinado com halteres 20 × 12.',
        nota: 'A mesma carga nas quatro séries do supino inclinado. Não subas série a série.',
        exercicios: [
          { ex: 'supino-inclinado-halteres', series: 4, reps: [6, 10], kg: 25, inc: 2 },
          { ex: 'press-peito-maquina', series: 3, reps: [8, 12], kg: 45, inc: 7 },
          { ex: 'peck-deck', series: 3, reps: [10, 15], kg: 12.5, inc: 2.5 },
          { ex: 'elevacoes-laterais', series: 4, reps: [12, 20], kg: 10, inc: 2 },
          { ex: 'triceps-polia-barra', series: 3, reps: [8, 12], kg: 27, inc: 7, nota: 'Escreve nas notas qual das polias usaste' },
          { ex: 'triceps-acima-cabeca', series: 3, reps: [10, 15], kg: 30, inc: 2 }
        ]
      },
      {
        k: 'C',
        nome: 'Pernas e core',
        aquecimento: 'Prensa de pernas 79 × 15.',
        exercicios: [
          { ex: 'agachamento-barra', series: 3, reps: [6, 10], kg: 60, inc: 5 },
          { ex: 'prensa-pernas', series: 3, reps: [10, 12], kg: 127, inc: 7 },
          { ex: 'flexao-pernas-sentado', series: 4, reps: [10, 12], kg: 66, inc: 7 },
          { ex: 'extensao-pernas', series: 3, reps: [12, 15], kg: 66, inc: 7 },
          { ex: 'gemeos-prensa', series: 4, reps: [12, 20], kg: 79, inc: 7 },
          { ex: 'crunch', series: 3, reps: [15, 20], kg: 20, inc: 5, nota: 'Banco inclinado, com peso' }
        ]
      },
      {
        k: 'D',
        nome: 'Ombros e costas',
        aquecimento: 'Elevações laterais 5 × 15 para aquecer o ombro.',
        exercicios: [
          { ex: 'press-ombros-halteres', series: 4, reps: [6, 10], kg: 22, inc: 2 },
          { ex: 'elevacoes-laterais', series: 4, reps: [12, 20], kg: 10, inc: 2 },
          { ex: 'puxada-supinada', series: 3, reps: [8, 12], kg: 52, inc: 7 },
          { ex: 'remada-maquina-uni', series: 3, reps: [10, 12], kg: 32, inc: 7 },
          { ex: 'encolhimentos-halteres', series: 3, reps: [12, 15], kg: 22, inc: 2 },
          { ex: 'crucifixo-invertido', series: 3, reps: [12, 20], kg: 8, inc: 2 }
        ]
      }
    ]
  };

  /* ---------- índices, montados uma vez ---------- */

  /** Prescrição de cada exercício, com o dia a que pertence */
  const PRESCRICOES = {};
  PLANO.dias.forEach((dia, i) => {
    dia.indice = i;
    dia.exercicios.forEach(p => {
      // um exercício repetido em dois dias fica com a prescrição do primeiro,
      // mas soma as séries dos dois para efeito de volume
      if (!PRESCRICOES[p.ex]) PRESCRICOES[p.ex] = Object.assign({ dia: dia.k, diaIndice: i }, p);
      if (p.troca) PRESCRICOES[p.troca.ex] = Object.assign({ dia: dia.k, diaIndice: i, series: p.series, reps: p.reps, substituto: p.ex }, p.troca);
    });
  });

  /** O exercício faz parte do plano? Devolve a prescrição ou null. */
  function prescricao(exId) {
    return PRESCRICOES[exId] || null;
  }

  /** Todos os exercícios do plano, sem repetidos, pela ordem dos dias */
  function exerciciosDoPlano() {
    const vistos = new Set();
    const out = [];
    PLANO.dias.forEach(d => d.exercicios.forEach(p => {
      if (vistos.has(p.ex)) return;
      vistos.add(p.ex);
      out.push(p.ex);
    }));
    return out;
  }

  function dia(indice) {
    return PLANO.dias[((indice % PLANO.dias.length) + PLANO.dias.length) % PLANO.dias.length];
  }

  function diaPorLetra(k) {
    return PLANO.dias.find(d => d.k === k) || null;
  }

  /** Séries de trabalho previstas para uma rotação completa */
  function seriesPorSemana() {
    return PLANO.dias.reduce((n, d) => n + d.exercicios.reduce((m, p) => m + p.series, 0), 0);
  }

  global.PLANO = Object.assign(PLANO, {
    prescricao, exerciciosDoPlano, dia, diaPorLetra, seriesPorSemana,
    total: PLANO.dias.length
  });
})(window);
