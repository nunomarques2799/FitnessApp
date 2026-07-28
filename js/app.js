/* =============================================================
   Treinos — Router, navegação e ciclo de vida
   ============================================================= */
(function (global) {
  'use strict';

  const TABS = [
    { rota: 'hoje',       icone: 'casa',       label: 'Hoje' },
    { rota: 'historico',  icone: 'calendario', label: 'Histórico' },
    { rota: 'exercicios', icone: 'haltere',    label: 'Exercícios' },
    { rota: 'progresso',  icone: 'grafico',    label: 'Progresso' },
    { rota: 'ajustes',    icone: 'ajustes',    label: 'Ajustes' }
  ];

  const scrolls = {};
  let rotaActual = null;

  /* ---------- router ---------- */
  function analisar() {
    const h = (location.hash || '#/hoje').replace(/^#\/?/, '');
    const [nome, ...args] = h.split('/');
    return { nome: nome || 'hoje', arg: args.join('/') || null };
  }

  function ir(caminho, substituir) {
    const alvo = '#/' + String(caminho).replace(/^#?\/?/, '');
    if (location.hash === alvo) { render(); return; }
    if (substituir) location.replace(alvo); else location.hash = alvo;
  }

  function voltar(alternativa) {
    if (history.length > 1) history.back();
    else ir(alternativa || 'hoje', true);
  }

  function render() {
    const { nome, arg } = analisar();
    const vista = Vistas[nome] || Vistas.hoje;

    if (rotaActual) scrolls[rotaActual] = global.scrollY;

    const main = document.getElementById('conteudo');
    const cab = document.getElementById('cabecalho');

    document.getElementById('cab-titulo').textContent = vista.titulo ? vista.titulo(arg) : '';
    const sub = vista.sub ? vista.sub(arg) : '';
    const subEl = document.getElementById('cab-sub');
    subEl.textContent = sub || '';
    subEl.hidden = !sub;
    document.getElementById('cab-accoes').innerHTML = vista.accoes ? vista.accoes(arg) : '';

    main.innerHTML = vista.render(arg);
    if (vista.montar) vista.montar(main, arg);

    // liga acções do cabeçalho depois de renderizadas
    if (vista.montarCabecalho) vista.montarCabecalho(document.getElementById('cab-accoes'), arg);

    document.querySelectorAll('.nav__b').forEach(b => {
      const activo = b.dataset.rota === nome ||
        (nome === 'exercicio' && b.dataset.rota === 'exercicios') ||
        (nome === 'sessao' && b.dataset.rota === 'historico') ||
        (nome === 'treino' && b.dataset.rota === 'hoje');
      b.setAttribute('aria-current', activo ? 'page' : 'false');
    });

    rotaActual = nome + (arg ? '/' + arg : '');
    const y = scrolls[rotaActual];
    global.scrollTo({ top: y || 0, behavior: 'auto' });
    main.focus({ preventScroll: true });
    cab.classList.toggle('app-cab--linha', (y || 0) > 4);
    desenharBarraInferior();
  }

  /* ---------- barra inferior: treino a decorrer / descanso ---------- */
  let tickTimer = null;

  function desenharBarraInferior() {
    const slot = document.getElementById('timer-slot');
    const s = Store.state;
    const { nome } = analisar();

    if (s.timer && s.timer.fim) {
      const restante = (s.timer.fim - Date.now()) / 1000;
      if (restante <= -3) { s.timer = null; Store.guardar(); }
    }

    if (s.timer && s.timer.fim) {
      const restante = Math.max(0, (s.timer.fim - Date.now()) / 1000);
      const pct = Math.max(0, Math.min(100, (1 - restante / s.timer.total) * 100));
      const fim = restante <= 0;
      const nome = s.timer.titulo || 'Descanso';
      if (!slot.querySelector('.timer')) {
        slot.innerHTML = `<div class="timer ${fim ? 'timer--fim' : ''}" role="timer" aria-label="${UI.esc(nome)}">
          <span class="timer__v num" data-v>${UI.mmss(restante)}</span>
          <span class="timer__l" data-l>${UI.esc(fim ? nome + ' — acabou' : nome)}</span>
          <button type="button" class="btn-icone" data-add aria-label="Adicionar 30 segundos">${UI.icone('mais', 20)}</button>
          <button type="button" class="btn-icone" data-parar aria-label="Terminar descanso">${UI.icone('fechar', 22)}</button>
        </div>`;
        slot.querySelector('[data-add]').addEventListener('click', () => {
          Store.state.timer.fim += 30000; Store.state.timer.total += 30; UI.haptic('leve'); tick();
        });
        slot.querySelector('[data-parar]').addEventListener('click', () => {
          Store.state.timer = null; Store.guardar(); UI.haptic('leve'); desenharBarraInferior();
        });
      }
      const barra = slot.querySelector('.timer');
      barra.style.setProperty('--pct', pct + '%');
      barra.classList.toggle('timer--fim', fim);
      barra.querySelector('[data-v]').textContent = UI.mmss(restante);
      barra.querySelector('[data-l]').textContent = fim ? nome + ' — acabou' : nome;
      if (!tickTimer) tickTimer = setInterval(tick, 1000);
      return;
    }

    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }

    if (s.ativo && nome !== 'treino') {
      const min = Math.floor((Date.now() - s.ativo.inicio) / 60000);
      slot.innerHTML = `<button type="button" class="timer" data-retomar>
        ${UI.icone('chama', 22, 'cor-primaria')}
        <span class="timer__l crescer" style="color:var(--txt);font-weight:700">${UI.esc(s.ativo.nome)}</span>
        <span class="timer__v num" style="font-size:var(--t-base)">${min} min</span>
        ${UI.icone('direita', 20)}
      </button>`;
      slot.querySelector('[data-retomar]').addEventListener('click', () => ir('treino'));
      return;
    }
    slot.innerHTML = '';
  }

  let avisouFim = false;
  function tick() {
    const s = Store.state;
    if (!s.timer) { desenharBarraInferior(); return; }
    const restante = (s.timer.fim - Date.now()) / 1000;
    if (restante <= 0 && !avisouFim) {
      avisouFim = true;
      UI.beep(2); UI.haptic('sucesso');
    }
    if (restante > 0) avisouFim = false;
    if (restante <= -3) { s.timer = null; Store.guardar(); }
    desenharBarraInferior();
  }

  function iniciarDescanso(segundos, titulo) {
    Store.state.timer = { fim: Date.now() + segundos * 1000, total: segundos, titulo: titulo || 'Descanso' };
    avisouFim = false;
    Store.guardar();
    desenharBarraInferior();
  }

  /* ---------- arranque ---------- */
  function nav() {
    document.getElementById('nav').innerHTML = TABS.map(t =>
      `<button type="button" class="nav__b" data-rota="${t.rota}" aria-current="false">
        ${UI.icone(t.icone, 23)}<span>${t.label}</span>
      </button>`).join('');
    document.getElementById('nav').addEventListener('click', e => {
      const b = e.target.closest('.nav__b');
      if (!b) return;
      UI.haptic('leve');
      ir(b.dataset.rota);
    });
  }

  function aplicarTema() {
    const t = Store.state.settings.tema;
    if (t && t !== 'auto') document.documentElement.setAttribute('data-tema', t);
    else document.documentElement.removeAttribute('data-tema');
  }

  function arrancar() {
    Store.carregar();
    aplicarTema();
    Anatomia.injectar();
    nav();
    global.addEventListener('hashchange', render);
    global.addEventListener('scroll', () => {
      document.getElementById('cabecalho').classList.toggle('app-cab--linha', global.scrollY > 4);
    }, { passive: true });

    // retoma o cronómetro ao voltar do segundo plano
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { tick(); desenharBarraInferior(); }
    });

    render();

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline não disponível */ });
    }
  }

  global.App = { ir, voltar, render, iniciarDescanso, desenharBarraInferior, aplicarTema, TABS };
  global.Vistas = global.Vistas || {};

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})(window);
