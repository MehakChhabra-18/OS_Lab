/**
 * OS Lab — Common Application Orchestration
 * Handles:
 *  - Service Worker registration
 *  - Global Theme toggle (synced with localStorage)
 *  - Cookie visit banner & cookie preference reset
 *  - Asynchronous Fetch for data/modules.json with graceful fallback
 */

(function () {
    "use strict";

    /* =========================================================
       1. REGISTER SERVICE WORKER
       ========================================================= */
    function registerServiceWorker() {
        if ("serviceWorker" in navigator) {
            // Service workers require http/https or localhost
            const isLocalOrSecure =
                window.location.protocol === "https:" ||
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

            if (isLocalOrSecure) {
                window.addEventListener("load", () => {
                    navigator.serviceWorker
                        .register("./service-worker.js")
                        .then((reg) => {
                            console.log("[ServiceWorker] Registered with scope:", reg.scope);
                        })
                        .catch((err) => {
                            console.warn("[ServiceWorker] Registration failed:", err);
                        });
                });
            } else {
                console.info("[ServiceWorker] Skipped registration (requires HTTPS or localhost server).");
            }
        }
    }

    /* =========================================================
       2. GLOBAL THEME TOGGLE (localStorage)
       ========================================================= */
    function initThemeToggle() {
        const savedTheme = window.OSLabStorage ? window.OSLabStorage.Local.getTheme() : "dark";
        if (window.OSLabStorage) {
            window.OSLabStorage.Local.applyTheme(savedTheme);
        }

        // The toggle is a real <button>, so Enter/Space activation works natively
        document.querySelectorAll(".theme-toggle").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (!window.OSLabStorage) return;
                const newTheme = window.OSLabStorage.Local.toggleTheme();
                window.OSLabStorage.showToast(`Theme switched to ${newTheme} mode`, "info");
            });
        });
    }

    /* =========================================================
       3. COOKIE VISIT TRACKING & PREFERENCES BANNER
       ========================================================= */
    function initCookieNotice() {
        if (!window.OSLabStorage) return;

        const visitInfo = window.OSLabStorage.Cookie.recordVisit();
        const dismissed = window.OSLabStorage.Cookie.get("oslab_banner_dismissed");

        // Display notice if not explicitly dismissed
        if (!dismissed) {
            const banner = document.createElement("div");
            banner.id = "oslab-cookie-banner";
            banner.className = "cookie-banner";
            banner.setAttribute("role", "region");
            banner.setAttribute("aria-label", "Cookie notice");

            const visitText = visitInfo.isFirstVisit
                ? "Welcome to OS Lab! We use cookies to remember your visits and local preferences."
                : `Welcome back! (Visit #${visitInfo.visitCount}). We store small non-sensitive preferences in cookies and localStorage.`;

            // Styles live in css/navbar.css so the banner follows the light theme
            banner.innerHTML = `
                <div class="cookie-banner-text">
                    <span class="cookie-banner-icon" aria-hidden="true">🍪</span>
                    <span>${visitText}</span>
                </div>
                <div class="cookie-banner-actions">
                    <button type="button" id="oslab-cookie-accept" class="cookie-btn cookie-btn-primary">Acknowledge</button>
                    <button type="button" id="oslab-cookie-clear" class="cookie-btn cookie-btn-ghost">Reset Cookies</button>
                </div>
            `;

            document.body.appendChild(banner);

            const acceptBtn = document.getElementById("oslab-cookie-accept");
            if (acceptBtn) {
                acceptBtn.onclick = () => {
                    window.OSLabStorage.Cookie.set("oslab_banner_dismissed", "true", 30);
                    banner.remove();
                };
            }

            const clearBtn = document.getElementById("oslab-cookie-clear");
            if (clearBtn) {
                clearBtn.onclick = () => {
                    window.OSLabStorage.Cookie.clearAll();
                    banner.remove();
                    window.OSLabStorage.showToast("All OS Lab cookies cleared successfully.", "info");
                };
            }
        }
    }

    /* =========================================================
       4. FETCH JSON MODULE CONFIGURATION WITH ASYNC/AWAIT
       ========================================================= */
    window.OSLabModules = null;

    /**
     * Fallback #2: load data/modules-config.js with a <script> tag.
     * Browsers block fetch()/XHR to local files under the file:// protocol,
     * but <script src> to a local file is still allowed, so this works
     * when the user opens the HTML pages directly from disk.
     */
    function loadModuleConfigViaScriptTag() {
        return new Promise((resolve, reject) => {
            // Reuse the global if the script tag has already run once
            if (window.OSLabModuleConfig && Array.isArray(window.OSLabModuleConfig.modules)) {
                window.OSLabModules = window.OSLabModuleConfig.modules;
                return resolve(window.OSLabModules);
            }

            const script = document.createElement("script");
            script.src = "./data/modules-config.js";
            script.onload = () => {
                if (window.OSLabModuleConfig && Array.isArray(window.OSLabModuleConfig.modules)) {
                    window.OSLabModules = window.OSLabModuleConfig.modules;
                    resolve(window.OSLabModules);
                } else {
                    reject(new Error("modules-config.js loaded but did not define OSLabModuleConfig"));
                }
            };
            script.onerror = () => reject(new Error("Could not load ./data/modules-config.js"));
            document.head.appendChild(script);
        });
    }

    async function loadModuleConfig() {
        // fetch() to a local file is guaranteed to fail on file://,
        // so skip it and go straight to the script-tag loader (no console warning).
        const isFileProtocol = window.location.protocol === "file:";

        if (!isFileProtocol) {
            try {
                const response = await fetch("./data/modules.json");
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                window.OSLabModules = data.modules || [];
                console.log("[OSLab] Loaded modules configuration via Fetch:", window.OSLabModules);
                return window.OSLabModules;
            } catch (err) {
                console.info("[OSLab] Fetch of data/modules.json failed (" + err.message + "), trying script-tag fallback.");
            }
        }

        // Fallback #1: same full data, loaded via <script src="data/modules-config.js">
        try {
            window.OSLabModules = await loadModuleConfigViaScriptTag();
            console.log("[OSLab] Loaded modules configuration via script-tag fallback:", window.OSLabModules);
            return window.OSLabModules;
        } catch (scriptErr) {
            console.warn("[OSLab] Script-tag fallback failed, using minimal hardcoded list:", scriptErr);
        }

        // Fallback #2 (last resort): minimal hardcoded configuration
        window.OSLabModules = [
            { id: "page-replacement", name: "Page Replacement" },
            { id: "cpu-scheduling", name: "CPU Scheduling" },
            { id: "disk-scheduling", name: "Disk Scheduling" },
            { id: "memory-allocation", name: "Memory Allocation" }
        ];
        return window.OSLabModules;
    }

    /* =========================================================
       INITIALIZE ON DOM CONTENT LOADED
       ========================================================= */
    document.addEventListener("DOMContentLoaded", () => {
        registerServiceWorker();
        initThemeToggle();
        initCookieNotice();
        loadModuleConfig();
    });
})();
