/* =============================================================
   Treinos — Catálogo de músculos e exercícios
   ============================================================= */
(function (global) {
  'use strict';

  /* --- Grupos musculares -------------------------------------
     alvo = séries semanais para hipertrofia (só estímulo directo).
     Referência de 10–20 séries semanais por grupo; os músculos
     pequenos ficam mais baixos porque apanham muito trabalho
     indirecto nos compostos.
     zona = push | pull | pernas | core                          */
  const MUSCLES = {
    peito:         { name: 'Peito',              curto: 'Peito',    zona: 'push',   alvo: 16 },
    deltoide_ant:  { name: 'Deltoide anterior',  curto: 'Omb. ant', zona: 'push',   alvo: 8  },
    deltoide_lat:  { name: 'Deltoide lateral',   curto: 'Omb. lat', zona: 'push',   alvo: 14 },
    triceps:       { name: 'Tríceps',            curto: 'Tríceps',  zona: 'push',   alvo: 14 },
    dorsais:       { name: 'Dorsais',            curto: 'Dorsais',  zona: 'pull',   alvo: 18 },
    trapezio:      { name: 'Trapézio',           curto: 'Trapézio', zona: 'pull',   alvo: 10 },
    deltoide_post: { name: 'Deltoide posterior', curto: 'Omb. post',zona: 'pull',   alvo: 10 },
    biceps:        { name: 'Bíceps',             curto: 'Bíceps',   zona: 'pull',   alvo: 14 },
    antebraco:     { name: 'Antebraço',          curto: 'Antebr.',  zona: 'pull',   alvo: 6  },
    quadriceps:    { name: 'Quadríceps',         curto: 'Quad.',    zona: 'pernas', alvo: 16 },
    isquiotibiais: { name: 'Isquiotibiais',      curto: 'Isquios',  zona: 'pernas', alvo: 12 },
    gluteos:       { name: 'Glúteos',            curto: 'Glúteos',  zona: 'pernas', alvo: 12 },
    gemeos:        { name: 'Gémeos',             curto: 'Gémeos',   zona: 'pernas', alvo: 10 },
    abdominais:    { name: 'Abdominais',         curto: 'Abd.',     zona: 'core',   alvo: 8  },
    lombar:        { name: 'Lombar',             curto: 'Lombar',   zona: 'core',   alvo: 6  }
  };

  const ZONAS = {
    push:   { name: 'Empurrar', curto: 'Push' },
    pull:   { name: 'Puxar',    curto: 'Pull' },
    pernas: { name: 'Pernas',   curto: 'Pernas' },
    core:   { name: 'Core',     curto: 'Core' }
  };

  const EQUIPAMENTO = {
    barra:    'Barra',
    halteres: 'Halteres',
    maquina:  'Máquina',
    cabos:    'Cabos',
    corporal: 'Peso corporal',
    kettlebell: 'Kettlebell',
    elastico: 'Elástico'
  };

  /* --- Exercícios --------------------------------------------
     id  identificador estável (não mudar)
     n   nome
     p   músculos primários      s  músculos secundários
     e   equipamento             t  'C' composto | 'I' isolamento
     r   [reps min, reps max]    inc  incremento de carga sugerido (kg)
     bw  exercício de peso corporal (carga = peso extra)          */
  const EXERCISES = [
    // ---------------- PEITO ----------------
    { id: 'supino-reto-barra',      n: 'Supino reto com barra',        p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5 },
    { id: 'supino-inclinado-barra', n: 'Supino inclinado com barra',   p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5 },
    { id: 'supino-declinado-barra', n: 'Supino declinado com barra',   p: ['peito'], s: ['triceps'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5 },
    { id: 'supino-reto-halteres',   n: 'Supino reto com halteres',     p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'halteres', t: 'C', r: [8, 12], inc: 2 },
    { id: 'supino-inclinado-halteres', n: 'Supino inclinado com halteres', p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2 },
    { id: 'press-peito-maquina',    n: 'Press de peito na máquina',    p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'maquina', t: 'C', r: [8, 12], inc: 5 },
    { id: 'crucifixo-halteres',     n: 'Crucifixo com halteres',       p: ['peito'], s: ['deltoide_ant'], e: 'halteres', t: 'I', r: [10, 15], inc: 2 },
    { id: 'crucifixo-inclinado',    n: 'Crucifixo inclinado com halteres', p: ['peito'], s: ['deltoide_ant'], e: 'halteres', t: 'I', r: [10, 15], inc: 2 },
    { id: 'peck-deck',              n: 'Peck deck (crucifixo máquina)', p: ['peito'], s: ['deltoide_ant'], e: 'maquina', t: 'I', r: [10, 15], inc: 5 },
    { id: 'crossover-alto',         n: 'Cross-over na polia alta',     p: ['peito'], s: ['deltoide_ant'], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5 },
    { id: 'crossover-baixo',        n: 'Cross-over na polia baixa',    p: ['peito', 'deltoide_ant'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5 },
    { id: 'flexoes',                n: 'Flexões',                      p: ['peito'], s: ['triceps', 'deltoide_ant', 'abdominais'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true },
    { id: 'flexoes-declinadas',     n: 'Flexões declinadas',           p: ['peito', 'deltoide_ant'], s: ['triceps'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true },
    { id: 'dips-peito',             n: 'Paralelas inclinadas (peito)', p: ['peito'], s: ['triceps', 'deltoide_ant'], e: 'corporal', t: 'C', r: [6, 12], inc: 2.5, bw: true },
    { id: 'pullover-halter',        n: 'Pullover com halter',          p: ['peito', 'dorsais'], s: ['triceps'], e: 'halteres', t: 'I', r: [10, 15], inc: 2.5 },

    // ---------------- COSTAS ----------------
    { id: 'elevacoes-pronada',      n: 'Elevações pronadas (pull-up)', p: ['dorsais'], s: ['biceps', 'antebraco', 'trapezio'], e: 'corporal', t: 'C', r: [5, 10], inc: 2.5, bw: true },
    { id: 'elevacoes-supinada',     n: 'Elevações supinadas (chin-up)', p: ['dorsais', 'biceps'], s: ['antebraco'], e: 'corporal', t: 'C', r: [5, 10], inc: 2.5, bw: true },
    { id: 'puxada-frontal',         n: 'Puxada frontal na polia alta', p: ['dorsais'], s: ['biceps', 'trapezio'], e: 'cabos', t: 'C', r: [8, 12], inc: 5 },
    { id: 'puxada-supinada',        n: 'Puxada supinada na polia',     p: ['dorsais', 'biceps'], s: [], e: 'cabos', t: 'C', r: [8, 12], inc: 5 },
    { id: 'puxada-neutra',          n: 'Puxada com pega neutra',       p: ['dorsais'], s: ['biceps'], e: 'cabos', t: 'C', r: [8, 12], inc: 5 },
    { id: 'remada-curvada-barra',   n: 'Remada curvada com barra',     p: ['dorsais', 'trapezio'], s: ['biceps', 'lombar'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5 },
    { id: 'remada-pendlay',         n: 'Remada Pendlay',               p: ['dorsais', 'trapezio'], s: ['biceps', 'lombar'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5 },
    { id: 'remada-halter-uni',      n: 'Remada com halter (unilateral)', p: ['dorsais'], s: ['biceps', 'trapezio'], e: 'halteres', t: 'C', r: [8, 12], inc: 2 },
    { id: 'remada-barra-t',         n: 'Remada na barra T',            p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5 },
    { id: 'remada-baixa-polia',     n: 'Remada baixa na polia',        p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'cabos', t: 'C', r: [8, 12], inc: 5 },
    { id: 'remada-maquina',         n: 'Remada na máquina',            p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'maquina', t: 'C', r: [8, 12], inc: 5 },
    { id: 'pullover-polia',         n: 'Pullover na polia alta',       p: ['dorsais'], s: ['triceps'], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5 },
    { id: 'remada-invertida',       n: 'Remada invertida',             p: ['dorsais', 'trapezio'], s: ['biceps'], e: 'corporal', t: 'C', r: [8, 15], inc: 2.5, bw: true },
    { id: 'face-pull',              n: 'Face pull na polia',           p: ['deltoide_post', 'trapezio'], s: ['biceps'], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5 },
    { id: 'encolhimentos-barra',    n: 'Encolhimentos com barra',      p: ['trapezio'], s: ['antebraco'], e: 'barra', t: 'I', r: [10, 15], inc: 5 },
    { id: 'encolhimentos-halteres', n: 'Encolhimentos com halteres',   p: ['trapezio'], s: ['antebraco'], e: 'halteres', t: 'I', r: [10, 15], inc: 2 },
    { id: 'peso-morto',             n: 'Peso morto convencional',      p: ['isquiotibiais', 'gluteos', 'lombar'], s: ['trapezio', 'dorsais', 'antebraco', 'quadriceps'], e: 'barra', t: 'C', r: [3, 6], inc: 5 },
    { id: 'peso-morto-romeno',      n: 'Peso morto romeno',            p: ['isquiotibiais', 'gluteos'], s: ['lombar', 'trapezio', 'antebraco'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5 },
    { id: 'peso-morto-sumo',        n: 'Peso morto sumo',              p: ['gluteos', 'quadriceps', 'isquiotibiais'], s: ['lombar', 'trapezio'], e: 'barra', t: 'C', r: [3, 6], inc: 5 },
    { id: 'hiperextensoes',         n: 'Hiperextensões (banco romano)', p: ['lombar', 'gluteos'], s: ['isquiotibiais'], e: 'corporal', t: 'I', r: [10, 15], inc: 2.5, bw: true },

    // ---------------- OMBROS ----------------
    { id: 'press-militar',          n: 'Press militar com barra',      p: ['deltoide_ant'], s: ['deltoide_lat', 'triceps', 'abdominais'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5 },
    { id: 'press-ombros-halteres',  n: 'Press de ombros com halteres', p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2 },
    { id: 'press-arnold',           n: 'Press Arnold',                 p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'halteres', t: 'C', r: [8, 12], inc: 2 },
    { id: 'press-ombros-maquina',   n: 'Press de ombros na máquina',   p: ['deltoide_ant', 'deltoide_lat'], s: ['triceps'], e: 'maquina', t: 'C', r: [8, 12], inc: 5 },
    { id: 'elevacoes-laterais',     n: 'Elevações laterais com halteres', p: ['deltoide_lat'], s: [], e: 'halteres', t: 'I', r: [12, 20], inc: 1 },
    { id: 'elevacoes-laterais-polia', n: 'Elevações laterais na polia', p: ['deltoide_lat'], s: [], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5 },
    { id: 'elevacoes-laterais-maquina', n: 'Elevações laterais na máquina', p: ['deltoide_lat'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5 },
    { id: 'elevacoes-frontais',     n: 'Elevações frontais com halteres', p: ['deltoide_ant'], s: [], e: 'halteres', t: 'I', r: [12, 15], inc: 1 },
    { id: 'crucifixo-invertido',    n: 'Crucifixo invertido com halteres', p: ['deltoide_post'], s: ['trapezio'], e: 'halteres', t: 'I', r: [12, 20], inc: 1 },
    { id: 'crucifixo-invertido-maquina', n: 'Crucifixo invertido na máquina', p: ['deltoide_post'], s: ['trapezio'], e: 'maquina', t: 'I', r: [12, 20], inc: 5 },
    { id: 'remada-alta',            n: 'Remada alta',                  p: ['deltoide_lat', 'trapezio'], s: ['biceps'], e: 'barra', t: 'C', r: [10, 15], inc: 2.5 },

    // ---------------- BÍCEPS ----------------
    { id: 'rosca-direta-barra',     n: 'Rosca direta com barra',       p: ['biceps'], s: ['antebraco'], e: 'barra', t: 'I', r: [8, 12], inc: 2.5 },
    { id: 'rosca-barra-w',          n: 'Rosca com barra W',            p: ['biceps'], s: ['antebraco'], e: 'barra', t: 'I', r: [8, 12], inc: 2.5 },
    { id: 'rosca-alternada',        n: 'Rosca alternada com halteres', p: ['biceps'], s: ['antebraco'], e: 'halteres', t: 'I', r: [10, 14], inc: 2 },
    { id: 'rosca-martelo',          n: 'Rosca martelo',                p: ['biceps', 'antebraco'], s: [], e: 'halteres', t: 'I', r: [10, 14], inc: 2 },
    { id: 'rosca-scott',            n: 'Rosca Scott (predicador)',     p: ['biceps'], s: [], e: 'barra', t: 'I', r: [10, 14], inc: 2.5 },
    { id: 'rosca-concentrada',      n: 'Rosca concentrada',            p: ['biceps'], s: [], e: 'halteres', t: 'I', r: [10, 15], inc: 2 },
    { id: 'rosca-polia',            n: 'Rosca na polia baixa',         p: ['biceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5 },
    { id: 'rosca-inclinada',        n: 'Rosca inclinada com halteres', p: ['biceps'], s: [], e: 'halteres', t: 'I', r: [10, 14], inc: 2 },

    // ---------------- TRÍCEPS ----------------
    { id: 'dips-triceps',           n: 'Paralelas (dips)',             p: ['triceps'], s: ['peito', 'deltoide_ant'], e: 'corporal', t: 'C', r: [6, 12], inc: 2.5, bw: true },
    { id: 'supino-fechado',         n: 'Supino fechado',               p: ['triceps'], s: ['peito', 'deltoide_ant'], e: 'barra', t: 'C', r: [6, 10], inc: 2.5 },
    { id: 'triceps-polia-barra',    n: 'Extensão de tríceps na polia (barra)', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5 },
    { id: 'triceps-polia-corda',    n: 'Extensão de tríceps na polia (corda)', p: ['triceps'], s: [], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5 },
    { id: 'triceps-testa',          n: 'Francês / testa com barra W',  p: ['triceps'], s: [], e: 'barra', t: 'I', r: [8, 12], inc: 2.5 },
    { id: 'triceps-acima-cabeca',   n: 'Extensão acima da cabeça (halter)', p: ['triceps'], s: [], e: 'halteres', t: 'I', r: [10, 15], inc: 2 },
    { id: 'triceps-kickback',       n: 'Kickback com halteres',        p: ['triceps'], s: [], e: 'halteres', t: 'I', r: [12, 15], inc: 1 },
    { id: 'triceps-maquina',        n: 'Extensão de tríceps na máquina', p: ['triceps'], s: [], e: 'maquina', t: 'I', r: [10, 15], inc: 5 },
    { id: 'flexoes-diamante',       n: 'Flexões diamante',             p: ['triceps'], s: ['peito'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true },

    // ---------------- ANTEBRAÇO ----------------
    { id: 'rosca-punho',            n: 'Rosca de punho com barra',     p: ['antebraco'], s: [], e: 'barra', t: 'I', r: [15, 20], inc: 2.5 },
    { id: 'rosca-punho-invertida',  n: 'Rosca de punho invertida',     p: ['antebraco'], s: [], e: 'barra', t: 'I', r: [15, 20], inc: 2.5 },
    { id: 'farmers-walk',           n: "Farmer's walk",                p: ['antebraco', 'trapezio'], s: ['abdominais', 'gluteos'], e: 'halteres', t: 'C', r: [30, 60], inc: 5, tempo: true },

    // ---------------- QUADRÍCEPS ----------------
    { id: 'agachamento-barra',      n: 'Agachamento com barra',        p: ['quadriceps', 'gluteos'], s: ['isquiotibiais', 'lombar', 'abdominais'], e: 'barra', t: 'C', r: [5, 8], inc: 5 },
    { id: 'agachamento-frontal',    n: 'Agachamento frontal',          p: ['quadriceps'], s: ['gluteos', 'abdominais'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5 },
    { id: 'agachamento-bulgaro',    n: 'Agachamento búlgaro',          p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [8, 12], inc: 2 },
    { id: 'goblet-squat',           n: 'Goblet squat',                 p: ['quadriceps', 'gluteos'], s: ['abdominais'], e: 'halteres', t: 'C', r: [10, 15], inc: 2.5 },
    { id: 'prensa-pernas',          n: 'Prensa de pernas',             p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'maquina', t: 'C', r: [8, 15], inc: 10 },
    { id: 'hack-squat',             n: 'Hack squat',                   p: ['quadriceps'], s: ['gluteos'], e: 'maquina', t: 'C', r: [8, 12], inc: 5 },
    { id: 'extensao-pernas',        n: 'Extensão de pernas',           p: ['quadriceps'], s: [], e: 'maquina', t: 'I', r: [12, 15], inc: 5 },
    { id: 'afundos-halteres',       n: 'Afundos com halteres',         p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [10, 12], inc: 2 },
    { id: 'afundos-caminhando',     n: 'Afundos a caminhar',           p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [10, 16], inc: 2 },
    { id: 'step-up',                n: 'Step-up com halteres',         p: ['quadriceps', 'gluteos'], s: [], e: 'halteres', t: 'C', r: [10, 12], inc: 2 },
    { id: 'sumo-squat-halter',      n: 'Sumo squat com halter',        p: ['quadriceps', 'gluteos'], s: ['isquiotibiais'], e: 'halteres', t: 'C', r: [10, 15], inc: 2.5 },

    // ---------------- ISQUIOS / GLÚTEOS ----------------
    { id: 'flexao-pernas-deitado',  n: 'Flexão de pernas deitado',     p: ['isquiotibiais'], s: ['gemeos'], e: 'maquina', t: 'I', r: [10, 15], inc: 5 },
    { id: 'flexao-pernas-sentado',  n: 'Flexão de pernas sentado',     p: ['isquiotibiais'], s: [], e: 'maquina', t: 'I', r: [10, 15], inc: 5 },
    { id: 'good-morning',           n: 'Good morning',                 p: ['isquiotibiais', 'lombar'], s: ['gluteos'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5 },
    { id: 'nordic-curl',            n: 'Nordic curl',                  p: ['isquiotibiais'], s: [], e: 'corporal', t: 'I', r: [5, 10], inc: 2.5, bw: true },
    { id: 'hip-thrust',             n: 'Elevação pélvica (hip thrust)', p: ['gluteos'], s: ['isquiotibiais'], e: 'barra', t: 'C', r: [8, 12], inc: 5 },
    { id: 'ponte-gluteos',          n: 'Ponte de glúteos',             p: ['gluteos'], s: ['isquiotibiais'], e: 'corporal', t: 'I', r: [12, 20], inc: 2.5, bw: true },
    { id: 'abducao-anca',           n: 'Abdução de anca na máquina',   p: ['gluteos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5 },
    { id: 'coice-polia',            n: 'Coice na polia (glúteo)',      p: ['gluteos'], s: ['isquiotibiais'], e: 'cabos', t: 'I', r: [12, 15], inc: 2.5 },
    { id: 'peso-morto-pernas-rigidas', n: 'Peso morto pernas rígidas', p: ['isquiotibiais', 'gluteos'], s: ['lombar'], e: 'barra', t: 'C', r: [8, 12], inc: 2.5 },

    // ---------------- GÉMEOS ----------------
    { id: 'gemeos-pe',              n: 'Elevação de gémeos de pé',     p: ['gemeos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5 },
    { id: 'gemeos-sentado',         n: 'Elevação de gémeos sentado',   p: ['gemeos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 5 },
    { id: 'gemeos-prensa',          n: 'Gémeos na prensa',             p: ['gemeos'], s: [], e: 'maquina', t: 'I', r: [12, 20], inc: 10 },

    // ---------------- CORE ----------------
    { id: 'prancha',                n: 'Prancha',                      p: ['abdominais'], s: ['lombar', 'gluteos'], e: 'corporal', t: 'I', r: [30, 90], inc: 2.5, bw: true, tempo: true },
    { id: 'prancha-lateral',        n: 'Prancha lateral',              p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [20, 60], inc: 2.5, bw: true, tempo: true },
    { id: 'crunch',                 n: 'Abdominais (crunch)',          p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [15, 25], inc: 2.5, bw: true },
    { id: 'crunch-polia',           n: 'Crunch na polia (ajoelhado)',  p: ['abdominais'], s: [], e: 'cabos', t: 'I', r: [12, 20], inc: 2.5 },
    { id: 'elevacao-pernas-suspenso', n: 'Elevação de pernas suspenso', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [8, 15], inc: 2.5, bw: true },
    { id: 'elevacao-joelhos',       n: 'Elevação de joelhos suspenso', p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [10, 20], inc: 2.5, bw: true },
    { id: 'ab-wheel',               n: 'Roda abdominal (ab wheel)',    p: ['abdominais'], s: ['lombar'], e: 'corporal', t: 'I', r: [8, 15], inc: 2.5, bw: true },
    { id: 'russian-twist',          n: 'Russian twist',                p: ['abdominais'], s: [], e: 'halteres', t: 'I', r: [15, 25], inc: 2 },
    { id: 'mountain-climbers',      n: 'Mountain climbers',            p: ['abdominais'], s: ['quadriceps'], e: 'corporal', t: 'I', r: [20, 40], inc: 2.5, bw: true },
    { id: 'dead-bug',               n: 'Dead bug',                     p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [10, 16], inc: 2.5, bw: true },
    { id: 'bird-dog',               n: 'Bird dog',                     p: ['lombar', 'abdominais'], s: ['gluteos'], e: 'corporal', t: 'I', r: [10, 16], inc: 2.5, bw: true },
    { id: 'superman',               n: 'Superman',                     p: ['lombar'], s: ['gluteos'], e: 'corporal', t: 'I', r: [12, 20], inc: 2.5, bw: true },
    { id: 'pallof-press',           n: 'Pallof press',                 p: ['abdominais'], s: [], e: 'cabos', t: 'I', r: [10, 15], inc: 2.5 },
    { id: 'hollow-hold',            n: 'Hollow hold',                  p: ['abdominais'], s: [], e: 'corporal', t: 'I', r: [20, 60], inc: 2.5, bw: true, tempo: true },

    // ---------------- FUNCIONAL / OUTROS ----------------
    { id: 'kettlebell-swing',       n: 'Kettlebell swing',             p: ['gluteos', 'isquiotibiais'], s: ['lombar', 'abdominais'], e: 'kettlebell', t: 'C', r: [15, 25], inc: 4 },
    { id: 'clean-and-press',        n: 'Clean & press',                p: ['deltoide_ant', 'quadriceps', 'trapezio'], s: ['gluteos', 'triceps'], e: 'barra', t: 'C', r: [5, 8], inc: 2.5 },
    { id: 'burpees',                n: 'Burpees',                      p: ['quadriceps', 'peito'], s: ['abdominais', 'deltoide_ant'], e: 'corporal', t: 'C', r: [10, 20], inc: 2.5, bw: true },
    { id: 'remada-elastico',        n: 'Remada com elástico',          p: ['dorsais'], s: ['biceps'], e: 'elastico', t: 'C', r: [12, 20], inc: 1 },
    { id: 'puxada-elastico',        n: 'Puxada com elástico',          p: ['dorsais'], s: ['biceps'], e: 'elastico', t: 'C', r: [12, 20], inc: 1 }
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
    'encolhimentos-halteres': 1,
    // braços
    'rosca-direta-barra': 1, 'rosca-martelo': 2, 'rosca-punho': 1,
    // pernas
    'agachamento-barra': 1, 'prensa-pernas': 2, 'extensao-pernas': 2,
    'peso-morto-romeno': 1, 'flexao-pernas-deitado': 2,
    'hip-thrust': 1, 'abducao-anca': 2,
    'gemeos-pe': 1, 'gemeos-sentado': 2,
    // core
    'elevacao-joelhos': 1, 'prancha': 2, 'crunch-polia': 2,
    'hiperextensoes': 1
  };

  /* --- Modelos de treino (splits) ----------------------------
     Cada sessão define as zonas/músculos alvo e nº de exercícios */
  const SPLITS = {
    fullbody: {
      name: 'Corpo inteiro',
      desc: '2–3× por semana. Ideal para começar ou pouco tempo.',
      dias: [
        { name: 'Corpo inteiro A', foco: ['peito', 'dorsais', 'quadriceps', 'deltoide_lat', 'abdominais'] },
        { name: 'Corpo inteiro B', foco: ['isquiotibiais', 'gluteos', 'dorsais', 'peito', 'triceps', 'biceps'] }
      ]
    },
    upperlower: {
      name: 'Superior / Inferior',
      desc: '4× por semana. Bom equilíbrio entre volume e recuperação.',
      dias: [
        { name: 'Superior', foco: ['peito', 'dorsais', 'deltoide_lat', 'triceps', 'biceps', 'deltoide_post'] },
        { name: 'Inferior', foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos', 'abdominais'] }
      ]
    },
    ppl: {
      name: 'Push / Pull / Legs',
      desc: '3 a 6× por semana. Máximo volume por grupo muscular.',
      dias: [
        { name: 'Push (empurrar)', foco: ['peito', 'deltoide_ant', 'deltoide_lat', 'triceps'] },
        { name: 'Pull (puxar)',    foco: ['dorsais', 'trapezio', 'deltoide_post', 'biceps', 'antebraco'] },
        { name: 'Legs (pernas)',   foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos', 'abdominais'] }
      ]
    },
    arnold: {
      name: 'Peito+Costas / Ombros+Braços / Pernas',
      desc: '3 a 6× por semana. Clássico com agonista/antagonista.',
      dias: [
        { name: 'Peito e Costas',    foco: ['peito', 'dorsais', 'trapezio'] },
        { name: 'Ombros e Braços',   foco: ['deltoide_lat', 'deltoide_ant', 'deltoide_post', 'biceps', 'triceps', 'antebraco'] },
        { name: 'Pernas e Core',     foco: ['quadriceps', 'isquiotibiais', 'gluteos', 'gemeos', 'abdominais', 'lombar'] }
      ]
    }
  };

  EXERCISES.forEach(e => { if (PRINCIPAIS[e.id]) e.pr = PRINCIPAIS[e.id]; });

  global.CATALOGO = { MUSCLES, ZONAS, EQUIPAMENTO, EXERCISES, SPLITS, PRINCIPAIS };
})(window);
