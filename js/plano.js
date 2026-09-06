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
    versao: 1,
    criadoEm: '2026-09-05',
    revisto: '2026-09-05',
    origem: 'Construído a partir dos treinos registados até 5 de Setembro de 2026',
    semanas: 8,                 // não mudar exercícios antes disto
    rotacao: 'Cinco dias em roda, sem estarem presos a dias da semana',
    descanso: { composto: 180, isolamento: 90 },
    rir: [1, 2],                // deixar 1 a 2 em reserva; última série de cada exercício 0 a 1
    notasDaRevisao: 'Primeira versão.',

    regras: [
      'As cargas escritas são o chão, não o tecto. Vieram dos teus registos. Se uma série sair fácil, acrescenta repetições — não pares no número impresso.',
      'Dupla progressão: chega ao topo do intervalo em todas as séries, sobe um incremento e recomeça no fundo do intervalo.',
      'A mesma carga em todas as séries de trabalho. As repetições vão cair de série para série — é assim mesmo. Subir a carga série a série é o que tem escondido o teu progresso.',
      'Deixa 1 a 2 repetições em reserva em todas as séries, menos na última de cada exercício, onde podes ir a 0 ou 1.',
      'Não trocar de exercícios durante 8 semanas. Registar todas as séries. Descanso de 2 a 3 minutos nos compostos, 90 segundos nos isolamentos.'
    ],

    /* Séries semanais previstas por grupo, como estão escritas no plano */
    volumeAlvo: [
      { k: 'dorsais', nome: 'Dorsais', musculos: ['dorsais'], alvo: 19 },
      { k: 'peito', nome: 'Peito', musculos: ['peito'], alvo: 13 },
      { k: 'deltoide_lat', nome: 'Deltoide lateral', musculos: ['deltoide_lat'], alvo: 6 },
      { k: 'posterior', nome: 'Deltoide posterior e trapézio', musculos: ['deltoide_post', 'trapezio'], alvo: 6 },
      { k: 'biceps', nome: 'Bíceps', musculos: ['biceps'], alvo: 9 },
      { k: 'triceps', nome: 'Tríceps', musculos: ['triceps'], alvo: 11 }
    ],

    /* Ponto de controlo: se estes dois não subirem um incremento até lá,
       o travão é a comida ou o sono, não o programa. */
    controlo: {
      semana: 4,
      exercicios: ['puxada-frontal', 'supino-inclinado-halteres'],
      texto: 'Se a puxada à frente e o supino inclinado com halteres não tiverem subido um incremento, o travão é a comida ou o sono, não o plano.'
    },

    dias: [
      {
        k: 'A',
        nome: 'Costas e bíceps',
        aquecimento: 'Puxada à frente 45 × 10 e depois começa.',
        exercicios: [
          { ex: 'puxada-frontal', series: 4, reps: [6, 10], kg: 59, inc: 7 },
          { ex: 'remada-peito-apoiado', series: 3, reps: [8, 12], kg: 22, inc: 2 },
          { ex: 'remada-baixa-polia', series: 3, reps: [10, 12], kg: 52, inc: 7, nota: 'Pega em V' },
          { ex: 'crucifixo-invertido-polia-uni', series: 3, reps: [12, 15], kg: 9, inc: 2.5 },
          { ex: 'rosca-inclinada', series: 3, reps: [8, 12], kg: 12, inc: 2 },
          { ex: 'rosca-martelo-corda', series: 3, reps: [10, 12], kg: 41, inc: 7 }
        ]
      },
      {
        k: 'B',
        nome: 'Peito, tríceps e deltoide lateral',
        aquecimento: 'Supino inclinado com halteres 20 × 10. A mesma carga em todas as séries de trabalho — não subas série a série.',
        exercicios: [
          { ex: 'supino-inclinado-halteres', series: 4, reps: [6, 10], kg: 25, inc: 2 },
          { ex: 'peck-deck', series: 3, reps: [10, 15], kg: 12.5, inc: 2.5 },
          { ex: 'elevacoes-laterais-polia', series: 3, reps: [12, 20], kg: 6.8, inc: 2.5 },
          { ex: 'triceps-polia-barra', series: 3, reps: [8, 12], kg: 27, inc: 7 },
          { ex: 'triceps-polia-acima-cabeca', series: 3, reps: [10, 15], kg: 24, inc: 7 }
        ]
      },
      {
        k: 'C',
        nome: 'Pernas',
        livre: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos'],
        nota: 'A tua sessão de pernas, como já a fazes. O plano só acrescenta o trabalho de core no fim.',
        exercicios: [
          { ex: 'dead-bug', series: 3, reps: [10, 10], nota: 'Por lado' },
          { ex: 'prancha', series: 3, reps: [40, 40] }
        ]
      },
      {
        k: 'D',
        nome: 'Costas e ombros',
        exercicios: [
          {
            ex: 'elevacoes-supinada', series: 3, reps: [6, 10], max: true,
            troca: { ex: 'puxada-supinada', kg: 52, quando: 'Se não chegares às 6 repetições, faz puxada supinada com 52 kg.' }
          },
          { ex: 'remada-maquina-uni', series: 3, reps: [10, 12], kg: 32, inc: 7 },
          { ex: 'puxada-fechada-pronada', series: 3, reps: [10, 12], kg: 52, inc: 7 },
          { ex: 'encolhimentos-halteres', series: 3, reps: [12, 15], kg: 22, inc: 2 },
          { ex: 'press-ombros-halteres', series: 3, reps: [6, 10], kg: 22, inc: 2, nota: 'Sentado' },
          { ex: 'elevacoes-laterais', series: 3, reps: [12, 20], kg: 10, inc: 2 }
        ]
      },
      {
        k: 'E',
        nome: 'Peito e braços',
        aquecimento: 'Supino plano 20 × 10 e depois 35 × 5.',
        exercicios: [
          { ex: 'supino-reto-barra', series: 3, reps: [6, 10], kg: 45, inc: 5 },
          { ex: 'crossover-alto', series: 3, reps: [12, 15], kg: 14.8, inc: 2.5, nota: 'De cima para baixo' },
          { ex: 'rosca-polia', series: 3, reps: [10, 12], kg: 32, inc: 7 },
          { ex: 'triceps-polia-corda', series: 3, reps: [10, 15], kg: 22.5, inc: 2.5 },
          { ex: 'rosca-punho-invertida', series: 2, reps: [15, 20], kg: 25, inc: 2.5 }
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
      PRESCRICOES[p.ex] = Object.assign({ dia: dia.k, diaIndice: i }, p);
      if (p.troca) PRESCRICOES[p.troca.ex] = Object.assign({ dia: dia.k, diaIndice: i, series: p.series, reps: p.reps, substituto: p.ex }, p.troca);
    });
  });

  /** O exercício faz parte do plano? Devolve a prescrição ou null. */
  function prescricao(exId) {
    return PRESCRICOES[exId] || null;
  }

  /** Todos os exercícios do plano, pela ordem dos dias */
  function exerciciosDoPlano() {
    return PLANO.dias.reduce((acc, d) => acc.concat(d.exercicios.map(p => p.ex)), []);
  }

  function dia(indice) {
    return PLANO.dias[((indice % PLANO.dias.length) + PLANO.dias.length) % PLANO.dias.length];
  }

  function diaPorLetra(k) {
    return PLANO.dias.find(d => d.k === k) || null;
  }

  /** Séries de trabalho previstas para uma semana completa */
  function seriesPorSemana() {
    return PLANO.dias.reduce((n, d) => n + d.exercicios.reduce((m, p) => m + p.series, 0), 0);
  }

  global.PLANO = Object.assign(PLANO, {
    prescricao, exerciciosDoPlano, dia, diaPorLetra, seriesPorSemana,
    total: PLANO.dias.length
  });
})(window);
