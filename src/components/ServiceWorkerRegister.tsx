"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker (sprint T-06), production only so `next dev`
 * is never served from a cache. After the worker is ready it is told which files
 * this page loaded, so images and lazily loaded chunks are stored for offline use.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const build = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    let cancelled = false;

    const shareLoadedFiles = async () => {
      const registration = await navigator.serviceWorker.ready;
      if (cancelled) return;
      const urls = performance.getEntriesByType("resource").map((e) => e.name);
      registration.active?.postMessage({ type: "CACHE_URLS", urls });
    };

    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(build)}`, { scope: "/" })
      .then(() => {
        if (document.readyState === "complete") void shareLoadedFiles();
        else window.addEventListener("load", () => void shareLoadedFiles(), { once: true });
      })
      .catch(() => {
        // Offline support is an extra: the app works normally without it.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
