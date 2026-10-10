/**
 * OS Lab — Unified Storage Architecture
 * Features:
 *  1. Cookies (document.cookie) for visit tracking & preferences
 *  2. localStorage for persistent user preferences & input persistence
 *  3. sessionStorage for temporary session execution state
 *  4. IndexedDB (OSLabDB / simulations) for full CRUD simulation records
 */

(function (root) {
    "use strict";

    /* =========================================================
       1. COOKIES UTILITY
       ========================================================= */
    const CookieStorage = {
        /**
         * Set a cookie with SameSite and Max-Age
         * @param {string} name
         * @param {string} value
         * @param {number} days
         */
        set(name, value, days = 30) {
            const maxAge = days * 24 * 60 * 60;
            const encodedValue = encodeURIComponent(value);
            document.cookie = `${encodeURIComponent(name)}=${encodedValue}; max-age=${maxAge}; path=/; SameSite=Lax`;
        },

        /**
         * Get a cookie value by name
         * @param {string} name
         * @returns {string|null}
         */
        get(name) {
            const prefix = encodeURIComponent(name) + "=";
            const cookies = document.cookie ? document.cookie.split("; ") : [];
            for (const c of cookies) {
                if (c.indexOf(prefix) === 0) {
                    return decodeURIComponent(c.substring(prefix.length));
                }
            }
            return null;
        },

        /**
         * Delete cookie by setting max-age to 0
         * @param {string} name
         */
        remove(name) {
            document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Lax`;
        },

        /**
         * Check and record user visit status
         * @returns {{isFirstVisit: boolean, visitCount: number, lastVisit: string|null}}
         */
        recordVisit() {
            const lastVisit = this.get("oslab_last_visit");
            const rawCount = this.get("oslab_visit_count");
            const visitCount = rawCount ? parseInt(rawCount, 10) + 1 : 1;
            const now = new Date().toISOString();

            this.set("oslab_visited", "true", 60);
            this.set("oslab_last_visit", now, 60);
            this.set("oslab_visit_count", String(visitCount), 60);

            return {
                isFirstVisit: !lastVisit,
                visitCount,
                lastVisit
            };
        },

        /**
         * Clear all OS Lab cookies
         */
        clearAll() {
            this.remove("oslab_visited");
            this.remove("oslab_last_visit");
            this.remove("oslab_visit_count");
            this.remove("oslab_banner_dismissed");
            this.remove("oslab_pref_compact");
        }
    };

    /* =========================================================
       2. LOCAL STORAGE UTILITY
       ========================================================= */
    const LocalPref = {
        get(key, defaultValue = null) {
            try {
                const val = localStorage.getItem(key);
                return val !== null ? JSON.parse(val) : defaultValue;
            } catch (e) {
                console.warn("[LocalPref] Read failed for key:", key, e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn("[LocalPref] Write failed for key:", key, e);
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn("[LocalPref] Remove failed for key:", key, e);
            }
        },

        // Theme management
        getTheme() {
            return this.get("oslab_theme", "dark");
        },

        setTheme(theme) {
            this.set("oslab_theme", theme);
            this.applyTheme(theme);
        },

        applyTheme(theme) {
            const isLight = theme === "light";

            if (isLight) {
                document.documentElement.classList.add("light-theme");
                document.body && document.body.classList.add("light-theme");
            } else {
                document.documentElement.classList.remove("light-theme");
                document.body && document.body.classList.remove("light-theme");
            }

            // Keep the toggle control's glyph, tooltip and accessible name in sync
            const nextModeLabel = isLight ? "Switch to Dark Mode" : "Switch to Light Mode";
            const toggles = document.querySelectorAll(".theme-toggle");
            toggles.forEach(t => {
                t.textContent = isLight ? "☀️" : "☾";
                t.setAttribute("title", nextModeLabel);
                t.setAttribute("aria-label", nextModeLabel);
            });

            // Let canvas/Gantt renderers repaint with the matching palette
            // (they cannot react to a CSS class change on their own)
            try {
                window.dispatchEvent(
                    new CustomEvent("oslab:themechange", {
                        detail: { theme: isLight ? "light" : "dark" }
                    })
                );
            } catch (_) { /* older browsers: visuals keep the last palette */ }
        },

        toggleTheme() {
            const current = this.getTheme();
            const next = current === "light" ? "dark" : "light";
            this.setTheme(next);
            return next;
        },

        // Save module inputs
        saveModuleInputs(moduleKey, inputs) {
            this.set(`oslab_inputs_${moduleKey}`, {
                ...inputs,
                savedAt: new Date().toISOString()
            });
        },

        getModuleInputs(moduleKey) {
            return this.get(`oslab_inputs_${moduleKey}`, null);
        }
    };

    /* =========================================================
       3. SESSION STORAGE UTILITY
       ========================================================= */
    const SessionState = {
        get(key, defaultValue = null) {
            try {
                const val = sessionStorage.getItem(key);
                return val !== null ? JSON.parse(val) : defaultValue;
            } catch (e) {
                console.warn("[SessionState] Read failed for key:", key, e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn("[SessionState] Write failed for key:", key, e);
            }
        },

        remove(key) {
            try {
                sessionStorage.removeItem(key);
            } catch (e) {
                console.warn("[SessionState] Remove failed for key:", key, e);
            }
        },

        saveStep(moduleKey, stepIndex, extra = {}) {
            this.set(`oslab_step_${moduleKey}`, {
                stepIndex,
                ...extra,
                timestamp: Date.now()
            });
        },

        getStep(moduleKey) {
            return this.get(`oslab_step_${moduleKey}`, null);
        },

        clearModuleSession(moduleKey) {
            this.remove(`oslab_step_${moduleKey}`);
        }
    };

    /* =========================================================
       4. INDEXEDDB REUSABLE LAYER (OSLabDB / simulations)
       ========================================================= */
    const DB_NAME = "OSLabDB";
    const DB_VERSION = 1;
    const STORE_NAME = "simulations";

    const SimulationDB = {
        dbInstance: null,

        /**
         * Open and initialize IndexedDB
         * @returns {Promise<IDBDatabase>}
         */
        open() {
            return new Promise((resolve, reject) => {
                if (this.dbInstance) {
                    return resolve(this.dbInstance);
                }

                if (!("indexedDB" in window)) {
                    return reject(new Error("IndexedDB is not supported in this browser."));
                }

                const request = window.indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const store = db.createObjectStore(STORE_NAME, {
                            keyPath: "id",
                            autoIncrement: true
                        });
                        store.createIndex("module", "module", { unique: false });
                        store.createIndex("algorithm", "algorithm", { unique: false });
                        store.createIndex("createdAt", "createdAt", { unique: false });
                    }
                };

                request.onsuccess = (event) => {
                    this.dbInstance = event.target.result;
                    resolve(this.dbInstance);
                };

                request.onerror = (event) => {
                    console.error("[SimulationDB] Error opening DB:", event.target.error);
                    reject(event.target.error);
                };
            });
        },

        /**
         * CREATE: Save a new simulation
         * @param {Object} data
         * @returns {Promise<number>} the new auto-increment ID
         */
        async add(data) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], "readwrite");
                const store = tx.objectStore(STORE_NAME);

                const record = {
                    module: data.module || "Unknown",
                    algorithm: data.algorithm || "Default",
                    title: data.title ? String(data.title).trim() : `${data.module} - ${data.algorithm}`,
                    notes: data.notes ? String(data.notes).trim() : "",
                    input: data.input || {},
                    result: data.result || {},
                    createdAt: data.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const request = store.add(record);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },

        /**
         * READ: Get all simulations
         * @returns {Promise<Array>}
         */
        async getAll() {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], "readonly");
                const store = tx.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const records = request.result || [];
                    // Return descending by creation date
                    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    resolve(records);
                };
                request.onerror = () => reject(request.error);
            });
        },

        /**
         * READ: Get single simulation by ID
         * @param {number} id
         * @returns {Promise<Object>}
         */
        async getById(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], "readonly");
                const store = tx.objectStore(STORE_NAME);
                const request = store.get(Number(id));

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });
        },

        /**
         * UPDATE: Modify title, notes or metadata
         * @param {number} id
         * @param {Object} updates
         * @returns {Promise<Object>}
         */
        async update(id, updates) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], "readwrite");
                const store = tx.objectStore(STORE_NAME);
                const getReq = store.get(Number(id));

                getReq.onsuccess = () => {
                    const existing = getReq.result;
                    if (!existing) {
                        return reject(new Error(`Record with id ${id} not found.`));
                    }

                    const updated = {
                        ...existing,
                        ...updates,
                        id: Number(id),
                        updatedAt: new Date().toISOString()
                    };

                    const putReq = store.put(updated);
                    putReq.onsuccess = () => resolve(updated);
                    putReq.onerror = () => reject(putReq.error);
                };

                getReq.onerror = () => reject(getReq.error);
            });
        },

        /**
         * DELETE: Remove record by ID
         * @param {number} id
         * @returns {Promise<boolean>}
         */
        async delete(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], "readwrite");
                const store = tx.objectStore(STORE_NAME);
                const request = store.delete(Number(id));

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        },

        /**
         * DELETE ALL: Clear entire object store
         * @returns {Promise<boolean>}
         */
        async clearAll() {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], "readwrite");
                const store = tx.objectStore(STORE_NAME);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        }
    };

    /* =========================================================
       5. USER NOTIFICATION / TOAST UTILITY
       ========================================================= */
    function showToast(message, type = "info") {
        let container = document.getElementById("oslab-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "oslab-toast-container";
            container.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `oslab-toast oslab-toast-${type}`;

        const colors = {
            success: { bg: "#0f3a2a", border: "#2ebd85", text: "#a3f7cb" },
            error: { bg: "#3d131a", border: "#e54861", text: "#ffb4bf" },
            info: { bg: "#152642", border: "#3d7bf0", text: "#bfdbfe" }
        };

        const theme = colors[type] || colors.info;

        toast.style.cssText = `
            background: ${theme.bg};
            border: 1px solid ${theme.border};
            color: ${theme.text};
            padding: 12px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 260px;
            max-width: 380px;
            animation: oslabToastIn 0.25s ease-out;
        `;

        const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
        const iconSpan = document.createElement("span");
        iconSpan.textContent = icon;
        iconSpan.style.fontWeight = "bold";

        const textSpan = document.createElement("span");
        textSpan.textContent = message;
        textSpan.style.flex = "1";

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.style.cssText = `
            background: transparent;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 0 4px;
        `;
        closeBtn.onclick = () => toast.remove();

        toast.appendChild(iconSpan);
        toast.appendChild(textSpan);
        toast.appendChild(closeBtn);
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Expose onto root/window
    root.OSLabStorage = {
        Cookie: CookieStorage,
        Local: LocalPref,
        Session: SessionState,
        DB: SimulationDB,
        showToast
    };

    // Auto-apply stored theme immediately on script load
    try {
        const savedTheme = LocalPref.getTheme();
        LocalPref.applyTheme(savedTheme);
    } catch (_) {}

})(typeof window !== "undefined" ? window : globalThis);
