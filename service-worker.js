/**
 * OS Lab — Service Worker & Offline Cache API
 * Provides offline navigation, static asset caching, and cache versioning.
 */

const CACHE_NAME = "oslab-static-v2";

// Essential static resources to cache
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./page-replacement.html",
    "./cpu-scheduling.html",
    "./disk-scheduling.html",
    "./memory-allocation.html",
    "./history.html",
    "./css/landing.css",
    "./css/style.css",
    "./css/scheduling.css",
    "./css/disk-scheduling.css",
    "./css/memory-allocation.css",
    "./css/history.css",
    "./css/navbar.css",
    "./data/modules.json",
    "./js/storage.js",
    "./js/app-common.js",
    "./js/script.js",
    "./js/cpu-scheduling.js",
    "./js/disk-scheduling.js",
    "./js/memory/memory-allocation.js",
    "./js/memory/first-fit.js",
    "./js/memory/best-fit.js",
    "./js/memory/worst-fit.js",
    "./js/algorithms/fifo.js",
    "./js/algorithms/lru.js",
    "./js/algorithms/optimal.js",
    "./js/algorithms/lfu.js",
    "./js/cpu/fcfs.js",
    "./js/cpu/sjf.js",
    "./js/cpu/srtf.js",
    "./js/cpu/priority.js",
    "./js/cpu/roundrobin.js",
    "./js/disk/fcfs.js",
    "./js/disk/sstf.js",
    "./js/disk/scan.js",
    "./js/disk/cscan.js",
    "./js/disk/look.js",
    "./js/disk/clook.js",
    "./js/visualization/canvas.js",
    "./js/visualization/gantt.js",
    "./js/visualization/history.js",
    "./js/visualization/reference.js",
    "./js/visualization/results.js",
    "./js/visualization/step.js",
    "./js/visualization/step-execution.js",
    "./js/visualization/timeline.js",
    "./js/workers/algorithm-worker.js"
];

/* =========================================================
   INSTALL EVENT: Pre-cache static assets
   ========================================================= */
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[ServiceWorker] Pre-caching static app shell");
            // Cache items individually so one missing asset doesn't break everything
            return Promise.allSettled(
                STATIC_ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn("[ServiceWorker] Could not pre-cache:", url, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

/* =========================================================
   ACTIVATE EVENT: Clean up stale caches
   ========================================================= */
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log("[ServiceWorker] Deleting obsolete cache:", name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

/* =========================================================
   FETCH EVENT: Network-first with cache fallback
   ========================================================= */
self.addEventListener("fetch", (event) => {
    // Only handle GET requests
    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // Ignore non-http(s) schemes like chrome-extension://
    if (!url.protocol.startsWith("http")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If valid response, clone and update cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                // Network failed; attempt cache lookup
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If HTML navigation failed and no direct match, return index.html fallback
                if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
                    const fallback = await caches.match("./index.html");
                    if (fallback) return fallback;
                }

                return new Response("Offline - Resource unavailable", {
                    status: 503,
                    statusText: "Service Unavailable",
                    headers: { "Content-Type": "text/plain" }
                });
            })
    );
});
