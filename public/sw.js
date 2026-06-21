const CACHE_NAME = "workout-v2";

const PRECACHE_URLS = [
  "/today",
  "/week",
  "/progress",
  "/weight-log",
  "/history",
  "/manifest.json",
];

// Install: precache app-shell routes for offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: purge any cache that isn't the current version, then claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests and Next.js HMR/webpack
  const url = new URL(request.url);
  if (
    url.protocol === "chrome-extension:" ||
    url.pathname.startsWith("/_next/webpack") ||
    url.pathname.includes("__nextjs")
  ) {
    return;
  }

  // Navigations: network-first and NEVER cache the HTML response. Caching HTML
  // would (a) serve a stale app shell after a deploy and (b) accumulate one
  // entry per distinct ?date= visited. Offline → the precached route shell,
  // ignoring the query string so /today?date=X falls back to /today.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(request, { ignoreSearch: true })
          .then((cached) => cached || caches.match("/today"))
      )
    );
    return;
  }

  // Hashed static assets (_next/static): cache-first (content-hashed, immutable)
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Other assets (fonts, images, icons): stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
