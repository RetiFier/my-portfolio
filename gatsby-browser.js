import "./src/styles/global.css";

/**
 * The site no longer uses a service worker (gatsby-plugin-offline was removed
 * because it served stale builds). Unregister any worker left from an earlier
 * visit and delete the caches that plugin created; static/sw.js also removes
 * itself when the browser checks the old worker for updates.
 */
export const onClientEntry = () => {
  if (typeof window === "undefined") return;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((r) => r.unregister()))
      .catch(() => {});
  }
  if ("caches" in window) {
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => /^(gatsby-plugin-offline|workbox)/.test(k)).map((k) => caches.delete(k))),
      )
      .catch(() => {});
  }
};
