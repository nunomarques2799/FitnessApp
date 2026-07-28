/* =============================================================
   Vista: Treino activo — registo de séries
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;
  let relogio = null;

  Vistas.treino = {
    titulo: () => Store.state.ativo ? Store.state.ativo.nome : 'Treino',
    sub: () => {
      const a = Store.state.ativo;
      if (!a) return '';
      const min = Math.floor((Date.now() - a.inicio) / 60000);
      const feitas = a.entradas.reduce((n, e) => n + e.series.filter(s => s.feita).length, 0);
      return `${min} min · ${feitas} séries`;
    },
    accoes: () => Store.state.ativo
      ? `<button type="button" class="btn-icone" data-opcoes aria-label="Opções do treino">${icone('opcoes', 22)}</button>
         <button type="button" class="btn btn--primario btn--pequeno" data-terminar>Terminar</button>`
      : '',

    montarCabecalho(cont) {
      const o = cont.querySelector('[data-opcoes]');
      if (o) o.addEventListener('click', sheetOpcoes);
      const t = cont.querySelector('[data-terminar]');
      if (t) t.addEventListener('click', terminar);
    },

    render() {
      const a = Store.state.ativo;
      if (!a) {
        return Comp.vazio({
          icone: 'haltere', titulo: 'Nenhum treino a decorrer',
          sub: 'Vai a Hoje para começar o treino sugerido ou um treino livre.'
        });
      }
      return `<div data-exercicios>${a.entradas.map(cartaoExercicio).join('') || estadoVazio()}</div>
        <button type="button" class="btn btn--secundario btn--bloco btn--grande mt4" data-add-ex>
          ${icone('mais', 20)}Adicionar exercício
        </button>
        <button type="button" class="btn btn--primario btn--bloco btn--grande mt3" data-terminar-b>
          ${icone('check', 20)}Terminar treino
        </button>
        <button type="button" class="btn btn--fantasma btn--bloco mt2" data-descartar-b>Descartar treino</button>`;
    },

    montar(raiz) {
      const a = Store.state.ativo;
      if (!a) {
        const b = raiz.querySelector('[data-vazio-accao]');
        if (b) b.addEventListener('click', () => App.ir('hoje'));
        return;
      }

      clearInterval(relogio);
      relogio = setInterval(() => {
        if (!Store.state.ativo || !location.hash.includes('treino')) { clearInterval(relogio); return; }
        const sub = document.getElementById('cab-sub');
        if (sub) sub.textContent = Vistas.treino.sub();
      }, 20000);

      raiz.querySelector('[data-add-ex]').addEventListener('click', adicionarExercicio);
      raiz.querySelector('[data-terminar-b]').addEventListener('click', terminar);
      raiz.querySelector('[data-descartar-b]').addEventListener('click', descartar);

      const lista = raiz.querySelector('[data-exercicios]');
      lista.addEventListener('click', e => {
        const ok = e.target.closest('[data-ok]');
        if (ok) return alternarSerie(+ok.dataset.i, +ok.dataset.s);
        const addS = e.target.closest('[data-add-serie]');
        if (addS) return adicionarSerie(+addS.dataset.i);
        const men = e.target.closest('[data-menu-ex]');
        if (men) return sheetExercicio(+men.dataset.i);
        const men2 = e.target.closest('[data-menu-serie]');
        if (men2) return sheetSerie(+men2.dataset.i, +men2.dataset.s);
        const vazioB = e.target.closest('[data-vazio-accao]');
        if (vazioB) return adicionarExercicio();
      });

      lista.addEventListener('focusin', e => {
        if (e.target.classList.contains('campo-num')) setTimeout(() => e.target.select(), 30);
      });

      lista.addEventListener('input', e => {
        const c = e.target.closest('[data-campo]');
        if (!c) return;
        const { i, s, campo } = c.dataset;
        const serie = Store.state.ativo.entradas[i].series[s];
        const v = UI.lerNumero(c.value);
        if (campo === 'kg') serie.kg = v === null ? null : Store.U.paraKg(v);
        else serie.reps = v === null ? null : Math.round(v);
        Store.guardar();
      });
    }
  };

  function estadoVazio() {
    return Comp.vazio({
      icone: 'mais', titulo: 'Treino vazio',
      sub: 'Adiciona o primeiro exercício para começares a registar séries.',
      accao: 'Adicionar exercício'
    });
  }

  /* ---------- render de um exercício ---------- */
  function cartaoExercicio(entrada, i) {
    const ex = Store.exercicio(entrada.exId);
    if (!ex) return '';
    const ult = Store.ultimaPerformance(entrada.exId, Store.state.ativo.id);
    const prog = Store.sugerirProgressao(entrada.exId);
    const rec = Store.recordes(entrada.exId);
    const musc = (ex.p || []).map(k => Store.MUSCLES[k].curto).join(' · ');

    const reps = Store.repsDe(ex);
    const alvoTxt = `alvo ${reps[0]}-${reps[1]}${ex.tempo ? 's' : ' reps'}`;
    const dica = ult
      ? `${Store.D.relativo(ult.data)}: ${ult.series.length}×${ult.series.map(s => s.reps).join('/')} @ ${Store.U.fmt(Math.max(...ult.series.map(s => s.kg || 0)))}`
      : 'Primeira vez — regista uma carga de referência';

    const linhas = entrada.series.map((s, si) => {
      const ants = ult && ult.series[si];
      const aquecimento = s.tipo === 'aquecimento';
      return `<div class="serie ${s.feita ? 'serie--feita' : ''}">
        <button type="button" class="serie__n" data-menu-serie data-i="${i}" data-s="${si}"
                aria-label="Opções da série ${si + 1}">
          ${aquecimento ? 'A' : si + 1}${s.tipo === 'falha' ? '<small>F</small>' : ''}
        </button>
        <input class="campo-num" data-campo="kg" data-i="${i}" data-s="${si}"
               type="text" inputmode="decimal" enterkeyhint="next"
               value="${s.kg != null ? UI.fmt(Store.U.mostrar(s.kg)) : ''}"
               placeholder="${ants && ants.kg != null ? UI.fmt(Store.U.mostrar(ants.kg)) : Store.U.label()}"
               aria-label="Peso da série ${si + 1} em ${Store.U.label()}">
        <input class="campo-num" data-campo="reps" data-i="${i}" data-s="${si}"
               type="text" inputmode="numeric" enterkeyhint="done"
               value="${s.reps != null ? s.reps : ''}"
               placeholder="${ants && ants.reps != null ? ants.reps : (ex.tempo ? 'seg' : 'reps')}"
               aria-label="${ex.tempo ? 'Segundos' : 'Repetições'} da série ${si + 1}">
        <button type="button" class="serie__ok" data-ok data-i="${i}" data-s="${si}"
                aria-pressed="${!!s.feita}" aria-label="${s.feita ? 'Anular' : 'Concluir'} série ${si + 1}">
          ${icone('check', 20)}
        </button>
      </div>`;
    }).join('');

    return `<article class="exercicio" data-ex-idx="${i}">
      <header class="exercicio__cab">
        <div class="crescer">
          <h2 class="exercicio__n">${esc(ex.n)}</h2>
          <p class="exercicio__meta">${esc(musc)} · ${esc(alvoTxt)}</p>
          <p class="exercicio__meta">${esc(dica)}</p>
        </div>
        <button type="button" class="btn-icone" data-menu-ex data-i="${i}" aria-label="Opções de ${esc(ex.n)}">${icone('opcoes', 20)}</button>
      </header>

      ${prog && prog.subir ? `<p class="chip chip--sucesso" style="margin:0 var(--e4) var(--e2)">${icone('seta', 13)}Sugestão: sobe para ${Store.U.fmt(prog.kg)}</p>` : ''}
      ${rec ? `<p class="chip" style="margin:0 var(--e4) var(--e2)">${icone('trofeu', 13)}Recorde ${esc(Store.textoRecorde(rec))}</p>` : ''}

      <div class="serie-cab" aria-hidden="true">
        <span>Set</span><span>${esc(Store.U.label())}</span><span>${ex.tempo ? 'Seg' : 'Reps'}</span><span></span>
      </div>
      ${linhas}
      <footer class="exercicio__rodape">
        <button type="button" class="btn btn--fantasma btn--pequeno" data-add-serie data-i="${i}">${icone('mais', 16)}Série</button>
        <span class="crescer"></span>
        <span class="chip num">${entrada.series.filter(s => s.feita && s.tipo !== 'aquecimento').length}/${entrada.series.filter(s => s.tipo !== 'aquecimento').length} feitas</span>
      </footer>
    </article>`;
  }

  function redesenhar() {
    const raiz = document.getElementById('conteudo');
    const lista = raiz.querySelector('[data-exercicios]');
    if (!lista) { App.render(); return; }
    const activo = document.activeElement;
    const ref = activo && activo.dataset && activo.dataset.campo
      ? { i: activo.dataset.i, s: activo.dataset.s, campo: activo.dataset.campo, pos: activo.selectionStart } : null;
    lista.innerHTML = Store.state.ativo.entradas.map(cartaoExercicio).join('') || estadoVazio();
    if (ref) {
      const el = lista.querySelector(`[data-campo="${ref.campo}"][data-i="${ref.i}"][data-s="${ref.s}"]`);
      if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(ref.pos, ref.pos); } catch (e) { /* ignorar */ } }
    }
    const sub = document.getElementById('cab-sub');
    if (sub) sub.textContent = Vistas.treino.sub();
  }

  /* ---------- acções sobre séries ---------- */
  function alternarSerie(i, si) {
    const entrada = Store.state.ativo.entradas[i];
    const s = entrada.series[si];
    const ex = Store.exercicio(entrada.exId);
    const ult = Store.ultimaPerformance(entrada.exId, Store.state.ativo.id);

    if (!s.feita) {
      // preenche a partir da sessão anterior se estiver vazio
      if (s.kg == null && ult && ult.series[si]) s.kg = ult.series[si].kg;
      if (s.reps == null) s.reps = (ult && ult.series[si] && ult.series[si].reps) || Store.repsDe(ex)[1];
      s.feita = true;
      UI.haptic('medio');

      // recorde pessoal?
      const antes = Store.recordes(entrada.exId);
      const novo1rm = Store.um1RM(s.kg, s.reps);
      if (s.tipo !== 'aquecimento' && s.kg && (!antes || novo1rm > antes.rmValor + 0.01)) {
        UI.toast(`Recorde em ${ex.n}!`, 'sucesso');
        UI.haptic('sucesso');
      }
      if (s.tipo !== 'aquecimento') {
        const seg = ex && ex.t === 'C' ? Store.state.settings.descanso : Store.state.settings.descansoIsolamento;
        App.iniciarDescanso(seg, ex ? ex.n : '');
      }
    } else {
      s.feita = false;
      UI.haptic('leve');
    }
    Store.guardar();
    redesenhar();
  }

  function adicionarSerie(i) {
    const entrada = Store.state.ativo.entradas[i];
    const ult = entrada.series[entrada.series.length - 1];
    entrada.series.push({ kg: ult ? ult.kg : null, reps: ult ? ult.reps : null, feita: false, tipo: 'normal' });
    Store.guardar();
    UI.haptic('leve');
    redesenhar();
  }

  function sheetSerie(i, si) {
    const entrada = Store.state.ativo.entradas[i];
    const s = entrada.series[si];
    const tipos = [['normal', 'Série normal'], ['aquecimento', 'Aquecimento (não conta para o volume)'], ['falha', 'Até à falha']];

    const sh = UI.sheet({
      titulo: `Série ${si + 1}`,
      html: `<div class="pilha">
        ${tipos.map(([v, l]) => `<button type="button" class="lista__i" style="border-radius:var(--r2);border:1px solid var(--borda)" data-tipo="${v}">
          <span class="lista__corpo"><span class="lista__t">${esc(l)}</span></span>
          ${s.tipo === v ? `<span class="lista__fim" style="color:var(--primaria-txt)">${icone('check', 20)}</span>` : ''}
        </button>`).join('')}
        <button type="button" class="btn btn--perigo-fantasma btn--bloco mt3" data-remover>${icone('lixo', 18)}Remover série</button>
      </div>`
    });

    sh.painel.querySelectorAll('[data-tipo]').forEach(b => b.addEventListener('click', () => {
      s.tipo = b.dataset.tipo;
      Store.guardar(); UI.fecharSheet(); UI.haptic('leve'); redesenhar();
    }));
    sh.painel.querySelector('[data-remover]').addEventListener('click', () => {
      entrada.series.splice(si, 1);
      if (!entrada.series.length) entrada.series.push({ kg: null, reps: null, feita: false, tipo: 'normal' });
      Store.guardar(); UI.fecharSheet(); UI.haptic('medio'); redesenhar();
    });
  }

  /* ---------- acções sobre exercícios ---------- */
  function sheetExercicio(i) {
    const entrada = Store.state.ativo.entradas[i];
    const ex = Store.exercicio(entrada.exId);
    const total = Store.state.ativo.entradas.length;

    const sh = UI.sheet({
      titulo: ex ? ex.n : 'Exercício',
      html: `<div class="campo">
          <label class="campo__l" for="ex-notas">Notas desta sessão</label>
          <textarea class="area" id="ex-notas" placeholder="Ex.: senti o ombro na 3.ª série" aria-describedby="ex-notas-a">${esc(entrada.notas || '')}</textarea>
          <p class="campo__ajuda" id="ex-notas-a">Fica guardado no histórico deste treino.</p>
        </div>
        <div class="pilha">
          <button type="button" class="btn btn--secundario btn--bloco" data-hist>${icone('grafico', 18)}Ver histórico e recordes</button>
          <button type="button" class="btn btn--secundario btn--bloco" data-trocar>${icone('duplicar', 18)}Trocar por outro exercício</button>
          <div class="linha" style="gap:var(--e2)">
            <button type="button" class="btn btn--secundario crescer" data-sobe ${i === 0 ? 'disabled' : ''}>${icone('cima', 18)}Subir</button>
            <button type="button" class="btn btn--secundario crescer" data-desce ${i === total - 1 ? 'disabled' : ''}>${icone('baixo', 18)}Descer</button>
          </div>
          <button type="button" class="btn btn--perigo-fantasma btn--bloco" data-remover>${icone('lixo', 18)}Remover do treino</button>
        </div>`
    });

    const area = sh.painel.querySelector('#ex-notas');
    area.addEventListener('input', () => { entrada.notas = area.value; Store.guardar(); });

    sh.painel.querySelector('[data-hist]').addEventListener('click', () => { UI.fecharSheet(); App.ir('exercicio/' + entrada.exId); });
    sh.painel.querySelector('[data-trocar]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => Comp.escolherExercicio(id => {
        Store.state.ativo.entradas[i] = Store.criarEntrada(id);
        Store.guardar(true); redesenhar();
      }, { titulo: 'Trocar exercício' }), 240);
    });
    sh.painel.querySelector('[data-sobe]').addEventListener('click', () => mover(i, -1, sh));
    sh.painel.querySelector('[data-desce]').addEventListener('click', () => mover(i, 1, sh));
    sh.painel.querySelector('[data-remover]').addEventListener('click', async () => {
      UI.fecharSheet();
      const feitas = entrada.series.filter(s => s.feita).length;
      if (feitas && !(await UI.confirmar({
        titulo: 'Remover exercício?',
        msg: `Tens ${feitas} série${feitas > 1 ? 's' : ''} registada${feitas > 1 ? 's' : ''} neste exercício. Vais perdê-la${feitas > 1 ? 's' : ''}.`,
        ok: 'Remover', perigo: true
      }))) return;
      Store.state.ativo.entradas.splice(i, 1);
      Store.guardar(true); UI.haptic('medio'); redesenhar();
    });
  }

  function mover(i, delta, sh) {
    const arr = Store.state.ativo.entradas;
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    Store.guardar(); UI.fecharSheet(); UI.haptic('leve'); redesenhar();
  }

  function adicionarExercicio() {
    Comp.escolherExercicio(id => {
      Store.state.ativo.entradas.push(Store.criarEntrada(id));
      Store.guardar(true);
      redesenhar();
      UI.haptic('sucesso');
    }, { manterAberto: false });
  }

  /* ---------- opções e fim ---------- */
  function sheetOpcoes() {
    const a = Store.state.ativo;
    if (!a) return;
    const sh = UI.sheet({
      titulo: 'Opções do treino',
      html: `<div class="campo">
          <label class="campo__l" for="t-nome">Nome</label>
          <input class="entrada" id="t-nome" value="${esc(a.nome)}" autocomplete="off">
        </div>
        <div class="campo">
          <label class="campo__l" for="t-notas">Notas</label>
          <textarea class="area" id="t-notas" placeholder="Como correu o treino?">${esc(a.notas || '')}</textarea>
        </div>
        <button type="button" class="btn btn--perigo-fantasma btn--bloco" data-descartar>${icone('lixo', 18)}Descartar treino</button>`
    });
    const nome = sh.painel.querySelector('#t-nome');
    const notas = sh.painel.querySelector('#t-notas');
    nome.addEventListener('input', () => {
      a.nome = nome.value;
      Store.guardar();
      document.getElementById('cab-titulo').textContent = a.nome;
    });
    notas.addEventListener('input', () => { a.notas = notas.value; Store.guardar(); });
    sh.painel.querySelector('[data-descartar]').addEventListener('click', () => { UI.fecharSheet(); descartar(); });
  }

  async function descartar() {
    if (await UI.confirmar({
      titulo: 'Descartar treino?',
      msg: 'Todas as séries registadas neste treino serão perdidas. Esta acção não pode ser anulada.',
      ok: 'Descartar', perigo: true
    })) {
      Store.descartarTreino();
      UI.toast('Treino descartado');
      App.ir('hoje');
    }
  }

  async function terminar() {
    const a = Store.state.ativo;
    if (!a) return;
    const feitas = a.entradas.reduce((n, e) => n + e.series.filter(s => s.feita).length, 0);
    if (!feitas) {
      UI.toast('Marca pelo menos uma série como feita', 'erro');
      UI.haptic('erro');
      return;
    }
    const porFazer = a.entradas.reduce((n, e) => n + e.series.filter(s => !s.feita).length, 0);
    const msg = porFazer
      ? `Vais guardar ${feitas} séries. As ${porFazer} séries não marcadas serão descartadas.`
      : `Vais guardar ${feitas} séries.`;
    if (!(await UI.confirmar({ titulo: 'Terminar treino?', msg, ok: 'Terminar' }))) return;

    const t = Store.terminarTreino();
    UI.haptic('sucesso');
    if (t) {
      App.ir('sessao/' + t.id, true);
      setTimeout(() => UI.toast('Treino guardado', 'sucesso'), 300);
    } else {
      App.ir('hoje', true);
    }
  }
})();
