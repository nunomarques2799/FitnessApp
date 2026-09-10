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
     kg        carga de trabalho desta semana — é esta que entra no treino
     partida   carga com que o exercício entrou neste bloco de 8 semanas;
               é o chão contra o qual se contam os degraus no ecrã Plano.
               Só se escreve quando já não é igual a `kg`, e não se mexe
               nas revisões — mexer nela apagava o progresso do bloco
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
    versao: 7,
    criadoEm: '2026-09-05',
    revisto: '2026-09-10',
    origem: 'Construído a partir dos 23 treinos registados entre 31 de Julho e 6 de Setembro de 2026',
    semanas: 8,                 // não mudar exercícios antes disto
    rotacao: 'Quatro dias em roda, sem estarem presos a dias da semana',
    descanso: { composto: 180, isolamento: 90 },
    rir: [1, 2],                // deixar 1 a 2 em reserva; última série de cada exercício 0 a 1
    notasDaRevisao: 'Versão 7. Primeira revisão com os quatro dias já feitos, e a maior parte das '
      + 'cargas desce. O sinal é sempre o mesmo: registaste RIR 0 com as repetições a caírem de '
      + 'série para série, o que quer dizer que a carga só dá para a primeira. Descem a flexão de '
      + 'pernas de 66 para 52 (fizeste a primeira a 66 e tiveste de baixar logo para 59), a extensão '
      + 'de pernas de 66 para 45 (fizeste 59 e acabaste a 52, sempre à falha), os gémeos de 79 para '
      + '73 (só uma série chegou aos 79, e a zero), a puxada supinada de 52 para 45 (12, 11 e 8) e o '
      + 'crucifixo invertido com halteres de 8 para 6. O supino inclinado volta aos 25: a versão 6 '
      + 'subiu-o a mais, porque das quatro séries só a primeira chegou ao topo — e essa foi à falha. '
      + 'O tríceps à testa começa nos 20 em vez de 25, que é a barra W mais 5 de cada lado: é '
      + 'exercício novo, mais vale sobrar. Sobem três, e sobem por mérito: o agachamento de 75 para '
      + '80 (10, 10 e 12 com 2 a 3 em reserva), o press de ombros de 22 para 24 (quatro séries no '
      + 'topo com 1 a 2 em reserva) e as elevações laterais de 8 para 10, nos dois dias (quatro '
      + 'séries de 20, que é o tecto do intervalo). A prensa de pernas fica nos 127: chegaste às 12 '
      + 'nas três séries, mas todas a zero de reserva — sobe quando as fizeres com 1 ou 2 no bolso. '
      + 'A remada a um braço passa da máquina para a polia, a 14 kg, que é onde a fazes; a máquina '
      + 'fica escrita como alternativa, a 18. E muda uma coisa na app: um dia do plano passa a '
      + 'entrar sempre com as cargas e repetições escritas aqui, e não com o que fizeste da última '
      + 'vez. Os números mudam neste ficheiro, ao domingo, com o relatório à frente. '
      + 'Versão 6. Primeiro acerto de cargas com o plano já a andar, feito sobre os dias '
      + 'A e B. No dia A registaste RIR 0 em quase todas as séries — não é isso que o plano pede, e '
      + 'com quatro séries à falha a última nem sequer conta. Descem: a remada na máquina de 52 para '
      + '45, a remada baixa de 52 para 45, o crucifixo invertido na polia de 9 para 6,5 e as duas '
      + 'roscas de 12 para 10 (fizeste-as a 10 e ainda assim chegaste à falha). A puxada à frente '
      + 'fica nos 52: fizeste 4 × 10 e é a tua carga de sempre — o que muda é o alvo, de 6-10 para '
      + '8-12, que é onde realmente trabalhas. No dia B só o supino inclinado sobe, de 25 para 27, '
      + 'porque fechaste as quatro séries no topo do intervalo com 1 a 2 em reserva. As elevações '
      + 'laterais descem de 10 para 8. As aberturas com halteres saem do plano: eram o mesmo '
      + 'exercício que o peck deck — mesmo músculo, mesma região do peito, mesmo padrão — e estavam '
      + 'as duas no dia B. Em vez delas, o press de peito na máquina volta ao dia B, onde faz falta '
      + 'como segundo press, e o peck deck passa a ser feito nos dois dias. O peito mantém as 13 '
      + 'séries: 4 de supino inclinado, 3 de press na máquina e 3 de peck deck no dia B, mais 3 de '
      + 'peck deck no dia D. '
      + 'Versão 5. O peito passa a ser treinado duas vezes por rotação em vez de uma: '
      + 'o press de peito na máquina muda-se do dia B para o dia D, e no lugar dele entram as '
      + 'aberturas com halteres. Peito sobe de 10 para 13 séries, em duas sessões. Sai o '
      + 'encolhimento de ombros: o trapézio já leva trabalho a sério nas duas remadas do dia A. '
      + 'Versão 4: as cargas das barras passam a contar o peso da própria barra: '
      + 'agachamento de 60 para 75 kg (barra olímpica de 20) e tríceps à testa de 20 para 25 '
      + '(barra W de 10). Os registos antigos ficam como estavam, em discos — só contam para o '
      + 'plano depois de o exercício ser feito lá dentro, por isso não se misturam. '
      + 'Versão 3: a extensão de tríceps acima da cabeça saiu — magoava o ombro — e '
      + 'entrou o tríceps à testa com barra W, que trabalha a mesma cabeça longa do tríceps sem pôr '
      + 'o braço acima da cabeça. A extensão na polia pode ser feita com barra em V. '
      + 'Versão 2: o histórico mostrou 20 séries de peito por semana contra 10 de '
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
      'Os números vêm daqui e só mudam aqui. Cada dia do plano abre com a carga e as repetições escritas neste ficheiro, não com o que fizeste da última vez. Ao fim da semana exportas o relatório e é com ele à frente que se decide o que sobe, o que desce e o que fica — durante a semana, a app não te propõe subir nada.',
      'Deixa 1 a 2 repetições em reserva em todas as séries, menos na última de cada exercício, onde podes ir a 0 ou 1.',
      'Nas polias, usa sempre a mesma máquina para o mesmo exercício e escolhe-a no chip do exercício. Duas polias com relações diferentes fazem os números saltar para o dobro, e a app fica sem saber se subiste ou desceste.',
      'Nas barras, conta o peso da barra: a olímpica tem 20 kg e a barra W tem 10. Não muda nada para a progressão, mas sem isso o máximo estimado e a comparação com o teu peso ficam errados por 20 kg. As cargas escritas aqui já levam a barra dentro.',
      'Não trocar de exercícios durante 8 semanas. Registar todas as séries. Descanso de 2 a 3 minutos nos compostos, 90 segundos nos isolamentos.',
      'Para ganhar músculo a 72 kg, come acima da manutenção e dorme. Se o peso não subir umas 2 a 3 centenas de gramas por semana, não é o treino que está a travar.',
      'Dor na articulação — ombro, cotovelo, joelho — não é para aguentar. Troca-se o exercício por outro que faça o mesmo trabalho sem doer, e o plano continua. Se a dor ficar fora do treino, vai a alguém que te possa ver.'
    ],

    /* Séries por rotação previstas por grupo */
    volumeAlvo: [
      { k: 'dorsais', nome: 'Dorsais', musculos: ['dorsais'], alvo: 17 },
      { k: 'peito', nome: 'Peito', musculos: ['peito'], alvo: 13 },
      { k: 'deltoide_lat', nome: 'Deltoide lateral', musculos: ['deltoide_lat'], alvo: 8 },
      { k: 'deltoide_post', nome: 'Deltoide posterior', musculos: ['deltoide_post'], alvo: 6 },
      { k: 'deltoide_ant', nome: 'Deltoide anterior', musculos: ['deltoide_ant'], alvo: 4 },
      { k: 'trapezio', nome: 'Trapézio', musculos: ['trapezio'], alvo: 0 },
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
        nota: 'O dia mais importante do plano. Puxa com os cotovelos, não com as mãos. Pára cada série com 1 a 2 repetições ainda no bolso — só a última é que pode ir ao fim.',
        exercicios: [
          { ex: 'puxada-frontal', series: 4, reps: [8, 12], kg: 52, inc: 7 },
          { ex: 'remada-maquina', series: 4, reps: [10, 14], kg: 45, inc: 7, partida: 52 },
          { ex: 'remada-baixa-polia', series: 3, reps: [10, 14], kg: 45, inc: 7, partida: 52, nota: 'Pega em V, junto ao corpo' },
          { ex: 'crucifixo-invertido-polia-uni', series: 3, reps: [12, 15], kg: 6.5, inc: 2.5, partida: 9 },
          { ex: 'rosca-inclinada', series: 3, reps: [8, 12], kg: 10, inc: 2, partida: 12 },
          { ex: 'rosca-martelo', series: 3, reps: [8, 12], kg: 10, inc: 2, partida: 12 }
        ]
      },
      {
        k: 'B',
        nome: 'Peito, tríceps e deltoide lateral',
        aquecimento: 'Supino inclinado com halteres 20 × 12.',
        nota: 'A mesma carga nas quatro séries do supino inclinado. Não subas série a série.',
        exercicios: [
          { ex: 'supino-inclinado-halteres', series: 4, reps: [8, 12], kg: 25, inc: 2 },
          { ex: 'press-peito-maquina', series: 3, reps: [8, 12], kg: 45, inc: 7 },
          { ex: 'peck-deck', series: 3, reps: [10, 15], kg: 12.5, inc: 2.5 },
          { ex: 'elevacoes-laterais', series: 4, reps: [12, 20], kg: 10, inc: 2 },
          { ex: 'triceps-polia-barra', series: 3, reps: [8, 12], kg: 27, inc: 7, nota: 'Barra em V ou barra direita: escolhe uma e mantém-na' },
          { ex: 'triceps-testa', series: 3, reps: [8, 12], kg: 20, inc: 2.5, partida: 20, nota: 'Barra W de 10 kg incluída — 20 kg são a barra mais 5 de cada lado. Acerta a carga na primeira sessão' }
        ]
      },
      {
        k: 'C',
        nome: 'Pernas e core',
        aquecimento: 'Prensa de pernas 79 × 15.',
        exercicios: [
          { ex: 'agachamento-barra', series: 3, reps: [6, 10], kg: 80, inc: 5, partida: 75, nota: 'Barra de 20 kg incluída — 80 kg são a barra mais 30 de cada lado' },
          { ex: 'prensa-pernas', series: 3, reps: [10, 12], kg: 127, inc: 7, nota: 'Fica nos 127 até fazeres as três séries com 1 a 2 repetições ainda no bolso' },
          { ex: 'flexao-pernas-sentado', series: 4, reps: [10, 12], kg: 52, inc: 7, partida: 66 },
          { ex: 'extensao-pernas', series: 3, reps: [12, 15], kg: 45, inc: 7, partida: 66 },
          { ex: 'gemeos-prensa', series: 4, reps: [12, 20], kg: 73, inc: 7, partida: 79 },
          { ex: 'crunch', series: 3, reps: [15, 20], kg: 20, inc: 5, nota: 'Banco inclinado, com peso' }
        ]
      },
      {
        k: 'D',
        nome: 'Ombros, costas e peito',
        aquecimento: 'Elevações laterais 5 × 15 para aquecer o ombro.',
        nota: 'A segunda dose de peito da semana. Três séries chegam — o trabalho grande foi no dia B.',
        exercicios: [
          { ex: 'press-ombros-halteres', series: 4, reps: [6, 10], kg: 24, inc: 2, partida: 22 },
          { ex: 'elevacoes-laterais', series: 4, reps: [12, 20], kg: 10, inc: 2 },
          { ex: 'puxada-supinada', series: 3, reps: [8, 12], kg: 45, inc: 7, partida: 52 },
          {
            ex: 'remada-polia-uni', series: 3, reps: [10, 12], kg: 14, inc: 2.5, partida: 14,
            nota: 'Na polia, sempre a mesma — escolhe-a no chip. Acerta a carga na primeira sessão e depois mantém-na. Com a polia ocupada, vale a máquina a 18 kg',
            troca: {
              ex: 'remada-maquina-uni', kg: 18, inc: 2.5,
              quando: 'Se a polia estiver ocupada',
              nota: 'Substitui a remada na polia a um braço. 18 kg, e os números das duas não se comparam'
            }
          },
          { ex: 'peck-deck', series: 3, reps: [10, 15], kg: 12.5, inc: 2.5 },
          { ex: 'crucifixo-invertido', series: 3, reps: [12, 20], kg: 6, inc: 2, partida: 8 }
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
