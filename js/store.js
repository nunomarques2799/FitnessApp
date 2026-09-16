/* =============================================================
   Treinos — Camada de dados (100% local) + motor de análise
   Guarda tudo em localStorage. Nada sai do telemóvel.
   ============================================================= */
(function (global) {
  'use strict';

  const KEY = 'treinos.db.v1';
  const LB = 0.45359237;
  const CATALOGO = global.CATALOGO;
  const { MUSCLES, GRUPOS, EXERCISES, SPLITS, OBJETIVOS, METRICAS, CIRCUITOS } = CATALOGO;

  /* Índice parte do músculo → grupo, para o menu de criação de treino */
  const GRUPO_DA_PARTE = {};
  Object.keys(GRUPOS).forEach(g => GRUPOS[g].partes.forEach(p => { GRUPO_DA_PARTE[p.k] = g; }));

  /* ---------- utilitários de data ---------- */
  const D = {
    hoje() { return D.iso(new Date()); },
    iso(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    parse(iso) { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); },
    diasEntre(isoA, isoB) {
      return Math.round((D.parse(isoB) - D.parse(isoA)) / 86400000);
    },
    desdeHoje(iso) { return D.diasEntre(iso, D.hoje()); },
    maisDias(iso, n) { const d = D.parse(iso); d.setDate(d.getDate() + n); return D.iso(d); },
    nomeMes(m) { return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][m]; },
    nomeDia(iso) { return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][D.parse(iso).getDay()]; },
    relativo(iso) {
      const n = D.desdeHoje(iso);
      if (n === 0) return 'Hoje';
      if (n === 1) return 'Ontem';
      if (n < 7) return `Há ${n} dias`;
      if (n < 14) return 'Há 1 semana';
      if (n < 31) return `Há ${Math.floor(n / 7)} semanas`;
      if (n < 60) return 'Há 1 mês';
      return `Há ${Math.floor(n / 30)} meses`;
    },
    curto(iso) {
      const d = D.parse(iso);
      return `${d.getDate()} ${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getMonth()]}`;
    }
  };

  /* ---------- estado inicial ---------- */
  function estadoInicial() {
    return {
      version: 2,
      criadoEm: new Date().toISOString(),
      settings: {
        tema: 'auto',
        unidade: 'kg',
        objetivo: 'musculo',    // musculo | forca | peso | hibrido
        descanso: 180,          // segundos, compostos (Schoenfeld 2016: 3 min > 1 min)
        descansoIsolamento: 120,
        descansoCircuito: 20,   // entre estações de um circuito
        split: 'ppl',
        exerciciosPorTreino: 7,   // 7×3 = 21 séries por sessão
        seriesPorExercicio: 3,
        repsAlvo: [8, 12],      // esquema de hipertrofia
        volume: 1,              // multiplicador dos alvos semanais (0.7 / 1 / 1.3)
        musculosIgnorados: [],
        avisoSonoro: true,
        vibrar: true,
        timerModo: 'perguntar', // perguntar | sempre | nunca — cronómetro de descanso
        plano: 'nuno-2026-09',  // plano embutido a seguir (null = a app sugere sozinha)
        maquinas: ['Polia leve (levanto mais)', 'Polia dura (levanto menos)'],
        fecharAuto: 4,          // horas sem registos até a app fechar o treino sozinho (0 = nunca)
        rir: true,              // registar repetições em reserva em cada série
        equipamento: null,      // null = tudo disponível
        nutricao: {             // alvos do dia; com o plano ligado são os dele
          plano: 'nuno-2000',   // plano alimentar embutido (null = alvos à mão)
          kcal: null, prot: null, hc: null, gord: null
        }
      },
      perfil: { peso: null, pesoEm: null, pesos: [] },
      planoDesde: null,         // dia em que o plano começou, para contar as semanas
      exerciciosCustom: [],
      nomes: {},                // exId → nome escolhido por ti
      favoritos: [],
      treinos: [],              // histórico (mais recente primeiro)
      ativo: null,              // treino em curso
      timer: null,              // { fim: epochMs, total: seg }
      alimentos: [],            // alimentos criados por ti
      alimentosEditados: {},    // idDoCatálogo → campos que corrigiste
      alimentosOcultos: [],     // alimentos do catálogo que escondeste
      comidas: [],              // registo alimentar, uma linha por alimento comido
      medidas: []               // medições com fita, uma por dia: { data, cintura, peito, braco, ombros } em cm
    };
  }

  let state = estadoInicial();
  const ouvintes = [];

  /* ---------- persistência ---------- */
  function carregar() {
    state = estadoInicial();
    _idxRec = null;
    invalidarIndice();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const dados = JSON.parse(raw);
        const base = estadoInicial();
        // guardar as omissões antes da mistura: o Object.assign de baixo
        // substitui base.settings inteiro pelo que estava guardado, e as
        // definições acrescentadas em versões novas ficariam por preencher
        const omissoes = base.settings;
        state = Object.assign(base, dados);
        state.settings = Object.assign({}, omissoes, dados.settings || {});
        // a nutrição é um objecto dentro das definições: mistura-se campo a campo,
        // senão um telemóvel gravado antes dela ficava sem os alvos de origem
        state.settings.nutricao = Object.assign({}, omissoes.nutricao, (dados.settings || {}).nutricao || {});
        state.perfil = normalizarPerfil(dados.perfil);
        if (!state.nomes) state.nomes = {};
        if (!Array.isArray(state.alimentos)) state.alimentos = [];
        if (!Array.isArray(state.comidas)) state.comidas = [];
        if (!Array.isArray(state.alimentosOcultos)) state.alimentosOcultos = [];
        if (!state.alimentosEditados) state.alimentosEditados = {};
        if (!Array.isArray(state.medidas)) state.medidas = [];
      }
    } catch (e) {
      console.error('Falha a ler dados locais', e);
    }
    // nomes antigos das polias, ainda por estrear: passam aos que dizem qual é qual
    const maq = state.settings.maquinas || [];
    if (maq.length === 2 && maq[0] === 'Polia 1' && maq[1] === 'Polia 2'
      && !state.treinos.some(t => t.entradas.some(e => e.maq))) {
      state.settings.maquinas = ['Polia leve (levanto mais)', 'Polia dura (levanto menos)'];
    }

    // primeira vez com o plano ligado — telemóvel novo ou dados antigos:
    // marca o dia em que começou e adopta os descansos que ele manda
    if (state.settings.plano && !state.planoDesde) {
      state.planoDesde = D.hoje();
      adoptarDescansoDoPlano();
      guardar(true);
    }
    return state;
  }

  let guardaPendente = null;
  function guardar(imediato) {
    _idxRec = null;
    clearTimeout(guardaPendente);
    const escrever = () => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (e) {
        global.UI && UI.toast('Não foi possível guardar (armazenamento cheio)', 'erro');
      }
    };
    if (imediato) escrever(); else guardaPendente = setTimeout(escrever, 250);
    ouvintes.forEach(f => f(state));
  }

  function aoMudar(fn) { ouvintes.push(fn); }

  /* ---------- unidades ---------- */
  const U = {
    label() { return state.settings.unidade; },
    mostrar(kg) {
      if (kg == null) return null;
      return state.settings.unidade === 'lb' ? kg / LB : kg;
    },
    paraKg(v) {
      if (v == null || v === '') return null;
      return state.settings.unidade === 'lb' ? v * LB : v;
    },
    fmt(kg, semUnidade) {
      if (kg == null) return '—';
      const v = U.mostrar(kg);
      const s = Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : v.toFixed(1).replace('.', ',');
      return semUnidade ? s : s + ' ' + U.label();
    }
  };

  /* ---------- perfil ---------- */

  /**
   * Põe o perfil na forma actual, venha de onde vier: garante a lista de
   * pesagens, recupera um peso guardado sem dia (dados antigos) e deixa
   * `peso` e `pesoEm` sempre a apontar para a pesagem mais recente.
   */
  function normalizarPerfil(dados) {
    const p = Object.assign({ peso: null, pesoEm: null, pesos: [] }, dados || {});
    if (!Array.isArray(p.pesos)) p.pesos = [];
    if (p.peso != null && !p.pesos.length) p.pesos = [{ data: p.pesoEm || D.hoje(), kg: p.peso }];
    p.pesos.sort((a, b) => b.data.localeCompare(a.data));
    p.peso = p.pesos.length ? p.pesos[0].kg : null;
    p.pesoEm = p.pesos.length ? p.pesos[0].data : null;
    return p;
  }

  /** Peso corporal mais recente, em kg (null enquanto não for registado) */
  function pesoCorporal() {
    const p = state.perfil || {};
    return p.peso != null ? p.peso : null;
  }

  /**
   * Regista o peso corporal (kg). Guarda um valor por dia — voltar a pesar-te
   * no mesmo dia corrige o registo em vez de criar outro.
   */
  function definirPeso(kg, data) {
    const p = state.perfil || (state.perfil = { peso: null, pesoEm: null, pesos: [] });
    if (!Array.isArray(p.pesos)) p.pesos = [];
    if (kg == null) { p.peso = null; p.pesoEm = null; guardar(true); return null; }
    const v = Math.round(kg * 10) / 10;
    const dia = data || D.hoje();
    const i = p.pesos.findIndex(x => x.data === dia);
    if (i >= 0) p.pesos[i].kg = v; else p.pesos.push({ data: dia, kg: v });
    p.pesos.sort((a, b) => b.data.localeCompare(a.data));
    if (p.pesos.length > 400) p.pesos.length = 400;
    p.peso = p.pesos[0].kg;
    p.pesoEm = p.pesos[0].data;
    guardar(true);
    return v;
  }

  /** Apaga o registo de peso de um dia */
  function apagarPeso(data) {
    const p = state.perfil || {};
    if (!Array.isArray(p.pesos)) return;
    p.pesos = p.pesos.filter(x => x.data !== data);
    p.peso = p.pesos.length ? p.pesos[0].kg : null;
    p.pesoEm = p.pesos.length ? p.pesos[0].data : null;
    guardar(true);
  }

  /** Histórico de peso, do mais antigo para o mais recente */
  function historicoPeso(dias) {
    const lista = ((state.perfil || {}).pesos || []).slice().sort((a, b) => a.data.localeCompare(b.data));
    if (!dias) return lista;
    const limite = D.maisDias(D.hoje(), -dias + 1);
    return lista.filter(x => x.data >= limite);
  }

  /* ---------- medidas com fita ---------- */

  /**
   * O que se mede e onde. A fita só diz a verdade se for sempre no mesmo
   * sítio, à mesma hora e antes do treino — o pump de um treino de peito
   * ou de braços dá 1 a 2 cm que não são músculo.
   */
  const MEDIDAS = [
    { k: 'cintura', n: 'Cintura', onde: 'À altura do umbigo, com a fita paralela ao chão. Descontraído, sem encolher a barriga: mede no fim de uma expiração normal.' },
    { k: 'peito', n: 'Peito', onde: 'Por baixo das axilas e por cima dos mamilos, com os braços caídos ao lado do corpo. Mede no fim de uma expiração normal, sem encher o peito.' },
    { k: 'braco', n: 'Braço', onde: 'Sempre o mesmo braço. Dobrado a 90° com o bíceps contraído, na parte mais grossa.' },
    { k: 'ombros', n: 'Ombros', onde: 'De pé, braços caídos. A fita dá a volta aos dois ombros na parte mais larga, por cima dos deltoides e do peito. Mais fácil com ajuda.' }
  ];

  /**
   * Regista as medidas de um dia, em cm. Um registo por dia: voltar a medir
   * no mesmo dia corrige o que lá está. Campos em branco não apagam os outros.
   */
  function definirMedidas(valores, data) {
    state.medidas = state.medidas || [];
    const dia = data || D.hoje();
    let m = state.medidas.find(x => x.data === dia);
    if (!m) { m = { data: dia }; state.medidas.push(m); }
    MEDIDAS.forEach(({ k }) => {
      const v = valores[k];
      if (v != null && v > 0) m[k] = Math.round(v * 10) / 10;
    });
    state.medidas = state.medidas.filter(x => MEDIDAS.some(({ k }) => x[k] != null));
    state.medidas.sort((a, b) => a.data.localeCompare(b.data));
    guardar(true);
    return m;
  }

  function apagarMedidas(data) {
    state.medidas = (state.medidas || []).filter(x => x.data !== data);
    guardar(true);
  }

  /** Medições, da mais antiga para a mais recente */
  function historicoMedidas() {
    return (state.medidas || []).slice().sort((a, b) => a.data.localeCompare(b.data));
  }

  /**
   * Quanto mudou uma medida desde a primeira vez (ou desde há N dias).
   * Devolve { antes, agora, dif, desde } ou null se só houver uma medição.
   */
  function variacaoMedida(k, dias) {
    const lista = historicoMedidas().filter(x => x[k] != null);
    if (lista.length < 2) return null;
    const agora = lista[lista.length - 1];
    let antes = lista[0];
    if (dias) {
      const limite = D.maisDias(D.hoje(), -dias + 1);
      const antigos = lista.filter(x => x.data < limite);
      if (antigos.length) antes = antigos[antigos.length - 1];
    }
    if (antes.data === agora.data) return null;
    return { antes: antes[k], agora: agora[k], dif: Math.round((agora[k] - antes[k]) * 10) / 10, desde: antes.data };
  }

  /** Variação de peso nos últimos N dias, em kg (null se não houver com que comparar) */
  function variacaoPeso(dias) {
    const lista = historicoPeso();
    if (lista.length < 2) return null;
    const limite = D.maisDias(D.hoje(), -(dias || 30) + 1);
    const antigos = lista.filter(x => x.data < limite);
    const base = antigos.length ? antigos[antigos.length - 1] : lista[0];
    const ultimo = lista[lista.length - 1];
    if (base.data === ultimo.data) return null;
    return Math.round((ultimo.kg - base.kg) * 10) / 10;
  }

  /* ---------- plano de treino ----------
     Quando há plano activo, é ele que manda: define os exercícios de
     cada dia, o intervalo de repetições e o incremento de carga. As
     cargas escritas no plano são só o chão da primeira sessão — a
     partir daí quem manda é o histórico.  */

  function plano() {
    const P = global.PLANO;
    return P && state.settings.plano === P.id ? P : null;
  }

  function planoActivo() { return !!plano(); }

  /**
   * Liga ou desliga o plano. Ao ligar, marca o dia em que começou e
   * adopta os tempos de descanso que o plano manda.
   */
  function activarPlano(liga) {
    const P = global.PLANO;
    if (!P) return false;
    state.settings.plano = liga ? P.id : null;
    if (liga) {
      if (!state.planoDesde) state.planoDesde = D.hoje();
      adoptarDescansoDoPlano();
    }
    guardar(true);
    return liga;
  }

  function adoptarDescansoDoPlano() {
    const P = global.PLANO;
    if (!P || !P.descanso) return;
    state.settings.descanso = P.descanso.composto;
    state.settings.descansoIsolamento = P.descanso.isolamento;
  }

  /** Prescrição de um exercício no plano activo, ou null */
  function prescricao(exId) {
    const P = plano();
    return P ? P.prescricao(exId) : null;
  }

  /** Próximo dia da roda, a seguir ao último dia do plano que fizeste */
  function proximoDiaPlano() {
    const P = plano();
    if (!P) return null;
    const ultimo = state.treinos.find(t => t.planoId === P.id && typeof t.planoDia === 'number');
    const indice = ultimo ? (ultimo.planoDia + 1) % P.total : 0;
    return { indice, dia: P.dia(indice), ultimo: ultimo || null };
  }

  /** Semana do plano em que estás (1 na primeira) */
  function semanaDoPlano() {
    if (!planoActivo()) return 0;
    const desde = state.planoDesde || D.hoje();
    return Math.floor(Math.max(0, D.desdeHoje(desde)) / 7) + 1;
  }

  /**
   * Última sessão de um exercício feita já dentro do plano.
   * Enquanto não houver uma, a carga escrita no plano vale mais do que o
   * histórico antigo: quem subia a carga de série para série deixou lá um
   * máximo que só aguentou uma vez, e a progressão leria isso como sendo
   * a carga de trabalho.
   */
  function ultimaNoPlano(exId, maq) {
    const P = plano();
    if (!P) return null;
    for (const t of state.treinos) {
      if (t.planoId !== P.id) continue;
      const e = t.entradas.find(x => x.exId === exId);
      if (!e || !e.series.filter(serieUtil).length) continue;
      if (maq && (e.maq || null) !== maq) continue;
      return { data: t.data, series: e.series, treinoId: t.id, maq: e.maq || null, versao: t.planoVersao || 0 };
    }
    return null;
  }

  /** Carga de trabalho de uma sessão: a mais pesada das séries que contam */
  function cargaDe(series) {
    const uteis = (series || []).filter(serieUtil).map(x => x.kg || 0);
    return uteis.length ? Math.max(...uteis) : null;
  }

  /** Incremento de carga: o do plano se o exercício lá estiver, senão o do catálogo */
  function incrementoDe(ex) {
    if (!ex) return 2.5;
    const p = prescricao(ex.id);
    return (p && p.inc) || ex.inc || 2.5;
  }

  /* ---------- objectivo ---------- */
  function objetivo() {
    return OBJETIVOS[state.settings.objetivo] || OBJETIVOS.musculo;
  }

  /** Aplica os valores por omissão de um objectivo (o utilizador pode ajustar depois) */
  function aplicarObjetivo(chave) {
    const o = OBJETIVOS[chave];
    if (!o) return null;
    const s = state.settings;
    s.objetivo = chave;
    s.repsAlvo = o.reps.slice();
    s.descanso = o.descanso;
    s.descansoIsolamento = o.descansoIsolamento;
    s.volume = o.volume;
    s.seriesPorExercicio = o.series;
    s.exerciciosPorTreino = o.exercicios;
    s.split = o.split;
    guardar(true);
    return o;
  }

  /** O objectivo actual pede treinos em circuito? */
  function usaCircuitos() {
    return !!objetivo().circuitos;
  }

  /* ---------- preferências de treino ---------- */

  /** Músculos que contam para sugestões e cobertura (exclui os ignorados) */
  function musculosActivos() {
    const fora = state.settings.musculosIgnorados || [];
    return Object.keys(MUSCLES).filter(k => !fora.includes(k));
  }

  function ignorado(k) {
    return (state.settings.musculosIgnorados || []).includes(k);
  }

  /** Alvo semanal de séries, ajustado pelo multiplicador de volume */
  function alvoDe(k) {
    return Math.round(MUSCLES[k].alvo * (state.settings.volume || 1));
  }

  /* ---------- métricas de registo ---------- */

  /** Descritor da métrica de um exercício: dois campos, a e b */
  function metricaDe(ex) {
    return METRICAS[(ex && ex.m) || 'peso'] || METRICAS.peso;
  }

  /** Campo onde vive o valor alvo (repetições, metros ou calorias) */
  function chaveAlvo(ex) {
    const m = (ex && ex.m) || 'peso';
    if (m === 'distancia') return 'm';
    if (m === 'calorias') return 'cal';
    return 'reps';       // peso, tempo (segundos) e reps
  }

  /**
   * O exercício faz-se numa máquina que pode variar de números?
   * Duas polias com relações diferentes dão leituras que chegam a ser o
   * dobro para o mesmo esforço, por isso convém dizer qual foi.
   */
  function usaMaquina(ex) {
    if (!ex) return false;
    // só as polias: as máquinas de placas do ginásio são uma só, e a
    // pergunta em todos os exercícios era ruído
    const e = ex.e;
    return (e === 'cabos' || e === 'corda') && (state.settings.maquinas || []).length > 0;
  }

  /** O exercício mede-se em carga? (conta para volume e recordes de peso) */
  function comCarga(ex) {
    const m = (ex && ex.m) || 'peso';
    return m === 'peso' || m === 'tempo' || m === 'reps';
  }

  /**
   * Intervalo de referência de um exercício.
   * O esquema de repetições do objectivo só se aplica a exercícios
   * de carga; cardio, tempos e movimentos balísticos mantêm o seu.
   */
  function repsDe(ex) {
    const alvo = state.settings.repsAlvo;
    if (!ex) return alvo || [8, 12];
    const p = prescricao(ex.id);
    if (p && p.reps) return p.reps;
    if (ex.cond || !comCarga(ex) || ex.tempo || !alvo) return ex.r;
    if (ex.m === 'reps') return ex.r;
    if (ex.r[0] >= alvo[1]) return ex.r;   // gémeos, abdominais, elevações laterais…
    return alvo;
  }

  /** Série vazia com os campos certos para a métrica do exercício */
  function serieVazia(ex) {
    const met = metricaDe(ex);
    const s = { feita: false, tipo: 'normal' };
    s[met.a.k] = null;
    s[met.b.k] = null;
    return s;
  }

  /** Série já preenchida com o valor de referência */
  function serieBase(ex, alvo) {
    const s = serieVazia(ex);
    const k = chaveAlvo(ex);
    const r = repsDe(ex);
    s[k] = alvo != null ? alvo : (k === 'reps' ? r[1] : r[0]);
    return s;
  }

  /** Copia os valores de uma série anterior, campo a campo */
  function copiarSerie(ex, origem) {
    const met = metricaDe(ex);
    const s = { feita: false, tipo: origem.tipo === 'aquecimento' ? 'aquecimento' : 'normal' };
    s[met.a.k] = origem[met.a.k] != null ? origem[met.a.k] : null;
    s[met.b.k] = origem[met.b.k] != null ? origem[met.b.k] : null;
    return s;
  }

  /* ---------- exercícios ---------- */

  /** Aplica o nome que o utilizador deu ao exercício, sem mexer no catálogo */
  function comNome(e) {
    const novo = state.nomes && state.nomes[e.id];
    if (!novo || novo === e.n) return e;
    return Object.assign({}, e, { n: novo, nomeOriginal: e.nomeOriginal || e.n });
  }

  let _lista = null;
  function todosExercicios() {
    if (!_lista) _lista = EXERCISES.concat(state.exerciciosCustom).map(comNome);
    return _lista;
  }
  const _idx = {};
  function exercicio(id) {
    if (!_idx[id] || _idx[id].__stale) {
      const e = todosExercicios().find(x => x.id === id);
      if (!e) return null;
      _idx[id] = e;
    }
    return _idx[id];
  }
  function invalidarIndice() { _lista = null; for (const k in _idx) delete _idx[k]; }

  /**
   * Muda o nome de um exercício. Os exercícios do catálogo guardam o
   * nome novo à parte, para o original se poder repor; os teus mudam
   * de nome directamente. Devolve o nome que ficou.
   */
  function renomearExercicio(id, nome) {
    const base = EXERCISES.find(e => e.id === id);
    const meu = state.exerciciosCustom.find(e => e.id === id);
    if (!base && !meu) return null;
    const limpo = String(nome || '').trim();
    if (!state.nomes) state.nomes = {};

    if (meu) {
      // um exercício teu: o original é o nome com que foi criado
      if (!limpo || limpo === meu.n) { delete state.nomes[id]; }
      else state.nomes[id] = limpo;
    } else if (!limpo || limpo === base.n) {
      delete state.nomes[id];
    } else {
      state.nomes[id] = limpo;
    }
    invalidarIndice();
    guardar(true);
    const ex = exercicio(id);
    return ex ? ex.n : null;
  }

  /** O exercício tem um nome dado por ti? */
  function nomeProprio(id) {
    return !!(state.nomes && state.nomes[id]);
  }

  function criarExercicio(dados) {
    const base = dados.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let id = 'meu-' + base, i = 2;
    while (exercicio(id)) { id = 'meu-' + base + '-' + i++; }
    const ex = {
      id, n: dados.n, p: dados.p || [], s: dados.s || [],
      e: dados.e || 'halteres', t: dados.t || 'I',
      r: dados.r || [8, 12], inc: dados.inc || 2.5,
      m: dados.m || 'peso', pt: dados.pt || [], custom: true
    };
    if (ex.m === 'tempo') ex.tempo = true;
    state.exerciciosCustom.push(ex);
    invalidarIndice();
    guardar(true);
    return ex;
  }

  function apagarExercicioCustom(id) {
    state.exerciciosCustom = state.exerciciosCustom.filter(e => e.id !== id);
    state.favoritos = state.favoritos.filter(f => f !== id);
    if (state.nomes) delete state.nomes[id];
    invalidarIndice();
    guardar(true);
  }

  function alternarFavorito(id) {
    const i = state.favoritos.indexOf(id);
    if (i >= 0) state.favoritos.splice(i, 1); else state.favoritos.push(id);
    guardar(true);
    return i < 0;
  }

  /** Exercícios de um grupo muscular, opcionalmente filtrados por parte */
  function exerciciosDoGrupo(grupo, parte) {
    const g = GRUPOS[grupo];
    if (!g) return [];
    return todosExercicios().filter(ex => {
      const partes = ex.pt || [];
      if (parte) return partes.includes(parte);
      if (partes.some(p => GRUPO_DA_PARTE[p] === grupo)) return true;
      // exercícios personalizados não têm partes: usa os músculos principais
      if (!partes.length) return (ex.p || []).some(m => MUSCLES[m] && MUSCLES[m].grupo === grupo);
      return false;
    });
  }

  /** Quantos exercícios existem em cada grupo (para os cartões do menu) */
  function contagemPorGrupo() {
    const acc = {};
    Object.keys(GRUPOS).forEach(g => { acc[g] = exerciciosDoGrupo(g).length; });
    return acc;
  }

  /** Exercícios de um lado de cada vez */
  function exerciciosUnilaterais() {
    return todosExercicios().filter(e => e.uni);
  }

  /** Pegas presentes numa lista, pela ordem do catálogo */
  function pegasDe(lista) {
    const ordem = Object.keys(CATALOGO.PEGAS);
    const usadas = new Set((lista || []).map(e => e.pg).filter(Boolean));
    return ordem.filter(k => usadas.has(k));
  }

  /* ---------- cronómetro de descanso ----------
     'sempre' e 'nunca' decidem já; 'perguntar' deixa o campo por
     preencher e a vista do treino pergunta uma vez, ao começar.  */
  function descansoInicial() {
    const modo = state.settings.timerModo || 'perguntar';
    if (modo === 'sempre') return true;
    if (modo === 'nunca') return false;
    return null;
  }

  /** O treino a decorrer arranca o cronómetro sozinho? */
  function comDescanso(treino) {
    const a = treino || state.ativo;
    return !!(a && a.descansoAuto);
  }

  /** Liga ou desliga o cronómetro automático do treino a decorrer */
  function definirDescanso(liga) {
    if (!state.ativo) return;
    state.ativo.descansoAuto = !!liga;
    if (!liga) state.timer = null;
    guardar(true);
  }

  /* ---------- treino ativo ---------- */
  function comecarTreino(nome, exercicioIds) {
    state.ativo = {
      id: 'w' + Date.now(),
      data: D.hoje(),
      inicio: Date.now(),
      nome: nome || 'Treino livre',
      tipo: 'forca',
      notas: '',
      descansoAuto: descansoInicial(),
      ultimoRegisto: Date.now(),
      entradas: (exercicioIds || []).map(criarEntrada)
    };
    guardar(true);
    return state.ativo;
  }

  /**
   * Começa o próximo dia do plano. Cada exercício entra com o número de
   * séries previsto e a mesma carga em todas — subir série a série é o
   * que o plano manda evitar.
   */
  function comecarPlano(indiceEscolhido) {
    const P = plano();
    if (!P) return null;
    const sug = sugerirPlano(indiceEscolhido);
    if (!sug) return null;
    state.ativo = {
      id: 'w' + Date.now(),
      data: D.hoje(),
      inicio: Date.now(),
      nome: sug.nome,
      tipo: 'forca',
      planoId: P.id,
      planoDia: sug.planoDia,
      planoVersao: P.versao,
      notas: '',
      descansoAuto: descansoInicial(),
      ultimoRegisto: Date.now(),
      entradas: sug.exercicios.map(criarEntradaPlano)
    };
    guardar(true);
    return state.ativo;
  }

  /** Entrada de um exercício prescrito: séries do plano, carga única */
  function criarEntradaPlano(x) {
    const ex = x.ex;
    const n = Math.max(1, x.series || state.settings.seriesPorExercicio || 3);
    // um dia do plano entra sempre com o que está escrito em js/plano.js: a
    // mesma carga em todas as séries e o topo do intervalo de repetições, que
    // é o alvo da dupla progressão. O que ficou registado da última vez não se
    // copia para aqui — isso fazia a sessão anterior repetir-se sozinha e
    // escondia o que o plano pede. Os números mudam na revisão semanal.
    const reps = x.reps || repsDe(ex);
    const chave = chaveAlvo(ex);
    const series = Array.from({ length: n }, () => {
      const s = serieVazia(ex);
      if (comCarga(ex) && !x.max && x.kg != null) s.kg = x.kg;
      s[chave] = reps[1];
      return s;
    });
    return { exId: ex.id, series, notas: '', plano: true };
  }

  /** Começa um treino em circuito a partir de um modelo do catálogo */
  function comecarCircuito(chave) {
    const c = CIRCUITOS[chave];
    if (!c) return null;
    state.ativo = {
      id: 'w' + Date.now(),
      data: D.hoje(),
      inicio: Date.now(),
      nome: c.name,
      tipo: 'circuito',
      circuitoId: chave,
      formato: c.formato,
      rondas: c.rondas,
      minutos: c.minutos,
      descansoEstacao: c.descansoEstacao,
      descansoRonda: c.descansoRonda,
      descansoAuto: descansoInicial(),
      ultimoRegisto: Date.now(),
      notas: '',
      entradas: c.estacoes.map(e => criarEntradaCircuito(e, c.rondas))
    };
    guardar(true);
    return state.ativo;
  }

  function criarEntradaCircuito(estacao, rondas) {
    const ex = exercicio(estacao.ex);
    const ult = ultimaPerformance(estacao.ex);
    const cargaAnterior = ult ? Math.max(...ult.series.map(s => s.kg || 0)) : 0;
    const series = Array.from({ length: Math.max(1, rondas) }, () => {
      const s = serieBase(ex, estacao.alvo);
      if (cargaAnterior && comCarga(ex)) s.kg = cargaAnterior;
      return s;
    });
    return { exId: estacao.ex, series, notas: '', alvo: estacao.alvo };
  }

  function criarEntrada(exId) {
    const ex = exercicio(exId);
    const ult = ultimaPerformance(exId);
    const nSeries = Math.max(1, state.settings.seriesPorExercicio || 3);
    const reps = repsDe(ex);
    let series = [];
    if (ult) {
      series = ult.series.filter(s => s.tipo !== 'aquecimento').map(s => copiarSerie(ex, s));
      const sug = sugerirProgressao(exId);
      if (sug && sug.subir) series.forEach(s => { s.kg = sug.kg; s.reps = reps[0]; });
    }
    if (!series.length) series = Array.from({ length: nSeries }, () => serieBase(ex));
    return { exId, series, notas: '' };
  }

  /**
   * Fecha o treino a decorrer. A hora de fim só é passada pelo fecho
   * automático, para o treino esquecido ficar com a duração até à última
   * série e não com as horas que passaram até alguém reabrir a app.
   */
  function terminarTreino(fimMs) {
    const a = state.ativo;
    if (!a) return null;
    a.entradas = a.entradas
      .map(e => ({ ...e, series: e.series.filter(s => s.feita) }))
      .filter(e => e.series.length);
    if (!a.entradas.length) { state.ativo = null; state.timer = null; guardar(true); return null; }
    const auto = fimMs != null;
    a.fim = auto ? fimMs : Date.now();
    a.duracao = Math.max(0, Math.round((a.fim - a.inicio) / 1000));
    if (auto) {
      a.fechadoAuto = true;
      // treino começado antes de existir marca da última série: estima pelo registo
      if (a.duracao < 60) { a.duracao = estimarDuracao(a); a.fim = a.inicio + a.duracao * 1000; }
    }
    state.treinos.unshift(a);
    state.treinos.sort((x, y) => y.data.localeCompare(x.data) || y.inicio - x.inicio);
    state.ativo = null;
    state.timer = null;
    guardar(true);
    return a;
  }

  function descartarTreino() { state.ativo = null; state.timer = null; guardar(true); }

  function apagarTreino(id) {
    state.treinos = state.treinos.filter(t => t.id !== id);
    guardar(true);
  }

  /* ---------- duração e fecho automático ---------- */

  /**
   * Escolhe a máquina de um exercício do treino a decorrer. As séries que
   * ainda não estão feitas passam a levar a carga do histórico dessa
   * máquina — é para isso que serve dizer qual é.
   * Num exercício do plano a carga fica como está: lá o número vem do plano
   * e não do histórico, e a máquina serve só para saber onde foi feito.
   * Devolve a carga que ficou, ou null se não havia histórico dessa máquina.
   */
  function definirMaquina(i, maq) {
    const a = state.ativo;
    if (!a || !a.entradas[i]) return null;
    const entrada = a.entradas[i];
    entrada.maq = maq || null;
    let kg = null;
    const ex = exercicio(entrada.exId);
    if (maq && ex && comCarga(ex) && !entrada.plano) {
      const prog = sugerirProgressao(entrada.exId, maq);
      if (prog && prog.kg) {
        kg = prog.kg;
        entrada.series.forEach(s => { if (!s.feita) s.kg = kg; });
      }
    }
    marcarActividade();
    guardar(true);
    return kg;
  }

  /** Marca que houve registo no treino a decorrer (relógio do fecho automático) */
  function marcarActividade() {
    if (state.ativo) state.ativo.ultimoRegisto = Date.now();
  }

  /**
   * Duração plausível de um treino a partir do que ficou registado:
   * cada série custa o descanso previsto mais o tempo de execução.
   * Serve para os treinos que ficaram abertos e para corrigir o histórico.
   */
  function estimarDuracao(t) {
    const series = seriesTreino(t);
    if (!series) return 0;
    const descanso = t.tipo === 'circuito'
      ? (t.descansoEstacao || state.settings.descansoCircuito || 20)
      : Math.round(((state.settings.descanso || 180) + (state.settings.descansoIsolamento || 120)) / 2);
    return Math.min(4 * 3600, Math.max(300, series * (descanso + 45)));
  }

  /** Treinos guardados com duração acima de um limite de horas */
  function treinosLongos(horas) {
    const limite = Math.max(1, horas || 4) * 3600;
    return state.treinos.filter(t => (t.duracao || 0) > limite);
  }

  /** Troca as durações absurdas por uma estimativa. A original fica guardada. */
  function corrigirDuracoes(horas) {
    const alvo = treinosLongos(horas);
    alvo.forEach(t => {
      if (t.duracaoOriginal == null) t.duracaoOriginal = t.duracao;
      t.duracao = estimarDuracao(t);
      t.duracaoEstimada = true;
      if (t.inicio) t.fim = t.inicio + t.duracao * 1000;
    });
    if (alvo.length) guardar(true);
    return alvo.length;
  }

  /** Corrige à mão a duração de um treino guardado (segundos) */
  function definirDuracao(id, segundos) {
    const t = state.treinos.find(x => x.id === id);
    if (!t) return null;
    if (t.duracaoOriginal == null) t.duracaoOriginal = t.duracao;
    t.duracao = Math.max(0, Math.round(segundos));
    t.duracaoEstimada = false;
    if (t.inicio) t.fim = t.inicio + t.duracao * 1000;
    guardar(true);
    return t.duracao;
  }

  /**
   * Fecha o treino que ficou esquecido: passadas as horas definidas sem
   * nenhum registo, guarda-o com a duração até à última série marcada.
   * Se não chegou a haver série nenhuma, descarta-o.
   * Devolve o que aconteceu, ou null se não havia nada a fazer.
   */
  function fecharPorInactividade() {
    const a = state.ativo;
    if (!a) return null;
    const horas = state.settings.fecharAuto;
    if (!horas) return null;
    const ultima = a.ultimoRegisto || a.inicio;
    if (Date.now() - ultima < horas * 3600000) return null;
    const nome = a.nome;
    const feitas = a.entradas.reduce((n, e) => n + e.series.filter(s => s.feita).length, 0);
    if (!feitas) { descartarTreino(); return { nome, descartado: true }; }
    const t = terminarTreino(ultima);
    return t ? { nome, treino: t } : { nome, descartado: true };
  }

  /* ---------- métricas ---------- */
  function um1RM(kg, reps) {
    if (!kg || !reps) return 0;
    if (reps === 1) return kg;
    return kg * (1 + reps / 30);          // Epley
  }

  function serieUtil(s) { return s.feita !== false && s.tipo !== 'aquecimento'; }

  function volumeTreino(t) {
    let v = 0;
    t.entradas.forEach(e => e.series.forEach(s => {
      if (serieUtil(s)) v += (s.kg || 0) * (s.reps || 0);
    }));
    return v;
  }

  function seriesTreino(t) {
    return t.entradas.reduce((n, e) => n + e.series.filter(serieUtil).length, 0);
  }

  /** Trabalho de condição física de um treino: metros, calorias e segundos */
  function trabalhoCardio(t) {
    const acc = { metros: 0, calorias: 0, segundos: 0, series: 0 };
    t.entradas.forEach(e => {
      const ex = exercicio(e.exId);
      if (!ex || !ex.cond) return;
      e.series.forEach(s => {
        if (!serieUtil(s)) return;
        acc.series++;
        acc.metros += s.m || 0;
        acc.calorias += s.cal || 0;
        acc.segundos += (s.seg || 0) + (ex.tempo ? (s.reps || 0) : 0);
      });
    });
    return acc;
  }

  /** Séries por músculo num intervalo. Primário = 1, secundário = 0,5.
      Exercícios de condição física não contam — servem outro objectivo. */
  function seriesPorMusculo(dias) {
    const limite = dias ? D.maisDias(D.hoje(), -dias + 1) : '0000-00-00';
    const acc = {};
    Object.keys(MUSCLES).forEach(m => { acc[m] = 0; });
    state.treinos.forEach(t => {
      if (t.data < limite) return;
      t.entradas.forEach(e => {
        const ex = exercicio(e.exId);
        if (!ex || ex.cond) return;
        const n = e.series.filter(serieUtil).length;
        (ex.p || []).forEach(m => { if (acc[m] != null) acc[m] += n; });
        (ex.s || []).forEach(m => { if (acc[m] != null) acc[m] += n * 0.5; });
      });
    });
    return acc;
  }

  /** Última data com estímulo directo (primário) de cada músculo */
  function ultimoEstimulo() {
    const ult = {};
    state.treinos.forEach(t => {
      t.entradas.forEach(e => {
        const ex = exercicio(e.exId);
        if (!ex || ex.cond) return;
        (ex.p || []).forEach(m => { if (!ult[m] || t.data > ult[m]) ult[m] = t.data; });
      });
    });
    return ult;
  }

  /**
   * Estado de recuperação/cobertura por músculo.
   * estado: nunca | recuperar | pronto | atraso | indirecto
   */
  function estadoMusculos(incluirIgnorados) {
    const s7 = seriesPorMusculo(7);
    const ult = ultimoEstimulo();
    const chaves = incluirIgnorados ? Object.keys(MUSCLES) : musculosActivos();
    return chaves.map(k => {
      const m = MUSCLES[k];
      const alvo = alvoDe(k);
      const dias = ult[k] ? D.desdeHoje(ult[k]) : null;
      const sets = Math.round(s7[k] * 10) / 10;
      let estado;
      // sem estímulo directo: só é lacuna se o trabalho indirecto não cobrir o alvo
      if (dias === null) estado = sets === 0 ? 'nunca' : (sets >= alvo ? 'pronto' : 'indirecto');
      else if (dias >= 7) estado = 'atraso';
      else if (dias <= 1) estado = 'recuperar';
      else if (sets < alvo * 0.6) estado = 'atraso';
      else estado = 'pronto';
      return {
        key: k, nome: m.name, zona: m.zona, grupo: m.grupo,
        alvo, sets, dias, ultima: ult[k] || null, estado,
        ignorado: ignorado(k),
        pct: Math.min(1, sets / (alvo || 1))
      };
    });
  }

  /**
   * Última sessão registada de um exercício.
   * Com `maq`, só conta as sessões feitas nessa máquina — comparar a polia
   * dura com a leve faria a progressão saltar sem razão nenhuma.
   */
  function ultimaPerformance(exId, excluirId, maq) {
    for (const t of state.treinos) {
      if (excluirId && t.id === excluirId) continue;
      const e = t.entradas.find(x => x.exId === exId);
      if (!e || !e.series.length) continue;
      if (maq && (e.maq || null) !== maq) continue;
      return { data: t.data, series: e.series, treinoId: t.id, maq: e.maq || null };
    }
    return null;
  }

  /** Histórico completo de um exercício (mais recente primeiro) */
  function historicoExercicio(exId) {
    const ex = exercicio(exId);
    const out = [];
    state.treinos.forEach(t => {
      const e = t.entradas.find(x => x.exId === exId);
      if (!e) return;
      const uteis = e.series.filter(serieUtil);
      if (!uteis.length) return;
      let melhor = null, vol = 0;
      const total = { reps: 0, m: 0, cal: 0, seg: 0 };
      uteis.forEach(s => {
        vol += (s.kg || 0) * (s.reps || 0);
        total.reps += s.reps || 0;
        total.m += s.m || 0;
        total.cal += s.cal || 0;
        total.seg += (s.seg || 0) + (ex && ex.tempo ? (s.reps || 0) : 0);
        const rm = um1RM(s.kg, s.reps);
        if (!melhor || rm > melhor.rm) melhor = { rm, kg: s.kg, reps: s.reps };
      });
      out.push({ data: t.data, treinoId: t.id, series: uteis, volume: vol, melhor, total, maq: e.maq || null });
    });
    return out;
  }

  /** Índice dos melhores registos por exercício, numa só passagem */
  let _idxRec = null;
  function indiceRecordes() {
    if (_idxRec) return _idxRec;
    _idxRec = {};
    state.treinos.forEach(t => t.entradas.forEach(e => {
      e.series.forEach(s => {
        if (!serieUtil(s)) return;
        const r = _idxRec[e.exId] || (_idxRec[e.exId] = { kg: 0, reps: 0, m: 0, cal: 0, seg: 0, data: null });
        if ((s.kg || 0) > r.kg) { r.kg = s.kg; r.reps = s.reps || r.reps; r.data = t.data; }
        if ((s.reps || 0) > r.reps && !s.kg) r.reps = s.reps;
        if ((s.m || 0) > r.m) { r.m = s.m; if (!r.data) r.data = t.data; }
        if ((s.cal || 0) > r.cal) { r.cal = s.cal; if (!r.data) r.data = t.data; }
        if ((s.seg || 0) > r.seg) r.seg = s.seg;
      });
    }));
    return _idxRec;
  }

  /**
   * Recordes pessoais de um exercício.
   * Em exercícios de carga, `peso` está sempre preenchido quando há
   * histórico; em exercícios de condição física devolve o melhor
   * registo da métrica própria (metros, calorias ou segundos).
   */
  function recordes(exId) {
    const ex = exercicio(exId);
    const h = historicoExercicio(exId);
    if (!h.length) return null;
    const met = (ex && ex.m) || 'peso';
    let peso = null, reps = null, rm = 0, rmInfo = null, vol = 0;
    let dist = null, cal = null, seg = null, melhorTotal = 0;

    h.forEach(sessao => {
      sessao.series.forEach(x => {
        const kg = x.kg || 0, r = x.reps || 0;
        if (!peso || kg > peso.kg) peso = { kg, reps: r, data: sessao.data };
        if (!reps || r > reps.reps) reps = { kg, reps: r, data: sessao.data };
        const e = um1RM(kg, r);
        if (e > rm) { rm = e; rmInfo = { kg, reps: r, data: sessao.data }; }
        if (x.m && (!dist || x.m > dist.valor)) dist = { valor: x.m, data: sessao.data };
        if (x.cal && (!cal || x.cal > cal.valor)) cal = { valor: x.cal, data: sessao.data };
        const s = x.seg || (ex && ex.tempo ? r : 0);
        if (s && (!seg || s > seg.valor)) seg = { valor: s, data: sessao.data };
      });
      if (sessao.volume > vol) vol = sessao.volume;
      const t = met === 'distancia' ? sessao.total.m : met === 'calorias' ? sessao.total.cal : sessao.total.seg;
      if (t > melhorTotal) melhorTotal = t;
    });

    if (!peso) return null;
    return {
      metrica: met, comCarga: comCarga(ex),
      peso, reps, rm: rmInfo, rmValor: rm, volume: vol,
      distancia: dist, calorias: cal, tempo: seg, melhorTotal,
      sessoes: h.length, semCarga: peso.kg === 0
    };
  }

  /** Texto curto do melhor registo, adequado à métrica do exercício */
  function textoRecorde(rec, ex) {
    if (!rec) return '';
    const met = rec.metrica || 'peso';
    if (met === 'distancia') return rec.distancia ? `${UI.fmt(rec.distancia.valor, 0)} m` : '—';
    if (met === 'calorias') return rec.calorias ? `${UI.fmt(rec.calorias.valor, 0)} cal` : '—';
    if (met === 'tempo') return rec.tempo ? UI.mmss(rec.tempo.valor) : '—';
    if (rec.semCarga) return `${rec.reps.reps} repetições`;
    return `${U.fmt(rec.peso.kg)} × ${rec.peso.reps}`;
  }

  /** Etiqueta curta para listas, a partir do índice de recordes */
  function melhorEtiqueta(ex, r) {
    if (!ex || !r) return null;
    const met = ex.m || 'peso';
    if (met === 'distancia') return r.m ? `${UI.fmt(r.m, 0)} m` : null;
    if (met === 'calorias') return r.cal ? `${UI.fmt(r.cal, 0)} cal` : null;
    if (met === 'tempo') return r.reps ? `${r.reps} s` : null;
    if (r.kg) return U.fmt(r.kg);
    return r.reps ? `${r.reps} repetições` : null;
  }

  /**
   * Progressão sugerida. Sobe a carga em dois casos:
   * — completaste todas as séries no topo do intervalo (dupla progressão);
   * — registaste RIR e sobraram 3 ou mais repetições em todas as séries,
   *   já dentro do intervalo — a carga está a ficar leve antes do tempo.
   */
  function sugerirProgressao(exId, maq) {
    const ex = exercicio(exId);
    if (!ex || !comCarga(ex)) return null;
    const ult = ultimaPerformance(exId, null, maq);
    if (!ult) return null;
    const uteis = ult.series.filter(serieUtil);
    if (!uteis.length) return null;
    const reps = repsDe(ex);
    const kgBase = Math.max(...uteis.map(s => s.kg || 0));
    if (!kgBase) return null;
    const todasNoTopo = uteis.every(s => (s.reps || 0) >= reps[1] && (s.kg || 0) >= kgBase);
    const margem = uteis.every(s => s.rir != null) ? Math.min(...uteis.map(s => s.rir)) : null;
    const folga = margem != null && margem >= 3 && uteis.every(s => (s.reps || 0) >= reps[0]);
    const subir = todasNoTopo || folga;
    return {
      subir,
      motivo: subir ? (todasNoTopo ? 'topo' : 'folga') : null,
      margem,
      kg: subir ? kgBase + incrementoDe(ex) : kgBase,
      anterior: kgBase,
      reps: subir ? reps[0] : Math.max(...uteis.map(s => s.reps || 0))
    };
  }

  /* ---------- motor de sugestão ---------- */

  /** Escolhe o próximo dia do plano com base no histórico */
  function proximoDiaSplit() {
    const split = SPLITS[state.settings.split] || SPLITS.ppl;
    const ultimo = state.treinos.find(t => t.splitId === state.settings.split && typeof t.splitDia === 'number');
    let i = 0;
    if (ultimo) i = (ultimo.splitDia + 1) % split.dias.length;
    return { split, splitKey: state.settings.split, indice: i, dia: split.dias[i] };
  }

  /** Pontua exercícios para escolher os melhores para um músculo */
  function melhorExercicioPara(musculo, usados, equipamento) {
    const cands = todosExercicios().filter(ex =>
      (ex.p || []).includes(musculo) &&
      !ex.cond &&
      !usados.has(ex.id) &&
      (!equipamento || !equipamento.length || equipamento.includes(ex.e))
    );
    if (!cands.length) return null;

    // sessões desde a última vez que cada exercício foi feito
    const hist = {};
    state.treinos.slice(0, 30).forEach((t, i) => t.entradas.forEach(e => {
      if (hist[e.exId] == null) hist[e.exId] = i;
    }));

    const PESO_EQUIP = { barra: 30, halteres: 28, maquina: 26, cabos: 24, corporal: 14, kettlebell: 10, elastico: 6 };
    const forca = state.settings.objetivo === 'forca';

    function pontuar(ex) {
      let p = 0;
      if ((ex.p || [])[0] === musculo) p += 100;        // é o alvo principal do exercício
      if (ex.pr === 1) p += 130; else if (ex.pr === 2) p += 65;
      if (state.favoritos.includes(ex.id)) p += 90;
      if (hist[ex.id] != null) p += 70 - Math.min(60, hist[ex.id] * 4);  // já sabe a carga
      if (ex.t === 'C') p += forca ? 70 : 25;           // quem treina força quer compostos
      p += PESO_EQUIP[ex.e] || 0;
      if ((ex.p || []).length >= 3) p -= 40;            // demasiado global
      if (ex.custom) p += 25;
      return p;
    }

    cands.sort((a, b) => pontuar(b) - pontuar(a) || a.n.localeCompare(b.n, 'pt'));
    return cands[0];
  }

  /** Circuitos que fazem sentido para o objectivo actual */
  function circuitosSugeridos() {
    const obj = state.settings.objetivo;
    const chaves = Object.keys(CIRCUITOS);
    const bons = chaves.filter(k => (CIRCUITOS[k].objetivos || []).includes(obj));
    return (bons.length ? bons : chaves).map(k => ({ chave: k, ...CIRCUITOS[k] }));
  }

  /** Sugestão de circuito: alterna entre os que servem o objectivo */
  function sugerirCircuito(preferido) {
    const lista = circuitosSugeridos();
    if (!lista.length) return null;
    if (preferido && CIRCUITOS[preferido]) return { chave: preferido, ...CIRCUITOS[preferido] };
    const feitos = state.treinos.filter(t => t.circuitoId).map(t => t.circuitoId);
    const nunca = lista.find(c => !feitos.includes(c.chave));
    if (nunca) return nunca;
    // o que está há mais tempo sem ser feito
    return lista.slice().sort((a, b) => feitos.indexOf(a.chave) - feitos.indexOf(b.chave)).pop();
  }

  /**
   * Sugestão do próximo dia do plano embutido.
   * Nos dias marcados como livres (as pernas) o plano só acrescenta o
   * trabalho fixo do fim — os exercícios grandes ficam à escolha da app.
   */
  function sugerirPlano(indiceEscolhido) {
    const P = plano();
    if (!P) return null;
    const prox = proximoDiaPlano();
    const indice = indiceEscolhido != null ? indiceEscolhido : prox.indice;
    const dia = P.dia(indice);
    const exercicios = [];

    if (dia.livre) {
      const usados = new Set();
      dia.livre.forEach(m => {
        if (exercicios.length >= 4) return;
        const ex = melhorExercicioPara(m, usados, state.settings.equipamento);
        if (!ex) return;
        usados.add(ex.id);
        const prog = sugerirProgressao(ex.id);
        exercicios.push({
          ex, musculo: m,
          series: state.settings.seriesPorExercicio || 3,
          reps: repsDe(ex),
          kg: prog ? prog.kg : null,
          subir: prog ? prog.subir : false,
          anterior: prog ? prog.anterior : null
        });
      });
    }

    dia.exercicios.forEach(p => {
      const ex = exercicio(p.ex);
      if (!ex) return;
      // dentro do plano é o plano que manda: a carga proposta é sempre a que
      // está escrita, nunca a que saiu da última sessão. A progressão decide-se
      // na revisão da semana, com o relatório à frente, e escreve-se aqui. Sem
      // isto, uma série levada à falha puxava o número para cima sozinha e uma
      // carga baixada de propósito nunca chegava ao ginásio.
      // A última carga feita fica ao lado, só para se ver o que muda.
      const noPlano = ultimaNoPlano(p.ex);
      const antes = noPlano ? cargaDe(noPlano.series) : null;
      exercicios.push({
        ex, musculo: (ex.p || [])[0], prescricao: p,
        series: p.series, reps: p.reps,
        kg: p.kg != null ? p.kg : null,
        subir: false,
        anterior: antes,
        mudou: antes != null && p.kg != null && p.kg !== antes,
        max: !!p.max, nota: p.nota || null
      });
    });

    return {
      tipo: 'plano', plano: P, dia, planoDia: indice,
      nome: `Dia ${dia.k} · ${dia.nome}`,
      splitNome: P.nome,
      aquecimento: dia.aquecimento || null,
      nota: dia.nota || null,
      livre: !!dia.livre,
      exercicios, alerta: null
    };
  }

  /**
   * Sugestão de treino para hoje.
   * Com plano activo é o plano que manda. Sem ele, combina a divisão
   * escolhida com os músculos em défice na última semana; se o dia da
   * divisão for de circuito, devolve um treino híbrido.
   */
  function sugerirTreino() {
    if (planoActivo()) {
      const p = sugerirPlano();
      if (p && p.exercicios.length) return p;
    }
    const { split, splitKey, indice, dia } = proximoDiaSplit();

    if (dia.circuito) {
      const c = sugerirCircuito(dia.circuito);
      if (c) {
        return {
          tipo: 'circuito', circuito: c, chave: c.chave,
          nome: c.name, splitId: splitKey, splitDia: indice, splitNome: split.name,
          exercicios: c.estacoes.map(e => ({ ex: exercicio(e.ex), alvo: e.alvo })).filter(x => x.ex),
          alerta: null
        };
      }
    }

    const estados = {};
    estadoMusculos().forEach(m => { estados[m.key] = m; });

    // a ordem do plano define a estrutura da sessão (compostos grandes primeiro);
    // o défice só decide quem leva exercício extra
    const foco = (dia.foco || []).filter(k => !ignorado(k));
    // défice absoluto (não relativo): assim os exercícios extra vão para os
    // grupos grandes — dorsais, peito, quadríceps — e não para o trapézio
    const porDefice = foco.slice().sort((a, b) =>
      (estados[b].alvo - estados[b].sets) - (estados[a].alvo - estados[a].sets));

    // músculo claramente em falta fora do dia — junta-se no fim se houver espaço
    // (só depois de haver histórico suficiente para a comparação fazer sentido)
    const extras = (state.treinos.length < 4 ? [] : musculosActivos().filter(k => {
      if (foco.includes(k)) return false;
      const e = estados[k];
      if (e.dias === null) return e.sets < e.alvo * 0.5;              // nunca trabalhado directamente
      return e.dias >= 2 && (e.dias >= 6 || e.sets < e.alvo * 0.35);  // parado ou com pouco volume
    }))
      .sort((a, b) => (estados[b].dias === null ? 99 : estados[b].dias) - (estados[a].dias === null ? 99 : estados[a].dias))
      .slice(0, 1);

    const limite = state.settings.exerciciosPorTreino || 6;
    const usados = new Set();
    const escolha = [];
    const equip = state.settings.equipamento;

    const alvos = foco.concat(extras);
    const porMusculo = {};
    // 1.ª passagem: um exercício por músculo alvo
    for (const m of alvos) {
      if (escolha.length >= limite) break;
      const ex = melhorExercicioPara(m, usados, equip);
      if (ex) { usados.add(ex.id); porMusculo[m] = 1; escolha.push({ ex, musculo: m }); }
    }
    // 2.ª e 3.ª passagens: exercícios extra para os grandes grupos em défice
    // (músculos pequenos — antebraço, lombar, deltoide anterior — nunca levam mais do que um)
    for (const maximo of [2, 3]) {
      for (const m of porDefice) {
        if (escolha.length >= limite) break;
        if (estados[m].alvo < 10) continue;
        if ((porMusculo[m] || 0) >= maximo) continue;
        if (estados[m].sets >= estados[m].alvo) continue;
        const ex = melhorExercicioPara(m, usados, equip);
        if (ex) { usados.add(ex.id); porMusculo[m] = (porMusculo[m] || 0) + 1; escolha.push({ ex, musculo: m }); }
      }
      if (escolha.length >= limite) break;
    }

    return {
      tipo: 'forca',
      nome: dia.name,
      splitId: splitKey,
      splitDia: indice,
      splitNome: split.name,
      // compostos primeiro (ordenação estável mantém a prioridade dentro de cada grupo)
      exercicios: escolha
        .slice()
        .sort((a, b) => (b.ex.t === 'C' ? 1 : 0) - (a.ex.t === 'C' ? 1 : 0))
        .map(({ ex, musculo }) => {
          const prog = sugerirProgressao(ex.id);
          return {
            ex, musculo,
            series: Math.max(1, state.settings.seriesPorExercicio || 3),
            reps: repsDe(ex),
            kg: prog ? prog.kg : null,
            subir: prog ? prog.subir : false,
            anterior: prog ? prog.anterior : null
          };
        }),
      alerta: extras.length ? (() => {
        const e = estados[extras[0]];
        const n = MUSCLES[extras[0]].name;
        if (e.dias === null) return `${n} nunca foi treinado directamente — juntei um exercício.`;
        return e.dias >= 6
          ? `${n} sem estímulo há ${e.dias} dias — juntei um exercício.`
          : `${n} só com ${Math.round(e.sets * 10) / 10} de ${e.alvo} séries esta semana — juntei um exercício.`;
      })() : null
    };
  }

  /* ---------- monitorização do plano ---------- */

  /**
   * Como está o plano: em que semana vai, que dias já fizeste, e para
   * cada exercício a carga de partida, a carga de agora e quantos
   * degraus subiste desde o início.
   */
  function estadoPlano() {
    const P = plano();
    if (!P) return null;
    const sessoes = state.treinos.filter(t => t.planoId === P.id);
    const limite7 = D.maisDias(D.hoje(), -6);

    const dias = P.dias.map(d => {
      const feitos = sessoes.filter(t => t.planoDia === d.indice);
      return {
        k: d.k, nome: d.nome, indice: d.indice, livre: !!d.livre,
        total: feitos.length,
        ultima: feitos.length ? feitos[0].data : null,
        semana: feitos.filter(t => t.data >= limite7).length
      };
    });

    const exercicios = P.exerciciosDoPlano().map(id => {
      const ex = exercicio(id);
      const p = P.prescricao(id);
      // só conta o que foi feito dentro do plano — é isso que se está a seguir
      const hist = historicoExercicio(id).filter(h => {
        const t = state.treinos.find(x => x.id === h.treinoId);
        return t && t.planoId === P.id;
      });
      const ult = hist[0] || null;
      const prog = ult ? sugerirProgressao(id) : null;
      const uteis = ult ? ult.series.filter(serieUtil) : [];
      const actual = uteis.length ? Math.max(...uteis.map(s => s.kg || 0)) : null;
      const inc = (p && p.inc) || (ex && ex.inc) || 2.5;
      // o chão é a carga com que o exercício entrou no bloco, não a desta
      // semana: as cargas do plano mexem-se em cada revisão, e contar degraus
      // contra um chão que anda dava sempre zero
      const chao = p ? (p.partida != null ? p.partida : (p.kg != null ? p.kg : null)) : null;
      return {
        id, ex, prescricao: p, inc, chao, alvo: p && p.kg != null ? p.kg : null,
        nome: ex ? ex.n : id,
        maq: ult ? ult.maq : null,
        sessoes: hist.length,
        ultima: ult ? ult.data : null,
        actual,
        degraus: (chao != null && actual) ? Math.round((actual - chao) / inc) : null,
        subir: prog ? prog.subir : false,
        proxima: prog ? prog.kg : chao,
        series: uteis
      };
    });

    // Uma volta deste plano são as cinco sessões da roda, não sete dias.
    // Comparar o previsto com os últimos sete dias dava números enganadores
    // (cinco sessões numa semana, três na outra), por isso a conta é feita
    // sobre a última rotação completa.
    const idsDoPlano = new Set(P.exerciciosDoPlano());
    const rotacao = sessoes.slice(0, P.total);
    const grupoDe = id => {
      const ex = exercicio(id);
      const m = ex && (ex.p || [])[0];
      const v = P.volumeAlvo.find(g => g.musculos.includes(m));
      return v ? v.k : null;
    };
    const previsto = {}, feito = {};
    P.volumeAlvo.forEach(v => { previsto[v.k] = 0; feito[v.k] = 0; });
    P.dias.forEach(d => d.exercicios.forEach(p => {
      const k = grupoDe(p.ex);
      if (k) previsto[k] += p.series;
    }));
    let feitasRotacao = 0;
    rotacao.forEach(t => t.entradas.forEach(e => {
      if (!idsDoPlano.has(e.exId)) return;
      const n = e.series.filter(serieUtil).length;
      feitasRotacao += n;
      const k = grupoDe(e.exId);
      if (k) feito[k] += n;
    }));

    const controlo = P.controlo.exercicios.map(id => {
      const e = exercicios.find(x => x.id === id);
      return { id, nome: e ? e.nome : id, degraus: e ? e.degraus : null, subiu: !!(e && e.degraus >= 1) };
    });

    return {
      plano: P,
      semana: semanaDoPlano(),
      desde: state.planoDesde,
      proximo: proximoDiaPlano(),
      sessoes: sessoes.length,
      sessoesSemana: sessoes.filter(t => t.data >= limite7).length,
      dias, exercicios,
      seriesPrevistas: P.seriesPorSemana(),
      seriesRotacao: feitasRotacao,
      rotacaoSessoes: rotacao.length,
      controlo,
      volume: P.volumeAlvo.map(v => ({
        k: v.k, nome: v.nome,
        alvo: previsto[v.k],       // o que o plano prescreve mesmo
        escrito: v.alvo,           // o número que vem escrito no plano
        sets: feito[v.k]
      }))
    };
  }

  /**
   * Relatório de uma semana em texto, para exportar e rever o plano.
   * `recuar` = quantas semanas para trás (0 = a semana a correr).
   */
  function relatorioPlano(recuar) {
    const P = plano();
    const est = estadoPlano();
    if (!P || !est) return '';
    const base = D.maisDias(D.hoje(), -7 * (recuar || 0));
    const ini = D.maisDias(base, -((D.parse(base).getDay() + 6) % 7));
    const fim = D.maisDias(ini, 6);
    const semana = Math.floor(Math.max(0, D.diasEntre(state.planoDesde || ini, ini)) / 7) + 1;
    const sessoes = state.treinos.filter(t => t.data >= ini && t.data <= fim)
      .slice().sort((a, b) => a.data.localeCompare(b.data) || (a.inicio || 0) - (b.inicio || 0));

    const L = [];
    L.push(`# ${P.nome} v${P.versao} — semana ${semana} (${D.curto(ini)} a ${D.curto(fim)})`);
    L.push('');

    const peso = pesoCorporal();
    if (peso != null) {
      const dif = variacaoPeso(30);
      L.push(`Peso corporal: ${U.fmt(peso)}${dif === null ? '' : ` (${dif > 0 ? '+' : ''}${UI.fmt(U.mostrar(dif))} ${U.label()} em 30 dias)`}`);
    }

    const feitos = sessoes.filter(t => t.planoId === P.id).map(t => P.dia(t.planoDia).k);
    const distintos = [...new Set(feitos)].sort();
    const faltam = P.dias.map(d => d.k).filter(k => !distintos.includes(k));
    const repetidos = distintos.filter(k => feitos.filter(x => x === k).length > 1);
    L.push(`Sessões do plano: ${feitos.length}${feitos.length ? ' — ' + feitos.join(', ') : ''}`);
    L.push(`Dias cobertos: ${distintos.length} de ${P.total}.${faltam.length ? ` Faltou ${faltam.join(', ')}.` : ''}${repetidos.length ? ` Repetiste ${repetidos.join(', ')}.` : ''}`);
    const fora = sessoes.filter(t => t.planoId !== P.id);
    if (fora.length) L.push(`Fora do plano: ${fora.length} treino${fora.length > 1 ? 's' : ''} (${fora.map(t => t.nome).join(', ')}).`);
    L.push('');

    sessoes.forEach(t => {
      L.push(`## ${t.nome} — ${D.curto(t.data)} (${UI.fmtDuracao(t.duracao)})`);
      t.entradas.forEach(e => {
        const ex = exercicio(e.exId);
        const p = P.prescricao(e.exId);
        const uteis = e.series.filter(serieUtil);
        if (!uteis.length) return;
        const partes = uteis.map(s => {
          const carga = s.kg ? U.fmt(s.kg, true) + '×' : '';
          const v = ex && ex.tempo ? `${s.reps || 0}s` : (s.reps != null ? s.reps : '—');
          return `${carga}${v}${s.rir != null ? ` (RIR ${s.rir})` : ''}`;
        });
        const alvo = p ? ` — plano ${p.kg != null ? U.fmt(p.kg) + ', ' : ''}${p.series}×${p.reps[0]}-${p.reps[1]}` : '';
        L.push(`- ${ex ? ex.n : e.exId}${e.maq ? ` [${e.maq}]` : ''}: ${partes.join(', ')}${alvo}`);
        if (e.notas) L.push(`  Nota: ${e.notas}`);
      });
      if (t.notas) L.push(`Notas da sessão: ${t.notas}`);
      L.push('');
    });

    L.push('## Cargas · chão do bloco, o que o plano pede agora, onde estás e degraus ganhos');
    est.exercicios.forEach(x => {
      if (x.chao == null) { L.push(`- ${x.nome}: peso do corpo · ${x.sessoes} ${x.sessoes === 1 ? 'sessão' : 'sessões'}`); return; }
      L.push(`- ${x.nome}: chão ${U.fmt(x.chao)} · plano ${x.alvo != null ? U.fmt(x.alvo) : '—'} → ${x.actual ? U.fmt(x.actual) : 'sem registo'}`
        + `${x.degraus != null ? ` (${x.degraus >= 0 ? '+' : ''}${x.degraus} degrau${Math.abs(x.degraus) === 1 ? '' : 's'} de ${U.fmt(x.inc)})` : ''}`
        + `${x.subir ? ' · a subir para ' + U.fmt(x.proxima) : ''}`);
    });
    L.push('');

    L.push(`## Volume da última rotação (${est.rotacaoSessoes} de ${P.total} sessões)`);
    L.push(est.volume.map(v => `${v.nome} ${v.sets}/${v.alvo}`).join(' · '));
    L.push('');
    L.push(`Séries do plano na última rotação: ${est.seriesRotacao} de ${est.seriesPrevistas} previstas.`);

    if (est.semana >= P.controlo.semana) {
      L.push('');
      L.push(`## Controlo da semana ${P.controlo.semana}`);
      est.controlo.forEach(c => L.push(`- ${c.nome}: ${c.degraus == null ? 'sem dados' : `${c.degraus >= 0 ? '+' : ''}${c.degraus} degraus`} — ${c.subiu ? 'subiu' : 'parado'}`));
    }
    return L.join('\n');
  }

  /* ---------- estatísticas globais ---------- */
  function diasTreinados(dias) {
    const limite = D.maisDias(D.hoje(), -dias + 1);
    return new Set(state.treinos.filter(t => t.data >= limite).map(t => t.data)).size;
  }

  function sequencia() {
    // semanas consecutivas com pelo menos 1 treino
    const datas = new Set(state.treinos.map(t => t.data));
    if (!datas.size) return 0;
    let n = 0, cursor = D.hoje();
    for (let semana = 0; semana < 260; semana++) {
      let teve = false;
      for (let i = 0; i < 7; i++) if (datas.has(D.maisDias(cursor, -i))) { teve = true; break; }
      if (!teve) { if (semana === 0) { cursor = D.maisDias(cursor, -7); continue; } break; }
      n++;
      cursor = D.maisDias(cursor, -7);
    }
    return n;
  }

  function volumeSemanal(nSemanas) {
    const out = [];
    let fim = D.hoje();
    const dow = (D.parse(fim).getDay() + 6) % 7;      // semana começa à segunda
    fim = D.maisDias(fim, -dow);
    for (let i = nSemanas - 1; i >= 0; i--) {
      const ini = D.maisDias(fim, -7 * i);
      const term = D.maisDias(ini, 6);
      const treinos = state.treinos.filter(t => t.data >= ini && t.data <= term);
      out.push({
        inicio: ini,
        label: D.curto(ini),
        volume: treinos.reduce((v, t) => v + volumeTreino(t), 0),
        series: treinos.reduce((v, t) => v + seriesTreino(t), 0),
        metros: treinos.reduce((v, t) => v + trabalhoCardio(t).metros, 0),
        minutos: Math.round(treinos.reduce((v, t) => v + (t.duracao || 0), 0) / 60),
        treinos: treinos.length
      });
    }
    return out;
  }

  /* =============================================================
     Alimentação — catálogo, registo do dia e revisão da semana

     O registo guarda os macros já calculados em cada linha, e não
     só uma referência ao alimento. É de propósito: corrigir hoje
     as calorias do bitoque não pode reescrever o que comeste no
     mês passado, tal como acertar o plano de treino não mexe nas
     séries já registadas.
     ============================================================= */

  function refeicoes() { return global.COMIDA.REFEICOES; }
  function ordemRefeicoes() { return Object.keys(global.COMIDA.REFEICOES); }

  /** Um alimento como está agora: catálogo, com as tuas correcções por cima */
  function alimento(id) {
    const meu = (state.alimentos || []).find(a => a.id === id);
    if (meu) return meu;
    const base = global.COMIDA.POR_ID[id];
    if (!base) return null;
    const ed = state.alimentosEditados && state.alimentosEditados[id];
    return ed ? Object.assign({}, base, ed) : base;
  }

  /** Todos os alimentos à mão: os teus primeiro, depois o catálogo */
  function alimentos() {
    const ocultos = new Set(state.alimentosOcultos || []);
    const base = global.COMIDA.ALIMENTOS.filter(a => !ocultos.has(a.id)).map(a => alimento(a.id));
    return (state.alimentos || []).concat(base);
  }

  /** Macros de uma quantidade: gramas nos alimentos por 100 g, porções nos outros */
  function macrosDe(a, q) {
    const f = a.tipo === 'g' ? (q || 0) / 100 : (q || 0);
    const uma = n => Math.round((n || 0) * f * 10) / 10;
    return { kcal: Math.round((a.kcal || 0) * f), prot: uma(a.prot), hc: uma(a.hc), gord: uma(a.gord) };
  }

  /** Soma de uma lista de linhas com macros */
  function somarMacros(lista) {
    const t = { kcal: 0, prot: 0, hc: 0, gord: 0 };
    (lista || []).forEach(x => {
      t.kcal += x.kcal || 0; t.prot += x.prot || 0; t.hc += x.hc || 0; t.gord += x.gord || 0;
    });
    ['prot', 'hc', 'gord'].forEach(k => { t[k] = Math.round(t[k] * 10) / 10; });
    t.kcal = Math.round(t.kcal);
    return t;
  }

  /** Quantidade escrita por extenso: "180 g" ou "2 × scoop" */
  function textoQuantidade(x) {
    if (x.tipo === 'g') return `${UI.fmt(x.q, 0)} g`;
    const n = UI.fmt(x.q);
    const p = x.porcao || 'porção';
    return x.q === 1 ? `1 ${p}` : `${n} × ${p}`;
  }

  /** Cria ou corrige um alimento. Corrigir um do catálogo guarda só a diferença. */
  function guardarAlimento(dados) {
    const campos = {
      n: String(dados.n || '').trim(),
      cat: dados.cat || 'prato',
      tipo: dados.tipo === 'g' ? 'g' : 'un',
      kcal: Math.max(0, dados.kcal || 0),
      prot: Math.max(0, dados.prot || 0),
      hc: Math.max(0, dados.hc || 0),
      gord: Math.max(0, dados.gord || 0),
      porcao: dados.tipo === 'g' ? null : (String(dados.porcao || '').trim() || 'porção'),
      g: dados.g || null
    };
    if (!campos.n) return null;

    if (dados.id) {
      const meu = (state.alimentos || []).find(a => a.id === dados.id);
      if (meu) Object.assign(meu, campos);
      else {
        // alimento do catálogo: guarda-se só o que ficou diferente
        state.alimentosEditados = state.alimentosEditados || {};
        state.alimentosEditados[dados.id] = campos;
      }
      guardar(true);
      return alimento(dados.id);
    }

    const base = campos.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'alimento';
    let id = 'meu-' + base, i = 2;
    while (alimento(id)) id = 'meu-' + base + '-' + i++;
    const novo = Object.assign({ id, custom: true, criadoEm: D.hoje() }, campos);
    state.alimentos = state.alimentos || [];
    state.alimentos.push(novo);
    guardar(true);
    return novo;
  }

  /** Tira um alimento da lista. Os teus são apagados, os do catálogo escondidos. */
  function apagarAlimento(id) {
    const i = (state.alimentos || []).findIndex(a => a.id === id);
    if (i >= 0) state.alimentos.splice(i, 1);
    else {
      state.alimentosOcultos = state.alimentosOcultos || [];
      if (!state.alimentosOcultos.includes(id)) state.alimentosOcultos.push(id);
      if (state.alimentosEditados) delete state.alimentosEditados[id];
    }
    guardar(true);
  }

  /** Repõe um alimento do catálogo como veio de fábrica */
  function reporAlimento(id) {
    if (state.alimentosEditados) delete state.alimentosEditados[id];
    state.alimentosOcultos = (state.alimentosOcultos || []).filter(x => x !== id);
    guardar(true);
    return alimento(id);
  }

  /** Quantas vezes cada alimento foi registado, e quando foi a última */
  function usosAlimentos() {
    const u = {};
    (state.comidas || []).forEach(c => {
      const x = u[c.aId] || (u[c.aId] = { n: 0, ultima: null });
      x.n++;
      if (!x.ultima || c.data > x.ultima) x.ultima = c.data;
    });
    return u;
  }

  /**
   * Alimentos por ordem de utilidade: os mais usados primeiro, depois os do
   * plano, depois o resto. Com `termo`, procura por nome.
   */
  function procurarAlimentos(termo, limite) {
    const u = usosAlimentos();
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const t = norm(termo).trim();
    const lista = alimentos().filter(a => !t || norm(a.n).includes(t));
    lista.sort((a, b) => {
      const ua = u[a.id], ub = u[b.id];
      if (t) {
        const ia = norm(a.n).indexOf(t), ib = norm(b.n).indexOf(t);
        if (ia !== ib) return ia - ib;
      }
      if ((ub ? ub.n : 0) !== (ua ? ua.n : 0)) return (ub ? ub.n : 0) - (ua ? ua.n : 0);
      if (!!b.plano !== !!a.plano) return b.plano ? 1 : -1;
      return a.n.localeCompare(b.n, 'pt');
    });
    return limite ? lista.slice(0, limite) : lista;
  }

  /* ---------- plano alimentar embutido ---------- */

  function planoAlimentar() {
    const P = global.PLANO_ALIMENTAR;
    if (!P) return null;
    return state.settings.nutricao && state.settings.nutricao.plano === P.id ? P : null;
  }

  function activarPlanoAlimentar(ligar) {
    const P = global.PLANO_ALIMENTAR;
    state.settings.nutricao = state.settings.nutricao || {};
    state.settings.nutricao.plano = ligar && P ? P.id : null;
    guardar(true);
    return planoAlimentar();
  }

  /** Os alvos do dia: os do plano se estiver ligado, senão os que escreveste */
  function alvosNutricao() {
    const P = planoAlimentar();
    if (P) return Object.assign({}, P.alvos, { fonte: 'plano', nome: P.nome });
    const n = state.settings.nutricao || {};
    if (n.kcal || n.prot || n.hc || n.gord) {
      return { kcal: n.kcal || null, prot: n.prot || null, hc: n.hc || null, gord: n.gord || null, fonte: 'teus' };
    }
    return null;
  }

  /** O que o plano manda comer num dia, já com as contas feitas */
  function planoDoDia(data) {
    const P = planoAlimentar();
    if (!P) return null;
    const dia = P.dia(data || D.hoje());
    if (!dia) return null;
    const refs = ordemRefeicoes().map(k => {
      const linhas = (dia.refeicoes[k] || []).map(l => {
        const a = alimento(l.a);
        if (!a) return null;
        return Object.assign({
          aId: a.id, n: a.n, tipo: a.tipo, porcao: a.porcao || null, q: l.q, nota: l.nota || null
        }, macrosDe(a, l.q));
      }).filter(Boolean);
      return { k, nome: refeicoes()[k].name, linhas, totais: somarMacros(linhas) };
    });
    return { nome: dia.nome, refeicoes: refs, totais: somarMacros(refs.map(r => r.totais)) };
  }

  /** Regista de uma vez o que o plano manda numa refeição */
  function registarRefeicaoDoPlano(data, refeicao) {
    const p = planoDoDia(data);
    if (!p) return 0;
    const r = p.refeicoes.find(x => x.k === refeicao);
    if (!r || !r.linhas.length) return 0;
    r.linhas.forEach(l => registarComida({
      alimentoId: l.aId, q: l.q, refeicao, data, nota: l.nota, doPlano: true
    }, true));
    guardar(true);
    return r.linhas.length;
  }

  /* ---------- registo ---------- */

  function registarComida(dados, adiar) {
    const a = alimento(dados.alimentoId);
    if (!a) return null;
    const q = dados.q != null ? dados.q : (a.tipo === 'g' ? (a.g || 100) : 1);
    const r = Object.assign({
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data: dados.data || D.hoje(),
      refeicao: dados.refeicao || global.COMIDA.refeicaoDaHora(),
      aId: a.id, n: a.n, tipo: a.tipo, porcao: a.porcao || null, q,
      nota: dados.nota || null, doPlano: !!dados.doPlano, criadoEm: Date.now()
    }, macrosDe(a, q));
    state.comidas = state.comidas || [];
    state.comidas.push(r);
    if (!adiar) guardar(true);
    return r;
  }

  function comida(id) { return (state.comidas || []).find(c => c.id === id) || null; }

  /** Muda a quantidade, a refeição ou o dia de uma linha já registada */
  function actualizarComida(id, campos) {
    const c = comida(id);
    if (!c) return null;
    if (campos.refeicao) c.refeicao = campos.refeicao;
    if (campos.data) c.data = campos.data;
    if (campos.nota !== undefined) c.nota = campos.nota || null;
    if (campos.q != null && campos.q !== c.q) {
      const a = alimento(c.aId);
      if (a) Object.assign(c, macrosDe(a, campos.q));
      else {
        // o alimento já não existe: escala os macros que ficaram na linha
        const f = c.q ? campos.q / c.q : 0;
        c.kcal = Math.round(c.kcal * f);
        ['prot', 'hc', 'gord'].forEach(k => { c[k] = Math.round(c[k] * f * 10) / 10; });
      }
      c.q = campos.q;
      c.doPlano = false;
    }
    guardar(true);
    return c;
  }

  function apagarComida(id) {
    const i = (state.comidas || []).findIndex(c => c.id === id);
    if (i < 0) return false;
    state.comidas.splice(i, 1);
    guardar(true);
    return true;
  }

  function comidasDoDia(data) {
    const ordem = ordemRefeicoes();
    return (state.comidas || []).filter(c => c.data === data)
      .slice().sort((a, b) => ordem.indexOf(a.refeicao) - ordem.indexOf(b.refeicao) || a.criadoEm - b.criadoEm);
  }

  function totaisComida(data) {
    return somarMacros(comidasDoDia(data));
  }

  /** Um dia inteiro: o que comeste, por refeição, contra os alvos e contra o plano */
  function diaComida(data) {
    const dia = data || D.hoje();
    const itens = comidasDoDia(dia);
    const plano = planoDoDia(dia);
    const refs = ordemRefeicoes().map(k => {
      const lista = itens.filter(c => c.refeicao === k);
      const pl = plano ? plano.refeicoes.find(r => r.k === k) : null;
      return {
        k, nome: refeicoes()[k].name, itens: lista, totais: somarMacros(lista),
        plano: pl && pl.linhas.length ? pl : null,
        seguido: !!(lista.length && lista.every(c => c.doPlano))
      };
    });
    const totais = somarMacros(itens);
    const alvos = alvosNutricao();
    const restante = alvos ? {
      kcal: alvos.kcal != null ? Math.round(alvos.kcal - totais.kcal) : null,
      prot: alvos.prot != null ? Math.round((alvos.prot - totais.prot) * 10) / 10 : null,
      hc: alvos.hc != null ? Math.round((alvos.hc - totais.hc) * 10) / 10 : null,
      gord: alvos.gord != null ? Math.round((alvos.gord - totais.gord) * 10) / 10 : null
    } : null;
    return { data: dia, itens, refeicoes: refs, totais, alvos, restante, plano, vazio: !itens.length };
  }

  /** Dias com registo de comida, do mais recente para trás */
  function diasComRegisto(limite) {
    const dias = [...new Set((state.comidas || []).map(c => c.data))].sort().reverse();
    return limite ? dias.slice(0, limite) : dias;
  }

  /* ---------- a semana ---------- */

  /** Segunda a domingo da semana a `recuar` semanas de distância */
  function semanaDe(recuar) {
    const base = D.maisDias(D.hoje(), -7 * (recuar || 0));
    const ini = D.maisDias(base, -((D.parse(base).getDay() + 6) % 7));
    return { ini, fim: D.maisDias(ini, 6) };
  }

  /**
   * A semana de alimentação: cada dia, a média dos dias registados e a
   * distância aos alvos. A média só conta dias com registo — dias em
   * branco a contar como zero davam um défice que não existiu.
   */
  function semanaComida(recuar) {
    const { ini, fim } = semanaDe(recuar);
    const alvos = alvosNutricao();
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const data = D.maisDias(ini, i);
      const itens = comidasDoDia(data);
      const treino = (state.treinos || []).find(t => t.data === data);
      dias.push({
        data, itens, totais: somarMacros(itens), registado: itens.length > 0,
        doPlano: itens.length > 0 && itens.every(c => c.doPlano),
        treino: treino ? treino.nome : null,
        futuro: data > D.hoje()
      });
    }
    const comRegisto = dias.filter(d => d.registado);
    const media = comRegisto.length ? {
      kcal: Math.round(comRegisto.reduce((n, d) => n + d.totais.kcal, 0) / comRegisto.length),
      prot: Math.round(comRegisto.reduce((n, d) => n + d.totais.prot, 0) / comRegisto.length),
      hc: Math.round(comRegisto.reduce((n, d) => n + d.totais.hc, 0) / comRegisto.length),
      gord: Math.round(comRegisto.reduce((n, d) => n + d.totais.gord, 0) / comRegisto.length)
    } : null;
    const desvio = media && alvos ? {
      kcal: alvos.kcal != null ? media.kcal - alvos.kcal : null,
      prot: alvos.prot != null ? media.prot - alvos.prot : null,
      hc: alvos.hc != null ? media.hc - alvos.hc : null,
      gord: alvos.gord != null ? media.gord - alvos.gord : null
    } : null;
    return { ini, fim, dias, comRegisto: comRegisto.length, media, desvio, alvos, recuar: recuar || 0 };
  }

  /**
   * Relatório da semana em texto, para exportar e rever o plano alimentar.
   * Traz o que foi comido dia a dia, a média contra os alvos e o peso —
   * é o que é preciso para decidir se as calorias sobem ou descem.
   */
  function relatorioComida(recuar) {
    const s = semanaComida(recuar);
    const P = planoAlimentar();
    const L = [];
    const un = m => `${m.kcal} kcal · ${UI.fmt(m.prot, 0)} P · ${UI.fmt(m.hc, 0)} HC · ${UI.fmt(m.gord, 0)} G`;

    L.push(`# Alimentação — ${D.curto(s.ini)} a ${D.curto(s.fim)}`);
    L.push('');
    if (s.alvos) {
      L.push(`Alvo diário: ${s.alvos.kcal || '—'} kcal · ${s.alvos.prot || '—'} g proteína · `
        + `${s.alvos.hc || '—'} g hidratos · ${s.alvos.gord || '—'} g gordura`
        + (P ? ` (${P.nome} v${P.versao})` : ''));
    } else {
      L.push('Sem alvos definidos — escreve-os em Ajustes ou liga o plano alimentar.');
    }
    const peso = pesoCorporal();
    if (peso != null) {
      const dif = variacaoPeso(30);
      L.push(`Peso corporal: ${U.fmt(peso)}${dif === null ? '' : ` (${dif > 0 ? '+' : ''}${UI.fmt(U.mostrar(dif))} ${U.label()} em 30 dias)`}`);
    }
    L.push('');

    if (!s.comRegisto) {
      L.push('Sem nada registado nesta semana.');
      return L.join('\n');
    }

    L.push(`Dias registados: ${s.comRegisto} de 7.`);
    L.push(`Média dos dias registados: ${un(s.media)}`);
    if (s.desvio) {
      const p = [];
      if (s.desvio.kcal != null) p.push(`${s.desvio.kcal > 0 ? '+' : ''}${s.desvio.kcal} kcal`);
      if (s.desvio.prot != null) p.push(`${s.desvio.prot > 0 ? '+' : ''}${s.desvio.prot} g de proteína`);
      if (s.desvio.hc != null) p.push(`${s.desvio.hc > 0 ? '+' : ''}${s.desvio.hc} g de hidratos`);
      if (s.desvio.gord != null) p.push(`${s.desvio.gord > 0 ? '+' : ''}${s.desvio.gord} g de gordura`);
      if (p.length) L.push(`Face ao alvo: ${p.join(' · ')}`);
    }
    const seguidos = s.dias.filter(d => d.registado && d.doPlano).length;
    if (P) L.push(`Dias só com o que o plano manda: ${seguidos} de ${s.comRegisto}.`);
    L.push('');

    s.dias.forEach(d => {
      if (d.futuro && !d.registado) return;
      const cab = `## ${D.nomeDia(d.data)}, ${D.curto(d.data)}`;
      if (!d.registado) { L.push(`${cab} — sem registo${d.treino ? ` (treino: ${d.treino})` : ''}`); L.push(''); return; }
      L.push(`${cab} — ${un(d.totais)}${d.treino ? ` (treino: ${d.treino})` : ''}`);
      ordemRefeicoes().forEach(k => {
        const itens = d.itens.filter(c => c.refeicao === k);
        if (!itens.length) return;
        const partes = itens.map(c => `${c.n} ${textoQuantidade(c)} (${c.kcal} kcal, ${UI.fmt(c.prot, 0)} P)`);
        L.push(`- ${refeicoes()[k].name}: ${partes.join('; ')}`);
      });
      L.push('');
    });

    const u = {};
    s.dias.forEach(d => d.itens.forEach(c => { u[c.n] = (u[c.n] || 0) + 1; }));
    // só o que se repetiu: uma lista onde tudo aparece 1× não diz nada
    const top = Object.keys(u).filter(n => u[n] > 1).sort((a, b) => u[b] - u[a]).slice(0, 10);
    if (top.length) {
      L.push('## O que mais comeste');
      top.forEach(n => L.push(`- ${n}: ${u[n]}×`));
    }
    return L.join('\n');
  }

  /* ---------- registo alimentar em ficheiro ---------- */

  /**
   * Só o registo alimentar, em JSON: as linhas, todos os alimentos que criaste
   * (mesmo os que ainda não comeste) e as correcções ao catálogo. É o ficheiro
   * que se leva para outro telemóvel, que volta corrigido, ou de onde os teus
   * alimentos passam para o catálogo da app.
   */
  function exportarComida() {
    const comidas = (state.comidas || []).slice().sort((a, b) => a.data.localeCompare(b.data) || a.criadoEm - b.criadoEm);
    return JSON.stringify({
      tipo: 'registo-alimentar', versao: 1, exportadoEm: new Date().toISOString(),
      comidas, alimentos: state.alimentos || [], alimentosEditados: state.alimentosEditados || {}
    }, null, 2);
  }

  /**
   * Lê um ficheiro de registo — o de cima ou uma cópia de segurança inteira —
   * e devolve as linhas já normalizadas, sem mexer em nada.
   * Cada linha precisa de `data`; o resto preenche-se: com `aId` do catálogo e
   * sem `kcal`, os macros saem do alimento; com `kcal`, valem os números da linha.
   */
  function lerRegistoComida(json) {
    const dados = typeof json === 'string' ? JSON.parse(json) : json;
    const brutas = Array.isArray(dados) ? dados : dados && dados.comidas;
    if (!Array.isArray(brutas)) throw new Error('Ficheiro sem registo alimentar');
    const alimentosFicheiro = (dados && Array.isArray(dados.alimentos) ? dados.alimentos : [])
      .filter(a => a && a.id && a.n);
    const doFicheiro = id => alimentosFicheiro.find(a => a.id === id) || null;
    const refs = ordemRefeicoes();
    const num = v => Math.max(0, +v || 0);
    const agora = Date.now();

    const linhas = brutas.map((c, i) => {
      if (!c || !/^\d{4}-\d{2}-\d{2}$/.test(c.data || '')) return null;
      const a = c.aId ? (alimento(c.aId) || doFicheiro(c.aId)) : null;
      const n = String(c.n || (a && a.n) || '').trim();
      if (!n) return null;
      const tipo = c.tipo === 'g' || c.tipo === 'un' ? c.tipo : (a ? a.tipo : 'un');
      const q = +c.q > 0 ? +c.q : (tipo === 'g' ? ((a && a.g) || 100) : 1);
      const macros = c.kcal != null
        ? { kcal: Math.round(num(c.kcal)), prot: num(c.prot), hc: num(c.hc), gord: num(c.gord) }
        : a ? macrosDe(a, q) : null;
      if (!macros) return null;
      return Object.assign({
        id: c.id || 'c' + (agora + i).toString(36) + Math.random().toString(36).slice(2, 6),
        data: c.data,
        refeicao: refs.includes(c.refeicao) ? c.refeicao : 'snack',
        aId: c.aId || null, n, tipo,
        porcao: tipo === 'g' ? null : (c.porcao || (a && a.porcao) || null), q,
        nota: c.nota || null, doPlano: !!c.doPlano,
        criadoEm: +c.criadoEm || agora + i
      }, macros);
    }).filter(Boolean);

    return {
      linhas,
      ignoradas: brutas.length - linhas.length,
      dias: [...new Set(linhas.map(c => c.data))].sort(),
      alimentos: alimentosFicheiro
    };
  }

  /**
   * Mete no registo as linhas de um ficheiro.
   *   'juntar' → só entra o que ainda não cá está (pelo id da linha)
   *   'dias'   → cada dia que vem no ficheiro fica exactamente como no ficheiro
   * Os teus alimentos que vêm junto entram se ainda não existirem.
   */
  function importarComida(json, modo) {
    const r = lerRegistoComida(json);
    state.comidas = state.comidas || [];
    let novas = r.linhas;
    if (modo === 'dias') {
      const dias = new Set(r.dias);
      state.comidas = state.comidas.filter(c => !dias.has(c.data));
    } else {
      const ids = new Set(state.comidas.map(c => c.id));
      novas = novas.filter(c => !ids.has(c.id));
    }
    novas.forEach(c => state.comidas.push(c));
    state.alimentos = state.alimentos || [];
    r.alimentos.forEach(a => { if (!alimento(a.id)) state.alimentos.push(Object.assign({ custom: true }, a)); });
    // correcções ao catálogo: o que já está neste telemóvel manda
    const dados = typeof json === 'string' ? JSON.parse(json) : json;
    if (dados && dados.alimentosEditados && typeof dados.alimentosEditados === 'object') {
      state.alimentosEditados = Object.assign({}, dados.alimentosEditados, state.alimentosEditados || {});
    }
    guardar(true);
    return { linhas: novas.length, dias: r.dias.length };
  }

  /* ---------- backup ---------- */
  function exportar() {
    return JSON.stringify({ ...state, exportadoEm: new Date().toISOString() }, null, 2);
  }

  function importar(json, modo) {
    const dados = JSON.parse(json);
    if (!dados || !Array.isArray(dados.treinos)) throw new Error('Ficheiro inválido');
    if (modo === 'juntar') {
      const ids = new Set(state.treinos.map(t => t.id));
      dados.treinos.forEach(t => { if (!ids.has(t.id)) state.treinos.push(t); });
      state.treinos.sort((x, y) => y.data.localeCompare(x.data) || (y.inicio || 0) - (x.inicio || 0));
      const cids = new Set(state.exerciciosCustom.map(e => e.id));
      (dados.exerciciosCustom || []).forEach(e => { if (!cids.has(e.id)) state.exerciciosCustom.push(e); });
      // nomes próprios: o que já está neste telemóvel manda
      state.nomes = Object.assign({}, dados.nomes || {}, state.nomes || {});
      // peso corporal: junta os dias que faltam, sem mexer nos que já cá estão
      const meu = normalizarPerfil(state.perfil);
      const dias = new Set(meu.pesos.map(p => p.data));
      normalizarPerfil(dados.perfil).pesos.forEach(p => { if (!dias.has(p.data)) meu.pesos.push(p); });
      state.perfil = normalizarPerfil(meu);
      // medidas: junta os dias que faltam, sem mexer nos que já cá estão
      state.medidas = state.medidas || [];
      const diasMedidas = new Set(state.medidas.map(m => m.data));
      (Array.isArray(dados.medidas) ? dados.medidas : []).forEach(m => {
        if (m && m.data && !diasMedidas.has(m.data)) state.medidas.push(m);
      });
      state.medidas.sort((a, b) => a.data.localeCompare(b.data));
      // alimentação: junta as linhas do registo que ainda não cá estão
      const linhas = new Set((state.comidas || []).map(c => c.id));
      (dados.comidas || []).forEach(c => { if (!linhas.has(c.id)) state.comidas.push(c); });
      const aids = new Set((state.alimentos || []).map(a => a.id));
      (dados.alimentos || []).forEach(a => { if (!aids.has(a.id)) state.alimentos.push(a); });
      // correcções ao catálogo: o que já está neste telemóvel manda
      state.alimentosEditados = Object.assign({}, dados.alimentosEditados || {}, state.alimentosEditados || {});
      state.alimentosOcultos = [...new Set((state.alimentosOcultos || []).concat(dados.alimentosOcultos || []))];
    } else {
      const omissoes = estadoInicial().settings;
      state = Object.assign(estadoInicial(), dados);
      state.settings = Object.assign({}, omissoes, dados.settings || {});
      state.settings.nutricao = Object.assign({}, omissoes.nutricao, (dados.settings || {}).nutricao || {});
      state.perfil = normalizarPerfil(dados.perfil);
      if (!Array.isArray(state.comidas)) state.comidas = [];
      if (!Array.isArray(state.alimentos)) state.alimentos = [];
      if (!Array.isArray(state.medidas)) state.medidas = [];
    }
    invalidarIndice();
    guardar(true);
    return state.treinos.length;
  }

  function apagarTudo() {
    state = estadoInicial();
    invalidarIndice();
    localStorage.removeItem(KEY);
    guardar(true);
  }

  global.Store = {
    get state() { return state; },
    D, U, MUSCLES, GRUPOS, SPLITS, OBJETIVOS, CIRCUITOS, METRICAS,
    carregar, guardar, aoMudar,
    pesoCorporal, definirPeso, apagarPeso, historicoPeso, variacaoPeso,
    MEDIDAS, definirMedidas, apagarMedidas, historicoMedidas, variacaoMedida,
    objetivo, aplicarObjetivo, usaCircuitos,
    plano, planoActivo, activarPlano, prescricao, proximoDiaPlano, semanaDoPlano,
    incrementoDe, sugerirPlano, comecarPlano, estadoPlano, relatorioPlano, ultimaNoPlano,
    musculosActivos, ignorado, alvoDe, repsDe,
    metricaDe, chaveAlvo, comCarga, usaMaquina, definirMaquina, serieVazia, serieBase, serieUtil,
    todosExercicios, exercicio, criarExercicio, apagarExercicioCustom, alternarFavorito,
    renomearExercicio, nomeProprio,
    exerciciosDoGrupo, contagemPorGrupo, exerciciosUnilaterais, pegasDe,
    comDescanso, definirDescanso,
    comecarTreino, comecarCircuito, criarEntrada, terminarTreino, descartarTreino, apagarTreino,
    marcarActividade, fecharPorInactividade, estimarDuracao, treinosLongos, corrigirDuracoes, definirDuracao,
    um1RM, volumeTreino, seriesTreino, trabalhoCardio, seriesPorMusculo, estadoMusculos,
    ultimaPerformance, historicoExercicio, recordes, indiceRecordes, textoRecorde, melhorEtiqueta,
    sugerirProgressao, sugerirTreino, sugerirCircuito, circuitosSugeridos, proximoDiaSplit,
    diasTreinados, sequencia, volumeSemanal,
    refeicoes, ordemRefeicoes, alimento, alimentos, macrosDe, somarMacros, textoQuantidade,
    guardarAlimento, apagarAlimento, reporAlimento, usosAlimentos, procurarAlimentos,
    planoAlimentar, activarPlanoAlimentar, alvosNutricao, planoDoDia, registarRefeicaoDoPlano,
    registarComida, comida, actualizarComida, apagarComida, comidasDoDia, totaisComida,
    diaComida, diasComRegisto, semanaComida, relatorioComida,
    exportarComida, lerRegistoComida, importarComida,
    exportar, importar, apagarTudo
  };
})(window);
