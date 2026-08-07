/* =============================================================
   Treinos — Catálogo de músculos, exercícios e circuitos
   Português de Portugal. Nomes de músculos sempre por extenso.
   ============================================================= */
(function (global) {
  'use strict';

  /* --- Grupos musculares -------------------------------------
     alvo = séries semanais para hipertrofia (só estímulo directo).
     Referência de 10–20 séries semanais por grupo; os músculos
     pequenos ficam mais baixos porque apanham muito trabalho
     indirecto nos compostos.
     zona  = push | pull | pernas | core
     grupo = grupo do menu de criação de treino                  */
  const MUSCLES = {
    peito:         { name: 'Peito',              zona: 'push',   grupo: 'peito',       alvo: 16 },
    deltoide_ant:  { name: 'Deltoide anterior',  zona: 'push',   grupo: 'ombros',      alvo: 8  },
    deltoide_lat:  { name: 'Deltoide lateral',   zona: 'push',   grupo: 'ombros',      alvo: 14 },
    triceps:       { name: 'Tríceps',            zona: 'push',   grupo: 'triceps',     alvo: 14 },
    dorsais:       { name: 'Dorsais',            zona: 'pull',   grupo: 'costas',      alvo: 18 },
    trapezio:      { name: 'Trapézio',           zona: 'pull',   grupo: 'costas',      alvo: 10 },
    deltoide_post: { name: 'Deltoide posterior', zona: 'pull',   grupo: 'ombros',      alvo: 10 },
    biceps:        { name: 'Bíceps',             zona: 'pull',   grupo: 'biceps',      alvo: 14 },
    antebraco:     { name: 'Antebraço',          zona: 'pull',   grupo: 'antebracos',  alvo: 6  },
    quadriceps:    { name: 'Quadríceps',         zona: 'pernas', grupo: 'pernas',      alvo: 16 },
    isquiotibiais: { name: 'Isquiotibiais',      zona: 'pernas', grupo: 'pernas',      alvo: 12 },
    gluteos:       { name: 'Glúteos',            zona: 'pernas', grupo: 'pernas',      alvo: 12 },
    adutores:      { name: 'Adutores',           zona: 'pernas', grupo: 'pernas',      alvo: 6  },
    gemeos:        { name: 'Gémeos',             zona: 'pernas', grupo: 'pernas',      alvo: 10 },
    abdominais:    { name: 'Abdominais',         zona: 'core',   grupo: 'abdominais',  alvo: 8  },
    lombar:        { name: 'Lombar',             zona: 'core',   grupo: 'costas',      alvo: 6  }
  };

  const ZONAS = {
    push:   { name: 'Empurrar' },
    pull:   { name: 'Puxar' },
    pernas: { name: 'Pernas' },
    core:   { name: 'Zona central' }
  };

  /* --- Grupos do menu de criação de treino --------------------
     Cada grupo abre a lista dos seus exercícios e os filtros da
     parte do músculo que se quer trabalhar.                     */
  const GRUPOS = {
    peito: {
      name: 'Peito', icone: 'peito',
      musculos: ['peito'],
      partes: [
        { k: 'peito-superior', name: 'Peito superior', desc: 'Inclinados e polia de baixo para cima' },
        { k: 'peito-medio',    name: 'Peito médio',    desc: 'Supino plano e aberturas' },
        { k: 'peito-inferior', name: 'Peito inferior', desc: 'Declinados e paralelas' }
      ]
    },
    costas: {
      name: 'Costas', icone: 'costas',
      musculos: ['dorsais', 'trapezio', 'lombar'],
      partes: [
        { k: 'costas-largura',   name: 'Largura (dorsais)',   desc: 'Puxadas verticais — alarga o V' },
        { k: 'costas-espessura', name: 'Espessura (remadas)', desc: 'Puxadas horizontais — engrossa o meio' },
        { k: 'costas-trapezio',  name: 'Trapézio',            desc: 'Encolhimentos e puxadas altas' },
        { k: 'costas-lombar',    name: 'Lombar',              desc: 'Extensão da anca e da coluna' }
      ]
    },
    ombros: {
      name: 'Ombros', icone: 'ombros',
      musculos: ['deltoide_ant', 'deltoide_lat', 'deltoide_post'],
      partes: [
        { k: 'ombro-anterior',  name: 'Deltoide anterior',  desc: 'Elevações à frente e press' },
        { k: 'ombro-lateral',   name: 'Deltoide lateral',   desc: 'Elevações laterais — dá largura' },
        { k: 'ombro-posterior', name: 'Deltoide posterior', desc: 'Aberturas invertidas e puxadas à cara' }
      ]
    },
    biceps: {
      name: 'Bíceps', icone: 'biceps',
      musculos: ['biceps'],
      partes: [
        { k: 'biceps-completo', name: 'Bíceps completo',       desc: 'Curl clássico, braço junto ao corpo' },
        { k: 'biceps-longa',    name: 'Cabeça longa (o pico)', desc: 'Braço atrás do tronco, no banco inclinado' },
        { k: 'biceps-braquial', name: 'Braquial',              desc: 'Pega neutra — empurra o bíceps para cima' }
      ]
    },
    triceps: {
      name: 'Tríceps', icone: 'triceps',
      musculos: ['triceps'],
      partes: [
        { k: 'triceps-longa',   name: 'Cabeça longa',            desc: 'Braço acima da cabeça — a maior das três' },
        { k: 'triceps-lateral', name: 'Cabeça lateral e medial', desc: 'Extensões com o braço junto ao corpo' },
        { k: 'triceps-forca',   name: 'Força a empurrar',        desc: 'Compostos com pega fechada' }
      ]
    },
    antebracos: {
      name: 'Antebraços', icone: 'antebraco',
      musculos: ['antebraco'],
      partes: [
        { k: 'antebraco-flexores',   name: 'Flexores',      desc: 'Parte de dentro do antebraço' },
        { k: 'antebraco-extensores', name: 'Extensores',    desc: 'Parte de fora do antebraço' },
        { k: 'antebraco-pega',       name: 'Força de pega', desc: 'Segurar carga muito tempo' }
      ]
    },
    pernas: {
      name: 'Pernas', icone: 'pernas',
      musculos: ['quadriceps', 'isquiotibiais', 'gluteos', 'adutores', 'gemeos'],
      partes: [
        { k: 'pernas-quadriceps',    name: 'Quadríceps',    desc: 'Frente da coxa' },
        { k: 'pernas-isquiotibiais', name: 'Isquiotibiais', desc: 'Trás da coxa' },
        { k: 'pernas-gluteos',       name: 'Glúteos',       desc: 'Extensão da anca' },
        { k: 'pernas-adutores',      name: 'Adutores',      desc: 'Parte de dentro da coxa' },
        { k: 'pernas-gemeos',        name: 'Gémeos',        desc: 'Barriga da perna' }
      ]
    },
    abdominais: {
      name: 'Abdominais', icone: 'abdominais',
      musculos: ['abdominais'],
      partes: [
        { k: 'abdominais-superiores',   name: 'Parte de cima',  desc: 'Aproximar o peito da bacia' },
        { k: 'abdominais-inferiores',   name: 'Parte de baixo', desc: 'Levantar as pernas' },
        { k: 'abdominais-obliquos',     name: 'Oblíquos',       desc: 'Rotação e inclinação do tronco' },
        { k: 'abdominais-estabilizacao', name: 'Estabilização', desc: 'Aguentar sem deixar mexer' }
      ]
    },
    hibrido: {
      name: 'Cardio e híbrido', icone: 'chama',
      musculos: ['quadriceps', 'gemeos', 'gluteos', 'abdominais', 'dorsais'],
      partes: [
        { k: 'hibrido-corrida',    name: 'Corrida',              desc: 'Rua, passadeira e sprints' },
        { k: 'hibrido-maquina',    name: 'Máquinas de cardio',   desc: 'Remo, bicicleta, elíptica' },
        { k: 'hibrido-saltos',     name: 'Saltos',               desc: 'Caixa, corda, pliometria' },
        { k: 'hibrido-balistico',  name: 'Movimentos balísticos', desc: 'Bola, kettlebell, barra rápida' },
        { k: 'hibrido-transporte', name: 'Transporte e arrasto', desc: 'Trenó e cargas ao colo' }
      ]
    }
  };

  const EQUIPAMENTO = {
    barra:      'Barra',
    halteres:   'Halteres',
    maquina:    'Máquina',
    cabos:      'Cabos',
    corporal:   'Peso do corpo',
    kettlebell: 'Kettlebell',
    elastico:   'Elástico',
    bola:       'Bola medicinal',
    caixa:      'Caixa',
    corda:      'Corda',
    disco:      'Disco',
    treno:      'Trenó',
    cardio:     'Máquina de cardio',
    nenhum:     'Sem equipamento'
  };

  /* --- Pegas ---------------------------------------------------
     A mesma puxada muda de exercício conforme a pega. Cada
     exercício diz qual usa, para não haver dúvidas na barra. */
  const PEGAS = {
    pronada:  { name: 'Pega pronada',  curto: 'Pronada',
      desc: 'Palmas viradas para a frente ou para baixo, polegares para dentro. Tira trabalho ao bíceps e é a que puxa mais dorsal de fora.' },
    supinada: { name: 'Pega supinada', curto: 'Supinada',
      desc: 'Palmas viradas para ti. Mete bastante bíceps e puxa mais a parte de baixo dos dorsais.' },
    neutra:   { name: 'Pega neutra',   curto: 'Neutra',
      desc: 'Palmas viradas uma para a outra. É a mais amiga do ombro e do cotovelo, e a que aguenta mais carga sem dores.' },
    mista:    { name: 'Pega mista',    curto: 'Mista',
      desc: 'Uma palma para a frente e a outra para trás. Só para peso morto pesado — troca o lado de série para série.' },
    corda:    { name: 'Corda',         curto: 'Corda',
      desc: 'Pega neutra que abre no fim do movimento. Deixa o pulso rodar à vontade e dá mais amplitude no fecho.' }
  };

  /* Largura da pega — só faz diferença nas puxadas e remadas */
  const LARGURAS = {
    larga:   { name: 'Larga',   desc: 'Mãos bem mais afastadas do que os ombros. Encurta o percurso e insiste na parte de fora dos dorsais.' },
    media:   { name: 'Média',   desc: 'Mãos à largura dos ombros. É a mais equilibrada e a que aguenta mais carga.' },
    fechada: { name: 'Fechada', desc: 'Mãos juntas ou quase. Dá mais amplitude e mete mais bíceps e parte de baixo do dorsal.' }
  };

  /* --- Exercícios de um lado de cada vez -----------------------
     Corrigem diferenças entre lados e deixam apoiar o tronco.
     Uma série conta o trabalho de um lado: faz os dois antes de
     a marcares como feita.                                      */
  const UNILATERAL = {
    braco: { chip: 'Um braço', name: 'Um braço de cada vez' },
    perna: { chip: 'Uma perna', name: 'Uma perna de cada vez' },
    lado:  { chip: 'Um lado',  name: 'Um lado de cada vez' }
  };
  const UNI_AJUDA = 'Faz o lado direito e o esquerdo antes de marcares a série como feita. A carga que escreves é a de um lado.';

  /* --- Objectivos de treino -----------------------------------
     Cada objectivo define o esquema de repetições, o descanso e
     o plano por omissão. O utilizador pode sempre ajustar tudo. */
  const OBJETIVOS = {
    musculo: {
      name: 'Ganhar músculo',
      curto: 'Músculo',
      desc: 'Séries de 8 a 12 repetições com descanso longo. O foco é o volume por grupo muscular.',
      reps: [8, 12], descanso: 180, descansoIsolamento: 120, volume: 1,
      series: 3, exercicios: 7, split: 'ppl', circuitos: false
    },
    forca: {
      name: 'Ganhar força',
      curto: 'Força',
      desc: 'Séries curtas e pesadas, 3 a 6 repetições, com descanso de 3 a 5 minutos entre séries.',
      reps: [3, 6], descanso: 240, descansoIsolamento: 150, volume: 0.8,
      series: 4, exercicios: 5, split: 'upperlower', circuitos: false
    },
    peso: {
      name: 'Perder peso',
      curto: 'Perder peso',
      desc: 'Corpo inteiro com descanso curto, mais circuitos híbridos. Mantém o músculo e gasta energia.',
      reps: [12, 15], descanso: 75, descansoIsolamento: 60, volume: 1,
      series: 3, exercicios: 6, split: 'perda', circuitos: true
    },
    hibrido: {
      name: 'Força e condição física',
      curto: 'Híbrido',
      desc: 'Dias de força a alternar com circuitos de corrida, remo e movimentos balísticos.',
      reps: [6, 10], descanso: 150, descansoIsolamento: 90, volume: 0.9,
      series: 3, exercicios: 6, split: 'hibrido', circuitos: true
    }
  };

  /* --- Métricas de registo ------------------------------------
     Definem as duas colunas que aparecem ao registar cada série.
     peso  → carga × repetições (o normal na musculação)
     tempo → carga opcional × segundos (prancha, cordas)
     reps  → só repetições (movimentos sem carga fixa)
     distancia → metros × tempo   |   calorias → calorias × tempo */
  const METRICAS = {
    peso:      { a: { k: 'kg',  label: 'Carga',    peso: true },  b: { k: 'reps', label: 'Repetições' } },
    tempo:     { a: { k: 'kg',  label: 'Carga',    peso: true, opcional: true }, b: { k: 'reps', label: 'Segundos', tempo: true } },
    reps:      { a: { k: 'kg',  label: 'Carga',    peso: true, opcional: true }, b: { k: 'reps', label: 'Repetições' } },
    distancia: { a: { k: 'm',   label: 'Metros' }, b: { k: 'seg', label: 'Tempo', tempo: true, opcional: true } },
    calorias:  { a: { k: 'cal', label: 'Calorias' }, b: { k: 'seg', label: 'Tempo', tempo: true, opcional: true } }
  };

  /* --- Exercícios --------------------------------------------
     id  identificador estável (não mudar)
     n   nome
     p   músculos principais     s  músculos secundários
     e   equipamento             t  'C' composto | 'I' isolamento
     r   [mínimo, máximo] na unidade da métrica
     inc incremento de carga sugerido (kg)
     pt  partes do músculo que o exercício trabalha
     bw  exercício de peso do corpo (a carga é peso extra)
     m   métrica de registo (peso por omissão)
     uni um lado de cada vez: 'braco' | 'perna' | 'lado'
     pg  pega (ver PEGAS)      lg  largura da pega (ver LARGURAS)
     cond  exercício de condição física — não conta para o volume
           de musculação, conta para o tempo e para o cardio     */
  const EXERCISES = [
    // ---------------- PEITO ----------------
    { id: 'supino-reto-barra', n: 'Supino plano com barra', p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5, pt: ['peito-medio'] },
    { id: 'supino-inclinado-barra', n: 'Supino inclinado com barra', p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5, pt: ['peito-superior'] },
    { id: 'supino-declinado-barra', n: 'Supino declinado com barra', p: ['peito'], s: ['triceps'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5, pt: ['peito-inferior'] },
    { id: 'supino-reto-halteres', n: 'Supino plano com halteres', p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, pt: ['peito-medio'] },
    { id: 'supino-inclinado-halteres', n: 'Supino inclinado com halteres', p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, pt: ['peito-superior'] },
    { id: 'press-peito-maquina', n: 'Press de peito na máquina', p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'maquina', t: 'C', r: [8, 12], inc: 5, pt: ['peito-medio'] },
    { id: 'crucifixo-halteres', n: 'Aberturas com halteres', p: ['peito'], s: ['deltoide_ant'], e: 'halteres', t: 'I', r: [10, 15], inc: 2, pt: ['peito-medio'] },
    { id: 'crucifixo-inclinado', n: 'Aberturas inclinadas com halteres', p: ['peito'], s: ['deltoide_ant'], e: 'halteres', t: 'I', r: [10, 15], inc: 2, pt: ['peito-superior'] },
    { id: 'peck-deck', n: 'Aberturas na máquina (peck deck)', p: ['peito'], s: ['deltoide_ant'], e: 'maquina', t: 'I', r: [10, 15], inc: 5, pt: ['peito-medio'] },
    { id: 'crossover-alto', n: 'Cruzamento na polia alta', p: ['peito'], s: ['deltoide_ant'], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, pt: ['peito-inferior', 'peito-medio'] },
    { id: 'crossover-baixo', n: 'Cruzamento na polia baixa', p: ['peito', 'deltoide_ant'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, pt: ['peito-superior'] },
    { id: 'flexoes', n: 'Flexões', p: ['peito'], s: ['triceps', 'deltoide_ant', 'abdominais'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true, pt: ['peito-medio'] },
    { id: 'flexoes-joelhos', n: 'Flexões apoiadas nos joelhos', p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true, pt: ['peito-medio'] },
    { id: 'flexoes-declinadas', n: 'Flexões com os pés elevados', p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true, pt: ['peito-superior'] },
    { id: 'dips-peito', n: 'Paralelas inclinadas para o peito', p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'corporal', t: 'C', r: [6, 12], inc: 2.5, bw: true, pt: ['peito-inferior'] },
    { id: 'pullover-halter', n: 'Pullover com halter', p: ['peito', 'dorsais'], s: ['triceps'], e: 'halteres', t: 'I', r: [10, 15], inc: 2.5, pt: ['peito-superior', 'costas-largura'] },
    { id: 'supino-inclinado-maquina', n: 'Press inclinado na máquina', p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'maquina', t: 'C', r: [8, 12], inc: 5, pt: ['peito-superior'] },
    { id: 'press-peito-maquina-uni', n: 'Press de peito na máquina a um braço', p: ['peito'], s: ['triceps', 'deltoide_ant', 'abdominais'], e: 'maquina', t: 'C', r: [8, 14], inc: 2.5, uni: 'braco', pt: ['peito-medio'] },
    { id: 'supino-halter-uni', n: 'Supino com halter a um braço', p: ['peito'], s: ['triceps', 'abdominais', 'deltoide_ant'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, uni: 'braco', pt: ['peito-medio'] },
    { id: 'crossover-uni', n: 'Cruzamento na polia a um braço', p: ['peito'], s: ['deltoide_ant', 'abdominais'], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, uni: 'braco', pt: ['peito-medio', 'peito-inferior'] },
    { id: 'peck-deck-uni', n: 'Aberturas na máquina a um braço', p: ['peito'], s: ['deltoide_ant'], e: 'maquina', t: 'I', r: [10, 15], inc: 2.5, uni: 'braco', pt: ['peito-medio'] },
    { id: 'flexoes-arqueiro', n: 'Flexões de arqueiro', p: ['peito'], s: ['triceps', 'deltoide_ant', 'abdominais'], e: 'corporal', t: 'C', r: [5, 10], inc: 2.5, bw: true, uni: 'braco', pt: ['peito-medio'] },

    // ---------------- COSTAS ----------------
    { id: 'elevacoes-pronada', n: 'Elevações na barra fixa (pega pronada)', p: ['dorsais'], s: ['biceps', 'antebraco', 'trapezio'], e: 'corporal', t: 'C', r: [5, 10], inc: 2.5, bw: true, pg: 'pronada', lg: 'larga', pt: ['costas-largura'] },
    { id: 'elevacoes-supinada', n: 'Elevações na barra fixa (pega supinada)', p: ['dorsais', 'biceps'], s: ['antebraco'], e: 'corporal', t: 'C', r: [5, 10], inc: 2.5, bw: true, pg: 'supinada', lg: 'fechada', pt: ['costas-largura', 'biceps-completo'] },
    { id: 'elevacoes-neutra', n: 'Elevações na barra fixa (pega neutra)', p: ['dorsais'], s: ['biceps', 'antebraco'], e: 'corporal', t: 'C', r: [5, 10], inc: 2.5, bw: true, pg: 'neutra', lg: 'fechada', pt: ['costas-largura'] },
    { id: 'puxada-frontal', n: 'Puxada à frente na polia alta (pega larga pronada)', p: ['dorsais'], s: ['biceps', 'trapezio'], e: 'cabos', t: 'C', r: [8, 12], inc: 5, pg: 'pronada', lg: 'larga', pt: ['costas-largura'] },
    { id: 'puxada-fechada-pronada', n: 'Puxada à frente com pega estreita pronada', p: ['dorsais'], s: ['biceps', 'trapezio'], e: 'cabos', t: 'C', r: [8, 12], inc: 5, pg: 'pronada', lg: 'fechada', pt: ['costas-largura'] },
    { id: 'puxada-supinada', n: 'Puxada na polia com pega supinada', p: ['dorsais', 'biceps'], s: [], e: 'cabos', t: 'C', r: [8, 12], inc: 5, pg: 'supinada', lg: 'fechada', pt: ['costas-largura'] },
    { id: 'puxada-neutra', n: 'Puxada na polia com pega neutra (triângulo)', p: ['dorsais'], s: ['biceps'], e: 'cabos', t: 'C', r: [8, 12], inc: 5, pg: 'neutra', lg: 'fechada', pt: ['costas-largura'] },
    { id: 'puxada-corda', n: 'Puxada na polia alta com corda', p: ['dorsais'], s: ['biceps', 'deltoide_post'], e: 'cabos', t: 'C', r: [10, 15], inc: 2.5, pg: 'corda', pt: ['costas-largura'] },
    { id: 'puxada-uni-polia', n: 'Puxada na polia alta a um braço', p: ['dorsais'], s: ['biceps', 'abdominais'], e: 'cabos', t: 'C', r: [8, 12], inc: 2.5, uni: 'braco', pg: 'neutra', pt: ['costas-largura'] },
    { id: 'remada-curvada-barra', n: 'Remada curvada com barra', p: ['dorsais', 'trapezio'], s: ['biceps', 'lombar'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5, pg: 'pronada', lg: 'media', pt: ['costas-espessura'] },
    { id: 'remada-yates', n: 'Remada com barra em pega supinada (Yates)', p: ['dorsais'], s: ['biceps', 'trapezio', 'lombar'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5, pg: 'supinada', lg: 'media', pt: ['costas-espessura'] },
    { id: 'remada-pendlay', n: 'Remada Pendlay', p: ['dorsais', 'trapezio'], s: ['biceps', 'lombar'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5, pg: 'pronada', lg: 'media', pt: ['costas-espessura'] },
    { id: 'remada-halter-uni', n: 'Remada com halter a um braço', p: ['dorsais'], s: ['biceps', 'trapezio'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, uni: 'braco', pg: 'neutra', pt: ['costas-espessura'] },
    { id: 'remada-meadows', n: 'Remada Meadows a um braço', p: ['dorsais'], s: ['biceps', 'trapezio', 'lombar'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5, uni: 'braco', pg: 'pronada', pt: ['costas-espessura'] },
    { id: 'remada-peito-apoiado', n: 'Remada com halteres com o peito apoiado', p: ['dorsais', 'trapezio'], s: ['biceps', 'deltoide_post'], e: 'halteres', t: 'C', r: [10, 14], inc: 2, pg: 'neutra', pt: ['costas-espessura'] },
    { id: 'remada-barra-t', n: 'Remada na barra T', p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5, pg: 'neutra', lg: 'fechada', pt: ['costas-espessura'] },
    { id: 'remada-baixa-polia', n: 'Remada sentada na polia baixa', p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'cabos', t: 'C', r: [8, 12], inc: 5, pg: 'neutra', lg: 'fechada', pt: ['costas-espessura'] },
    { id: 'remada-polia-larga', n: 'Remada na polia com pega larga pronada', p: ['dorsais', 'trapezio'], s: ['deltoide_post', 'biceps'], e: 'cabos', t: 'C', r: [10, 14], inc: 5, pg: 'pronada', lg: 'larga', pt: ['costas-espessura', 'ombro-posterior'] },
    { id: 'remada-polia-uni', n: 'Remada na polia a um braço', p: ['dorsais'], s: ['biceps', 'trapezio', 'abdominais'], e: 'cabos', t: 'C', r: [8, 12], inc: 2.5, uni: 'braco', pg: 'neutra', pt: ['costas-espessura'] },
    { id: 'remada-maquina', n: 'Remada na máquina', p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'maquina', t: 'C', r: [8, 12], inc: 5, pg: 'neutra', pt: ['costas-espessura'] },
    { id: 'remada-maquina-uni', n: 'Remada na máquina a um braço', p: ['dorsais'], s: ['biceps', 'trapezio'], e: 'maquina', t: 'C', r: [8, 12], inc: 2.5, uni: 'braco', pg: 'neutra', pt: ['costas-espessura'] },
    { id: 'pullover-polia', n: 'Pullover na polia alta', p: ['dorsais'], s: ['triceps'], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, pg: 'pronada', lg: 'media', pt: ['costas-largura'] },
    { id: 'puxada-omoplatas', n: 'Puxada de omoplatas na polia alta', p: ['trapezio'], s: ['dorsais'], e: 'cabos', t: 'I', r: [10, 15], inc: 5, pg: 'pronada', lg: 'larga', pt: ['costas-trapezio', 'costas-largura'] },
    { id: 'remada-invertida', n: 'Remada invertida na barra baixa', p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'corporal', t: 'C', r: [8, 15], inc: 2.5, bw: true, pg: 'pronada', lg: 'media', pt: ['costas-espessura'] },
    { id: 'remada-invertida-supinada', n: 'Remada invertida com pega supinada', p: ['dorsais', 'biceps'], s: ['trapezio'], e: 'corporal', t: 'C', r: [8, 15], inc: 2.5, bw: true, pg: 'supinada', lg: 'fechada', pt: ['costas-espessura', 'biceps-completo'] },
    { id: 'face-pull', n: 'Puxada à cara na polia', p: ['deltoide_post', 'trapezio'], s: ['biceps'], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5, pg: 'corda', pt: ['ombro-posterior', 'costas-trapezio'] },
    { id: 'encolhimentos-barra', n: 'Encolhimento de ombros com barra', p: ['trapezio'], s: ['antebraco'], e: 'barra', t: 'I', r: [10, 15], inc: 5, pg: 'pronada', lg: 'media', pt: ['costas-trapezio'] },
    { id: 'encolhimentos-halteres', n: 'Encolhimento de ombros com halteres', p: ['trapezio'], s: ['antebraco'], e: 'halteres', t: 'I', r: [10, 15], inc: 2, pg: 'neutra', pt: ['costas-trapezio'] },
    { id: 'encolhimento-polia', n: 'Encolhimento de ombros na polia', p: ['trapezio'], s: ['antebraco'], e: 'cabos', t: 'I', r: [12, 20], inc: 5, pg: 'neutra', pt: ['costas-trapezio'] },
    { id: 'peso-morto', n: 'Peso morto convencional', p: ['isquiotibiais', 'gluteos', 'lombar'], s: ['trapezio', 'dorsais', 'antebraco', 'quadriceps'], e: 'barra', t: 'C', r: [3, 6], inc: 5, pg: 'mista', lg: 'media', pt: ['costas-lombar', 'pernas-isquiotibiais', 'pernas-gluteos'] },
    { id: 'peso-morto-romeno', n: 'Peso morto romeno', p: ['isquiotibiais', 'gluteos'], s: ['lombar', 'trapezio', 'antebraco'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5, pt: ['pernas-isquiotibiais', 'pernas-gluteos'] },
    { id: 'peso-morto-sumo', n: 'Peso morto sumo', p: ['gluteos', 'quadriceps', 'isquiotibiais'], s: ['lombar', 'trapezio', 'adutores'], e: 'barra', t: 'C', r: [3, 6], inc: 5, pt: ['pernas-gluteos', 'pernas-adutores', 'costas-lombar'] },
    { id: 'hiperextensoes', n: 'Extensão do tronco no banco romano', p: ['lombar', 'gluteos'], s: ['isquiotibiais'], e: 'corporal', t: 'I', r: [10, 15], inc: 2.5, bw: true, pt: ['costas-lombar'] },

    // ---------------- OMBROS ----------------
    { id: 'press-militar', n: 'Press militar com barra', p: ['deltoide_ant'], s: ['deltoide_lat', 'triceps', 'abdominais'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5, pt: ['ombro-anterior'] },
    { id: 'press-ombros-halteres', n: 'Press de ombros com halteres', p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, pt: ['ombro-anterior', 'ombro-lateral'] },
    { id: 'press-arnold', n: 'Press Arnold', p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, pt: ['ombro-anterior', 'ombro-lateral'] },
    { id: 'press-ombros-maquina', n: 'Press de ombros na máquina', p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'maquina', t: 'C', r: [8, 12], inc: 5, pt: ['ombro-anterior'] },
    { id: 'press-ombros-neutro', n: 'Press de ombros com halteres em pega neutra', p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, pg: 'neutra', pt: ['ombro-anterior'] },
    { id: 'press-ombro-uni-halter', n: 'Press de ombro a um braço com halter', p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps', 'abdominais'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, uni: 'braco', pt: ['ombro-anterior'] },
    { id: 'press-kettlebell-uni', n: 'Press de ombro a um braço com kettlebell', p: ['deltoide_ant'], s: ['triceps', 'abdominais', 'trapezio'], e: 'kettlebell', t: 'C', r: [6, 10], inc: 4, uni: 'braco', pt: ['ombro-anterior'] },
    { id: 'elevacoes-laterais', n: 'Elevações laterais com halteres', p: ['deltoide_lat'], s: [], e: 'halteres', t: 'I', r: [12, 20], inc: 1, pt: ['ombro-lateral'] },
    { id: 'elevacoes-laterais-polia', n: 'Elevações laterais na polia a um braço', p: ['deltoide_lat'], s: [], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5, uni: 'braco', pt: ['ombro-lateral'] },
    { id: 'elevacao-lateral-inclinado', n: 'Elevação lateral inclinado no banco a um braço', p: ['deltoide_lat'], s: [], e: 'halteres', t: 'I', r: [12, 20], inc: 1, uni: 'braco', pt: ['ombro-lateral'] },
    { id: 'elevacoes-laterais-maquina', n: 'Elevações laterais na máquina', p: ['deltoide_lat'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5, pt: ['ombro-lateral'] },
    { id: 'elevacoes-frontais', n: 'Elevações à frente com halteres', p: ['deltoide_ant'], s: [], e: 'halteres', t: 'I', r: [12, 15], inc: 1, pt: ['ombro-anterior'] },
    { id: 'elevacao-frontal-polia-uni', n: 'Elevação à frente na polia a um braço', p: ['deltoide_ant'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, uni: 'braco', pt: ['ombro-anterior'] },
    { id: 'crucifixo-invertido', n: 'Aberturas invertidas com halteres', p: ['deltoide_post'], s: ['trapezio'], e: 'halteres', t: 'I', r: [12, 20], inc: 1, pt: ['ombro-posterior'] },
    { id: 'crucifixo-invertido-maquina', n: 'Aberturas invertidas na máquina', p: ['deltoide_post'], s: ['trapezio'], e: 'maquina', t: 'I', r: [12, 20], inc: 5, pt: ['ombro-posterior'] },
    { id: 'crucifixo-invertido-polia-uni', n: 'Abertura invertida na polia a um braço', p: ['deltoide_post'], s: ['trapezio'], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5, uni: 'braco', pt: ['ombro-posterior'] },
    { id: 'remada-alta', n: 'Remada alta', p: ['deltoide_lat', 'trapezio'], s: ['biceps'], e: 'barra', t: 'C', r: [10, 15], inc: 2.5, pg: 'pronada', lg: 'media', pt: ['ombro-lateral', 'costas-trapezio'] },

    // ---------------- BÍCEPS ----------------
    { id: 'rosca-direta-barra', n: 'Curl de bíceps com barra', p: ['biceps'], s: ['antebraco'], e: 'barra', t: 'I', r: [8, 12], inc: 2.5, pg: 'supinada', lg: 'media', pt: ['biceps-completo'] },
    { id: 'rosca-barra-w', n: 'Curl com barra W', p: ['biceps'], s: ['antebraco'], e: 'barra', t: 'I', r: [8, 12], inc: 2.5, pg: 'supinada', lg: 'fechada', pt: ['biceps-completo'] },
    { id: 'rosca-alternada', n: 'Curl alternado com halteres', p: ['biceps'], s: ['antebraco'], e: 'halteres', t: 'I', r: [10, 14], inc: 2, pg: 'supinada', pt: ['biceps-completo'] },
    { id: 'rosca-martelo', n: 'Curl martelo', p: ['biceps', 'antebraco'], s: [], e: 'halteres', t: 'I', r: [10, 14], inc: 2, pg: 'neutra', pt: ['biceps-braquial', 'antebraco-extensores'] },
    { id: 'rosca-martelo-corda', n: 'Curl martelo na polia com corda', p: ['biceps', 'antebraco'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, pg: 'corda', pt: ['biceps-braquial'] },
    { id: 'rosca-inversa', n: 'Curl invertido com barra (pega pronada)', p: ['biceps', 'antebraco'], s: [], e: 'barra', t: 'I', r: [10, 15], inc: 2.5, pg: 'pronada', lg: 'media', pt: ['biceps-braquial', 'antebraco-extensores'] },
    { id: 'rosca-scott', n: 'Curl no banco Scott', p: ['biceps'], s: [], e: 'barra', t: 'I', r: [10, 14], inc: 2.5, pg: 'supinada', lg: 'fechada', pt: ['biceps-completo'] },
    { id: 'rosca-scott-uni', n: 'Curl no banco Scott a um braço com halter', p: ['biceps'], s: [], e: 'halteres', t: 'I', r: [10, 14], inc: 2, uni: 'braco', pg: 'supinada', pt: ['biceps-completo'] },
    { id: 'rosca-concentrada', n: 'Curl concentrado', p: ['biceps'], s: [], e: 'halteres', t: 'I', r: [10, 15], inc: 2, uni: 'braco', pg: 'supinada', pt: ['biceps-longa'] },
    { id: 'rosca-polia', n: 'Curl na polia baixa', p: ['biceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, pg: 'supinada', pt: ['biceps-completo'] },
    { id: 'rosca-polia-uni', n: 'Curl de bíceps na polia a um braço', p: ['biceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, uni: 'braco', pg: 'supinada', pt: ['biceps-completo'] },
    { id: 'rosca-polia-alta-uni', n: 'Curl na polia alta a um braço', p: ['biceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, uni: 'braco', pg: 'supinada', pt: ['biceps-longa'] },
    { id: 'rosca-inclinada', n: 'Curl no banco inclinado', p: ['biceps'], s: [], e: 'halteres', t: 'I', r: [10, 14], inc: 2, pg: 'supinada', pt: ['biceps-longa'] },
    { id: 'rosca-aranha', n: 'Curl aranha com o peito apoiado', p: ['biceps'], s: [], e: 'halteres', t: 'I', r: [10, 15], inc: 2, pg: 'supinada', pt: ['biceps-completo'] },

    // ---------------- TRÍCEPS ----------------
    { id: 'dips-triceps', n: 'Paralelas', p: ['triceps'], s: ['peito', 'deltoide_ant'], e: 'corporal', t: 'C', r: [6, 12], inc: 2.5, bw: true, pt: ['triceps-forca'] },
    { id: 'supino-fechado', n: 'Supino com pega fechada', p: ['triceps'], s: ['peito', 'deltoide_ant'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5, pg: 'pronada', lg: 'fechada', pt: ['triceps-forca'] },
    { id: 'triceps-polia-barra', n: 'Extensão de tríceps na polia com barra', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, pg: 'pronada', lg: 'fechada', pt: ['triceps-lateral'] },
    { id: 'triceps-polia-corda', n: 'Extensão de tríceps na polia com corda', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, pg: 'corda', pt: ['triceps-lateral'] },
    { id: 'triceps-polia-corda-uni', n: 'Extensão de tríceps na polia com corda a um braço', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, uni: 'braco', pg: 'corda', pt: ['triceps-lateral'] },
    { id: 'triceps-polia-uni-supinada', n: 'Extensão de tríceps na polia a um braço em pega supinada', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, uni: 'braco', pg: 'supinada', pt: ['triceps-lateral'] },
    { id: 'triceps-testa', n: 'Tríceps à testa com barra W', p: ['triceps'], s: [], e: 'barra', t: 'I', r: [8, 12], inc: 2.5, pg: 'pronada', lg: 'fechada', pt: ['triceps-longa'] },
    { id: 'triceps-acima-cabeca', n: 'Extensão de tríceps acima da cabeça', p: ['triceps'], s: [], e: 'halteres', t: 'I', r: [10, 15], inc: 2, pt: ['triceps-longa'] },
    { id: 'triceps-acima-cabeca-uni', n: 'Extensão de tríceps acima da cabeça a um braço', p: ['triceps'], s: [], e: 'halteres', t: 'I', r: [10, 15], inc: 2, uni: 'braco', pt: ['triceps-longa'] },
    { id: 'triceps-polia-acima-cabeca', n: 'Extensão de tríceps acima da cabeça na polia', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, pg: 'corda', pt: ['triceps-longa'] },
    { id: 'triceps-kickback', n: 'Extensão de tríceps para trás com halteres', p: ['triceps'], s: [], e: 'halteres', t: 'I', r: [12, 15], inc: 1, uni: 'braco', pg: 'neutra', pt: ['triceps-lateral'] },
    { id: 'triceps-kickback-polia', n: 'Extensão de tríceps para trás na polia a um braço', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, uni: 'braco', pg: 'neutra', pt: ['triceps-lateral'] },
    { id: 'triceps-maquina', n: 'Extensão de tríceps na máquina', p: ['triceps'], s: [], e: 'maquina', t: 'I', r: [10, 15], inc: 5, pt: ['triceps-lateral'] },
    { id: 'flexoes-diamante', n: 'Flexões em diamante', p: ['triceps'], s: ['peito'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true, pt: ['triceps-forca'] },

    // ---------------- ANTEBRAÇO ----------------
    { id: 'rosca-punho', n: 'Flexão de punho com barra', p: ['antebraco'], s: [], e: 'barra', t: 'I', r: [15, 20], inc: 2.5, pg: 'supinada', pt: ['antebraco-flexores'] },
    { id: 'rosca-punho-halter-uni', n: 'Flexão de punho a um braço com halter', p: ['antebraco'], s: [], e: 'halteres', t: 'I', r: [15, 20], inc: 1, uni: 'braco', pg: 'supinada', pt: ['antebraco-flexores'] },
    { id: 'rosca-punho-invertida', n: 'Extensão de punho com barra', p: ['antebraco'], s: [], e: 'barra', t: 'I', r: [15, 20], inc: 2.5, pg: 'pronada', pt: ['antebraco-extensores'] },
    { id: 'farmers-walk', n: 'Transporte de halteres (farmer walk)', p: ['antebraco', 'trapezio'], s: ['abdominais', 'gluteos'], e: 'halteres', t: 'C', r: [30, 60], inc: 5, m: 'tempo', pg: 'neutra', pt: ['antebraco-pega', 'hibrido-transporte'] },
    { id: 'transporte-mala', n: 'Transporte de mala a um lado', p: ['antebraco', 'abdominais'], s: ['trapezio', 'gluteos'], e: 'halteres', t: 'C', r: [20, 45], inc: 4, m: 'tempo', uni: 'lado', pg: 'neutra', pt: ['antebraco-pega', 'abdominais-obliquos', 'hibrido-transporte'] },
    { id: 'pega-disco', n: 'Segurar disco com os dedos', p: ['antebraco'], s: [], e: 'disco', t: 'I', r: [20, 45], inc: 1.25, m: 'tempo', pt: ['antebraco-pega'] },

    // ---------------- QUADRÍCEPS ----------------
    { id: 'agachamento-barra', n: 'Agachamento com barra', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais', 'lombar', 'abdominais'], e: 'barra', t: 'C', r: [5, 8], inc: 5, pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'agachamento-frontal', n: 'Agachamento frontal', p: ['quadriceps'], s: ['gluteos', 'abdominais'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5, pt: ['pernas-quadriceps'] },
    { id: 'agachamento-bulgaro', n: 'Agachamento búlgaro', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, uni: 'perna', pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'goblet-squat', n: 'Agachamento com halter ao peito', p: ['quadriceps', 'gluteos'], s: ['abdominais', 'adutores'], e: 'halteres', t: 'C', r: [10, 15], inc: 2.5, pt: ['pernas-quadriceps'] },
    { id: 'prensa-pernas', n: 'Prensa de pernas', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'maquina', t: 'C', r: [8, 15], inc: 10, pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'prensa-uni', n: 'Prensa de pernas a uma perna', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'maquina', t: 'C', r: [10, 15], inc: 5, uni: 'perna', pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'hack-squat', n: 'Agachamento na máquina hack', p: ['quadriceps'], s: ['gluteos'], e: 'maquina', t: 'C', r: [8, 12], inc: 5, pt: ['pernas-quadriceps'] },
    { id: 'extensao-pernas', n: 'Extensão de pernas na máquina', p: ['quadriceps'], s: [], e: 'maquina', t: 'I', r: [12, 15], inc: 5, pt: ['pernas-quadriceps'] },
    { id: 'extensao-pernas-uni', n: 'Extensão de pernas a uma perna', p: ['quadriceps'], s: [], e: 'maquina', t: 'I', r: [12, 15], inc: 2.5, uni: 'perna', pt: ['pernas-quadriceps'] },
    { id: 'afundos-halteres', n: 'Afundos com halteres', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [10, 12], inc: 2, uni: 'perna', pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'afundo-reverso', n: 'Afundo para trás', p: ['gluteos', 'quadriceps'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [10, 12], inc: 2, uni: 'perna', pt: ['pernas-gluteos', 'pernas-quadriceps'] },
    { id: 'afundo-lateral', n: 'Afundo lateral', p: ['adutores', 'quadriceps'], s: ['gluteos'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, uni: 'perna', pt: ['pernas-adutores', 'pernas-quadriceps'] },
    { id: 'afundos-caminhando', n: 'Afundos a caminhar', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [10, 16], inc: 2, uni: 'perna', pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'step-up', n: 'Subida ao banco com halteres', p: ['quadriceps', 'gluteos'], s: [], e: 'halteres', t: 'C', r: [10, 12], inc: 2, uni: 'perna', pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'agachamento-pistola', n: 'Agachamento a uma perna (pistola)', p: ['quadriceps', 'gluteos'], s: ['abdominais', 'isquiotibiais'], e: 'corporal', t: 'C', r: [3, 8], inc: 2.5, bw: true, uni: 'perna', pt: ['pernas-quadriceps'] },
    { id: 'agachamento-uma-perna-caixa', n: 'Agachamento a uma perna para a caixa', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais', 'abdominais'], e: 'caixa', t: 'C', r: [6, 12], inc: 2, uni: 'perna', pt: ['pernas-quadriceps', 'pernas-gluteos'] },
    { id: 'sumo-squat-halter', n: 'Agachamento sumo com halter', p: ['quadriceps', 'gluteos'], s: ['adutores', 'isquiotibiais'], e: 'halteres', t: 'C', r: [10, 15], inc: 2.5, pt: ['pernas-adutores', 'pernas-gluteos'] },

    // ---------------- ISQUIOTIBIAIS, GLÚTEOS E ADUTORES ----------------
    { id: 'flexao-pernas-deitado', n: 'Flexão de pernas deitado na máquina', p: ['isquiotibiais'], s: ['gemeos'], e: 'maquina', t: 'I', r: [10, 15], inc: 5, pt: ['pernas-isquiotibiais'] },
    { id: 'flexao-pernas-sentado', n: 'Flexão de pernas sentado na máquina', p: ['isquiotibiais'], s: [], e: 'maquina', t: 'I', r: [10, 15], inc: 5, pt: ['pernas-isquiotibiais'] },
    { id: 'flexao-pernas-uni', n: 'Flexão de pernas a uma perna na máquina', p: ['isquiotibiais'], s: ['gemeos'], e: 'maquina', t: 'I', r: [10, 15], inc: 2.5, uni: 'perna', pt: ['pernas-isquiotibiais'] },
    { id: 'good-morning', n: 'Bom dia com barra', p: ['isquiotibiais', 'lombar'], s: ['gluteos'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5, pt: ['pernas-isquiotibiais', 'costas-lombar'] },
    { id: 'nordic-curl', n: 'Flexão nórdica', p: ['isquiotibiais'], s: [], e: 'corporal', t: 'I', r: [5, 10], inc: 2.5, bw: true, pt: ['pernas-isquiotibiais'] },
    { id: 'peso-morto-uni', n: 'Peso morto romeno a uma perna', p: ['isquiotibiais', 'gluteos'], s: ['lombar', 'abdominais'], e: 'halteres', t: 'C', r: [8, 12], inc: 2, uni: 'perna', pt: ['pernas-isquiotibiais', 'pernas-gluteos'] },
    { id: 'hip-thrust', n: 'Elevação da bacia com barra', p: ['gluteos'], s: ['isquiotibiais'], e: 'barra', t: 'C', r: [8, 12], inc: 5, pt: ['pernas-gluteos'] },
    { id: 'hip-thrust-uni', n: 'Elevação da bacia a uma perna', p: ['gluteos'], s: ['isquiotibiais', 'abdominais'], e: 'corporal', t: 'C', r: [10, 15], inc: 2.5, bw: true, uni: 'perna', pt: ['pernas-gluteos'] },
    { id: 'ponte-gluteos', n: 'Ponte de glúteos no chão', p: ['gluteos'], s: ['isquiotibiais'], e: 'corporal', t: 'I', r: [12, 20], inc: 2.5, bw: true, pt: ['pernas-gluteos'] },
    { id: 'abducao-anca', n: 'Abdução de anca na máquina', p: ['gluteos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5, pt: ['pernas-gluteos'] },
    { id: 'abducao-anca-polia', n: 'Abdução de anca na polia a uma perna', p: ['gluteos'], s: [], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5, uni: 'perna', pt: ['pernas-gluteos'] },
    { id: 'aducao-anca', n: 'Adução de anca na máquina', p: ['adutores'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5, pt: ['pernas-adutores'] },
    { id: 'coice-polia', n: 'Extensão de anca na polia', p: ['gluteos'], s: ['isquiotibiais'], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5, uni: 'perna', pt: ['pernas-gluteos'] },
    { id: 'peso-morto-pernas-rigidas', n: 'Peso morto de pernas esticadas', p: ['isquiotibiais', 'gluteos'], s: ['lombar'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5, pt: ['pernas-isquiotibiais'] },
    { id: 'agachamento-cossaco', n: 'Agachamento cossaco', p: ['adutores', 'quadriceps'], s: ['gluteos'], e: 'corporal', t: 'C', r: [8, 12], inc: 2, bw: true, uni: 'perna', pt: ['pernas-adutores'] },

    // ---------------- GÉMEOS ----------------
    { id: 'gemeos-pe', n: 'Elevação de gémeos de pé', p: ['gemeos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5, pt: ['pernas-gemeos'] },
    { id: 'gemeos-sentado', n: 'Elevação de gémeos sentado', p: ['gemeos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5, pt: ['pernas-gemeos'] },
    { id: 'gemeos-prensa', n: 'Elevação de gémeos na prensa', p: ['gemeos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 10, pt: ['pernas-gemeos'] },
    { id: 'gemeos-uni', n: 'Elevação de gémeos a uma perna', p: ['gemeos'], s: [], e: 'corporal', t: 'I', r: [12, 20], inc: 2.5, bw: true, uni: 'perna', pt: ['pernas-gemeos'] },

    // ---------------- ABDOMINAIS E LOMBAR ----------------
    { id: 'prancha', n: 'Prancha', p: ['abdominais'], s: ['lombar', 'gluteos'], e: 'corporal', t: 'I', r: [30, 90], inc: 2.5, bw: true, m: 'tempo', pt: ['abdominais-estabilizacao'] },
    { id: 'prancha-lateral', n: 'Prancha lateral', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [20, 60], inc: 2.5, bw: true, m: 'tempo', uni: 'lado', pt: ['abdominais-obliquos', 'abdominais-estabilizacao'] },
    { id: 'crunch', n: 'Abdominais no chão', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [15, 25], inc: 2.5, bw: true, pt: ['abdominais-superiores'] },
    { id: 'crunch-polia', n: 'Abdominais ajoelhado na polia', p: ['abdominais'], s: [], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5, pt: ['abdominais-superiores'] },
    { id: 'elevacao-pernas-suspenso', n: 'Elevação de pernas na barra', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [8, 15], inc: 2.5, bw: true, pt: ['abdominais-inferiores'] },
    { id: 'elevacao-joelhos', n: 'Elevação de joelhos na barra', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [10, 20], inc: 2.5, bw: true, pt: ['abdominais-inferiores'] },
    { id: 'ab-wheel', n: 'Roda abdominal', p: ['abdominais'], s: ['lombar'], e: 'corporal', t: 'I', r: [8, 15], inc: 2.5, bw: true, pt: ['abdominais-estabilizacao'] },
    { id: 'russian-twist', n: 'Rotação do tronco sentado', p: ['abdominais'], s: [], e: 'halteres', t: 'I', r: [15, 25], inc: 2, pt: ['abdominais-obliquos'] },
    { id: 'mountain-climbers', n: 'Corrida de escalador (mountain climbers)', p: ['abdominais'], s: ['quadriceps'], e: 'corporal', t: 'C', r: [20, 40], inc: 2.5, bw: true, cond: true, pt: ['abdominais-inferiores', 'hibrido-corrida'] },
    { id: 'dead-bug', n: 'Insecto morto (dead bug)', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [10, 16], inc: 2.5, bw: true, pt: ['abdominais-estabilizacao'] },
    { id: 'bird-dog', n: 'Cão de caça (bird dog)', p: ['lombar', 'abdominais'], s: ['gluteos'], e: 'corporal', t: 'I', r: [10, 16], inc: 2.5, bw: true, pt: ['abdominais-estabilizacao', 'costas-lombar'] },
    { id: 'superman', n: 'Superman no chão', p: ['lombar'], s: ['gluteos'], e: 'corporal', t: 'I', r: [12, 20], inc: 2.5, bw: true, pt: ['costas-lombar'] },
    { id: 'pallof-press', n: 'Press Pallof na polia', p: ['abdominais'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5, uni: 'lado', pt: ['abdominais-obliquos', 'abdominais-estabilizacao'] },
    { id: 'flexao-lateral-halter', n: 'Flexão lateral com halter', p: ['abdominais'], s: ['lombar'], e: 'halteres', t: 'I', r: [12, 20], inc: 2, uni: 'lado', pg: 'neutra', pt: ['abdominais-obliquos'] },
    { id: 'crunch-bicicleta', n: 'Abdominais em bicicleta', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [16, 30], inc: 2.5, bw: true, pt: ['abdominais-obliquos', 'abdominais-inferiores'] },
    { id: 'hollow-hold', n: 'Barquinho (hollow hold)', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [20, 60], inc: 2.5, bw: true, m: 'tempo', pt: ['abdominais-inferiores', 'abdominais-estabilizacao'] },

    // ---------------- CORRIDA ----------------
    { id: 'corrida', n: 'Corrida', p: ['quadriceps', 'gemeos'], s: ['isquiotibiais', 'gluteos', 'abdominais'], e: 'nenhum', t: 'C', r: [1000, 5000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-corrida'] },
    { id: 'corrida-passadeira', n: 'Corrida na passadeira', p: ['quadriceps', 'gemeos'], s: ['isquiotibiais', 'gluteos'], e: 'cardio', t: 'C', r: [800, 3000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-corrida', 'hibrido-maquina'] },
    { id: 'sprints', n: 'Sprints', p: ['quadriceps', 'isquiotibiais'], s: ['gluteos', 'gemeos'], e: 'nenhum', t: 'C', r: [100, 400], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-corrida'] },
    { id: 'corrida-lugar', n: 'Corrida no lugar com joelhos altos', p: ['quadriceps', 'gemeos'], s: ['abdominais'], e: 'nenhum', t: 'C', r: [30, 60], inc: 0, m: 'tempo', cond: true, pt: ['hibrido-corrida'] },
    { id: 'subir-escadas', n: 'Subir escadas', p: ['quadriceps', 'gluteos'], s: ['gemeos'], e: 'nenhum', t: 'C', r: [60, 180], inc: 0, m: 'tempo', cond: true, pt: ['hibrido-corrida'] },
    { id: 'marcha-inclinada', n: 'Marcha inclinada na passadeira', p: ['gluteos', 'quadriceps'], s: ['gemeos', 'isquiotibiais'], e: 'cardio', t: 'C', r: [600, 2000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-corrida', 'hibrido-maquina'] },

    // ---------------- MÁQUINAS DE CARDIO ----------------
    { id: 'remo-maquina', n: 'Remo no remoergómetro', p: ['dorsais', 'quadriceps'], s: ['biceps', 'isquiotibiais', 'lombar', 'trapezio'], e: 'cardio', t: 'C', r: [250, 1000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-maquina'] },
    { id: 'ski-erg', n: 'Ski erg', p: ['dorsais', 'abdominais'], s: ['triceps', 'deltoide_post'], e: 'cardio', t: 'C', r: [250, 1000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-maquina'] },
    { id: 'bicicleta-assalto', n: 'Bicicleta de assalto', p: ['quadriceps', 'dorsais'], s: ['deltoide_ant', 'isquiotibiais'], e: 'cardio', t: 'C', r: [10, 25], inc: 0, m: 'calorias', cond: true, pt: ['hibrido-maquina'] },
    { id: 'bicicleta-estatica', n: 'Bicicleta estática', p: ['quadriceps'], s: ['gluteos', 'gemeos'], e: 'cardio', t: 'C', r: [2000, 8000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-maquina'] },
    { id: 'eliptica', n: 'Elíptica', p: ['quadriceps', 'gluteos'], s: ['dorsais', 'isquiotibiais'], e: 'cardio', t: 'C', r: [1000, 4000], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-maquina'] },

    // ---------------- SALTOS ----------------
    { id: 'salto-corda', n: 'Saltar à corda', p: ['gemeos'], s: ['quadriceps', 'antebraco'], e: 'corda', t: 'C', r: [30, 120], inc: 0, m: 'tempo', cond: true, pt: ['hibrido-saltos'] },
    { id: 'box-jump', n: 'Salto para a caixa', p: ['quadriceps', 'gluteos'], s: ['gemeos', 'isquiotibiais'], e: 'caixa', t: 'C', r: [8, 15], inc: 0, m: 'reps', cond: true, pt: ['hibrido-saltos'] },
    { id: 'burpees', n: 'Burpees', p: ['quadriceps', 'peito'], s: ['abdominais', 'deltoide_ant', 'triceps'], e: 'corporal', t: 'C', r: [10, 20], inc: 0, bw: true, m: 'reps', cond: true, pt: ['hibrido-saltos'] },
    { id: 'burpee-box-jump', n: 'Burpee com salto para a caixa', p: ['quadriceps', 'peito'], s: ['gluteos', 'abdominais', 'deltoide_ant'], e: 'caixa', t: 'C', r: [8, 15], inc: 0, m: 'reps', cond: true, pt: ['hibrido-saltos'] },
    { id: 'polichinelos', n: 'Polichinelos', p: ['gemeos', 'deltoide_lat'], s: ['quadriceps'], e: 'nenhum', t: 'C', r: [30, 60], inc: 0, m: 'tempo', cond: true, pt: ['hibrido-saltos'] },
    { id: 'agachamento-salto', n: 'Agachamento com salto', p: ['quadriceps', 'gluteos'], s: ['gemeos'], e: 'corporal', t: 'C', r: [10, 20], inc: 0, bw: true, m: 'reps', cond: true, pt: ['hibrido-saltos'] },
    { id: 'agachamento-livre', n: 'Agachamento sem carga', p: ['quadriceps', 'gluteos'], s: ['isquiotibiais', 'abdominais'], e: 'corporal', t: 'C', r: [15, 30], inc: 0, bw: true, m: 'reps', cond: true, pt: ['hibrido-saltos', 'pernas-quadriceps'] },

    // ---------------- MOVIMENTOS BALÍSTICOS ----------------
    { id: 'wall-ball', n: 'Lançamento de bola à parede', p: ['quadriceps', 'deltoide_ant'], s: ['gluteos', 'triceps', 'abdominais'], e: 'bola', t: 'C', r: [10, 20], inc: 0, m: 'reps', cond: true, pt: ['hibrido-balistico'] },
    { id: 'slam-ball', n: 'Bola atirada ao chão', p: ['abdominais', 'dorsais'], s: ['deltoide_ant', 'quadriceps'], e: 'bola', t: 'C', r: [10, 20], inc: 0, m: 'reps', cond: true, pt: ['hibrido-balistico'] },
    { id: 'kettlebell-swing', n: 'Balanço com kettlebell', p: ['gluteos', 'isquiotibiais'], s: ['lombar', 'abdominais', 'trapezio'], e: 'kettlebell', t: 'C', r: [15, 25], inc: 4, cond: true, pt: ['hibrido-balistico', 'pernas-gluteos'] },
    { id: 'thruster', n: 'Thruster (agachamento com press)', p: ['quadriceps', 'deltoide_ant'], s: ['gluteos', 'triceps', 'abdominais'], e: 'barra', t: 'C', r: [8, 15], inc: 2.5, cond: true, pt: ['hibrido-balistico'] },
    { id: 'devil-press', n: 'Devil press com halteres', p: ['deltoide_ant', 'peito'], s: ['quadriceps', 'abdominais', 'triceps'], e: 'halteres', t: 'C', r: [6, 12], inc: 2, cond: true, pt: ['hibrido-balistico'] },
    { id: 'clean-and-press', n: 'Clean e press com barra', p: ['deltoide_ant', 'quadriceps', 'trapezio'], s: ['gluteos', 'triceps'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5, pt: ['hibrido-balistico', 'ombro-anterior'] },
    { id: 'kettlebell-clean-press', n: 'Clean e press com kettlebell', p: ['deltoide_ant', 'quadriceps'], s: ['trapezio', 'abdominais'], e: 'kettlebell', t: 'C', r: [6, 12], inc: 4, cond: true, pt: ['hibrido-balistico'] },
    { id: 'battle-ropes', n: 'Cordas de batalha', p: ['deltoide_ant', 'antebraco'], s: ['abdominais', 'dorsais'], e: 'corda', t: 'C', r: [20, 45], inc: 0, m: 'tempo', cond: true, pt: ['hibrido-balistico'] },
    { id: 'turkish-get-up', n: 'Levantamento turco', p: ['abdominais', 'deltoide_ant'], s: ['gluteos', 'quadriceps'], e: 'kettlebell', t: 'C', r: [3, 6], inc: 4, pt: ['hibrido-balistico', 'abdominais-estabilizacao'] },

    // ---------------- TRANSPORTE E ARRASTO ----------------
    { id: 'treno-empurrar', n: 'Empurrar o trenó', p: ['quadriceps', 'gluteos'], s: ['gemeos', 'deltoide_ant'], e: 'treno', t: 'C', r: [15, 40], inc: 10, m: 'distancia', cond: true, pt: ['hibrido-transporte'] },
    { id: 'treno-puxar', n: 'Puxar o trenó', p: ['dorsais', 'isquiotibiais'], s: ['biceps', 'gluteos'], e: 'treno', t: 'C', r: [15, 40], inc: 10, m: 'distancia', cond: true, pt: ['hibrido-transporte'] },
    { id: 'transporte-frontal', n: 'Transporte de carga ao peito', p: ['abdominais', 'quadriceps'], s: ['trapezio', 'antebraco'], e: 'halteres', t: 'C', r: [20, 50], inc: 4, m: 'distancia', cond: true, pt: ['hibrido-transporte', 'antebraco-pega'] },
    { id: 'bear-crawl', n: 'Marcha de urso', p: ['abdominais', 'deltoide_ant'], s: ['quadriceps', 'triceps'], e: 'corporal', t: 'C', r: [10, 30], inc: 0, m: 'distancia', cond: true, pt: ['hibrido-transporte', 'abdominais-estabilizacao'] },

    // ---------------- ELÁSTICOS ----------------
    { id: 'remada-elastico', n: 'Remada com elástico', p: ['dorsais'], s: ['biceps'], e: 'elastico', t: 'C', r: [12, 20], inc: 1, pt: ['costas-espessura'] },
    { id: 'puxada-elastico', n: 'Puxada com elástico', p: ['dorsais'], s: ['biceps'], e: 'elastico', t: 'C', r: [12, 20], inc: 1, pt: ['costas-largura'] }
  ];

  /* --- Exercícios de referência ------------------------------
     pr 1 = primeira escolha para o músculo, pr 2 = boa alternativa.
     Usado pelo motor de sugestão para não propor exercícios
     exóticos quando ainda não há histórico.                     */
  const PRINCIPAIS = {
    // peito
    'supino-reto-barra': 1, 'supino-inclinado-halteres': 2, 'press-peito-maquina': 2, 'peck-deck': 2,
    // ombros
    'press-militar': 1, 'press-ombros-halteres': 2,
    'elevacoes-laterais': 1, 'elevacoes-laterais-polia': 2,
    'face-pull': 1, 'crucifixo-invertido': 2,
    // tríceps
    'triceps-polia-corda': 1, 'supino-fechado': 2, 'triceps-testa': 2,
    // costas
    'puxada-frontal': 1, 'remada-curvada-barra': 1, 'elevacoes-pronada': 2, 'remada-baixa-polia': 2,
    'remada-halter-uni': 2, 'encolhimentos-halteres': 1,
    // braços
    'rosca-direta-barra': 1, 'rosca-martelo': 2, 'rosca-punho': 1,
    // pernas
    'agachamento-barra': 1, 'prensa-pernas': 2, 'extensao-pernas': 2,
    'peso-morto-romeno': 1, 'flexao-pernas-deitado': 2,
    'hip-thrust': 1, 'abducao-anca': 2, 'aducao-anca': 1,
    'gemeos-pe': 1, 'gemeos-sentado': 2,
    // zona central
    'elevacao-joelhos': 1, 'prancha': 2, 'crunch-polia': 2,
    'hiperextensoes': 1
  };

  /* --- Modelos de treino (divisões) --------------------------
     Cada sessão define os músculos alvo. Um dia com `circuito`
     propõe um treino híbrido em vez de uma sessão de força.     */
  const SPLITS = {
    fullbody: {
      name: 'Corpo inteiro',
      desc: '2 a 3 vezes por semana. Ideal para começar ou para quem tem pouco tempo.',
      dias: [
        { name: 'Corpo inteiro A', foco: ['peito', 'dorsais', 'quadriceps', 'deltoide_lat', 'abdominais'] },
        { name: 'Corpo inteiro B', foco: ['isquiotibiais', 'gluteos', 'dorsais', 'peito', 'triceps', 'biceps'] }
      ]
    },
    upperlower: {
      name: 'Superior e inferior',
      desc: '4 vezes por semana. Bom equilíbrio entre volume e recuperação.',
      dias: [
        { name: 'Tronco', foco: ['peito', 'dorsais', 'deltoide_lat', 'triceps', 'biceps', 'deltoide_post'] },
        { name: 'Pernas', foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos', 'abdominais'] }
      ]
    },
    ppl: {
      name: 'Empurrar, puxar e pernas',
      desc: '3 a 6 vezes por semana. Volume máximo por grupo muscular.',
      dias: [
        { name: 'Empurrar', foco: ['peito', 'deltoide_ant', 'deltoide_lat', 'triceps'] },
        { name: 'Puxar', foco: ['dorsais', 'trapezio', 'deltoide_post', 'biceps', 'antebraco'] },
        { name: 'Pernas', foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos', 'abdominais'] }
      ]
    },
    arnold: {
      name: 'Peito e costas, ombros e braços, pernas',
      desc: '3 a 6 vezes por semana. Clássico, junta músculos opostos no mesmo dia.',
      dias: [
        { name: 'Peito e costas', foco: ['peito', 'dorsais', 'trapezio'] },
        { name: 'Ombros e braços', foco: ['deltoide_lat', 'deltoide_ant', 'deltoide_post', 'biceps', 'triceps', 'antebraco'] },
        { name: 'Pernas e zona central', foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos', 'abdominais', 'lombar'] }
      ]
    },
    hibrido: {
      name: 'Híbrido: força e condição física',
      desc: '4 a 5 vezes por semana. Dias de força a alternar com circuitos.',
      dias: [
        { name: 'Força — tronco', foco: ['peito', 'dorsais', 'deltoide_lat', 'triceps', 'biceps'] },
        { name: 'Circuito híbrido', circuito: 'condicao-total' },
        { name: 'Força — pernas', foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos'] },
        { name: 'Circuito híbrido', circuito: 'forca-folego' }
      ]
    },
    perda: {
      name: 'Corpo inteiro com circuitos',
      desc: '4 a 5 vezes por semana. Musculação de corpo inteiro alternada com circuitos.',
      dias: [
        { name: 'Corpo inteiro A', foco: ['quadriceps', 'peito', 'dorsais', 'deltoide_lat', 'abdominais'] },
        { name: 'Circuito de condição', circuito: 'queima' },
        { name: 'Corpo inteiro B', foco: ['gluteos', 'isquiotibiais', 'dorsais', 'triceps', 'biceps', 'abdominais'] },
        { name: 'Circuito de condição', circuito: 'condicao-total' }
      ]
    }
  };

  /* --- Circuitos e treinos híbridos ---------------------------
     formato:
       rondas  — número fixo de voltas, descansa entre estações
       amrap   — o máximo de voltas possível dentro do tempo
       emom    — uma estação por minuto, descansa o que sobrar
       tabata  — 20 segundos a trabalhar, 10 a descansar
     alvo = valor por estação, na unidade da métrica do exercício */
  const CIRCUITOS = {
    'condicao-total': {
      name: 'Condição total',
      desc: 'Quatro estações que juntam máquina, pernas, anca e corpo inteiro. O clássico para ganhar fôlego sem perder força.',
      formato: 'rondas', rondas: 4, descansoEstacao: 20, descansoRonda: 90, minutos: 25, nivel: 'Intermédio',
      objetivos: ['hibrido', 'peso'],
      estacoes: [
        { ex: 'remo-maquina', alvo: 400 },
        { ex: 'wall-ball', alvo: 15 },
        { ex: 'kettlebell-swing', alvo: 20 },
        { ex: 'burpees', alvo: 10 }
      ]
    },
    queima: {
      name: 'Queima',
      desc: 'Cinco voltas rápidas sem material pesado. Descanso curto para manter as pulsações em cima do tempo todo.',
      formato: 'rondas', rondas: 5, descansoEstacao: 15, descansoRonda: 60, minutos: 30, nivel: 'Todos os níveis',
      objetivos: ['peso'],
      estacoes: [
        { ex: 'salto-corda', alvo: 60 },
        { ex: 'agachamento-livre', alvo: 20 },
        { ex: 'flexoes', alvo: 12 },
        { ex: 'prancha', alvo: 45 },
        { ex: 'corrida', alvo: 200 }
      ]
    },
    'forca-folego': {
      name: 'Força e fôlego',
      desc: 'Barra pesada seguida de corrida. Treina a capacidade de continuar a mexer carga com o coração acelerado.',
      formato: 'rondas', rondas: 4, descansoEstacao: 30, descansoRonda: 120, minutos: 30, nivel: 'Avançado',
      objetivos: ['hibrido'],
      estacoes: [
        { ex: 'thruster', alvo: 10 },
        { ex: 'elevacoes-pronada', alvo: 8 },
        { ex: 'corrida', alvo: 400 }
      ]
    },
    'emom-20': {
      name: 'Um exercício por minuto (20 minutos)',
      desc: 'A cada minuto começas uma estação nova. O que sobrar do minuto é o teu descanso — quanto mais rápido fores, mais descansas.',
      formato: 'emom', rondas: 5, descansoEstacao: 0, descansoRonda: 0, minutos: 20, nivel: 'Intermédio',
      objetivos: ['hibrido', 'peso'],
      estacoes: [
        { ex: 'kettlebell-swing', alvo: 12 },
        { ex: 'box-jump', alvo: 10 },
        { ex: 'wall-ball', alvo: 12 },
        { ex: 'elevacao-joelhos', alvo: 15 }
      ]
    },
    'amrap-12': {
      name: 'Máximo de voltas em 12 minutos',
      desc: 'Sem material. Fazes as voltas que conseguires em 12 minutos e apontas quantas foram — na próxima tentas passar o registo.',
      formato: 'amrap', rondas: 6, descansoEstacao: 0, descansoRonda: 0, minutos: 12, nivel: 'Todos os níveis',
      objetivos: ['peso', 'hibrido'],
      estacoes: [
        { ex: 'agachamento-livre', alvo: 10 },
        { ex: 'flexoes', alvo: 8 },
        { ex: 'burpees', alvo: 6 }
      ]
    },
    'tabata-core': {
      name: 'Tabata da zona central',
      desc: 'Vinte segundos a trabalhar, dez a descansar, oito voltas. Curto e muito intenso — bom para acabar um treino.',
      formato: 'tabata', rondas: 8, descansoEstacao: 10, descansoRonda: 0, minutos: 16, nivel: 'Intermédio',
      objetivos: ['peso', 'hibrido'],
      estacoes: [
        { ex: 'mountain-climbers', alvo: 20 },
        { ex: 'hollow-hold', alvo: 20 },
        { ex: 'prancha-lateral', alvo: 20 },
        { ex: 'russian-twist', alvo: 20 }
      ]
    },
    'primeiro-circuito': {
      name: 'Primeiro circuito',
      desc: 'Três voltas sem qualquer equipamento, com descanso generoso. É por aqui que se começa.',
      formato: 'rondas', rondas: 3, descansoEstacao: 30, descansoRonda: 90, minutos: 20, nivel: 'Iniciante',
      objetivos: ['peso', 'hibrido'],
      estacoes: [
        { ex: 'agachamento-livre', alvo: 15 },
        { ex: 'flexoes-joelhos', alvo: 10 },
        { ex: 'polichinelos', alvo: 40 },
        { ex: 'prancha', alvo: 30 }
      ]
    }
  };

  const FORMATOS = {
    rondas: { name: 'Rondas fixas', desc: 'Fazes todas as estações e voltas ao início.' },
    amrap:  { name: 'Máximo de voltas', desc: 'Voltas seguidas até o tempo acabar.' },
    emom:   { name: 'Uma estação por minuto', desc: 'Começas uma estação a cada minuto certo.' },
    tabata: { name: 'Tabata', desc: '20 segundos a trabalhar, 10 a descansar.' }
  };

  EXERCISES.forEach(e => {
    if (PRINCIPAIS[e.id]) e.pr = PRINCIPAIS[e.id];
    if (!e.m) e.m = 'peso';
    if (!e.pt) e.pt = [];
    if (e.m === 'tempo') e.tempo = true;      // compatibilidade com registos antigos
  });

  global.CATALOGO = {
    MUSCLES, ZONAS, GRUPOS, EQUIPAMENTO, PEGAS, LARGURAS, UNILATERAL, UNI_AJUDA,
    OBJETIVOS, METRICAS, EXERCISES, SPLITS, CIRCUITOS, FORMATOS, PRINCIPAIS
  };
})(window);
