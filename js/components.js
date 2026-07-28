/* =============================================================
   Treinos — Componentes reutilizáveis (devolvem HTML)
   ============================================================= */
(function (global) {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  const ESTADOS = {
    pronto:    { label: 'Pronto',         chip: 'chip--sucesso', desc: 'Recuperado e dentro do volume' },
    recuperar: { label: 'A recuperar',    chip: 'chip',          desc: 'Treinado há pouco tempo' },
    atraso:    { label: 'Em atraso',      chip: 'chip--aviso',   desc: 'Sem estímulo suficiente' },
    indirecto: { label: 'Só indirecto',   chip: 'chip--aviso',   desc: 'Só trabalhado como músculo secundário' },
    nunca:     { label: 'Nunca treinado', chip: 'chip--perigo',  desc: 'Ainda sem registos' }
  };

  /** Linha de músculo com barra de volume semanal */
  function musculo(m, opts) {
    opts = opts || {};
    const e = ESTADOS[m.estado];
    const dias = m.estado === 'indirecto' ? 'só indirecto'
      : m.dias === null ? 'sem registo'
      : m.dias === 0 ? 'hoje'
      : m.dias === 1 ? 'ontem'
      : `há ${m.dias} d`;
    const ultima = m.dias === null
      ? (m.estado === 'indirecto' ? 'nunca como músculo principal' : 'sem registo')
      : `último estímulo directo ${dias}`;
    return `<button type="button" class="musculo est-${m.estado}" data-musculo="${m.key}"
      aria-label="${esc(m.nome)}: ${e.label}, ${UI.fmt(m.sets)} de ${m.alvo} séries ${opts.periodo || 'esta semana'}, ${ultima}">
      <span class="musculo__n"><i class="musculo__pt" aria-hidden="true"></i>${esc(opts.curto ? m.curto : m.nome)}</span>
      <span class="musculo__meta num">${UI.fmt(m.sets)}/${m.alvo} · ${dias}</span>
      <span class="musculo__barra"><span class="musculo__fill" style="width:${Math.round(m.pct * 100)}%"></span></span>
    </button>`;
  }

  function legendaMusculos() {
    return `<p class="legenda" role="note">
      <span><i style="background:var(--sucesso)"></i>Pronto</span>
      <span><i style="background:var(--info)"></i>A recuperar</span>
      <span><i style="background:var(--aviso)"></i>Em atraso / só indirecto</span>
      <span><i style="background:var(--borda-forte)"></i>Sem registo</span>
    </p>`;
  }

  /** Item de exercício para listas */
  function exercicioItem(ex, opts) {
    opts = opts || {};
    const fav = Store.state.favoritos.includes(ex.id);
    const musc = (ex.p || []).map(k => Store.MUSCLES[k] && Store.MUSCLES[k].curto).filter(Boolean).join(' · ');
    const rec = Store.indiceRecordes()[ex.id];
    return `<button type="button" class="lista__i" data-ex="${ex.id}">
      <div class="lista__corpo">
        <div class="lista__t">${esc(ex.n)}${fav ? ' ' + icone('estrela', 13, 'em-linha') : ''}</div>
        <div class="lista__s">
          <span>${esc(musc)}</span>
          <span class="chip">${esc(CATALOGO.EQUIPAMENTO[ex.e] || ex.e)}</span>
          ${rec ? `<span class="chip chip--primaria num">${Store.U.fmt(rec.kg)}</span>` : ''}
        </div>
      </div>
      <span class="lista__fim">${opts.accao === 'add' ? icone('mais', 22, 'cor-primaria') : icone('direita', 20)}</span>
    </button>`;
  }

  /** Item de treino no histórico */
  function treinoItem(t) {
    const vol = Store.volumeTreino(t);
    const nSeries = Store.seriesTreino(t);
    return `<button type="button" class="lista__i" data-treino="${t.id}">
      <div class="lista__corpo">
        <div class="lista__t">${esc(t.nome)}</div>
        <div class="lista__s">
          <span>${esc(Store.D.relativo(t.data))} · ${esc(Store.D.curto(t.data))}</span>
          <span class="chip num">${t.entradas.length} ex</span>
          <span class="chip num">${nSeries} séries</span>
          ${vol ? `<span class="chip num">${UI.fmt(Store.U.mostrar(vol), 0)} ${Store.U.label()}</span>` : ''}
        </div>
      </div>
      <span class="lista__fim">${icone('direita', 20)}</span>
    </button>`;
  }

  function vazio(o) {
    return `<div class="vazio">
      <div class="vazio__ic">${icone(o.icone || 'haltere', 30)}</div>
      <div>
        <p class="vazio__t">${esc(o.titulo)}</p>
        ${o.sub ? `<p class="vazio__s mt2">${esc(o.sub)}</p>` : ''}
      </div>
      ${o.accao ? `<button type="button" class="btn btn--primario" data-vazio-accao>${icone('mais', 20)}${esc(o.accao)}</button>` : ''}
    </div>`;
  }

  function stat(valor, label, unidade) {
    // role="img" + aria-label faz o leitor de ecrã ler "3 dias treinados" numa só frase
    return `<div class="stat" role="img" aria-label="${esc(valor)} ${esc(unidade || '')} ${esc(label)}">
      <div class="stat__v num" aria-hidden="true">${esc(valor)}${unidade ? `<span class="stat__u"> ${esc(unidade)}</span>` : ''}</div>
      <div class="stat__l" aria-hidden="true">${esc(label)}</div>
    </div>`;
  }

  /** Abre o selector de exercícios (sheet com procura e filtros) */
  function escolherExercicio(aoEscolher, opts) {
    opts = opts || {};
    const musculos = Object.keys(Store.MUSCLES);
    let filtro = opts.musculo || null, procura = '';

    const s = UI.sheet({
      titulo: opts.titulo || 'Escolher exercício',
      alto: true,
      html: `<div class="procura-wrap mb3">
          ${icone('procurar', 20)}
          <input class="entrada" type="search" inputmode="search" placeholder="Procurar exercício…"
                 aria-label="Procurar exercício" data-procura data-auto-focus>
        </div>
        <div class="filtros" role="group" aria-label="Filtrar por músculo">
          <button type="button" class="filtro" data-f="" aria-pressed="${!filtro}">Todos</button>
          <button type="button" class="filtro" data-f="fav" aria-pressed="false">Favoritos</button>
          ${musculos.map(k => `<button type="button" class="filtro" data-f="${k}" aria-pressed="${filtro === k}">${esc(Store.MUSCLES[k].curto)}</button>`).join('')}
        </div>
        <div data-resultados></div>`,
      rodape: `<button type="button" class="btn btn--secundario" data-novo>${icone('mais', 20)}Criar exercício</button>`
    });

    const res = s.painel.querySelector('[data-resultados]');
    const input = s.painel.querySelector('[data-procura]');

    function normalizar(t) {
      return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    function desenhar() {
      let lista = Store.todosExercicios();
      if (filtro === 'fav') lista = lista.filter(e => Store.state.favoritos.includes(e.id));
      else if (filtro) lista = lista.filter(e => (e.p || []).includes(filtro) || (e.s || []).includes(filtro));
      if (procura) {
        const q = normalizar(procura);
        lista = lista.filter(e => normalizar(e.n).includes(q));
      }
      if (!lista.length) {
        res.innerHTML = vazio({ icone: 'procurar', titulo: 'Nenhum exercício encontrado', sub: 'Tenta outro termo ou cria um exercício personalizado.' });
        return;
      }
      const fav = lista.filter(e => Store.state.favoritos.includes(e.id));
      const resto = lista.filter(e => !Store.state.favoritos.includes(e.id));
      res.innerHTML = `<p class="seccao__tit mb3">${lista.length} exercício${lista.length > 1 ? 's' : ''}</p>
        <div class="lista">${fav.concat(resto).slice(0, 120).map(e => exercicioItem(e, { accao: 'add' })).join('')}</div>`;
    }

    input.addEventListener('input', () => {
      clearTimeout(input._t);
      input._t = setTimeout(() => { procura = input.value; desenhar(); }, 140);
    });

    s.painel.querySelectorAll('.filtro').forEach(b => b.addEventListener('click', () => {
      filtro = b.dataset.f || null;
      s.painel.querySelectorAll('.filtro').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      UI.haptic('leve');
      desenhar();
    }));

    res.addEventListener('click', e => {
      const b = e.target.closest('[data-ex]');
      if (!b) return;
      UI.haptic('medio');
      aoEscolher(b.dataset.ex);
      if (!opts.manterAberto) UI.fecharSheet();
      else UI.toast('Adicionado', 'sucesso');
    });

    s.painel.querySelector('[data-novo]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => criarExercicio(id => aoEscolher(id)), 240);
    });

    desenhar();
    return s;
  }

  /** Formulário de criação de exercício personalizado */
  function criarExercicio(aoCriar) {
    const musculos = Object.keys(Store.MUSCLES);
    const s = UI.sheet({
      titulo: 'Novo exercício',
      alto: true,
      html: `<form data-form novalidate>
        <div class="campo">
          <label class="campo__l" for="ne-nome">Nome<span class="req" aria-hidden="true">*</span></label>
          <input class="entrada" id="ne-nome" name="nome" required autocomplete="off" data-auto-focus
                 aria-describedby="ne-nome-ajuda">
          <p class="campo__ajuda" id="ne-nome-ajuda">Ex.: Supino inclinado na Smith</p>
          <p class="campo__erro" hidden data-erro="nome" role="alert"></p>
        </div>
        <div class="campo">
          <span class="campo__l" id="ne-prim">Músculos principais<span class="req" aria-hidden="true">*</span></span>
          <div class="filtros" style="flex-wrap:wrap;overflow:visible;padding:0;margin:0" role="group" aria-labelledby="ne-prim">
            ${musculos.map(k => `<button type="button" class="filtro" data-p="${k}" aria-pressed="false">${esc(Store.MUSCLES[k].curto)}</button>`).join('')}
          </div>
          <p class="campo__erro" hidden data-erro="p" role="alert"></p>
        </div>
        <div class="campo">
          <label class="campo__l" for="ne-equip">Equipamento</label>
          <select class="select" id="ne-equip" name="equip">
            ${Object.keys(CATALOGO.EQUIPAMENTO).map(k => `<option value="${k}">${esc(CATALOGO.EQUIPAMENTO[k])}</option>`).join('')}
          </select>
        </div>
        <div class="campo">
          <span class="campo__l">Tipo</span>
          <div class="segmento" role="group" aria-label="Tipo de exercício">
            <button type="button" class="segmento__b" data-t="C" aria-pressed="true">Composto</button>
            <button type="button" class="segmento__b" data-t="I" aria-pressed="false">Isolamento</button>
          </div>
          <p class="campo__ajuda">Compostos usam várias articulações (agachamento, supino). Isolamento trabalha um só músculo.</p>
        </div>
        <div class="linha" style="gap:var(--e3)">
          <div class="campo crescer">
            <label class="campo__l" for="ne-rmin">Reps mín.</label>
            <input class="entrada" id="ne-rmin" name="rmin" type="text" inputmode="numeric" value="${Store.state.settings.repsAlvo[0]}">
          </div>
          <div class="campo crescer">
            <label class="campo__l" for="ne-rmax">Reps máx.</label>
            <input class="entrada" id="ne-rmax" name="rmax" type="text" inputmode="numeric" value="${Store.state.settings.repsAlvo[1]}">
          </div>
        </div>
      </form>`,
      rodape: `<button type="button" class="btn btn--fantasma" data-cancelar>Cancelar</button>
               <button type="button" class="btn btn--primario" data-guardar>Guardar</button>`
    });

    const form = s.painel.querySelector('[data-form]');
    const primarios = new Set();
    let tipo = 'C';

    form.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.p;
      if (primarios.has(k)) primarios.delete(k); else primarios.add(k);
      b.setAttribute('aria-pressed', String(primarios.has(k)));
      UI.haptic('leve');
    }));
    form.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
      tipo = b.dataset.t;
      form.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));

    function erro(campo, msg) {
      const p = form.querySelector(`[data-erro="${campo}"]`);
      p.hidden = !msg;
      p.innerHTML = msg ? icone('aviso', 15) + esc(msg) : '';
    }

    s.painel.querySelector('[data-cancelar]').addEventListener('click', () => UI.fecharSheet());
    s.painel.querySelector('[data-guardar]').addEventListener('click', () => {
      const nome = form.nome.value.trim();
      erro('nome', ''); erro('p', '');
      if (!nome) { erro('nome', 'Dá um nome ao exercício.'); form.nome.focus(); return; }
      if (!primarios.size) { erro('p', 'Escolhe pelo menos um músculo principal.'); return; }
      const rmin = UI.lerNumero(form.rmin.value) || Store.state.settings.repsAlvo[0];
      const rmax = Math.max(rmin, UI.lerNumero(form.rmax.value) || rmin + 2);
      const ex = Store.criarExercicio({
        n: nome, p: [...primarios], s: [], e: form.equip.value, t: tipo,
        r: [rmin, rmax], inc: tipo === 'C' ? 2.5 : 2
      });
      UI.fecharSheet();
      UI.haptic('sucesso');
      UI.toast('Exercício criado', 'sucesso');
      if (aoCriar) aoCriar(ex.id);
    });
  }

  global.Comp = { ESTADOS, musculo, legendaMusculos, exercicioItem, treinoItem, vazio, stat, escolherExercicio, criarExercicio };
})(window);
