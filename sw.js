const CACHE_NAME = 'satisfaction-meter-v1';
const urlsToCache = [
  '/satisfaction-meter/dashboard.html',
  '/satisfaction-meter/manifest.json'
];

// Install – cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch – serve from cache if offline, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/satisfaction-meter/dashboard.html'))
  );
});

// Activate – remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => { if (name !== CACHE_NAME) return caches.delete(name); })
      )
    )
  );
});
