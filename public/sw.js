const SHELL_CACHE = "huayun-shell-v1";
const CONTENT_CACHE = "huayun-content-v1";

const SHELL_ROUTES = [
  "/zh",
  "/en",
  "/zh/heritage",
  "/en/heritage",
  "/zh/museum",
  "/en/museum",
  "/zh/campaigns",
  "/en/campaigns",
  "/zh/offline",
  "/en/offline",
  "/api/content/offline"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ROUTES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => ![SHELL_CACHE, CONTENT_CACHE].includes(key)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "CACHE_FAVORITES") {
    return;
  }

  const urls = Array.isArray(event.data.urls)
    ? event.data.urls.filter((url) => typeof url === "string" && url.length > 0)
    : [];

  if (!urls.length) {
    return;
  }

  event.waitUntil(caches.open(CONTENT_CACHE).then((cache) => cache.addAll(urls)).catch(() => undefined));
});

async function networkFirst(request) {
  const cache = await caches.open(CONTENT_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cache.match(request);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CONTENT_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.pathname === "/api/content/offline") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === "image" || url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const locale = url.pathname.startsWith("/en") ? "en" : "zh";
        return caches.match(`/${locale}/offline`);
      })
    );
  }
});
