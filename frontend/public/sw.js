// Domus - Progressive Web App Service Worker (Network Pass-Through com fallback de cache)
// Habilita instalação nativa PWA no Android/Chrome e iOS

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Ignora chamadas à API, WebSocket e métodos mutantes para evitar overhead de IPC no mobile
  if (
    url.includes('/api/') ||
    url.includes('socket.io') ||
    url.includes(':3333') ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  // Pass-through fetch padrão com fallback resiliente para cache em assets estáticos
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
