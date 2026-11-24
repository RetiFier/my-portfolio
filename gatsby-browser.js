import "./src/styles/global.css";
import React from "react";
import { Analytics } from "@vercel/analytics/react";

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

/**
 * Vercel Web Analytics. Mounted once at the root (not per page) so the script
 * is injected a single time; it records client-side route changes itself.
 * It only sends data from Vercel deployments and logs to the console in
 * `gatsby develop`.
 */
export const wrapRootElement = ({ element }) => (
  <>
    {element}
    <Analytics framework="gatsby" />
  </>
);
