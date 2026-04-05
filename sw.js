const CACHE_NAME = 'satisfaction-meter-v2';

const STATIC_URLS = [
  '/satisfaction-meter/dashboard.html',
  '/satisfaction-meter/manifest.json',
  '/satisfaction-meter/icons/launchericon-192x192.png',
  '/satisfaction-meter/icons/launchericon-512x512.png'
];

// ── Install: pre-cache essential files ───────────────────────
self.addEventListener('install', event => {
  self.skipWaiting(); // activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache each URL individually so one failure doesn't break the rest
      return Promise.allSettled(
        STATIC_URLS.map(url =>
          cache.add(url).catch(err => console.warn('Failed to cache:', url, err))
        )
      );
    })
  );
});

// ── Activate: remove stale caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim()) // take control immediately
  );
});

// ── Fetch: network-first for navigation, cache-fallback otherwise
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin or GitHub Pages requests
  if (url.origin !== location.origin &&
      !url.hostname.endsWith('github.io')) {
    return; // let the browser handle external requests normally
  }

  // For HTML navigation requests: network-first, cache fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache a fresh copy
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/satisfaction-meter/dashboard.html'))
        )
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
