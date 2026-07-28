/* =============================================================
   Treinos — Figura humana com os músculos trabalhados
   Um único conjunto de formas é injectado no documento e depois
   reutilizado com <use>, para que centenas de figuras não pesem.
   Cada forma é metade do corpo (lado direito) e é espelhada.
   ============================================================= */
(function (global) {
  'use strict';

  const VB = '0 0 200 400';

  /* ---------- corpo ---------- */
  const CORPO = `
    <g id="an-corpo">
      <ellipse class="an__corpo" cx="100" cy="34" rx="19" ry="23"/>
      <path class="an__corpo" d="M90 50h20v20H90z"/>
      <path class="an__corpo" d="M100 62c-14 0-26 4-32 12-6 8-10 20-12 34l4 32c2 16 4 28 6 40 1 10 2 16 2 22h64c0-6 1-12 2-22 2-12 4-24 6-40l4-32c-2-14-6-26-12-34-6-8-18-12-32-12z"/>
      <path class="an__corpo" d="M68 200h64c1 12 0 24-4 34-4 10-10 16-16 16H88c-6 0-12-6-16-16-4-10-5-22-4-34z"/>
      <path class="an__linha" style="stroke-width:22" d="M143 84c11 10 15 30 15 52 0 22-1 44-3 64"/>
      <path class="an__linha" style="stroke-width:22" d="M57 84c-11 10-15 30-15 52 0 22 1 44 3 64"/>
      <ellipse class="an__corpo" cx="155" cy="214" rx="9" ry="12"/>
      <ellipse class="an__corpo" cx="45" cy="214" rx="9" ry="12"/>
      <path class="an__linha" style="stroke-width:36" d="M115 240c6 22 7 46 6 68"/>
      <path class="an__linha" style="stroke-width:36" d="M85 240c-6 22-7 46-6 68"/>
      <path class="an__linha" style="stroke-width:24" d="M121 306c-1 24-3 44-5 62"/>
      <path class="an__linha" style="stroke-width:24" d="M79 306c1 24 3 44 5 62"/>
      <path class="an__corpo" d="M108 366h16c8 4 13 10 13 15 0 3-3 5-8 5h-16c-4 0-7-3-7-7z"/>
      <path class="an__corpo" d="M92 366H76c-8 4-13 10-13 15 0 3 3 5 8 5h16c4 0 7-3 7-7z"/>
    </g>`;

  /* ---------- músculos, vistos de frente ----------
     A ordem das chaves é a ordem de desenho: o peito fica por baixo
     do deltoide, tal como o ombro assenta por cima do peitoral. */
  const FRENTE = {
    trapezio:     'M101 62c11 1 21 5 30 12-3 6-9 8-16 6-6-2-11-8-14-14z',
    peito:        'M101 83c12 0 23 2 32 7 3 4 4 10 3 15-2 8-9 15-18 19-5 2-11 3-17 3z',
    deltoide_ant: 'M128 74c10 5 17 15 19 27 1 8-3 13-9 10-6-3-10-13-12-23-1-8-1-13 2-14z',
    deltoide_lat: 'M136 78c10 7 16 19 16 32 0 8-4 11-8 7-4-4-6-15-7-26z',
    biceps:       'M139 116c8 5 11 17 10 30-1 10-6 13-10 8-4-5-5-19-4-30z',
    antebraco:    'M141 160c7 5 11 19 11 33 0 8-4 11-7 7-4-5-6-20-6-32z',
    abdominais:   'M100 130h13c1 15 1 31-1 43-1 8-5 13-12 14z',
    obliquos:     'M114 134c6 2 9 12 9 23 0 11-4 20-9 24z',
    adutores:     'M100 246l9 2c2 12 1 26-2 36-2 6-6 8-7 6z',
    quadriceps:   'M103 248c12 0 21 9 23 24 2 17-1 32-6 41-4 7-10 7-13 0-4-11-5-37-4-53z',
    gemeos:       'M105 318c9 0 14 10 14 23 0 12-4 18-9 16-4-3-6-14-6-27z'
  };

  /* ---------- músculos, vistos de costas ---------- */
  const COSTAS = {
    trapezio:      'M100 62c12 1 24 7 32 16-6 14-14 28-22 40-4 6-8 10-10 12z',
    deltoide_post: 'M129 75c10 5 17 15 19 27 1 8-3 13-9 10-6-3-10-13-12-23z',
    deltoide_lat:  'M137 79c10 7 15 19 15 31 0 8-4 11-8 7-4-4-6-15-7-25z',
    dorsais:       'M102 108c10 4 20 10 27 19 5 8 3 21-4 31-8 10-17 16-23 18z',
    triceps:       'M138 114c9 5 13 18 12 32-1 10-6 13-10 8-4-5-5-20-4-32z',
    antebraco:     'M141 160c7 5 11 19 11 33 0 8-4 11-7 7-4-5-6-20-6-32z',
    lombar:        'M100 164h13c1 13 0 25-3 34h-10z',
    gluteos:       'M100 202c12 0 24 7 29 18 3 10-1 22-10 26-8 4-15 2-19-4z',
    adutores:      'M100 250l8 2c2 12 1 26-2 36-2 6-5 8-6 6z',
    isquiotibiais: 'M103 250c12 0 21 9 23 24 2 17-1 32-6 41-4 7-10 7-13 0-4-11-5-37-4-53z',
    gemeos:        'M104 320c10 0 15 10 15 23 0 12-4 18-9 16-5-3-7-14-8-27z'
  };

  /* Cada exercício descreve músculos; alguns só se vêem de um lado. */
  const NA_FRENTE = Object.keys(FRENTE);
  const NAS_COSTAS = Object.keys(COSTAS);

  /* ---------- injecção do conjunto de formas ---------- */
  let injectado = false;
  function injectar() {
    if (injectado || document.getElementById('anatomia-formas')) { injectado = true; return; }
    const formas = Object.keys(FRENTE).map(k => `<path id="anf-${k}" d="${FRENTE[k]}"/>`).join('') +
      Object.keys(COSTAS).map(k => `<path id="anc-${k}" d="${COSTAS[k]}"/>`).join('');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'anatomia-formas');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.innerHTML = `<defs>${CORPO}${formas}</defs>`;
    document.body.insertBefore(svg, document.body.firstChild);
    injectado = true;
  }

  /* ---------- desenho ---------- */

  /** Um lado do corpo e o seu espelho */
  function par(id, cls) {
    return `<use href="#${id}" class="${cls}"/><use href="#${id}" class="${cls}" transform="translate(200,0) scale(-1,1)"/>`;
  }

  /**
   * Uma vista (frente ou costas).
   * primarios / secundarios: chaves de músculo.
   */
  function vista(lado, primarios, secundarios, opts) {
    opts = opts || {};
    const formas = lado === 'costas' ? COSTAS : FRENTE;
    const prefixo = lado === 'costas' ? 'anc' : 'anf';
    const p = new Set(primarios || []);
    const s = new Set(secundarios || []);
    // os oblíquos acompanham os abdominais
    if (p.has('abdominais')) p.add('obliquos');
    else if (s.has('abdominais')) s.add('obliquos');

    const musculos = Object.keys(formas).map(k => {
      const cls = p.has(k) ? 'an__m an__m--p' : s.has(k) ? 'an__m an__m--s' : 'an__m';
      return par(`${prefixo}-${k}`, cls);
    }).join('');

    return `<svg class="an ${opts.mini ? 'an--mini' : ''}" viewBox="${VB}" aria-hidden="true" focusable="false">
      <use href="#an-corpo"/>${musculos}
    </svg>`;
  }

  function nomes(chaves) {
    return (chaves || []).map(k => Store.MUSCLES[k] && Store.MUSCLES[k].name).filter(Boolean);
  }

  /** Descrição textual para leitores de ecrã */
  function descricao(primarios, secundarios) {
    const p = nomes(primarios), s = nomes(secundarios);
    let t = p.length ? 'Trabalha sobretudo ' + p.join(', ') : 'Sem músculos indicados';
    if (s.length) t += '. Também trabalha ' + s.join(', ');
    return t + '.';
  }

  /** Escolhe a vista que mostra mais músculos principais */
  function melhorVista(primarios, secundarios) {
    const conta = lista => ({
      frente: (lista || []).filter(k => NA_FRENTE.includes(k)).length,
      costas: (lista || []).filter(k => NAS_COSTAS.includes(k)).length
    });
    const p = conta(primarios), s = conta(secundarios);
    const frente = p.frente * 3 + s.frente;
    const costas = p.costas * 3 + s.costas;
    return costas > frente ? 'costas' : 'frente';
  }

  /**
   * Figura completa: frente e costas lado a lado, com legenda.
   * opts.vista: 'ambas' (por omissão) | 'frente' | 'costas'
   */
  function figura(primarios, secundarios, opts) {
    opts = opts || {};
    injectar();
    const qual = opts.vista || 'ambas';
    const lados = qual === 'ambas' ? ['frente', 'costas'] : [qual];
    const corpos = lados.map(l => `<figure class="an-wrap">
        ${vista(l, primarios, secundarios)}
        <figcaption class="an-wrap__l">${l === 'costas' ? 'Costas' : 'Frente'}</figcaption>
      </figure>`).join('');

    return `<div class="an-figura" role="img" aria-label="${UI.esc(descricao(primarios, secundarios))}">
        <div class="an-figura__corpos">${corpos}</div>
        ${opts.semLegenda ? '' : legenda(primarios, secundarios)}
      </div>`;
  }

  function legenda(primarios, secundarios) {
    const p = nomes(primarios), s = nomes(secundarios);
    return `<div class="an-legenda" aria-hidden="true">
      ${p.length ? `<p class="an-legenda__l"><i class="an-legenda__pt an-legenda__pt--p"></i>
        <span><strong>Trabalha:</strong> ${UI.esc(p.join(', '))}</span></p>` : ''}
      ${s.length ? `<p class="an-legenda__l"><i class="an-legenda__pt an-legenda__pt--s"></i>
        <span><strong>Também usa:</strong> ${UI.esc(s.join(', '))}</span></p>` : ''}
    </div>`;
  }

  /** Figura pequena, uma só vista, para listas e cartões */
  function mini(primarios, secundarios, opts) {
    opts = opts || {};
    injectar();
    const lado = opts.vista || melhorVista(primarios, secundarios);
    return `<span class="an-mini" role="img" aria-label="${UI.esc(descricao(primarios, secundarios))}">
      ${vista(lado, primarios, secundarios, { mini: true })}
    </span>`;
  }

  /** Atalhos a partir de um exercício */
  function doExercicio(ex, opts) {
    return figura(ex.p || [], ex.s || [], opts);
  }
  function miniDoExercicio(ex, opts) {
    return mini(ex.p || [], ex.s || [], opts);
  }

  global.Anatomia = { injectar, figura, mini, doExercicio, miniDoExercicio, descricao, melhorVista, legenda };
})(window);
