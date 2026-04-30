const CACHE_NAME = "pwa-cache-v6";
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.webp",
  "/icons/icon-512.webp",
];

const putInCache = async (request, response) => {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isPageRequest =
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html");
  const isNetworkFirstAsset =
    url.pathname.startsWith("/_astro/") ||
    /\.(?:css|js|mjs)$/.test(url.pathname);

  // Detect an explicit reload / bypass-cache from the browser (e.g. user refresh)
  const isReload =
    request.cache === "reload" ||
    request.headers.get("pragma") === "no-cache" ||
    (request.headers.get("cache-control") || "").includes("no-cache") ||
    (request.headers.get("cache-control") || "").includes("max-age=0");

  if (isPageRequest || isNetworkFirstAsset) {
    // If this is an explicit reload, force a network fetch with no-store so the
    // browser gets fresh content. Otherwise use normal network-first strategy.
    const doNetworkFetch = (req) =>
      fetch(req)
        .then((response) => {
          putInCache(request, response.clone());
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || (isPageRequest ? caches.match("/") : undefined)),
        );

    if (isReload) {
      // Create a no-store request to bypass any intermediate caches
      const noStoreReq = new Request(request, { cache: "no-store", mode: request.mode, credentials: request.credentials, redirect: request.redirect });
      event.respondWith(doNetworkFetch(noStoreReq));
      return;
    }

    event.respondWith(
      doNetworkFetch(request),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        putInCache(request, response.clone());
        return response;
      });
    }),
  );
});
