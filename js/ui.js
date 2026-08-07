/* =============================================================
   Treinos — Primitivas de interface: ícones SVG, sheets, toasts
   ============================================================= */
(function (global) {
  'use strict';

  /* ---------- Ícones (traço 1.75, família única, sem emojis) ---------- */
  const PATHS = {
    casa: '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    haltere: '<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>',
    grafico: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    ajustes: '<path d="M4 6h4M13 6h7M4 12h7M16 12h4M4 18h3M12 18h8"/><circle cx="10.5" cy="6" r="2.2"/><circle cx="13.5" cy="12" r="2.2"/><circle cx="9.5" cy="18" r="2.2"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    menos: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
    direita: '<path d="m9 18 6-6-6-6"/>',
    esquerda: '<path d="m15 18-6-6 6-6"/>',
    baixo: '<path d="m6 9 6 6 6-6"/>',
    cima: '<path d="m18 15-6-6-6 6"/>',
    voltar: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    lixo: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    editar: '<path d="M12.5 20H21"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    procurar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    estrela: '<path d="m12 3.4 2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83L6.62 20.05l1.03-6L3.3 9.8l6-.9z"/>',
    cronometro: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5"/>',
    play: '<path d="M7.5 4.8v14.4L19.5 12z" fill="currentColor" stroke-linejoin="round"/>',
    pausa: '<path d="M9 5v14M15 5v14"/>',
    reiniciar: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3 8.5"/><path d="M2.5 3.5v5.2h5.2"/>',
    descarregar: '<path d="M12 3.5v12"/><path d="m7.2 11 4.8 4.8 4.8-4.8"/><path d="M4 20.5h16"/>',
    carregar: '<path d="M12 20.5v-12"/><path d="m7.2 13 4.8-4.8 4.8 4.8"/><path d="M4 3.5h16"/>',
    aviso: '<path d="M12 3.2 2.6 20.2h18.8z"/><path d="M12 9.5v5M12 17.6v.01"/>',
    trofeu: '<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4v1a3.5 3.5 0 0 0 3.2 3.5M17 5.5h3v1a3.5 3.5 0 0 1-3.2 3.5"/><path d="M12 14v3.5M9 20.5h6M10.5 17.5h3"/>',
    chama: '<path d="M12 2.8c3.2 3.9 6 5.7 6 9.4a6 6 0 0 1-12 0c0-2.1 1-3.7 2.6-5.2.3 1.3 1 2.1 2 2.4-.6-2.4.2-4.7 1.4-6.6z"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.2 1.9"/>',
    alvo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
    opcoes: '<circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11.2v5M12 7.9v.01"/>',
    lista: '<path d="M8.5 6H21M8.5 12H21M8.5 18H21M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    raio: '<path d="M13.2 2.5 4.6 13.8H11l-1.2 7.7 8.6-11.3H12z"/>',
    checkCirculo: '<circle cx="12" cy="12" r="9"/><path d="m8.3 12.2 2.6 2.6 4.8-5.4"/>',
    nota: '<path d="M5.5 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    duplicar: '<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M5.5 15H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 3h9A1.5 1.5 0 0 1 15.5 4.5V5"/>',
    filtro: '<path d="M3.5 5.5h17l-6.8 8v5.2l-3.4 1.8v-7z"/>',
    corpo: '<circle cx="12" cy="4.6" r="2.3"/><path d="M12 6.9v7.4M12 9.5 7 12M12 9.5l5 2.5M12 14.3l-2.6 6.8M12 14.3l2.6 6.8"/>',
    cadeado: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1"/>',
    seta: '<path d="M12 19V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/>',
    // mão fechada à volta de uma barra — as pegas dos exercícios
    pega: '<path d="M2.5 8.75h19"/><rect x="6" y="7.25" width="12" height="9.5" rx="4.75"/><path d="M10 16.15v-3.6M14 16.15v-3.6"/>'
  };

  function icone(nome, tam, cls) {
    const d = PATHS[nome] || PATHS.info;
    return `<svg class="ic ${cls || ''}" width="${tam || 22}" height="${tam || 22}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  }

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function reduzirMovimento() {
    return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function haptic(tipo) {
    if (!Store.state.settings.vibrar) return;
    if (!navigator.vibrate) return;
    const p = { leve: 8, medio: 18, sucesso: [12, 40, 24], erro: [30, 60, 30] };
    try { navigator.vibrate(p[tipo] || 10); } catch (e) { /* ignorado */ }
  }

  let audioCtx = null;
  function beep(vezes) {
    if (!Store.state.settings.avisoSonoro) return;
    try {
      audioCtx = audioCtx || new (global.AudioContext || global.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const n = vezes || 2;
      for (let i = 0; i < n; i++) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        const t0 = audioCtx.currentTime + i * 0.22;
        o.type = 'sine'; o.frequency.value = 880;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + 0.2);
      }
    } catch (e) { /* som indisponível */ }
  }
  // desbloqueia o áudio no primeiro toque (exigência do iOS)
  document.addEventListener('touchstart', function destrancar() {
    try {
      audioCtx = audioCtx || new (global.AudioContext || global.webkitAudioContext)();
      audioCtx.resume();
    } catch (e) { /* ignorado */ }
    document.removeEventListener('touchstart', destrancar);
  }, { passive: true, once: true });

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg, tipo, accao) {
    const cont = document.getElementById('toasts');
    cont.innerHTML = '';
    const ic = tipo === 'erro' ? 'aviso' : tipo === 'sucesso' ? 'checkCirculo' : 'info';
    const t = el(`<div class="toast toast--${tipo || 'info'}" role="status">
      ${icone(ic, 20)}
      <span class="toast__txt">${esc(msg)}</span>
      ${accao ? `<button type="button" class="toast__btn">${esc(accao.label)}</button>` : ''}
    </div>`);
    if (accao) t.querySelector('.toast__btn').addEventListener('click', () => { accao.fn(); fechar(); });
    cont.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(fechar, accao ? 6000 : 3200);
    function fechar() {
      t.classList.add('sai');
      setTimeout(() => t.remove(), 200);
    }
  }

  /* ---------- Bottom sheet ---------- */
  let sheetAberto = null;
  function sheet(opts) {
    fecharSheet(true);
    const raiz = el(`<div class="sheet-wrap">
      <div class="sheet__scrim" data-fechar></div>
      <div class="sheet ${opts.alto ? 'sheet--alto' : ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.titulo || 'Painel')}">
        <div class="sheet__pega" data-arrasto><span></span></div>
        <header class="sheet__cab">
          <h2 class="sheet__tit">${esc(opts.titulo || '')}</h2>
          <button type="button" class="btn-icone" data-fechar aria-label="Fechar">${icone('fechar', 22)}</button>
        </header>
        <div class="sheet__corpo">${opts.html || ''}</div>
        ${opts.rodape ? `<footer class="sheet__rodape">${opts.rodape}</footer>` : ''}
      </div>
    </div>`);

    document.body.appendChild(raiz);
    document.body.classList.add('sem-scroll');
    const painel = raiz.querySelector('.sheet');

    raiz.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', () => fecharSheet()));

    // arrastar para baixo para fechar
    const pega = raiz.querySelector('[data-arrasto]');
    let y0 = null, dy = 0;
    pega.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; painel.style.transition = 'none'; }, { passive: true });
    pega.addEventListener('touchmove', e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      painel.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    pega.addEventListener('touchend', () => {
      painel.style.transition = '';
      if (dy > 110) fecharSheet(); else painel.style.transform = '';
      y0 = null; dy = 0;
    });

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); fecharSheet(); }
      if (e.key === 'Tab') {
        const f = painel.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const pri = f[0], ult = f[f.length - 1];
        if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
        else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);

    sheetAberto = { raiz, onKey, aoFechar: opts.aoFechar };
    requestAnimationFrame(() => raiz.classList.add('aberto'));
    setTimeout(() => {
      const alvo = painel.querySelector('[data-auto-focus]') || painel.querySelector('input,button');
      if (alvo && opts.focar !== false) alvo.focus({ preventScroll: true });
    }, 220);

    if (opts.aoAbrir) opts.aoAbrir(painel, fecharSheet);
    return { painel, fechar: fecharSheet };
  }

  function fecharSheet(instantaneo) {
    if (!sheetAberto) return;
    const { raiz, onKey, aoFechar } = sheetAberto;
    sheetAberto = null;
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('sem-scroll');
    if (instantaneo) raiz.remove();
    else { raiz.classList.remove('aberto'); setTimeout(() => raiz.remove(), 220); }
    if (aoFechar) aoFechar();
  }

  /* ---------- Confirmação ---------- */
  function confirmar(opts) {
    return new Promise(resolve => {
      let resolvido = false;
      const s = sheet({
        titulo: opts.titulo,
        html: `<p class="texto-corpo">${esc(opts.msg)}</p>`,
        rodape: `<button type="button" class="btn btn--fantasma" data-nao>Cancelar</button>
                 <button type="button" class="btn ${opts.perigo ? 'btn--perigo' : 'btn--primario'}" data-sim>${esc(opts.ok || 'Confirmar')}</button>`,
        aoFechar: () => { if (!resolvido) resolve(false); }
      });
      s.painel.querySelector('[data-nao]').addEventListener('click', () => { resolvido = true; resolve(false); fecharSheet(); });
      s.painel.querySelector('[data-sim]').addEventListener('click', () => { resolvido = true; haptic('medio'); resolve(true); fecharSheet(); });
    });
  }

  /* ---------- números ---------- */
  function lerNumero(v) {
    if (v == null) return null;
    const s = String(v).replace(',', '.').trim();
    if (s === '') return null;
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function fmt(n, casas) {
    if (n == null) return '—';
    if (casas === 0 || Math.abs(n - Math.round(n)) < 0.005) return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return n.toFixed(casas == null ? 1 : casas).replace('.', ',');
  }
  function fmtDuracao(seg) {
    if (!seg && seg !== 0) return '—';
    const h = Math.floor(seg / 3600), m = Math.round((seg % 3600) / 60);
    return h ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
  }
  function mmss(seg) {
    const s = Math.max(0, Math.round(seg));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  global.UI = { icone, el, esc, toast, sheet, fecharSheet, confirmar, haptic, beep, lerNumero, fmt, fmtDuracao, mmss, reduzirMovimento };
})(window);
