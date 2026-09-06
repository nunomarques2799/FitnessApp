/* =============================================================
   Vista: Treino activo — registo de séries e de circuitos
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;
  let relogio = null;
  let ronda = 0, rondaDe = null;   // ronda visível do circuito, e o treino a que pertence

  /* Rótulo curto de um campo de registo */
  function rotulo(campo) {
    if (campo.peso) return Store.U.label();
    if (campo.k === 'reps') return campo.tempo ? 'Segundos' : 'Repetições';
    if (campo.k === 'seg') return 'Tempo';
    if (campo.k === 'm') return 'Metros';
    if (campo.k === 'cal') return 'Calorias';
    return campo.label;
  }

  function circuito() {
    const a = Store.state.ativo;
    return a && a.tipo === 'circuito' ? a : null;
  }

  function sincronizarRonda(a) {
    if (rondaDe !== a.id) { rondaDe = a.id; ronda = primeiraPorFazer(a); }
    const total = totalRondas(a);
    if (ronda >= total) ronda = Math.max(0, total - 1);
  }

  function totalRondas(a) {
    return a.entradas.reduce((n, e) => Math.max(n, e.series.length), 0);
  }

  function rondaCompleta(a, i) {
    return a.entradas.length > 0 && a.entradas.every(e => e.series[i] && e.series[i].feita);
  }

  function primeiraPorFazer(a) {
    const total = totalRondas(a);
    for (let i = 0; i < total; i++) if (!rondaCompleta(a, i)) return i;
    return Math.max(0, total - 1);
  }

  Vistas.treino = {
    titulo: () => Store.state.ativo ? Store.state.ativo.nome : 'Treino',
    sub: () => {
      const a = Store.state.ativo;
      if (!a) return '';
      const min = Math.floor((Date.now() - a.inicio) / 60000);
      const feitas = a.entradas.reduce((n, e) => n + e.series.filter(s => s.feita).length, 0);
      if (a.tipo === 'circuito') {
        const completas = Array.from({ length: totalRondas(a) }, (_, i) => rondaCompleta(a, i)).filter(Boolean).length;
        return `${min} min · ${completas} ronda${completas === 1 ? '' : 's'} completa${completas === 1 ? '' : 's'}`;
      }
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
          sub: 'Vai a Hoje para começares o treino sugerido, um circuito ou um treino livre.'
        });
      }
      if (a.tipo === 'circuito') return escolhaCronometro(a) + renderCircuito(a);

      return escolhaCronometro(a) +
        `<div data-exercicios>${a.entradas.map(cartaoExercicio).join('') || estadoVazio()}</div>
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

      raiz.querySelector('[data-terminar-b]').addEventListener('click', terminar);
      raiz.querySelector('[data-descartar-b]').addEventListener('click', descartar);
      const addEx = raiz.querySelector('[data-add-ex]');
      if (addEx) addEx.addEventListener('click', adicionarExercicio);

      raiz.querySelectorAll('[data-timer]').forEach(b => b.addEventListener('click', () => {
        Store.definirDescanso(b.dataset.timer === 'sim');
        UI.haptic('medio');
        UI.toast(b.dataset.timer === 'sim'
          ? 'O descanso passa a ser contado sozinho'
          : 'Treino sem cronómetro. Podes ligá-lo nas opções do treino.');
        App.render();
      }));

      const lista = raiz.querySelector('[data-exercicios]');
      lista.addEventListener('click', e => {
        const det = e.target.closest('[data-detalhe]');
        if (det) return Comp.detalhes(det.dataset.detalhe, { aoRenomear: () => redesenhar() });
        const ok = e.target.closest('[data-ok]');
        if (ok) return alternarSerie(+ok.dataset.i, +ok.dataset.s);
        const addS = e.target.closest('[data-add-serie]');
        if (addS) return adicionarSerie(+addS.dataset.i);
        const men = e.target.closest('[data-menu-ex]');
        if (men) return sheetExercicio(+men.dataset.i);
        const men2 = e.target.closest('[data-menu-serie]');
        if (men2) return sheetSerie(+men2.dataset.i, +men2.dataset.s);
        const maq = e.target.closest('[data-maquina]');
        if (maq) return sheetMaquina(+maq.dataset.i);
        const vazioB = e.target.closest('[data-vazio-accao]');
        if (vazioB) return adicionarExercicio();
        const r = e.target.closest('[data-ronda]');
        if (r) { ronda = +r.dataset.ronda; UI.haptic('leve'); return redesenhar(); }
        const nova = e.target.closest('[data-nova-ronda]');
        if (nova) return juntarRonda();
        const crono = e.target.closest('[data-cronometro]');
        if (crono) return arrancarCronometro();
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
        else if (campo === 'rir') serie.rir = v === null ? null : Math.max(0, Math.min(10, Math.round(v)));
        else serie[campo] = v === null ? null : Math.round(v);
        Store.marcarActividade();
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

  /**
   * Perguntar uma vez, no início do treino, se queres o cronómetro.
   * Só aparece com o modo "perguntar" e enquanto não escolheres —
   * até lá, o descanso não é contado. Em Ajustes podes fixar a resposta.
   */
  function escolhaCronometro(a) {
    if (a.descansoAuto != null) return '';
    const circuito = a.tipo === 'circuito';
    return `<section class="cartao cartao--plano mb3" data-cartao-timer>
      <div class="linha">
        <span style="color:var(--primaria-txt)">${icone('cronometro', 24)}</span>
        <div class="crescer">
          <p style="font-weight:650">Queres cronómetro de descanso?</p>
          <p class="cartao__sub">${circuito
            ? 'Conta sozinho os segundos entre estações e entre rondas.'
            : `Conta sozinho ${UI.mmss(Store.state.settings.descanso)} nos compostos e ${UI.mmss(Store.state.settings.descansoIsolamento)} no isolamento, sempre que marcas uma série.`}</p>
        </div>
      </div>
      <div class="linha mt3" style="gap:var(--e2)">
        <button type="button" class="btn btn--primario crescer" data-timer="sim">${icone('cronometro', 18)}Contar descanso</button>
        <button type="button" class="btn btn--secundario crescer" data-timer="nao">Sem cronómetro</button>
      </div>
    </section>`;
  }

  /* ---------- campos de registo ---------- */
  function campoHtml(campo, s, i, si, anterior) {
    const bruto = s[campo.k];
    const valor = campo.peso
      ? (bruto != null ? UI.fmt(Store.U.mostrar(bruto)) : '')
      : (bruto != null ? bruto : '');
    const ant = anterior ? anterior[campo.k] : null;
    const dica = ant != null
      ? (campo.peso ? UI.fmt(Store.U.mostrar(ant)) : String(ant))
      : rotulo(campo).toLowerCase();
    return `<input class="campo-num" data-campo="${campo.k}" data-i="${i}" data-s="${si}"
      type="text" inputmode="${campo.peso ? 'decimal' : 'numeric'}" enterkeyhint="next"
      value="${esc(valor)}" placeholder="${esc(dica)}"
      aria-label="${esc(rotulo(campo))} da série ${si + 1}">`;
  }

  /**
   * O exercício leva coluna de RIR — repetições que ainda tinhas em reserva?
   * Só na musculação: em cardio, tempos e circuitos não quer dizer nada.
   */
  function comRir(ex) {
    return !!(Store.state.settings.rir && ex && !ex.cond && !ex.tempo && !circuito() && Store.comCarga(ex));
  }

  function campoRir(s, i, si, ants) {
    const ant = ants && ants.rir != null ? String(ants.rir) : '–';
    return `<input class="campo-num campo-num--rir" data-campo="rir" data-i="${i}" data-s="${si}"
      type="text" inputmode="numeric" enterkeyhint="done" maxlength="2"
      value="${s.rir != null ? s.rir : ''}" placeholder="${esc(ant)}"
      aria-label="Repetições em reserva da série ${si + 1}">`;
  }

  function linhaSerie(ex, s, i, si, ants) {
    const met = Store.metricaDe(ex);
    const aquecimento = s.tipo === 'aquecimento';
    const coluna = comRir(ex);
    return `<div class="serie ${coluna ? 'serie--rir' : ''} ${s.feita ? 'serie--feita' : ''}">
      <button type="button" class="serie__n" data-menu-serie data-i="${i}" data-s="${si}"
              aria-label="Opções da série ${si + 1}">
        ${aquecimento ? 'A' : si + 1}${s.tipo === 'falha' ? '<small>F</small>' : ''}
      </button>
      ${campoHtml(met.a, s, i, si, ants)}
      ${campoHtml(met.b, s, i, si, ants)}
      ${coluna ? (aquecimento ? '<span aria-hidden="true"></span>' : campoRir(s, i, si, ants)) : ''}
      <button type="button" class="serie__ok" data-ok data-i="${i}" data-s="${si}"
              aria-pressed="${!!s.feita}" aria-label="${s.feita ? 'Anular' : 'Concluir'} série ${si + 1}">
        ${icone('check', 20)}
      </button>
    </div>`;
  }

  /* ---------- treino de força ---------- */
  function cartaoExercicio(entrada, i) {
    const ex = Store.exercicio(entrada.exId);
    if (!ex) return '';
    const ult = Store.ultimaPerformance(entrada.exId, Store.state.ativo.id);
    const prog = Store.sugerirProgressao(entrada.exId);
    const rec = Store.recordes(entrada.exId);
    const met = Store.metricaDe(ex);
    const musc = Comp.nomesMusculos(ex.p).join(' e ');

    const reps = Store.repsDe(ex);
    const unidade = ex.m === 'distancia' ? 'metros' : ex.m === 'calorias' ? 'calorias'
      : ex.tempo ? 'segundos' : 'repetições';
    const alvoTxt = `alvo ${reps[0]}–${reps[1]} ${unidade}`;
    const dica = ult
      ? `${Store.D.relativo(ult.data)}: ${ult.series.length} séries`
      : 'Primeira vez — regista um valor de referência';

    return `<article class="exercicio" data-ex-idx="${i}">
      <header class="exercicio__cab">
        ${Anatomia.miniDoExercicio(ex)}
        <div class="crescer">
          <h2 class="exercicio__n">${esc(ex.n)}</h2>
          <p class="exercicio__meta">${esc(musc)} · ${esc(alvoTxt)}</p>
          <p class="exercicio__meta">${esc(dica)}</p>
        </div>
        <button type="button" class="btn-icone" data-detalhe="${ex.id}" aria-label="Como se faz: ${esc(ex.n)}">${icone('info', 20)}</button>
        <button type="button" class="btn-icone" data-menu-ex data-i="${i}" aria-label="Opções de ${esc(ex.n)}">${icone('opcoes', 20)}</button>
      </header>

      ${prog && prog.subir ? `<p class="chip chip--sucesso chip--multilinha" style="margin:0 var(--e4) var(--e2)">${icone('seta', 13)}Sugestão: sobe para ${Store.U.fmt(prog.kg)}${prog.motivo === 'folga' ? ` — sobraram ${prog.margem} repetições` : ''}</p>` : ''}
      ${rec ? `<p class="chip" style="margin:0 var(--e4) var(--e2)">${icone('trofeu', 13)}Recorde ${esc(Store.textoRecorde(rec, ex))}</p>` : ''}
      ${chipMaquina(ex, entrada, i)}

      <div class="serie-cab ${comRir(ex) ? 'serie-cab--rir' : ''}" aria-hidden="true">
        <span>Série</span><span>${esc(rotulo(met.a))}</span><span>${esc(rotulo(met.b))}</span>${comRir(ex) ? '<span>RIR</span>' : ''}<span></span>
      </div>
      ${entrada.series.map((s, si) => linhaSerie(ex, s, i, si, ult && ult.series[si])).join('')}
      <footer class="exercicio__rodape">
        <button type="button" class="btn btn--fantasma btn--pequeno" data-add-serie data-i="${i}">${icone('mais', 16)}Série</button>
        <span class="crescer"></span>
        <span class="chip num">${entrada.series.filter(s => s.feita && s.tipo !== 'aquecimento').length}/${entrada.series.filter(s => s.tipo !== 'aquecimento').length} feitas</span>
      </footer>
    </article>`;
  }

  /** Chip para dizer em que polia/máquina está a ser feito o exercício */
  function chipMaquina(ex, entrada, i) {
    if (!Store.usaMaquina(ex)) return '';
    const m = entrada.maq;
    return `<button type="button" class="chip ${m ? 'chip--contorno' : 'chip--aviso'}" style="margin:0 var(--e4) var(--e2)"
      data-maquina data-i="${i}" aria-label="${m ? 'Máquina: ' + esc(m) + '. Trocar' : 'Escolher a máquina'}">
      ${icone('ajustes', 13)}${m ? esc(m) : 'Que máquina?'}
    </button>`;
  }

  /* ---------- treino em circuito ---------- */
  function renderCircuito(a) {
    return `<div data-exercicios>${circuitoInterior(a)}</div>
      <button type="button" class="btn btn--primario btn--bloco btn--grande mt4" data-terminar-b>
        ${icone('check', 20)}Terminar circuito
      </button>
      <button type="button" class="btn btn--fantasma btn--bloco mt2" data-descartar-b>Descartar treino</button>`;
  }

  function circuitoInterior(a) {
    sincronizarRonda(a);
    const total = totalRondas(a);
    const formato = CATALOGO.FORMATOS[a.formato] || CATALOGO.FORMATOS.rondas;
    const feitasNaRonda = a.entradas.filter(e => e.series[ronda] && e.series[ronda].feita).length;

    const abas = Array.from({ length: total }, (_, i) => {
      const completa = rondaCompleta(a, i);
      return `<button type="button" class="ronda ${completa ? 'ronda--feita' : ''}" data-ronda="${i}"
        aria-pressed="${i === ronda}" aria-label="Ronda ${i + 1}${completa ? ', completa' : ''}">
        ${completa ? icone('check', 16) : i + 1}
      </button>`;
    }).join('');

    return `<section class="cartao cartao--destaque mb3">
        <div class="cartao__cab">
          <div class="crescer">
            <span class="chip chip--primaria">${icone('chama', 13)}${esc(formato.name)}</span>
            <h2 class="cartao__tit mt2">Ronda ${ronda + 1} de ${total}</h2>
            <p class="cartao__sub">${feitasNaRonda} de ${a.entradas.length} estações feitas nesta ronda</p>
          </div>
        </div>
        <div class="rondas" role="group" aria-label="Rondas">${abas}</div>
        <div class="linha mt3" style="gap:var(--e2)">
          <button type="button" class="btn btn--secundario crescer" data-cronometro>
            ${icone('cronometro', 18)}Cronómetro de ${a.minutos} min
          </button>
          <button type="button" class="btn btn--secundario crescer" data-nova-ronda>
            ${icone('mais', 18)}Juntar ronda
          </button>
        </div>
        <p class="cartao__sub mt3">${esc(formato.desc)}</p>
      </section>

      ${a.entradas.map((entrada, i) => cartaoEstacao(entrada, i)).join('')}`;
  }

  function cartaoEstacao(entrada, i) {
    const ex = Store.exercicio(entrada.exId);
    if (!ex) return '';
    const s = entrada.series[ronda];
    if (!s) return '';
    const met = Store.metricaDe(ex);
    const musc = Comp.nomesMusculos(ex.p).join(' e ');
    const unidade = ex.m === 'distancia' ? 'metros' : ex.m === 'calorias' ? 'calorias'
      : ex.tempo ? 'segundos' : 'repetições';
    const anterior = ronda > 0 ? entrada.series[ronda - 1] : null;

    return `<article class="exercicio ${s.feita ? 'exercicio--feito' : ''}">
      <header class="exercicio__cab">
        <span class="estacao__n num" aria-hidden="true">${i + 1}</span>
        ${Anatomia.miniDoExercicio(ex)}
        <div class="crescer">
          <h2 class="exercicio__n">${esc(ex.n)}</h2>
          <p class="exercicio__meta">${entrada.alvo != null ? `${entrada.alvo} ${esc(unidade)} · ` : ''}${esc(musc)}</p>
        </div>
        <button type="button" class="btn-icone" data-detalhe="${ex.id}" aria-label="Como se faz: ${esc(ex.n)}">${icone('info', 20)}</button>
      </header>
      <div class="serie-cab" aria-hidden="true">
        <span>Ronda</span><span>${esc(rotulo(met.a))}</span><span>${esc(rotulo(met.b))}</span><span></span>
      </div>
      ${linhaSerie(ex, s, i, ronda, anterior)}
    </article>`;
  }

  function redesenhar() {
    const raiz = document.getElementById('conteudo');
    const lista = raiz.querySelector('[data-exercicios]');
    const a = Store.state.ativo;
    if (!lista || !a) { App.render(); return; }
    const activo = document.activeElement;
    const ref = activo && activo.dataset && activo.dataset.campo
      ? { i: activo.dataset.i, s: activo.dataset.s, campo: activo.dataset.campo, pos: activo.selectionStart } : null;

    lista.innerHTML = a.tipo === 'circuito'
      ? circuitoInterior(a)
      : (a.entradas.map(cartaoExercicio).join('') || estadoVazio());
    if (ref) {
      const el = lista.querySelector(`[data-campo="${ref.campo}"][data-i="${ref.i}"][data-s="${ref.s}"]`);
      if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(ref.pos, ref.pos); } catch (e) { /* ignorar */ } }
    }
    const sub = document.getElementById('cab-sub');
    if (sub) sub.textContent = Vistas.treino.sub();
  }

  /* ---------- acções sobre séries ---------- */
  function alternarSerie(i, si) {
    const a = Store.state.ativo;
    const entrada = a.entradas[i];
    const s = entrada.series[si];
    const ex = Store.exercicio(entrada.exId);
    const met = Store.metricaDe(ex);
    const ult = Store.ultimaPerformance(entrada.exId, a.id);

    if (!s.feita) {
      // preenche a partir da sessão anterior ou do alvo, se estiver vazio
      const ants = ult && ult.series[si];
      [met.a, met.b].forEach(campo => {
        if (s[campo.k] != null) return;
        if (ants && ants[campo.k] != null) { s[campo.k] = ants[campo.k]; return; }
        if (campo.k === Store.chaveAlvo(ex)) {
          s[campo.k] = entrada.alvo != null ? entrada.alvo
            : (campo.k === 'reps' ? Store.repsDe(ex)[1] : Store.repsDe(ex)[0]);
        }
      });
      s.feita = true;
      UI.haptic('medio');

      // recorde pessoal?
      if (Store.comCarga(ex) && s.tipo !== 'aquecimento' && s.kg) {
        const antes = Store.recordes(entrada.exId);
        const novo1rm = Store.um1RM(s.kg, s.reps);
        if (!antes || novo1rm > antes.rmValor + 0.01) {
          UI.toast(`Recorde em ${ex.n}!`, 'sucesso');
          UI.haptic('sucesso');
        }
      }

      if (s.tipo !== 'aquecimento') descansar(a, ex, si);
    } else {
      s.feita = false;
      UI.haptic('leve');
    }
    Store.marcarActividade();
    Store.guardar();

    if (a.tipo === 'circuito' && s.feita && rondaCompleta(a, ronda)) {
      const total = totalRondas(a);
      if (ronda + 1 < total) {
        ronda++;
        UI.toast(`Ronda ${ronda} completa. Vai a caminho da ${ronda + 1}.`, 'sucesso');
      } else {
        UI.toast('Última ronda completa. Bom trabalho.', 'sucesso');
      }
    }
    redesenhar();
  }

  /** Descanso adequado: entre estações num circuito, entre séries num treino de força */
  function descansar(a, ex, si) {
    if (!Store.comDescanso(a)) return;      // treino sem cronómetro
    if (a.tipo === 'circuito') {
      const fecha = rondaCompleta(a, si);
      const seg = fecha ? (a.descansoRonda || 0) : (a.descansoEstacao || Store.state.settings.descansoCircuito || 20);
      if (seg > 0) App.iniciarDescanso(seg, fecha ? 'Descanso entre rondas' : 'Muda de estação');
      return;
    }
    const seg = ex && ex.t === 'C' ? Store.state.settings.descanso : Store.state.settings.descansoIsolamento;
    App.iniciarDescanso(seg);
  }

  function adicionarSerie(i) {
    const entrada = Store.state.ativo.entradas[i];
    const ex = Store.exercicio(entrada.exId);
    const ult = entrada.series[entrada.series.length - 1];
    entrada.series.push(ult ? { ...Store.serieVazia(ex), ...copiaValores(ex, ult) } : Store.serieBase(ex));
    Store.marcarActividade();
    Store.guardar();
    UI.haptic('leve');
    redesenhar();
  }

  function copiaValores(ex, origem) {
    const met = Store.metricaDe(ex);
    const o = {};
    [met.a, met.b].forEach(c => { o[c.k] = origem[c.k] != null ? origem[c.k] : null; });
    return o;
  }

  /** Nova ronda em todas as estações (útil em AMRAP) */
  function juntarRonda() {
    const a = Store.state.ativo;
    a.entradas.forEach(e => {
      const ex = Store.exercicio(e.exId);
      const ult = e.series[e.series.length - 1];
      const nova = Store.serieBase(ex, e.alvo);
      if (ult && ult.kg != null) nova.kg = ult.kg;
      e.series.push(nova);
    });
    ronda = totalRondas(a) - 1;
    Store.marcarActividade();
    Store.guardar(true);
    UI.haptic('medio');
    App.render();
  }

  function arrancarCronometro() {
    const a = Store.state.ativo;
    App.iniciarDescanso((a.minutos || 12) * 60, 'Tempo do circuito');
    UI.haptic('medio');
    UI.toast(`Cronómetro a contar ${a.minutos} minutos`);
  }

  function sheetMaquina(i) {
    const entrada = Store.state.ativo.entradas[i];
    const ex = Store.exercicio(entrada.exId);
    const lista = Store.state.settings.maquinas || [];

    const sh = UI.sheet({
      titulo: 'Máquina',
      html: `<p class="texto-corpo mb3">Em que máquina estás a fazer ${esc(ex ? ex.n : 'este exercício')}?
          A app passa a comparar cada máquina só com o histórico dela, e enche já as séries por fazer
          com a carga que usaste lá da última vez.</p>
        <div class="pilha">
          ${lista.map(m => `<button type="button" class="lista__i" style="border-radius:var(--r2);border:1px solid var(--borda)" data-escolher="${esc(m)}">
            <span class="lista__corpo"><span class="lista__t">${esc(m)}</span></span>
            ${entrada.maq === m ? `<span class="lista__fim" style="color:var(--primaria-txt)">${icone('check', 20)}</span>` : ''}
          </button>`).join('')}
          <button type="button" class="btn btn--fantasma btn--bloco mt2" data-escolher="">Não registar máquina</button>
        </div>
        <p class="campo__ajuda">Os nomes mudam-se em Ajustes → Durante o treino.</p>`
    });

    sh.painel.querySelectorAll('[data-escolher]').forEach(b => b.addEventListener('click', () => {
      const escolha = b.dataset.escolher || null;
      const kg = Store.definirMaquina(i, escolha);
      UI.fecharSheet();
      UI.haptic('leve');
      if (escolha && kg) UI.toast(`${escolha}: cargas postas a ${Store.U.fmt(kg)}`, 'sucesso');
      else if (escolha) UI.toast(`${escolha} — ainda sem histórico nesta máquina`);
      redesenhar();
    }));
  }

  function sheetSerie(i, si) {
    const entrada = Store.state.ativo.entradas[i];
    const s = entrada.series[si];
    const ex = Store.exercicio(entrada.exId);
    const circuitoAtivo = !!circuito();
    const comReserva = comRir(ex) && s.tipo !== 'aquecimento';
    const tipos = [['normal', 'Série normal'], ['aquecimento', 'Aquecimento (não conta para o volume)'], ['falha', 'Até à falha']];

    const sh = UI.sheet({
      titulo: circuitoAtivo ? `Ronda ${si + 1}` : `Série ${si + 1}`,
      html: `<div class="pilha">
        ${comReserva ? `<div>
          <span class="campo__l" id="rir-l">Repetições em reserva (RIR)</span>
          <div class="filtros mt2" style="flex-wrap:wrap;overflow:visible;padding:0;margin:0" role="group" aria-labelledby="rir-l">
            ${[0, 1, 2, 3, 4, 5].map(v => `<button type="button" class="filtro" data-rir="${v}"
              aria-pressed="${s.rir === v}" aria-label="${v} repetições em reserva">${v}</button>`).join('')}
            <button type="button" class="filtro" data-rir="" aria-pressed="${s.rir == null}">Sem registo</button>
          </div>
          <p class="campo__ajuda">Quantas repetições ainda conseguias fazer quando paraste.
            0 é falha total; 2 é o ponto habitual para ganhar músculo sem te arrasares.</p>
          <hr class="divisor">
        </div>` : ''}
        ${circuitoAtivo ? '' : tipos.map(([v, l]) => `<button type="button" class="lista__i" style="border-radius:var(--r2);border:1px solid var(--borda)" data-tipo="${v}">
          <span class="lista__corpo"><span class="lista__t">${esc(l)}</span></span>
          ${s.tipo === v ? `<span class="lista__fim" style="color:var(--primaria-txt)">${icone('check', 20)}</span>` : ''}
        </button>`).join('')}
        <button type="button" class="btn btn--perigo-fantasma btn--bloco mt3" data-remover>${icone('lixo', 18)}Remover ${circuitoAtivo ? 'esta ronda' : 'série'}</button>
      </div>`
    });

    sh.painel.querySelectorAll('[data-rir]').forEach(b => b.addEventListener('click', () => {
      s.rir = b.dataset.rir === '' ? null : +b.dataset.rir;
      Store.marcarActividade();
      Store.guardar(); UI.fecharSheet(); UI.haptic('leve'); redesenhar();
    }));

    sh.painel.querySelectorAll('[data-tipo]').forEach(b => b.addEventListener('click', () => {
      s.tipo = b.dataset.tipo;
      Store.guardar(); UI.fecharSheet(); UI.haptic('leve'); redesenhar();
    }));
    sh.painel.querySelector('[data-remover]').addEventListener('click', () => {
      if (circuitoAtivo) {
        Store.state.ativo.entradas.forEach(e => { if (e.series.length > 1) e.series.splice(si, 1); });
        ronda = Math.max(0, Math.min(ronda, totalRondas(Store.state.ativo) - 1));
      } else {
        entrada.series.splice(si, 1);
        if (!entrada.series.length) entrada.series.push(Store.serieBase(ex));
      }
      Store.guardar(); UI.fecharSheet(); UI.haptic('medio'); App.render();
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
          <textarea class="area" id="ex-notas" placeholder="Por exemplo: senti o ombro na terceira série" aria-describedby="ex-notas-a">${esc(entrada.notas || '')}</textarea>
          <p class="campo__ajuda" id="ex-notas-a">Fica guardado no histórico deste treino.</p>
        </div>
        <div class="pilha">
          ${Store.usaMaquina(ex) ? `<button type="button" class="btn btn--secundario btn--bloco" data-maq-b>${icone('ajustes', 18)}Máquina${entrada.maq ? ': ' + esc(entrada.maq) : ''}</button>` : ''}
          <button type="button" class="btn btn--secundario btn--bloco" data-como>${icone('info', 18)}Como se faz</button>
          <button type="button" class="btn btn--secundario btn--bloco" data-hist>${icone('grafico', 18)}Ver histórico e recordes</button>
          <button type="button" class="btn btn--secundario btn--bloco" data-renomear>${icone('editar', 18)}Mudar o nome do exercício</button>
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

    const maqB = sh.painel.querySelector('[data-maq-b]');
    if (maqB) maqB.addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => sheetMaquina(i), 240);
    });

    sh.painel.querySelector('[data-como]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => Comp.detalhes(entrada.exId), 240);
    });
    sh.painel.querySelector('[data-hist]').addEventListener('click', () => { UI.fecharSheet(); App.ir('exercicio/' + entrada.exId); });
    sh.painel.querySelector('[data-renomear]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => Comp.renomearExercicio(entrada.exId, () => redesenhar()), 240);
    });
    sh.painel.querySelector('[data-trocar]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => Comp.escolherExercicio(id => {
        Store.state.ativo.entradas[i] = Store.criarEntrada(id);
        Store.guardar(true); redesenhar();
      }, { titulo: 'Trocar exercício' }), 240);
    });
    sh.painel.querySelector('[data-sobe]').addEventListener('click', () => mover(i, -1));
    sh.painel.querySelector('[data-desce]').addEventListener('click', () => mover(i, 1));
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

  function mover(i, delta) {
    const arr = Store.state.ativo.entradas;
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    Store.guardar(); UI.fecharSheet(); UI.haptic('leve'); redesenhar();
  }

  function adicionarExercicio() {
    Comp.escolherExercicio(id => {
      Store.state.ativo.entradas.push(Store.criarEntrada(id));
      Store.marcarActividade();
      Store.guardar(true);
      redesenhar();
      UI.haptic('sucesso');
    }, { manterAberto: false });
  }

  /* ---------- opções e fim ---------- */
  function sheetOpcoes() {
    const a = Store.state.ativo;
    if (!a) return;
    const liga = Store.comDescanso(a);
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
        <div class="cartao cartao--plano mb3">
          <button type="button" class="troca" data-troca-timer role="switch" aria-checked="${liga}"
                  aria-label="Cronómetro de descanso" aria-describedby="t-timer-a">
            <span class="crescer" style="text-align:left">
              <span class="troca__t" style="display:block">Cronómetro de descanso</span>
              <span class="troca__s" style="display:block" id="t-timer-a">${a.tipo === 'circuito'
                ? 'Conta o tempo entre estações e entre rondas'
                : `Arranca sozinho ao marcares uma série feita (${UI.mmss(Store.state.settings.descanso)} nos compostos)`}</span>
            </span>
            <span class="interruptor" aria-hidden="true"></span>
          </button>
          <p class="campo__ajuda" style="margin-top:var(--e2)">Vale só para este treino.
            Para não voltares a ser perguntado, escolhe em Ajustes → Descanso entre séries.</p>
        </div>
        ${a.tipo === 'circuito' ? `<p class="campo__ajuda mb3">
          Descanso entre estações: ${a.descansoEstacao || 0} segundos. Entre rondas: ${a.descansoRonda || 0} segundos.</p>` : ''}
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

    const troca = sh.painel.querySelector('[data-troca-timer]');
    troca.addEventListener('click', () => {
      const novo = !Store.comDescanso(a);
      Store.definirDescanso(novo);
      troca.setAttribute('aria-checked', String(novo));
      UI.haptic('leve');
      App.desenharBarraInferior();
      // a pergunta do início já não faz sentido depois de responderes aqui
      const cartao = document.querySelector('#conteudo [data-cartao-timer]');
      if (cartao) cartao.remove();
    });

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
    const palavra = a.tipo === 'circuito' ? 'estações' : 'séries';
    const msg = porFazer
      ? `Vais guardar ${feitas} ${palavra}. As ${porFazer} que não marcaste serão descartadas.`
      : `Vais guardar ${feitas} ${palavra}.`;
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
