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

// --- Notifications push / alertes ---
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) {
    payload = { body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'Lovanet';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || 'Nouveau contenu disponible sur Lovanet.',
      icon: '/lovanet-icon-192.png?v=11',
      badge: '/lovanet-icon-192.png?v=11',
      data: { url: payload.url || '/' },
      tag: payload.tag || 'lovanet-push',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(target); return client.focus(); }
      }
      return self.clients.openWindow(target);
    })
  );
});
