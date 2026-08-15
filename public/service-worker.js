// Service worker minimal : aucun cache, handler fetch passif.
// Requis par Chrome/Android pour rendre l'application installable (PWA).
const SW_VERSION = 'lovanet-sw-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Handler présent mais non intrusif : on laisse le réseau gérer les requêtes
// (indispensable pour les vidéos/range requests et l'installation PWA).
self.addEventListener('fetch', () => {});
