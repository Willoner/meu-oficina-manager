const CACHE_NAME = 'oficina-em-ordem-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.svg',
  '/logo-pwa-512.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Estratégia Network First: Tenta a rede, se falhar usa o cache.
  // Ideal para evitar que o PWA fique preso em versões antigas.
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
