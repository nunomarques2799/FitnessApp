/* =============================================================
   Treinos — Camada de dados (100% local) + motor de análise
   Guarda tudo em localStorage. Nada sai do telemóvel.
   ============================================================= */
(function (global) {
  'use strict';

  const KEY = 'treinos.db.v1';
  const LB = 0.45359237;
  const { MUSCLES, EXERCISES, SPLITS } = global.CATALOGO;

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
      version: 1,
      criadoEm: new Date().toISOString(),
      settings: {
        tema: 'auto',
        unidade: 'kg',
        descanso: 90,           // segundos, exercícios compostos
        descansoIsolamento: 60,
        split: 'ppl',
        exerciciosPorTreino: 7,   // 7×3 = 21 séries por sessão
        seriesPorExercicio: 3,
        repsAlvo: [10, 12],     // esquema de hipertrofia
        volume: 1,              // multiplicador dos alvos semanais (0.7 / 1 / 1.3)
        musculosIgnorados: ['gluteos'],
        avisoSonoro: true,
        vibrar: true,
        equipamento: null       // null = tudo disponível
      },
      perfil: { peso: null },
      exerciciosCustom: [],
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
        state = Object.assign(base, dados);
        state.settings = Object.assign(base.settings, dados.settings || {});
      }
    } catch (e) {
      console.error('Falha a ler dados locais', e);
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

  /**
   * Intervalo de repetições a usar num exercício.
   * Respeita o esquema preferido, mas mantém o do exercício quando este
   * pede reps mais altas (gémeos, abdominais) ou é medido em segundos.
   */
  function repsDe(ex) {
    const alvo = state.settings.repsAlvo;
    if (!ex) return alvo || [10, 12];
    if (ex.tempo || !alvo) return ex.r;
    if (ex.r[0] >= alvo[1]) return ex.r;   // gémeos, abdominais, elevações laterais…
    return alvo;
  }

  /* ---------- exercícios ---------- */
  function todosExercicios() {
    return EXERCISES.concat(state.exerciciosCustom);
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
  function invalidarIndice() { for (const k in _idx) delete _idx[k]; }

  function criarExercicio(dados) {
    const base = dados.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let id = 'meu-' + base, i = 2;
    while (exercicio(id)) { id = 'meu-' + base + '-' + i++; }
    const ex = {
      id, n: dados.n, p: dados.p || [], s: dados.s || [],
      e: dados.e || 'halteres', t: dados.t || 'I',
      r: dados.r || [8, 12], inc: dados.inc || 2.5, custom: true
    };
    state.exerciciosCustom.push(ex);
    invalidarIndice();
    guardar(true);
    return ex;
  }

  function apagarExercicioCustom(id) {
    state.exerciciosCustom = state.exerciciosCustom.filter(e => e.id !== id);
    state.favoritos = state.favoritos.filter(f => f !== id);
    invalidarIndice();
    guardar(true);
  }

  function alternarFavorito(id) {
    const i = state.favoritos.indexOf(id);
    if (i >= 0) state.favoritos.splice(i, 1); else state.favoritos.push(id);
    guardar(true);
    return i < 0;
  }

  /* ---------- treino ativo ---------- */
  function comecarTreino(nome, exercicioIds) {
    state.ativo = {
      id: 'w' + Date.now(),
      data: D.hoje(),
      inicio: Date.now(),
      nome: nome || 'Treino livre',
      notas: '',
      entradas: (exercicioIds || []).map(criarEntrada)
    };
    guardar(true);
    return state.ativo;
  }

  function criarEntrada(exId) {
    const ex = exercicio(exId);
    const ult = ultimaPerformance(exId);
    const nSeries = Math.max(1, state.settings.seriesPorExercicio || 3);
    const reps = repsDe(ex);
    let series = [];
    if (ult) {
      series = ult.series.filter(s => s.tipo !== 'aquecimento').map(s => ({ kg: s.kg, reps: s.reps, feita: false, tipo: 'normal' }));
      const sug = sugerirProgressao(exId);
      if (sug && sug.subir) series.forEach(s => { s.kg = sug.kg; s.reps = reps[0]; });
    }
    if (!series.length) series = Array.from({ length: nSeries }, () => ({ kg: null, reps: reps[1], feita: false, tipo: 'normal' }));
    return { exId, series, notas: '' };
  }

  function terminarTreino() {
    const a = state.ativo;
    if (!a) return null;
    a.entradas = a.entradas
      .map(e => ({ ...e, series: e.series.filter(s => s.feita) }))
      .filter(e => e.series.length);
    if (!a.entradas.length) { state.ativo = null; state.timer = null; guardar(true); return null; }
    a.fim = Date.now();
    a.duracao = Math.round((a.fim - a.inicio) / 1000);
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

  /* ---------- métricas ---------- */
  function um1RM(kg, reps) {
    if (!kg || !reps) return 0;
    if (reps === 1) return kg;
    return kg * (1 + reps / 30);          // Epley
  }

  function volumeTreino(t) {
    let v = 0;
    t.entradas.forEach(e => e.series.forEach(s => {
      if (s.feita !== false && s.tipo !== 'aquecimento') v += (s.kg || 0) * (s.reps || 0);
    }));
    return v;
  }

  function seriesTreino(t) {
    return t.entradas.reduce((n, e) => n + e.series.filter(s => s.feita !== false && s.tipo !== 'aquecimento').length, 0);
  }

  /** Séries por músculo num intervalo. Primário = 1, secundário = 0,5 */
  function seriesPorMusculo(dias) {
    const limite = dias ? D.maisDias(D.hoje(), -dias + 1) : '0000-00-00';
    const acc = {};
    Object.keys(MUSCLES).forEach(m => { acc[m] = 0; });
    state.treinos.forEach(t => {
      if (t.data < limite) return;
      t.entradas.forEach(e => {
        const ex = exercicio(e.exId);
        if (!ex) return;
        const n = e.series.filter(s => s.feita !== false && s.tipo !== 'aquecimento').length;
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
        if (!ex) return;
        (ex.p || []).forEach(m => { if (!ult[m] || t.data > ult[m]) ult[m] = t.data; });
      });
    });
    return ult;
  }

  /**
   * Estado de recuperação/cobertura por músculo.
   * estado: nunca | recuperar | pronto | atraso
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
        key: k, nome: m.name, curto: m.curto, zona: m.zona,
        alvo, sets, dias, ultima: ult[k] || null, estado,
        ignorado: ignorado(k),
        pct: Math.min(1, sets / (alvo || 1))
      };
    });
  }

  /** Última sessão registada de um exercício */
  function ultimaPerformance(exId, excluirId) {
    for (const t of state.treinos) {
      if (excluirId && t.id === excluirId) continue;
      const e = t.entradas.find(x => x.exId === exId);
      if (e && e.series.length) return { data: t.data, series: e.series, treinoId: t.id };
    }
    return null;
  }

  /** Histórico completo de um exercício (mais recente primeiro) */
  function historicoExercicio(exId) {
    const out = [];
    state.treinos.forEach(t => {
      const e = t.entradas.find(x => x.exId === exId);
      if (!e) return;
      const uteis = e.series.filter(s => s.feita !== false && s.tipo !== 'aquecimento');
      if (!uteis.length) return;
      let melhor = null, vol = 0;
      uteis.forEach(s => {
        vol += (s.kg || 0) * (s.reps || 0);
        const rm = um1RM(s.kg, s.reps);
        if (!melhor || rm > melhor.rm) melhor = { rm, kg: s.kg, reps: s.reps };
      });
      out.push({ data: t.data, treinoId: t.id, series: uteis, volume: vol, melhor });
    });
    return out;
  }

  /** Índice peso-máximo por exercício, numa só passagem (cache até gravar) */
  let _idxRec = null;
  function indiceRecordes() {
    if (_idxRec) return _idxRec;
    _idxRec = {};
    state.treinos.forEach(t => t.entradas.forEach(e => {
      e.series.forEach(s => {
        if (s.feita === false || s.tipo === 'aquecimento' || !s.kg) return;
        const r = _idxRec[e.exId] || (_idxRec[e.exId] = { kg: 0, reps: 0, data: null });
        if (s.kg > r.kg) { r.kg = s.kg; r.reps = s.reps; r.data = t.data; }
      });
    }));
    return _idxRec;
  }

  /**
   * Recordes pessoais de um exercício.
   * `peso` está sempre preenchido quando há histórico — em exercícios de peso
   * corporal sem carga adicional fica a 0 kg e o recorde relevante é `reps`.
   */
  function recordes(exId) {
    const h = historicoExercicio(exId);
    if (!h.length) return null;
    let peso = null, reps = null, rm = 0, rmInfo = null, vol = 0;
    h.forEach(s => {
      s.series.forEach(x => {
        const kg = x.kg || 0, r = x.reps || 0;
        if (!peso || kg > peso.kg) peso = { kg, reps: r, data: s.data };
        if (!reps || r > reps.reps) reps = { kg, reps: r, data: s.data };
        const e = um1RM(kg, r);
        if (e > rm) { rm = e; rmInfo = { kg, reps: r, data: s.data }; }
      });
      if (s.volume > vol) vol = s.volume;
    });
    if (!peso) return null;
    return { peso, reps, rm: rmInfo, rmValor: rm, volume: vol, sessoes: h.length, semCarga: peso.kg === 0 };
  }

  /** Texto curto do melhor registo, adequado a carga ou a peso corporal */
  function textoRecorde(rec) {
    if (!rec) return '';
    return rec.semCarga
      ? `${rec.reps.reps} reps`
      : `${U.fmt(rec.peso.kg)} × ${rec.peso.reps}`;
  }

  /** Progressão sugerida: sobe carga se completou todas as séries no topo do intervalo */
  function sugerirProgressao(exId) {
    const ex = exercicio(exId);
    const ult = ultimaPerformance(exId);
    if (!ex || !ult) return null;
    const uteis = ult.series.filter(s => s.feita !== false && s.tipo !== 'aquecimento');
    if (!uteis.length) return null;
    const reps = repsDe(ex);
    const kgBase = Math.max(...uteis.map(s => s.kg || 0));
    const todasNoTopo = uteis.every(s => (s.reps || 0) >= reps[1] && (s.kg || 0) >= kgBase);
    return {
      subir: todasNoTopo,
      kg: todasNoTopo ? kgBase + (ex.inc || 2.5) : kgBase,
      anterior: kgBase,
      reps: todasNoTopo ? reps[0] : Math.max(...uteis.map(s => s.reps || 0))
    };
  }

  /* ---------- motor de sugestão ---------- */

  /** Escolhe o próximo dia do split com base no histórico */
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

    function pontuar(ex) {
      let p = 0;
      if ((ex.p || [])[0] === musculo) p += 100;        // é o alvo principal do exercício
      if (ex.pr === 1) p += 130; else if (ex.pr === 2) p += 65;
      if (state.favoritos.includes(ex.id)) p += 90;
      if (hist[ex.id] != null) p += 70 - Math.min(60, hist[ex.id] * 4);  // já sabe a carga
      if (ex.t === 'C') p += 25;
      p += PESO_EQUIP[ex.e] || 0;
      if ((ex.p || []).length >= 3) p -= 40;            // demasiado global (ex.: burpees)
      if (ex.custom) p += 25;
      return p;
    }

    cands.sort((a, b) => pontuar(b) - pontuar(a) || a.n.localeCompare(b.n, 'pt'));
    return cands[0];
  }

  /**
   * Sugestão de treino para hoje.
   * Combina o split escolhido com os músculos em défice na última semana.
   */
  function sugerirTreino() {
    const { split, splitKey, indice, dia } = proximoDiaSplit();
    const estados = {};
    estadoMusculos().forEach(m => { estados[m.key] = m; });

    // a ordem do split define a estrutura da sessão (compostos grandes primeiro);
    // o défice só decide quem leva exercício extra
    const foco = dia.foco.filter(k => !ignorado(k));
    // défice absoluto (não relativo): assim os exercícios extra vão para os
    // grupos grandes — dorsais, peito, quadríceps — e não para o trapézio
    const porDefice = foco.slice().sort((a, b) =>
      (estados[b].alvo - estados[b].sets) - (estados[a].alvo - estados[a].sets));

    // músculo claramente em falta fora do dia — junta-se no fim se houver espaço
    // (só depois de haver histórico suficiente para a comparação fazer sentido)
    const extras = (state.treinos.length < 4 ? [] : musculosActivos().filter(k => {
      if (dia.foco.includes(k)) return false;
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
    } else {
      state = Object.assign(estadoInicial(), dados);
      state.settings = Object.assign(estadoInicial().settings, dados.settings || {});
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
    D, U, MUSCLES, SPLITS,
    carregar, guardar, aoMudar,
    musculosActivos, ignorado, alvoDe, repsDe,
    todosExercicios, exercicio, criarExercicio, apagarExercicioCustom, alternarFavorito,
    comecarTreino, criarEntrada, terminarTreino, descartarTreino, apagarTreino,
    um1RM, volumeTreino, seriesTreino, seriesPorMusculo, estadoMusculos,
    ultimaPerformance, historicoExercicio, recordes, indiceRecordes, textoRecorde, sugerirProgressao,
    sugerirTreino, proximoDiaSplit, diasTreinados, sequencia, volumeSemanal,
    exportar, importar, apagarTudo
  };
})(window);
