/* Gera os ícones PNG da app sem dependências externas.
   Uso:  node tools/gerar-icones.js                                   */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------- codificador PNG mínimo ---------- */
function crc32(buf) {
  let c, tabela = crc32.t;
  if (!tabela) {
    tabela = crc32.t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      tabela[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = tabela[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(tipo, dados) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([len, corpo, crc]);
}

function png(largura, altura, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8;    // profundidade
  ihdr[9] = 6;    // RGBA
  const linhas = Buffer.alloc((largura * 4 + 1) * altura);
  for (let y = 0; y < altura; y++) {
    linhas[y * (largura * 4 + 1)] = 0;    // filtro none
    rgba.copy(linhas, y * (largura * 4 + 1) + 1, y * largura * 4, (y + 1) * largura * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(linhas, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- desenho ---------- */
const FUNDO_TOPO = [0x16, 0x1D, 0x2C];
const FUNDO_BASE = [0x0A, 0x0E, 0x15];
const LARANJA = [0xF9, 0x73, 0x16];
const LARANJA_CLARO = [0xFB, 0x92, 0x3C];

/** caixa arredondada centrada; devolve true se (x,y) em coordenadas 0..1 está dentro */
function dentroCaixa(x, y, cx, cy, meiaL, meiaA, raio) {
  const dx = Math.abs(x - cx) - (meiaL - raio);
  const dy = Math.abs(y - cy) - (meiaA - raio);
  if (dx <= 0 && dy <= 0) return true;
  const qx = Math.max(dx, 0), qy = Math.max(dy, 0);
  return Math.hypot(qx, qy) <= raio;
}

/** true se o ponto pertence ao haltere */
function noHaltere(x, y, escala) {
  const cy = 0.5;
  const e = escala;
  const p = (v) => 0.5 + (v - 0.5) * e;
  const barra   = dentroCaixa(x, y, 0.5, cy, 0.5 * (0.40 * e), 0.5 * (0.085 * e), 0.030 * e);
  const placaIA = dentroCaixa(x, y, p(0.5 - 0.135), cy, 0.5 * (0.075 * e), 0.5 * (0.34 * e), 0.030 * e);
  const placaID = dentroCaixa(x, y, p(0.5 + 0.135), cy, 0.5 * (0.075 * e), 0.5 * (0.34 * e), 0.030 * e);
  const placaEA = dentroCaixa(x, y, p(0.5 - 0.225), cy, 0.5 * (0.070 * e), 0.5 * (0.22 * e), 0.028 * e);
  const placaED = dentroCaixa(x, y, p(0.5 + 0.225), cy, 0.5 * (0.070 * e), 0.5 * (0.22 * e), 0.028 * e);
  const capA    = dentroCaixa(x, y, p(0.5 - 0.288), cy, 0.5 * (0.055 * e), 0.5 * (0.115 * e), 0.024 * e);
  const capD    = dentroCaixa(x, y, p(0.5 + 0.288), cy, 0.5 * (0.055 * e), 0.5 * (0.115 * e), 0.024 * e);
  return barra || placaIA || placaID || placaEA || placaED || capA || capD;
}

function gerar(tamanho, opcoes) {
  opcoes = opcoes || {};
  const escala = opcoes.escala || 1;         // reduz o desenho em ícones maskable
  const cantos = opcoes.cantos !== false;    // canto arredondado (o iOS já corta, mas fica bem no Android)
  const raio = 0.22;
  const AA = 4;                              // supersampling
  const buf = Buffer.alloc(tamanho * tamanho * 4);

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < AA; sy++) {
        for (let sx = 0; sx < AA; sx++) {
          const fx = (x + (sx + 0.5) / AA) / tamanho;
          const fy = (y + (sy + 0.5) / AA) / tamanho;

          if (cantos && !dentroCaixa(fx, fy, 0.5, 0.5, 0.5, 0.5, raio)) continue;

          // fundo em gradiente + brilho radial atrás do haltere
          const t = fy;
          let cr = FUNDO_TOPO[0] + (FUNDO_BASE[0] - FUNDO_TOPO[0]) * t;
          let cg = FUNDO_TOPO[1] + (FUNDO_BASE[1] - FUNDO_TOPO[1]) * t;
          let cb = FUNDO_TOPO[2] + (FUNDO_BASE[2] - FUNDO_TOPO[2]) * t;
          const d = Math.hypot(fx - 0.5, fy - 0.5);
          const brilho = Math.max(0, 1 - d / 0.55) ** 2 * 0.30;
          cr += (LARANJA[0] - cr) * brilho;
          cg += (LARANJA[1] - cg) * brilho;
          cb += (LARANJA[2] - cb) * brilho;

          if (noHaltere(fx, fy, escala)) {
            const m = (fx + (1 - fy)) / 2;              // brilho diagonal
            cr = LARANJA[0] + (LARANJA_CLARO[0] - LARANJA[0]) * m;
            cg = LARANJA[1] + (LARANJA_CLARO[1] - LARANJA[1]) * m;
            cb = LARANJA[2] + (LARANJA_CLARO[2] - LARANJA[2]) * m;
          }
          r += cr; g += cg; b += cb; a += 255;
        }
      }
      const n = AA * AA;
      const i = (y * tamanho + x) * 4;
      const alfa = a / n;
      buf[i] = Math.round(r / n);
      buf[i + 1] = Math.round(g / n);
      buf[i + 2] = Math.round(b / n);
      buf[i + 3] = Math.round(alfa);
    }
  }
  return png(tamanho, tamanho, buf);
}

const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });

const saidas = [
  ['icon-180.png', 180, { cantos: false }],           // apple-touch-icon: o iOS arredonda sozinho
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { cantos: false, escala: 0.72 }]
];

saidas.forEach(([nome, tam, op]) => {
  const buf = gerar(tam, op);
  fs.writeFileSync(path.join(dir, nome), buf);
  console.log(`${nome}  ${tam}x${tam}  ${(buf.length / 1024).toFixed(1)} kB`);
});
console.log('Ícones gerados em icons/');
