const CACHE_NAME = 'hello-world-pwa-v1';
const urlsToCache = [
  '/',
  '/pwa/index.html',
  '/pwa/index1.html',
  '/pwa/index2.html',
  '/pwa/index3.html',
  '/pwa/index4.html',
  '/pwa/index5.html',
  '/pwa/styles.css',
  '/pwa/script.js',
  '/pwa/icon-192x192.png',
  '/pwa/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Thông báo mới';
  const options = {
      body: data.body || 'Bạn có một thông báo mới từ PWA!',
      icon: 'icon-192x192.png',
      badge: 'icon-192x192.png'
  };

  event.waitUntil(
      self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
