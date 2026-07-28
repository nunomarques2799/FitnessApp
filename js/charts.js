/* =============================================================
   Treinos — Gráficos SVG (sem bibliotecas, funciona offline)
   Todos incluem legenda de eixos, rótulos directos e resumo
   textual para leitores de ecrã.
   ============================================================= */
(function (global) {
  'use strict';
  const esc = s => UI.esc(s);

  function vazio(msg) {
    return `<div class="grafico-vazio">${UI.icone('grafico', 28)}<p>${esc(msg)}</p></div>`;
  }

  /** Gráfico de barras verticais. dados: [{label, valor, sub}] */
  function barras(dados, opts) {
    opts = opts || {};
    if (!dados.length || dados.every(d => !d.valor)) return vazio(opts.vazio || 'Sem dados ainda');
    const W = 320, H = 150, padL = 6, padR = 6, padT = 18, padB = 26;
    const max = Math.max(...dados.map(d => d.valor)) * 1.15 || 1;
    const n = dados.length;
    const passo = (W - padL - padR) / n;
    const larg = Math.min(28, passo * 0.62);

    const linhas = [0, 0.5, 1].map(f => {
      const y = padT + (H - padT - padB) * (1 - f);
      return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" class="g-grelha"/>`;
    }).join('');

    const barras = dados.map((d, i) => {
      const alt = Math.max(d.valor > 0 ? 3 : 0, (H - padT - padB) * (d.valor / max));
      const x = padL + passo * i + (passo - larg) / 2;
      const y = H - padB - alt;
      const destaque = i === n - 1;
      return `<g class="g-barra ${destaque ? 'g-barra--activa' : ''}" tabindex="0" role="listitem"
                 aria-label="${esc(d.label)}: ${esc(d.aria || d.valor)}">
        <rect x="${(x - (passo - larg) / 2).toFixed(1)}" y="${padT}" width="${passo.toFixed(1)}" height="${H - padT - padB}" fill="transparent"/>
        <rect class="g-barra__r" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${larg.toFixed(1)}" height="${alt.toFixed(1)}" rx="5"/>
        ${d.valor > 0 && (n <= 8 || destaque) ? `<text class="g-valor" x="${(x + larg / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle">${esc(d.curto || d.valor)}</text>` : ''}
        <text class="g-eixo" x="${(x + larg / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text>
      </g>`;
    }).join('');

    return `<svg class="grafico" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="list"
      aria-label="${esc(opts.aria || 'Gráfico de barras')}">${linhas}${barras}</svg>`;
  }

  /** Gráfico de linha. pontos: [{label, valor}] (ordem cronológica) */
  function linha(pontos, opts) {
    opts = opts || {};
    if (pontos.length < 2) return vazio(opts.vazio || 'Precisas de pelo menos 2 registos');
    const W = 320, H = 150, padL = 6, padR = 6, padT = 22, padB = 24;
    const vals = pontos.map(p => p.valor);
    let min = Math.min(...vals), max = Math.max(...vals);
    const margem = (max - min) * 0.2 || max * 0.1 || 1;
    min = Math.max(0, min - margem); max = max + margem;
    const px = i => padL + (W - padL - padR) * (pontos.length === 1 ? 0.5 : i / (pontos.length - 1));
    const py = v => padT + (H - padT - padB) * (1 - (v - min) / (max - min || 1));

    const grelha = [0, 0.5, 1].map(f => {
      const y = padT + (H - padT - padB) * f;
      return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" class="g-grelha"/>`;
    }).join('');

    const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`).join(' ');
    const area = `${d} L${px(pontos.length - 1).toFixed(1)},${H - padB} L${px(0).toFixed(1)},${H - padB} Z`;

    const mostrarRotulo = pontos.length <= 6;
    const pts = pontos.map((p, i) => {
      const x = px(i), y = py(p.valor);
      const ultimo = i === pontos.length - 1;
      return `<g class="g-ponto" tabindex="0" role="listitem" aria-label="${esc(p.label)}: ${esc(p.aria || p.valor)}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="transparent"/>
        <circle class="g-ponto__c ${ultimo ? 'g-ponto__c--activo' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${ultimo ? 5 : 3.5}"/>
        ${(mostrarRotulo || ultimo) ? `<text class="g-valor" x="${x.toFixed(1)}" y="${(y - 11).toFixed(1)}" text-anchor="${i === 0 ? 'start' : ultimo ? 'end' : 'middle'}">${esc(p.curto || p.valor)}</text>` : ''}
      </g>`;
    }).join('');

    const eixos = pontos.length > 1
      ? `<text class="g-eixo" x="${padL}" y="${H - 6}" text-anchor="start">${esc(pontos[0].label)}</text>
         <text class="g-eixo" x="${W - padR}" y="${H - 6}" text-anchor="end">${esc(pontos[pontos.length - 1].label)}</text>` : '';

    return `<svg class="grafico" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="list"
      aria-label="${esc(opts.aria || 'Gráfico de evolução')}">
      <defs><linearGradient id="gradLinha" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--cor-primaria)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--cor-primaria)" stop-opacity="0"/>
      </linearGradient></defs>
      ${grelha}
      <path d="${area}" fill="url(#gradLinha)"/>
      <path d="${d}" class="g-linha"/>
      ${pts}${eixos}
    </svg>`;
  }

  /** Mini gráfico em linha para cartões (sparkline) */
  function sparkline(vals) {
    if (vals.length < 2) return '';
    const W = 80, H = 24;
    const min = Math.min(...vals), max = Math.max(...vals);
    const d = vals.map((v, i) => {
      const x = (W * i / (vals.length - 1)).toFixed(1);
      const y = (H - 2 - (H - 4) * ((v - min) / (max - min || 1))).toFixed(1);
      return `${i ? 'L' : 'M'}${x},${y}`;
    }).join(' ');
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  global.Charts = { barras, linha, sparkline, vazio };
})(window);
