// Domus - Progressive Web App Service Worker (Network Pass-Through)
// Mantém registro ativo para habilitar instalação nativa PWA no Android/Chrome

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through total: requisições sempre diretas à rede sem bloqueio ou cache defasado
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
