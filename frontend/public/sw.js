// DOMUS - Service Worker de Limpeza e Auto-Desregistro
// Garante conexão direta e irrestrita sem interferência de cache

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass-through total: NUNCA interceptar requisições
self.addEventListener('fetch', () => {
  return;
});
