// Domus - Progressive Web App Service Worker (Network Pass-Through com fallback de cache)
// Habilita instalação nativa PWA no Android/Chrome e iOS

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch padrão com fallback resiliente para cache
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
