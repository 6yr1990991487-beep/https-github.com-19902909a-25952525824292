// Service worker minimal : aucun cache, mais un handler fetch actif.
// Requis par Chrome/Android pour rendre l'application installable (PWA).
const SW_VERSION = 'lovanet-sw-v4';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // purge d'anciens caches périmés, mais on reste enregistré
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Passthrough réseau : pas de mise en cache, mais handler présent.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => Response.error()));
});
