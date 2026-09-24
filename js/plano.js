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
    versao: 10,
    criadoEm: '2026-09-05',
    revisto: '2026-09-24',
    origem: 'Construído a partir dos 23 treinos registados entre 31 de Julho e 6 de Setembro de 2026',
    semanas: 8,                 // não mudar exercícios antes disto
    rotacao: 'Quatro dias em roda, sem estarem presos a dias da semana',
    descanso: { composto: 180, isolamento: 90 },
    rir: [1, 2],                // deixar 1 a 2 em reserva; última série de cada exercício 0 a 1
    notasDaRevisao: 'Versão 10, no mesmo dia da 9. A extensão de tríceps acima da cabeça volta ao dia B, no lugar do tríceps à testa: saiu na versão 3 porque magoava o ombro, e o ombro está bem — fizeste-a a 21 de Setembro a 18, 20,3 e 22,5, a última com 14 repetições e 1 em reserva. Entra nos 22,5 com o intervalo de 10 a 15. Fica no lugar do tríceps à testa e não ao lado dele, porque as duas trabalham a cabeça longa do tríceps e o dia B já passa da hora; assim o tríceps continua nas 6 séries por rotação. O tríceps à testa fica escrito como alternativa, a 30, para o dia em que o ombro se queixar. O peso subiu de 72 para 73 kg entre 6 e 24 de Setembro, uns 400 gramas por semana — um pouco acima do que a regra pede, mas é uma pesagem só. '
      + 'Versão 9. Seis sessões verdadeiras dentro da versão 8 — dois dias B, dois dias C, um dia A e um treino livre — e o dia D nenhuma: a última vez que o fizeste foi a 9 de Setembro, ainda na versão 6. As três sessões reconstituídas de 13 a 15 não entram nas contas. As pernas foram onde tudo andou. O agachamento sobe de 80 para 95: fizeste 3 × 12 a 80 com 1 a 2 em reserva e na sessão a seguir subiste tu para 90 e fizeste outra vez 3 × 12 — acima do tecto das 10 — por isso sobe um degrau sobre o que fizeste e não sobre o que estava escrito. A prensa sobe de 127 para 134, porque cumpriste a condição que a versão 7 lhe pôs: três de 12 com 1, 1 e 0 em reserva. A flexão de pernas sobe de 52 para 59 (quatro de 12 nas duas sessões, com 2 a 1 em reserva nas primeiras), a extensão de 45 para 52 (três de 15 nas duas) e os gémeos de 79 para 86 — estavam escritos a 73 mas fizeste sempre 79, quatro de 20 nas duas sessões. No dia A a puxada à frente sobe de 52 para 59: quatro de 12, repetições planas, e já tinhas feito o mesmo no treino livre de 20. É o primeiro degrau do exercício mais importante do plano e chega a tempo do ponto de controlo da semana 4. A remada na máquina fica nos 52: 14, 14, 12 e 12 — melhor que os quatro de 12 de 7 de Setembro, mas as duas últimas ainda não chegaram ao topo. O crucifixo invertido na polia sobe de 9 para 11,5 (três de 15, e a 21 já fizeste uma série a 14). As duas roscas sobem de 10 para 12, de volta à partida: a inclinada fez 14, 12 e 12 com reserva e a martelo três de 12 no treino livre. A remada baixa fica nos 45 — fizeste uma série só, a 14. No dia B o supino inclinado passa para 27,5 com incremento de 2,5, porque são os halteres que existem; fica, com o último 12 a cair para 10 nas duas sessões. O press de peito fica nos 52: a 21 fez três de 12, mas a 16 caiu para 9 e tiveste de baixar — sobe quando repetir os três de 12. O peck deck fica nos 12,5. As elevações laterais sobem de 12 para 14 nos dois dias (quatro de 20 a 16). O tríceps na polia volta a 27 e o incremento passa de 7 para 4,5, que é o salto real daquela polia (23 para 27): três de 12 nas duas sessões, com 2 e 1 em reserva na segunda. O tríceps à testa fica nos 30 — só duas séries a 30 em cada sessão, a primeira é sempre a 20. No dia D mexem só as elevações laterais e a máquina a um braço da troca, de 18 para 20,5 (três de 12 no treino livre e em 9 de Setembro). O resto do dia D não se toca, porque não foi feito. '
      + 'Versão 8. Duas sessões feitas já dentro da versão 7 — o dia A e o dia B — e desta vez a maior parte sobe. Sobem quatro por dupla progressão cumprida, que é o topo do intervalo em todas as séries: o supino inclinado de 25 para 27 (quatro de 12, com 1 a 2 em reserva), o press de peito na máquina de 45 para 52 (três de 12), as elevações laterais de 10 para 12 nos dois dias (quatro de 20, o tecto do intervalo outra vez) e a remada na máquina de 45 de volta a 52. Esta última merece explicação, porque desfaz uma decisão da versão 6: ela baixou-a de 52 para 45 por causa do RIR 0, mas as repetições estavam planas — 12, 12, 12, 12 — e repetições planas querem dizer que a carga está certa e que só vais à falha no fim. A 45 fizeste 14, 14, 14, 14. O sinal a que se dá ouvidos é as repetições a cair de série para série, não o RIR sozinho. Fica sem partida escrita porque voltaste ao chão do bloco: não é degrau ganho, é uma correcção. É um dos dois exercícios do ponto de controlo da semana 4. Duas cargas estavam erradas no papel e foi o ginásio que as corrigiu. O crucifixo invertido na polia estava escrito a 6,5 e fizeste-o a 9, com 15, 15 e 14: a descida da versão 6 não tinha razão de ser e passa a 9. O tríceps à testa entrou sem número certo, a pedir calibração — fizeste 20 a sentir e depois 30 para 12 e 12 — por isso fica escrito nos 30. Desce um: o tríceps na polia com barra, de 27 para 23. Fizeste 9, 9 e 9, tudo a zero de reserva, e na última baixaste tu próprio para 23. Nove repetições é o fundo do intervalo com a carga a fugir. Mantêm-se a puxada à frente nos 52, a remada baixa nos 45, o peck deck nos 12,5 e a rosca inclinada nos 10 — nenhum deles fechou todas as séries no topo. Os dias C e D ainda não foram feitos dentro da versão 7, por isso as cargas deles não se tocam. E os abdominais passam de 3 para 6 séries por rotação. Três era o alvo mais baixo do plano inteiro e menos de metade das 8 que o próprio catálogo da app considera normal, e só treinavas a flexão de cima para baixo. Entra a elevação de joelhos na barra no fim do dia A, que apanha a parte de baixo e é o dia mais afastado do dia C na roda. O crunch desce de 20 para 15: fizeste 20, 15 e 15 a zero, que é exactamente a queda de repetições que fez descer os outros. Ver os abdominais é gordura, não séries — a comer acima da manutenção, isto constrói o músculo mas não o mostra neste bloco. '      + 'Versão 7. Primeira revisão com os quatro dias já feitos, e a maior parte das '
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
      'Para ganhar músculo a 73 kg, come acima da manutenção e dorme. Se o peso não subir umas 2 a 3 centenas de gramas por semana, não é o treino que está a travar.',
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
      { k: 'abdominais', nome: 'Abdominais', musculos: ['abdominais'], alvo: 6 }
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
          { ex: 'puxada-frontal', series: 4, reps: [8, 12], kg: 59, inc: 7, partida: 52 },
          { ex: 'remada-maquina', series: 4, reps: [10, 14], kg: 52, inc: 7 },
          { ex: 'remada-baixa-polia', series: 3, reps: [10, 14], kg: 45, inc: 7, partida: 52, nota: 'Pega em V, junto ao corpo' },
          { ex: 'crucifixo-invertido-polia-uni', series: 3, reps: [12, 15], kg: 11.5, inc: 2.5, partida: 9, nota: 'O pino a seguir aos 9 na mesma polia' },
          { ex: 'rosca-inclinada', series: 3, reps: [8, 12], kg: 12, inc: 2, partida: 12 },
          { ex: 'rosca-martelo', series: 3, reps: [8, 12], kg: 12, inc: 2, partida: 12 },
          { ex: 'elevacao-joelhos', series: 3, reps: [10, 20], max: true, nota: 'Joelhos ao peito, sem balanço. Quando as 20 saírem nas três séries, segura um halter entre os pés' }
        ]
      },
      {
        k: 'B',
        nome: 'Peito, tríceps e deltoide lateral',
        aquecimento: 'Supino inclinado com halteres 20 × 12.',
        nota: 'A mesma carga nas quatro séries do supino inclinado. Não subas série a série.',
        exercicios: [
          { ex: 'supino-inclinado-halteres', series: 4, reps: [8, 12], kg: 27.5, inc: 2.5, partida: 25 },
          { ex: 'press-peito-maquina', series: 3, reps: [8, 12], kg: 52, inc: 7, partida: 45 },
          { ex: 'peck-deck', series: 3, reps: [10, 15], kg: 12.5, inc: 2.5 },
          { ex: 'elevacoes-laterais', series: 4, reps: [12, 20], kg: 14, inc: 2, partida: 8 },
          { ex: 'triceps-polia-barra', series: 3, reps: [8, 12], kg: 27, inc: 4.5, partida: 27, nota: 'Barra em V ou barra direita: escolhe uma e mantém-na' },
          {
            ex: 'triceps-acima-cabeca', series: 3, reps: [10, 15], kg: 22.5, inc: 2,
            nota: 'Carga da sessão de 21 de Setembro. Se o ombro der sinal, pára e faz o tríceps à testa',
            troca: {
              ex: 'triceps-testa', kg: 30, inc: 2.5,
              quando: 'Se o ombro doer',
              nota: 'Barra W de 10 kg incluída — 30 kg são a barra mais 10 de cada lado. Os 20 do princípio são aquecimento'
            }
          }
        ]
      },
      {
        k: 'C',
        nome: 'Pernas e core',
        aquecimento: 'Prensa de pernas 79 × 15.',
        exercicios: [
          { ex: 'agachamento-barra', series: 3, reps: [6, 10], kg: 95, inc: 5, partida: 75, nota: 'Barra de 20 kg incluída — 95 kg são a barra mais 37,5 de cada lado' },
          { ex: 'prensa-pernas', series: 3, reps: [10, 12], kg: 134, inc: 7, partida: 127, nota: 'Sobe outra vez quando as três séries saírem a 12 com 1 a 2 repetições ainda no bolso' },
          { ex: 'flexao-pernas-sentado', series: 4, reps: [10, 12], kg: 59, inc: 7, partida: 66 },
          { ex: 'extensao-pernas', series: 3, reps: [12, 15], kg: 52, inc: 7, partida: 66 },
          { ex: 'gemeos-prensa', series: 4, reps: [12, 20], kg: 86, inc: 7, partida: 79 },
          { ex: 'crunch', series: 3, reps: [15, 20], kg: 15, inc: 5, partida: 20, nota: 'Banco inclinado, com peso. Faz-se antes dos gémeos se o tempo estiver a acabar' }
        ]
      },
      {
        k: 'D',
        nome: 'Ombros, costas e peito',
        aquecimento: 'Elevações laterais 5 × 15 para aquecer o ombro.',
        nota: 'A segunda dose de peito da semana. Três séries chegam — o trabalho grande foi no dia B.',
        exercicios: [
          { ex: 'press-ombros-halteres', series: 4, reps: [6, 10], kg: 24, inc: 2, partida: 22 },
          { ex: 'elevacoes-laterais', series: 4, reps: [12, 20], kg: 14, inc: 2, partida: 8 },
          { ex: 'puxada-supinada', series: 3, reps: [8, 12], kg: 45, inc: 7, partida: 52 },
          {
            ex: 'remada-polia-uni', series: 3, reps: [10, 12], kg: 14, inc: 2.5, partida: 14,
            nota: 'Na polia, sempre a mesma — escolhe-a no chip. Acerta a carga na primeira sessão e depois mantém-na. Com a polia ocupada, vale a máquina a 20,5 kg',
            troca: {
              ex: 'remada-maquina-uni', kg: 20.5, inc: 2.5, partida: 18,
              quando: 'Se a polia estiver ocupada',
              nota: 'Substitui a remada na polia a um braço. 20,5 kg, e os números das duas não se comparam'
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
