const CACHE_NAME = 'km-mahim-os-v4';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png'
];

// Install: precache essential static shell assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('Pre-cache warning:', err);
        })
      )
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old stale caches immediately so new JS/sync updates load cleanly
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: NEVER intercept Supabase / external APIs or APK downloads; use Network-First for HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Bypass localhost & ALL cross-origin APIs (Supabase REST, Realtime, Google Fonts, etc.)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;
  if (url.origin !== self.location.origin) return;

  // Never cache APK binary downloads
  if (url.pathname.endsWith('.apk')) return;

  // Network-First for HTML navigations so Vercel updates take effect right away
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => (await caches.match(event.request)) || (await caches.match('/index.html')))
    );
    return;
  }

  // Static same-origin assets: Network-First with cache fallback for reliability
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
