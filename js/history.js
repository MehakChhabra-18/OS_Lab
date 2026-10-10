/**
 * OS Lab — Simulation History Controller
 * Implements complete CRUD operations for persisted simulation records.
 * Secure DOM manipulation using textContent to prevent XSS.
 */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // DOM Elements
    const historyContainer = document.getElementById("historyContainer");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const filterTabs = document.querySelectorAll(".filter-tab");
    const clearAllBtn = document.getElementById("clearAllBtn");

    // Stats
    const statTotal = document.getElementById("statTotal");
    const statPage = document.getElementById("statPage");
    const statCpu = document.getElementById("statCpu");
    const statDisk = document.getElementById("statDisk");
    const statMemory = document.getElementById("statMemory");

    // Edit Modal
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const editIdInput = document.getElementById("editId");
    const editTitleInput = document.getElementById("editTitle");
    const editNotesInput = document.getElementById("editNotes");
    const closeEditModalBtn = document.getElementById("closeEditModal");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    // Details Modal
    const detailsModal = document.getElementById("detailsModal");
    const detailsTitle = document.getElementById("detailsTitle");
    const detailsJson = document.getElementById("detailsJson");
    const closeDetailsModalBtn = document.getElementById("closeDetailsModal");
    const closeDetailsBtn = document.getElementById("closeDetailsBtn");

    // State
    let allRecords = [];
    let currentFilter = "all";
    let searchQuery = "";

    /* =========================================================
       1. LOAD AND READ RECORDS (READ OPERATION)
       ========================================================= */
    async function loadRecords() {
        if (!window.OSLabStorage || !window.OSLabStorage.DB) {
            console.error("Storage layer not found.");
            return;
        }

        try {
            // Colors come from css/history.css (.history-status*) so they follow the theme
            historyContainer.innerHTML = "<p class='history-status' style='text-align: center; padding: 20px;'>Loading simulation records...</p>";
            allRecords = await window.OSLabStorage.DB.getAll();
            updateStats(allRecords);
            renderRecords();
        } catch (err) {
            console.error("Failed to load records:", err);
            historyContainer.innerHTML = `<p class='history-status history-status-error' style='text-align: center; padding: 20px;'>Failed to load simulations from IndexedDB: ${err.message}</p>`;
        }
    }

    /* =========================================================
       2. STATS CALCULATION
       ========================================================= */
    function updateStats(records) {
        let total = records.length;
        let pageCount = 0;
        let cpuCount = 0;
        let diskCount = 0;
        let memoryCount = 0;

        for (const r of records) {
            const m = (r.module || "").toLowerCase();
            if (m.includes("page")) pageCount++;
            else if (m.includes("cpu")) cpuCount++;
            else if (m.includes("disk")) diskCount++;
            else if (m.includes("memory")) memoryCount++;
        }

        statTotal.textContent = String(total);
        statPage.textContent = String(pageCount);
        statCpu.textContent = String(cpuCount);
        statDisk.textContent = String(diskCount);
        statMemory.textContent = String(memoryCount);
    }

    /* =========================================================
       3. RENDER RECORDS (SECURE DOM CREATION)
       ========================================================= */
    function renderRecords() {
        // Filter logic
        let filtered = allRecords.filter((record) => {
            const matchesFilter =
                currentFilter === "all" ||
                (record.module || "").toLowerCase() === currentFilter.toLowerCase();

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !query ||
                (record.title || "").toLowerCase().includes(query) ||
                (record.algorithm || "").toLowerCase().includes(query) ||
                (record.notes || "").toLowerCase().includes(query) ||
                (record.module || "").toLowerCase().includes(query);

            return matchesFilter && matchesSearch;
        });

        historyContainer.innerHTML = "";

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            return;
        } else {
            emptyState.style.display = "none";
        }

        filtered.forEach((rec) => {
            const card = document.createElement("div");
            card.className = "history-card";

            // Header Row
            const cardTop = document.createElement("div");
            cardTop.className = "card-top";

            const cardMeta = document.createElement("div");
            cardMeta.className = "card-meta";

            const badge = document.createElement("span");
            badge.className = "module-badge";
            const modLower = (rec.module || "").toLowerCase();
            if (modLower.includes("page")) badge.classList.add("badge-page");
            else if (modLower.includes("cpu")) badge.classList.add("badge-cpu");
            else if (modLower.includes("disk")) badge.classList.add("badge-disk");
            else badge.classList.add("badge-memory");
            badge.textContent = rec.module || "General";

            const algoTag = document.createElement("span");
            algoTag.className = "algo-tag";
            algoTag.textContent = (rec.algorithm || "").toUpperCase();

            const dateSpan = document.createElement("span");
            dateSpan.className = "card-date";
            const dateObj = new Date(rec.createdAt || Date.now());
            dateSpan.textContent = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            cardMeta.appendChild(badge);
            cardMeta.appendChild(algoTag);
            cardMeta.appendChild(dateSpan);
            cardTop.appendChild(cardMeta);

            // Title Row
            const titleRow = document.createElement("div");
            titleRow.className = "card-title-row";
            const titleHeading = document.createElement("h3");
            titleHeading.textContent = rec.title || `${rec.module} - ${rec.algorithm}`;
            titleRow.appendChild(titleHeading);

            // Body Grid: Inputs & Results
            const bodyGrid = document.createElement("div");
            bodyGrid.className = "card-body-grid";

            // Input Item
            const inputItem = document.createElement("div");
            inputItem.className = "body-item";
            const inputLabel = document.createElement("strong");
            inputLabel.textContent = "Input Parameters";
            const inputVal = document.createElement("p");
            inputVal.textContent = formatInputSummary(rec.module, rec.input);
            inputItem.appendChild(inputLabel);
            inputItem.appendChild(inputVal);

            // Result Item
            const resultItem = document.createElement("div");
            resultItem.className = "body-item";
            const resultLabel = document.createElement("strong");
            resultLabel.textContent = "Execution Results";
            const resultVal = document.createElement("p");
            resultVal.textContent = formatResultSummary(rec.module, rec.result);
            resultItem.appendChild(resultLabel);
            resultItem.appendChild(resultVal);

            bodyGrid.appendChild(inputItem);
            bodyGrid.appendChild(resultItem);

            // Notes Section
            let notesElem = null;
            if (rec.notes && rec.notes.trim()) {
                notesElem = document.createElement("div");
                notesElem.className = "card-notes";
                notesElem.textContent = "“" + rec.notes + "”";
            }

            // Actions Row
            const actionsRow = document.createElement("div");
            actionsRow.className = "card-actions";

            const viewBtn = document.createElement("button");
            viewBtn.className = "btn btn-outline btn-sm";
            viewBtn.textContent = "🔍 View Full Details";
            viewBtn.onclick = () => openDetailsModal(rec);

            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-outline btn-sm";
            editBtn.textContent = "✏️ Edit Notes";
            editBtn.onclick = () => openEditModal(rec);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-danger btn-sm";
            deleteBtn.textContent = "🗑 Delete";
            deleteBtn.onclick = () => handleDeleteRecord(rec.id);

            actionsRow.appendChild(viewBtn);
            actionsRow.appendChild(editBtn);
            actionsRow.appendChild(deleteBtn);

            // Assemble Card
            card.appendChild(cardTop);
            card.appendChild(titleRow);
            card.appendChild(bodyGrid);
            if (notesElem) card.appendChild(notesElem);
            card.appendChild(actionsRow);

            historyContainer.appendChild(card);
        });
    }

    /* Helper: Summarize inputs based on module */
    function formatInputSummary(module, input) {
        if (!input || Object.keys(input).length === 0) return "N/A";
        const m = (module || "").toLowerCase();
        if (m.includes("page")) {
            return `Ref: "${input.referenceString || 'N/A'}" | Frames: ${input.frameCount || 'N/A'}`;
        } else if (m.includes("cpu")) {
            return `Processes: ${input.processCount || (input.processes ? input.processes.length : 'N/A')} | Algo: ${input.algorithm || 'N/A'}`;
        } else if (m.includes("disk")) {
            return `Init Head: ${input.initialHead ?? 'N/A'} | Queue: [${Array.isArray(input.requests) ? input.requests.join(', ') : (input.requestQueue || 'N/A')}]`;
        } else if (m.includes("memory")) {
            return `Blocks: [${input.blocks || 'N/A'}] | Processes: [${input.processes || 'N/A'}]`;
        }
        return JSON.stringify(input);
    }

    /* Helper: Summarize results based on module */
    function formatResultSummary(module, result) {
        if (!result || Object.keys(result).length === 0) return "N/A";
        const m = (module || "").toLowerCase();
        if (m.includes("page")) {
            return `Faults: ${result.pageFaults ?? 'N/A'} | Hits: ${result.pageHits ?? 'N/A'} | Hit Ratio: ${result.hitRatio ?? 'N/A'}`;
        } else if (m.includes("cpu")) {
            return `Avg Turnaround: ${result.avgTurnaround ?? 'N/A'}s | Avg Waiting: ${result.avgWaiting ?? 'N/A'}s`;
        } else if (m.includes("disk")) {
            return `Total Seek: ${result.totalSeek ?? 'N/A'} | Avg Seek: ${result.avgSeek ?? 'N/A'}`;
        } else if (m.includes("memory")) {
            return `Allocated: ${result.allocatedCount ?? 'N/A'} | Unallocated: ${result.unallocatedCount ?? 'N/A'}`;
        }
        return JSON.stringify(result);
    }

    /* =========================================================
       4. UPDATE OPERATION (EDIT TITLE & NOTES)
       ========================================================= */
    function openEditModal(record) {
        editIdInput.value = record.id;
        editTitleInput.value = record.title || "";
        editNotesInput.value = record.notes || "";
        editModal.style.display = "flex";
        editTitleInput.focus();
    }

    function closeEditModal() {
        editModal.style.display = "none";
        editForm.reset();
    }

    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const id = Number(editIdInput.value);
        const title = editTitleInput.value.trim();
        const notes = editNotesInput.value.trim();

        if (!title) {
            window.OSLabStorage.showToast("Title is required", "error");
            return;
        }

        try {
            await window.OSLabStorage.DB.update(id, { title, notes });
            window.OSLabStorage.showToast("Simulation record updated successfully!", "success");
            closeEditModal();
            await loadRecords();
        } catch (err) {
            console.error("Update failed:", err);
            window.OSLabStorage.showToast("Failed to update record: " + err.message, "error");
        }
    });

    closeEditModalBtn.onclick = closeEditModal;
    cancelEditBtn.onclick = closeEditModal;

    /* =========================================================
       5. READ DETAILS MODAL
       ========================================================= */
    function openDetailsModal(record) {
        detailsTitle.textContent = `🔍 ${record.module} (${(record.algorithm || '').toUpperCase()})`;
        detailsJson.textContent = JSON.stringify(record, null, 2);
        detailsModal.style.display = "flex";
    }

    function closeDetailsModal() {
        detailsModal.style.display = "none";
    }

    closeDetailsModalBtn.onclick = closeDetailsModal;
    closeDetailsBtn.onclick = closeDetailsModal;

    /* =========================================================
       6. DELETE OPERATIONS (DELETE SINGLE & CLEAR ALL)
       ========================================================= */
    async function handleDeleteRecord(id) {
        const confirmed = window.confirm("Are you sure you want to delete this simulation record? This action cannot be undone.");
        if (!confirmed) return;

        try {
            await window.OSLabStorage.DB.delete(id);
            window.OSLabStorage.showToast("Simulation deleted successfully.", "info");
            await loadRecords();
        } catch (err) {
            console.error("Delete failed:", err);
            window.OSLabStorage.showToast("Failed to delete record: " + err.message, "error");
        }
    }

    clearAllBtn.addEventListener("click", async function () {
        if (allRecords.length === 0) {
            window.OSLabStorage.showToast("History is already empty.", "info");
            return;
        }

        const confirmed = window.confirm("⚠️ WARNING: This will permanently delete ALL saved simulations from IndexedDB. Continue?");
        if (!confirmed) return;

        try {
            await window.OSLabStorage.DB.clearAll();
            window.OSLabStorage.showToast("All simulation records cleared.", "info");
            await loadRecords();
        } catch (err) {
            console.error("Clear all failed:", err);
            window.OSLabStorage.showToast("Failed to clear records: " + err.message, "error");
        }
    });

    /* =========================================================
       7. FILTERS & SEARCH EVENT LISTENERS
       ========================================================= */
    filterTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            filterTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.getAttribute("data-filter");
            renderRecords();
        });
    });

    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        renderRecords();
    });

    // Close modals on overlay click
    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) closeEditModal();
    });
    detailsModal.addEventListener("click", (e) => {
        if (e.target === detailsModal) closeDetailsModal();
    });

    // Initial Load
    loadRecords();
});
