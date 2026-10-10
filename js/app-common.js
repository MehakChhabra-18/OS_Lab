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

        const toggles = document.querySelectorAll(".theme-toggle");
        toggles.forEach((btn) => {
            btn.style.cursor = "pointer";
            btn.onclick = () => {
                if (window.OSLabStorage) {
                    const newTheme = window.OSLabStorage.Local.toggleTheme();
                    window.OSLabStorage.showToast(`Theme switched to ${newTheme} mode`, "info");
                }
            };
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
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #0d1b33;
                border-top: 1px solid #233b66;
                padding: 12px 24px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                z-index: 9999;
                font-size: 13px;
                color: #c5d6f8;
                box-shadow: 0 -4px 16px rgba(0,0,0,0.4);
            `;

            const visitText = visitInfo.isFirstVisit
                ? "Welcome to OS Lab! We use cookies to remember your visits and local preferences."
                : `Welcome back! (Visit #${visitInfo.visitCount}). We store small non-sensitive preferences in cookies and localStorage.`;

            banner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">🍪</span>
                    <span>${visitText}</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="oslab-cookie-accept" style="
                        background: #3b82f6;
                        color: #ffffff;
                        border: none;
                        padding: 6px 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 12px;
                    ">Acknowledge</button>
                    <button id="oslab-cookie-clear" style="
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #334155;
                        padding: 5px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Reset Cookies</button>
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

    async function loadModuleConfig() {
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
            console.warn("[OSLab] Could not load data/modules.json via fetch, using fallback:", err);
            // Fallback hardcoded configuration if fetch is blocked (e.g. file:// protocol)
            window.OSLabModules = [
                { id: "page-replacement", name: "Page Replacement" },
                { id: "cpu-scheduling", name: "CPU Scheduling" },
                { id: "disk-scheduling", name: "Disk Scheduling" },
                { id: "memory-allocation", name: "Memory Allocation" }
            ];
            return window.OSLabModules;
        }
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
