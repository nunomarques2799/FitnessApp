/* Service worker — permite abrir a app sem internet.
   Sobe o número da versão sempre que alterares ficheiros. */
const VERSAO = 'treinos-v19';
const FICHEIROS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/exercises.js',
  './js/plano.js',
  './js/execucao.js',
  './js/store.js',
  './js/ui.js',
  './js/charts.js',
  './js/pdf.js',
  './js/anatomia.js',
  './js/components.js',
  './js/views/hoje.js',
  './js/views/plano.js',
  './js/views/treino.js',
  './js/views/historico.js',
  './js/views/exercicios.js',
  './js/views/progresso.js',
  './js/views/ajustes.js',
  './js/app.js',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSAO)
      .then(c => c.addAll(FICHEIROS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) {
        // actualiza em segundo plano
        fetch(e.request).then(res => {
          if (res && res.ok) caches.open(VERSAO).then(c => c.put(e.request, res));
        }).catch(() => {});
        return hit;
      }
      return fetch(e.request).then(res => {
        if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
          const copia = res.clone();
          caches.open(VERSAO).then(c => c.put(e.request, copia));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
