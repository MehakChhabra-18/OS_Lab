console.log("script.js loaded");

const simulateButton = document.getElementById("simulateBtn");
const resetButton = document.getElementById("resetBtn");
const saveSimBtn = document.getElementById("saveSimBtn");

const referenceInput = document.getElementById("referenceString");
const frameInput = document.getElementById("frameCount");
const algorithmInput = document.getElementById("algorithm");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const speedControl = document.getElementById("speedControl");
const speedValue = document.getElementById("speedValue");

const principleTitle = document.getElementById("principleTitle");
const principleText = document.getElementById("principleText");

let simulationHistory = [];
let currentStep = -1;
let currentFrameCount = 0;
let currentAlgorithm = "";
let currentReferencePages = [];

/* =========================================================
   LOCAL STORAGE: RESTORE SAVED INPUTS ON LOAD
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    if (window.OSLabStorage && window.OSLabStorage.Local) {
        const savedInputs = window.OSLabStorage.Local.getModuleInputs("page_replacement");
        if (savedInputs) {
            if (savedInputs.referenceString && !referenceInput.value) {
                referenceInput.value = savedInputs.referenceString;
            }
            if (savedInputs.frameCount && !frameInput.value) {
                frameInput.value = savedInputs.frameCount;
            }
            if (savedInputs.algorithm) {
                algorithmInput.value = savedInputs.algorithm;
                updatePrinciple(savedInputs.algorithm);
            }
        }
    }
});

/* =========================================================
   WEB WORKER COMPUTATION DISPATCHER (WITH SYNC FALLBACK)
   ========================================================= */
function computeWithWorker(algorithm, referencePages, frameCount) {
    return new Promise((resolve) => {
        // Synchronous fallback helper
        function fallbackSync() {
            console.log("[Page Replacement] Running computation synchronously (fallback)");
            let res;
            if (algorithm === "fifo") res = (typeof fifo === "function" ? fifo : window.fifo)(referencePages, frameCount);
            else if (algorithm === "lru") res = (typeof lru === "function" ? lru : window.lru)(referencePages, frameCount);
            else if (algorithm === "optimal") res = (typeof optimal === "function" ? optimal : window.optimal)(referencePages, frameCount);
            else if (algorithm === "lfu") res = (typeof lfu === "function" ? lfu : window.lfu)(referencePages, frameCount);
            resolve(res);
        }

        if (typeof Worker === "undefined") {
            return fallbackSync();
        }

        try {
            const worker = new Worker("js/workers/algorithm-worker.js");
            const timeout = setTimeout(() => {
                worker.terminate();
                console.warn("[Page Replacement Worker] Timeout! Reverting to sync fallback.");
                fallbackSync();
            }, 3000);

            worker.onmessage = function (e) {
                clearTimeout(timeout);
                worker.terminate();
                if (e.data && e.data.success) {
                    console.log("[Page Replacement Worker] Result computed off-thread successfully:", e.data.result);
                    resolve(e.data.result);
                } else {
                    console.warn("[Page Replacement Worker] Worker returned error, using fallback:", e.data ? e.data.error : "Unknown");
                    fallbackSync();
                }
            };

            worker.onerror = function (err) {
                clearTimeout(timeout);
                worker.terminate();
                console.warn("[Page Replacement Worker] Worker error, using fallback:", err.message);
                fallbackSync();
            };

            worker.postMessage({
                id: Date.now(),
                type: "PAGE_REPLACEMENT",
                algorithm: algorithm,
                payload: {
                    referencePages: referencePages,
                    frameCount: frameCount
                }
            });
        } catch (workerErr) {
            console.warn("[Page Replacement Worker] Could not start worker (e.g. file:// restriction). Using sync:", workerErr);
            fallbackSync();
        }
    });
}

/* =========================================================
   SIMULATE
   ========================================================= */
simulateButton.addEventListener("click", async function () {
    console.log("SIMULATE BUTTON CLICKED");

    const referenceString = referenceInput.value.trim();
    const frameCount = Number(frameInput.value);
    const algorithm = algorithmInput.value;

    if (referenceString === "") {
        alert("Please enter a reference string.");
        return;
    }

    if (!frameCount || frameCount < 1) {
        alert("Please enter a valid number of frames.");
        return;
    }

    const referencePages = referenceString
        .split(/\s+/)
        .map(Number);

    if (referencePages.some(page => isNaN(page))) {
        alert("Reference string should contain numbers only.");
        return;
    }

    // Persist user inputs in localStorage
    if (window.OSLabStorage && window.OSLabStorage.Local) {
        window.OSLabStorage.Local.saveModuleInputs("page_replacement", {
            referenceString,
            frameCount,
            algorithm
        });
    }

    // Compute via Web Worker (or synchronous fallback)
    const result = await computeWithWorker(algorithm, referencePages, frameCount);

    if (!result || !result.history) {
        alert("Algorithm calculation failed.");
        return;
    }

    console.log("Simulation Result:", result);

    simulationHistory = result.history;
    currentReferencePages = referencePages;
    currentStep = -1;
    currentFrameCount = frameCount;
    currentAlgorithm = algorithm;

    displayReferenceString(referencePages);
    clearHistory();
    hideResults();
    clearCanvas();
    resetStepInfo();
    updatePrinciple(algorithm);

    previousBtn.disabled = true;
    nextBtn.disabled = false;

    // Enable Save Simulation button
    if (saveSimBtn) {
        saveSimBtn.style.display = "block";
    }

    // Reset session step
    if (window.OSLabStorage && window.OSLabStorage.Session) {
        window.OSLabStorage.Session.saveStep("page_replacement", 0);
    }
});

