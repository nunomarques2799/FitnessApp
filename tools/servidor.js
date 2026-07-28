/* Servidor estático mínimo, sem dependências.
   Uso:  node tools/servidor.js [porta]
   Mostra também o endereço da rede local para abrires no iPhone.   */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RAIZ = path.join(__dirname, '..');
const PORTA = Number(process.argv[2]) || 8080;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let caminho = decodeURIComponent(req.url.split('?')[0]);
  if (caminho === '/') caminho = '/index.html';
  const ficheiro = path.join(RAIZ, path.normalize(caminho).replace(/^(\.\.[/\\])+/, ''));

  if (!ficheiro.startsWith(RAIZ)) { res.writeHead(403).end('Proibido'); return; }

  fs.readFile(ficheiro, (err, dados) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Não encontrado: ' + caminho);
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(ficheiro).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(dados);
  });
}).listen(PORTA, () => {
  const ips = [];
  Object.values(os.networkInterfaces()).forEach(lista =>
    (lista || []).forEach(i => { if (i.family === 'IPv4' && !i.internal) ips.push(i.address); }));
  console.log(`\n  Treinos a correr\n`);
  console.log(`  Neste PC:      http://localhost:${PORTA}`);
  ips.forEach(ip => console.log(`  No iPhone:     http://${ip}:${PORTA}   (mesma rede Wi-Fi)`));
  console.log('');
});
