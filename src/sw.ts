/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;

const cacheName = `svoltecache-%CommitHash%`;

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  e.respondWith(
    (async () => {
      console.log(url.hostname, self.location.hostname);
      if (url.hostname !== self.location.hostname) return await fetch(e.request);
      const cache = await caches.open(cacheName);
      const r = await cache.match(e.request);
      console.log(`[SW] Retreiving Resource: ${e.request.url}`);
      if (r) return r;
      const response = await fetch(e.request);
      console.log(`[SW] Caching Resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(async (cacheNames) => {
      const cache = await caches.open(cacheName);
      console.log("[SW] Caching...");
      await cache.addAll(["%RequestInfo%"]);
      return Promise.all(
        cacheNames
          .filter((name) => name !== cacheName)
          .map((name) => {
            return caches.delete(name);
          })
      );
    })
  );
});

export {};
