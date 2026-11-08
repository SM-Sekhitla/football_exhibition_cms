/* Online application; provide an explicit offline screen, never cached API/admin data. */
const CACHE = 'best5-offline-v1';
const OFFLINE = '/offline.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    OFFLINE, '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
  ])));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('best5-offline-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin ||
      url.pathname === '/api' || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match(OFFLINE)) || new Response('You are offline. Reconnect to use BEST5.', {
        status: 503, headers: { 'Content-Type': 'text/plain' },
      })));
    return;
  }
  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
