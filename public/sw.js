/* CUORE service worker (sprint T-06).
 *
 * Goal: after one visit the app opens and the screening wizard works without a
 * network. It caches only the public site: pages, build assets, images and icons.
 * It never sees or stores user data: screening answers live in React state only,
 * and this worker ignores every non-GET, cross-origin and API-style request.
 *
 * The page registers /sw.js?v=<build id>, so each deploy installs a fresh worker
 * with its own cache and the old cache is deleted on activate.
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE = `cuore-${VERSION}`;

/** Pages to fetch and store on install. Their static assets are found by reading the HTML. */
const PAGES = ["/", "/about", "/model", "/cup/s", "/cup/m", "/cup/l"];

/** Files stored on install in addition to what the pages reference. */
const EXTRA = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/img/cups/s.webp",
  "/img/cups/m.webp",
  "/img/cups/l.webp",
  "/img/poster.webp",
];

/** Build assets and public images referenced from HTML. */
const ASSET_RE = /\/(?:_next\/static|img|icons)\/[A-Za-z0-9_\-./%~]+\.(?:js|css|woff2?|png|webp|svg|ico)/g;

const NAVIGATION_TIMEOUT_MS = 4000;

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname === "/_next/image" ||
  url.pathname.startsWith("/img/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname === "/manifest.webmanifest" ||
  url.pathname === "/favicon.ico" ||
  url.pathname === "/icon.png" ||
  url.pathname === "/apple-icon.png";

/** One cache entry per page, whatever the query string or trailing slash. */
const pageKey = (url) => new Request(url.origin + (url.pathname.replace(/\/+$/, "") || "/"));

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const assets = new Set(EXTRA);
      for (const path of PAGES) {
        const res = await fetch(path, { cache: "reload" });
        if (!res.ok) throw new Error(`precache ${path}: ${res.status}`); // install again on the next visit
        await cache.put(pageKey(new URL(path, self.location.origin)), res.clone());
        for (const m of (await res.text()).matchAll(ASSET_RE)) assets.add(m[0]);
      }
      // A missing asset must not block installation: the runtime cache fills the gap later.
      await Promise.all(
        [...assets].map(async (u) => {
          try {
            const r = await fetch(u);
            if (r.ok) await cache.put(u, r);
          } catch {}
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith("cuore-") && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function navigate(request) {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE);
  const fromNetwork = fetch(request).then(async (res) => {
    if (res.ok && res.type === "basic") await cache.put(pageKey(url), res.clone());
    return res;
  });
  const cached = await cache.match(pageKey(url));
  if (!cached) {
    try {
      return await fromNetwork;
    } catch {
      // Unknown page while offline: the start page is better than the browser's error screen.
      return (await cache.match(pageKey(new URL("/", url.origin)))) || Response.error();
    }
  }
  // Network first, but do not make the user wait on a dead connection.
  fromNetwork.catch(() => {});
  try {
    return await Promise.race([
      fromNetwork,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NAVIGATION_TIMEOUT_MS)),
    ]);
  } catch {
    return cached;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch (err) {
    // A resized next/image variant we never stored: fall back to the original file.
    const url = new URL(request.url);
    if (url.pathname === "/_next/image") {
      const original = url.searchParams.get("url");
      if (original && original.startsWith("/")) {
        const fallback = await cache.match(original, { ignoreVary: true });
        if (fallback) return fallback;
      }
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(navigate(request));
  } else if (isStatic(url)) {
    event.respondWith(cacheFirst(request));
  }
  // Anything else (for example client-side navigation data) goes straight to the network;
  // when it fails the app falls back to a full page load, which is served from the cache above.
});

/** The page tells us which files it actually loaded, so exact image sizes and lazy chunks are stored too. */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      for (const raw of data.urls) {
        try {
          const url = new URL(raw, self.location.origin);
          if (url.origin !== self.location.origin || !isStatic(url)) continue;
          if (await cache.match(url.href, { ignoreVary: true })) continue;
          const res = await fetch(url.href);
          if (res.ok) await cache.put(url.href, res);
        } catch {}
      }
    })(),
  );
});
