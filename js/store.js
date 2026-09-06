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
        equipamento: null       // null = tudo disponível
      },
      perfil: { peso: null, pesoEm: null, pesos: [] },
      planoDesde: null,         // dia em que o plano começou, para contar as semanas
      exerciciosCustom: [],
      nomes: {},                // exId → nome escolhido por ti
      favoritos: [],
      treinos: [],              // histórico (mais recente primeiro)
      ativo: null,              // treino em curso
      timer: null               // { fim: epochMs, total: seg }
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
        state.perfil = normalizarPerfil(dados.perfil);
        if (!state.nomes) state.nomes = {};
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
      return { data: t.data, series: e.series, treinoId: t.id, maq: e.maq || null };
    }
    return null;
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
    // na estreia dentro do plano ninguém copia as repetições antigas: elas
    // vinham de séries em rampa e não dizem respeito a esta carga
    const ult = x.estreia ? null : ultimaNoPlano(ex.id);
    const antes = ult ? ult.series.filter(s => s.tipo !== 'aquecimento') : [];
    const reps = x.reps || repsDe(ex);
    const chave = chaveAlvo(ex);
    const series = Array.from({ length: n }, (_, i) => {
      const s = serieVazia(ex);
      if (comCarga(ex) && !x.max && x.kg != null) s.kg = x.kg;
      const ant = antes[i] || antes[antes.length - 1];
      s[chave] = (x.subir || !ant || ant[chave] == null) ? (x.subir ? reps[0] : reps[1]) : ant[chave];
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
   * Devolve a carga que ficou, ou null se não havia histórico dessa máquina.
   */
  function definirMaquina(i, maq) {
    const a = state.ativo;
    if (!a || !a.entradas[i]) return null;
    const entrada = a.entradas[i];
    entrada.maq = maq || null;
    let kg = null;
    const ex = exercicio(entrada.exId);
    if (maq && ex && comCarga(ex)) {
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
      // a progressão só entra depois de o exercício ter sido feito dentro do plano,
      // e compara com a última vez na mesma máquina
      const noPlano = ultimaNoPlano(p.ex);
      const prog = noPlano ? sugerirProgressao(p.ex, noPlano.maq || undefined) : null;
      exercicios.push({
        ex, musculo: (ex.p || [])[0], prescricao: p,
        series: p.series, reps: p.reps,
        kg: prog ? prog.kg : (p.kg != null ? p.kg : null),
        subir: prog ? prog.subir : false,
        anterior: prog ? prog.anterior : null,
        estreia: !prog,
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
      const chao = p && p.kg != null ? p.kg : null;
      return {
        id, ex, prescricao: p, inc, chao,
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

    L.push('## Cargas · chão do plano, onde estás e degraus ganhos');
    est.exercicios.forEach(x => {
      if (x.chao == null) { L.push(`- ${x.nome}: peso do corpo · ${x.sessoes} ${x.sessoes === 1 ? 'sessão' : 'sessões'}`); return; }
      L.push(`- ${x.nome}: ${U.fmt(x.chao)} → ${x.actual ? U.fmt(x.actual) : 'sem registo'}`
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
    } else {
      state = Object.assign(estadoInicial(), dados);
      state.settings = Object.assign(estadoInicial().settings, dados.settings || {});
      state.perfil = normalizarPerfil(dados.perfil);
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
    exportar, importar, apagarTudo
  };
})(window);
