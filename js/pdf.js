/* =============================================================
   Treinos — Gerador de PDF mínimo, sem bibliotecas

   Faz só o que a app precisa: páginas A4 com texto em Helvetica,
   traços de separação e quebra de linha automática. Chega para a
   folha do plano, e continua a funcionar sem internet.

   As fontes Helvetica e Helvetica-Bold são das 14 que qualquer
   leitor de PDF traz de origem, por isso não é preciso embutir
   nada. O texto vai em WinAnsiEncoding, que cobre os acentos.
   ============================================================= */
(function (global) {
  'use strict';

  const A4 = { larg: 595.28, alt: 841.89 };
  const MARGEM = 48;

  /* Larguras da Helvetica em milésimos, para partir linhas ao tamanho certo */
  const CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
  const LARGS = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015,
    667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
    278, 278, 278, 469, 556, 333,
    556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
    334, 260, 334, 584
  ];
  const LARGURA = {};
  for (let i = 0; i < CHARS.length; i++) LARGURA[CHARS[i]] = LARGS[i];

  /* Acentuados medem o mesmo que a letra de base */
  const BASE = { 'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'í': 'i', 'ì': 'i', 'î': 'i', 'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ç': 'c', 'ñ': 'n' };
  Object.keys(BASE).forEach(c => {
    LARGURA[c] = LARGURA[BASE[c]];
    LARGURA[c.toUpperCase()] = LARGURA[BASE[c].toUpperCase()];
  });
  LARGURA['·'] = 333; LARGURA['×'] = 584; LARGURA['—'] = 1000; LARGURA['–'] = 556;

  /** Largura de um texto, em pontos */
  function largura(txt, tam, negrito) {
    let n = 0;
    for (const c of String(txt)) n += LARGURA[c] || 556;
    return n / 1000 * tam * (negrito ? 1.06 : 1);
  }

  /* WinAnsi: de 0xA0 a 0xFF é igual ao Latin-1; os sinais tipográficos
     vivem no espaço de 0x80 a 0x9F, que o Unicode põe noutro sítio */
  const ESPECIAIS = {
    0x2013: 0x96, 0x2014: 0x97, 0x2018: 0x91, 0x2019: 0x92,
    0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2026: 0x85, 0x20AC: 0x80
  };

  function codificar(txt) {
    let out = '';
    for (const c of String(txt)) {
      const n = c.codePointAt(0);
      let b = ESPECIAIS[n] != null ? ESPECIAIS[n] : (n <= 0xFF && (n < 0x80 || n > 0x9F) ? n : 0x3F);
      const ch = String.fromCharCode(b);
      out += (ch === '(' || ch === ')' || ch === '\\') ? '\\' + ch : ch;
    }
    return out;
  }

  /**
   * Documento novo. Devolve um construtor com métodos de escrita;
   * `blob()` fecha-o e devolve o ficheiro pronto.
   */
  function documento(opts) {
    opts = opts || {};
    const paginas = [];
    let cur = null, y = 0;

    function novaPagina() {
      cur = [];
      paginas.push(cur);
      y = A4.alt - MARGEM;
    }
    novaPagina();

    function espacoPara(altura) {
      if (y - altura < MARGEM + 24) novaPagina();
    }

    function escrever(txt, x, tam, negrito, cinza) {
      cur.push(`BT /${negrito ? 'F2' : 'F1'} ${tam} Tf ${cinza != null ? cinza : 0} g `
        + `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${codificar(txt)}) Tj ET`);
    }

    const api = {
      /** Linha de texto, com quebra automática dentro de `larguraMax` */
      texto(txt, o) {
        o = o || {};
        const tam = o.tam || 10;
        const x = o.x != null ? o.x : MARGEM;
        const max = o.max || (A4.larg - MARGEM - x);
        const alturaLinha = o.alturaLinha || tam * 1.35;
        const palavras = String(txt).split(/\s+/).filter(Boolean);
        let linha = '';
        const linhas = [];
        palavras.forEach(p => {
          const tentativa = linha ? linha + ' ' + p : p;
          if (largura(tentativa, tam, o.negrito) > max && linha) { linhas.push(linha); linha = p; }
          else linha = tentativa;
        });
        if (linha) linhas.push(linha);
        linhas.forEach(l => {
          espacoPara(alturaLinha);
          escrever(l, x, tam, o.negrito, o.cinza);
          y -= alturaLinha;
        });
        return api;
      },

      /** Texto numa posição fixa, sem mexer no cursor vertical */
      textoEm(txt, x, o) {
        o = o || {};
        escrever(txt, x, o.tam || 10, o.negrito, o.cinza);
        return api;
      },

      /** Desce o cursor sem escrever nada */
      espaco(n) { y -= (n || 8); return api; },

      /** Linha horizontal a toda a largura útil */
      risco(o) {
        o = o || {};
        espacoPara(10);
        y -= (o.antes || 4);
        cur.push(`${o.cinza != null ? o.cinza : 0.8} G 0.6 w ${MARGEM} ${y.toFixed(2)} m ${(A4.larg - MARGEM).toFixed(2)} ${y.toFixed(2)} l S`);
        y -= (o.depois || 10);
        return api;
      },

      /** Garante que ainda cabem `altura` pontos, ou salta de página */
      cabe(altura) { espacoPara(altura); return api; },

      get y() { return y; },
      get largura() { return A4.larg - MARGEM * 2; },
      get esquerda() { return MARGEM; },
      get direita() { return A4.larg - MARGEM; },

      blob() { return construir(paginas, opts); }
    };
    return api;
  }

  /* ---------- montagem do ficheiro ---------- */
  function construir(paginas, opts) {
    const objs = [];
    const idPaginas = 2;
    const idFonte1 = 3, idFonte2 = 4;
    const primeiraPagina = 5;
    const kids = paginas.map((_, i) => `${primeiraPagina + i * 2} 0 R`).join(' ');

    objs[1] = `<< /Type /Catalog /Pages ${idPaginas} 0 R >>`;
    objs[idPaginas] = `<< /Type /Pages /Kids [ ${kids} ] /Count ${paginas.length} >>`;
    objs[idFonte1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[idFonte2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

    paginas.forEach((linhas, i) => {
      const idPag = primeiraPagina + i * 2;
      const idCont = idPag + 1;
      objs[idPag] = `<< /Type /Page /Parent ${idPaginas} 0 R /MediaBox [0 0 ${A4.larg} ${A4.alt}] `
        + `/Resources << /Font << /F1 ${idFonte1} 0 R /F2 ${idFonte2} 0 R >> >> /Contents ${idCont} 0 R >>`;
      const fluxo = linhas.join('\n');
      objs[idCont] = `<< /Length ${fluxo.length} >>\nstream\n${fluxo}\nendstream`;
    });

    let pdf = '%PDF-1.4\n';
    const posicoes = [];
    for (let i = 1; i < objs.length; i++) {
      if (objs[i] == null) continue;
      posicoes[i] = pdf.length;
      pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
    }
    const inicioXref = pdf.length;
    const total = objs.length;
    pdf += `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) {
      pdf += posicoes[i] != null
        ? String(posicoes[i]).padStart(10, '0') + ' 00000 n \n'
        : '0000000000 65535 f \n';
    }
    const info = opts.titulo ? ` /Title (${codificar(opts.titulo)})` : '';
    pdf += `trailer\n<< /Size ${total} /Root 1 0 R${info ? ' /Info << ' + info.trim() + ' >>' : ''} >>\n`
      + `startxref\n${inicioXref}\n%%EOF`;

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xFF;
    return new Blob([bytes], { type: 'application/pdf' });
  }

  global.PDF = { documento, largura, A4, MARGEM };
})(window);