/* =========================================================
   SAVE SIMULATION TO INDEXEDDB (CRUD CREATE)
   ========================================================= */
if (saveSimBtn) {
    saveSimBtn.addEventListener("click", async function () {
        if (!simulationHistory || simulationHistory.length === 0) {
            alert("No simulation data to save. Please run a simulation first.");
            return;
        }

        let faults = 0;
        let hits = 0;
        simulationHistory.forEach(step => {
            if (step.result === "Fault") faults++;
            else hits++;
        });
        const hitRatio = ((hits / simulationHistory.length) * 100).toFixed(2) + "%";

        const defaultTitle = `${currentAlgorithm.toUpperCase()} (${currentFrameCount} Frames, ${simulationHistory.length} Pages)`;
        const title = prompt("Enter a title for this simulation record:", defaultTitle);
        if (title === null) return; // User cancelled

        const notes = prompt("Enter any notes or observations (optional):", "") || "";

        try {
            await window.OSLabStorage.DB.add({
                module: "Page Replacement",
                algorithm: currentAlgorithm.toUpperCase(),
                title: title.trim() || defaultTitle,
                notes: notes.trim(),
                input: {
                    referenceString: referenceInput.value.trim(),
                    frameCount: currentFrameCount,
                    totalReferences: currentReferencePages.length
                },
                result: {
                    pageFaults: faults,
                    pageHits: hits,
                    hitRatio: hitRatio,
                    totalSteps: simulationHistory.length
                }
            });

            if (window.OSLabStorage && window.OSLabStorage.showToast) {
                window.OSLabStorage.showToast("Simulation saved to history successfully!", "success");
            } else {
                alert("Simulation saved to history!");
            }
        } catch (err) {
            console.error("Save simulation failed:", err);
            alert("Could not save simulation: " + err.message);
        }
    });
}

/* =========================================================
   NEXT & PREVIOUS
   ========================================================= */
nextBtn.addEventListener("click", function () {
    if (currentStep < simulationHistory.length - 1) {
        showStep(currentStep + 1);
    }
});

previousBtn.addEventListener("click", function () {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
});

/* =========================================================
   SHOW STEP (PERSISTS TO SESSIONSTORAGE)
   ========================================================= */
function showStep(index) {
    if (index < 0 || index >= simulationHistory.length) {
        return;
    }

    currentStep = index;

    // Track active simulation step in sessionStorage
    if (window.OSLabStorage && window.OSLabStorage.Session) {
        window.OSLabStorage.Session.saveStep("page_replacement", index);
    }

    const step = simulationHistory[index];

    drawFrames(step.frames, currentFrameCount);
    updateStepInfo(step, index, simulationHistory.length, currentFrameCount, currentAlgorithm);
    highlightReferencePage(index);
    displayHistoryUntil(simulationHistory, index);

    previousBtn.disabled = index === 0;
    nextBtn.disabled = index === simulationHistory.length - 1;

    if (index === simulationHistory.length - 1) {
        showFinalResults(simulationHistory);
    } else {
        hideResults();
    }
}

/* =========================================================
   SPEED CONTROL
   ========================================================= */
speedControl.addEventListener("input", function () {
    speedValue.textContent = speedControl.value + "s";
});

/* =========================================================
   ALGORITHM PRINCIPLES & SELECTION
   ========================================================= */
algorithmInput.addEventListener("change", function () {
    updatePrinciple(algorithmInput.value);
});

function updatePrinciple(algorithm) {
    if (algorithm === "fifo") {
        principleTitle.textContent = "FIFO Principle";
        principleText.textContent = "When a page fault occurs and all frames are full, the page that has been in memory the longest (first in) is removed (first out).";
    } else if (algorithm === "lru") {
        principleTitle.textContent = "LRU Principle";
        principleText.textContent = "When a page fault occurs and all frames are full, the page that has not been used for the longest time is removed.";
    } else if (algorithm === "optimal") {
        principleTitle.textContent = "Optimal Principle";
        principleText.textContent = "When a page fault occurs and all frames are full, the page whose next use is farthest in the future is replaced.";
    } else if (algorithm === "lfu") {
        principleTitle.textContent = "LFU Principle";
        principleText.textContent = "When a page fault occurs and all frames are full, the page with the lowest usage frequency is replaced. If frequencies are equal, the least recently used page is replaced.";
    }
}

/* =========================================================
   RESET
   ========================================================= */
resetButton.addEventListener("click", function () {
    console.log("RESET CLICKED");

    simulationHistory = [];
    currentStep = -1;
    currentFrameCount = 0;
    currentAlgorithm = "";
    currentReferencePages = [];

    referenceInput.value = "";
    frameInput.value = "";
    algorithmInput.value = "fifo";

    clearCanvas();
    clearHistory();
    if (typeof referenceDisplay !== "undefined" && referenceDisplay) {
        referenceDisplay.innerHTML = "";
    }

    resetStepInfo();
    hideResults();

    previousBtn.disabled = true;
    nextBtn.disabled = true;

    if (saveSimBtn) {
        saveSimBtn.style.display = "none";
    }

    // Clear session step
    if (window.OSLabStorage && window.OSLabStorage.Session) {
        window.OSLabStorage.Session.clearModuleSession("page_replacement");
    }

    principleTitle.textContent = "FIFO Principle";
    principleText.textContent = "When a page fault occurs and all frames are full, the page that has been in memory the longest (first in) is removed (first out).";
});