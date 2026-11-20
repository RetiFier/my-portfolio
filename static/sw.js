/*
 * Kill switch for the service worker that gatsby-plugin-offline used to
 * install. Browsers that still have it registered fetch this file on their
 * next visit; it clears the old caches, unregisters itself and reloads open
 * tabs so they get the current build from the network. Keep this file
 * deployed for a while so returning visitors are cleaned up.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
