// Service worker auto-destructeur : purge tous les caches et se désinscrit.
// Nécessaire car d'anciennes versions mettaient en cache des assets périmés.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// Toujours réseau : plus aucune mise en cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
