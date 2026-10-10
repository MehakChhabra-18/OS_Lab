/**
 * CPU Scheduling Controller & Orchestrator
 * Coordinates UI inputs, dispatches scheduling algorithms,
 * and synchronizes canvas Gantt, timeline, step execution, and results.
 */

document.addEventListener("DOMContentLoaded", function () {
    /* =========================================================
       DOM ELEMENTS
    ========================================================= */
    const algorithmSelect = document.getElementById("algorithm");
    const processCountInput = document.getElementById("processCount");
    const processInputs = document.getElementById("processInputs");
    const processHeader = document.querySelector(".process-header");
    const quantumContainer = document.getElementById("quantumContainer");
    const timeQuantumInput = document.getElementById("timeQuantum");

    const simulateBtn = document.getElementById("simulateBtn");
    const resetBtn = document.getElementById("resetBtn");
    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");

    const principleTitle = document.getElementById("principleTitle");
    const principleText = document.getElementById("principleText");
    const rrQueueContainer = document.getElementById("rrQueueContainer");
    const saveSimBtn = document.getElementById("saveSimBtn");

    /* =========================================================
       STATE
    ========================================================= */
    window.currentSimulation = null;
    let currentStep = 0;
    let totalSteps = 0;

    /* =========================================================
       ALGORITHM PRINCIPLES
    ========================================================= */
    const principles = {
        fcfs: {
            title: "💡 FCFS (First Come First Serve)",
            text: "In FCFS, processes are executed strictly in the order of their arrival. The first process to arrive is given the CPU and executes non-preemptively until completion."
        },
        sjf: {
            title: "💡 SJF (Shortest Job First)",
            text: "In non-preemptive SJF, the CPU is allocated to the arrived process with the smallest CPU burst time. Ties are broken by arrival time. Once running, it cannot be interrupted."
        },
        srtf: {
            title: "💡 SRTF (Shortest Remaining Time First)",
            text: "SRTF is the preemptive version of SJF. At each point in time, the CPU executes the process with the shortest remaining burst time. A newly arrived shorter job will preempt the running process."
        },
        priority: {
            title: "💡 Priority Scheduling (Non-Preemptive)",
            text: "Processes are scheduled according to assigned priority. Lower numerical value indicates higher priority (e.g., 1 is higher priority than 2). Ties are broken by arrival time. Non-preemptive."
        },
        roundrobin: {
            title: "💡 Round Robin (RR)",
            text: "Each process is allocated a fixed time slice (Time Quantum). Processes execute cyclically from a FIFO ready queue. If a process does not complete within its quantum, it is preempted."
        }
    };

    function updatePrinciple(algo) {
        const info = principles[algo] || principles.fcfs;
        if (principleTitle) principleTitle.textContent = info.title;
        if (principleText) principleText.textContent = info.text;
    }

    /* =========================================================
       PROCESS INPUT GENERATION
    ========================================================= */
    function createProcessInputs() {
        const count = parseInt(processCountInput.value, 10);
        if (isNaN(count) || count < 1) return;

        const isPriority = algorithmSelect.value === "priority";

        // Update Header
        if (processHeader) {
            if (isPriority) {
                processHeader.classList.add("has-priority");
                processHeader.innerHTML = `
                    <span>Process ID</span>
                    <span>Arrival Time (AT)</span>
                    <span>Burst Time (BT)</span>
                    <span>Priority</span>
                `;
            } else {
                processHeader.classList.remove("has-priority");
                processHeader.innerHTML = `
                    <span>Process ID</span>
                    <span>Arrival Time (AT)</span>
                    <span>Burst Time (BT)</span>
                `;
            }
        }

        processInputs.innerHTML = "";

        const defaultAT = [0, 1, 2, 3];
        const defaultBT = [5, 3, 4, 2];
        const defaultPri = [2, 1, 3, 4];

        for (let i = 1; i <= count; i++) {
            const row = document.createElement("div");
            row.className = "process-row" + (isPriority ? " has-priority" : "");

            const atVal = defaultAT[i - 1] !== undefined ? defaultAT[i - 1] : i - 1;
            const btVal = defaultBT[i - 1] !== undefined ? defaultBT[i - 1] : 2;
            const priVal = defaultPri[i - 1] !== undefined ? defaultPri[i - 1] : i;

            let rowHTML = `
                <span><strong>P${i}</strong></span>
                <input type="number" class="arrival-input" value="${atVal}" min="0">
                <input type="number" class="burst-input" value="${btVal}" min="1">
            `;

            if (isPriority) {
                rowHTML += `<input type="number" class="priority-input" value="${priVal}" min="1">`;
            }

            row.innerHTML = rowHTML;
            processInputs.appendChild(row);
        }
    }

    /* =========================================================
       READING PROCESS DATA FROM UI
    ========================================================= */
    function getProcessesFromUI() {
        const rows = processInputs.children;
        const processes = [];
        const isPriority = algorithmSelect.value === "priority";

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const arrivalInput = row.querySelector(".arrival-input");
            const burstInput = row.querySelector(".burst-input");
            const priorityInput = row.querySelector(".priority-input");

            const arrivalVal = arrivalInput ? arrivalInput.value.trim() : "";
            const burstVal = burstInput ? burstInput.value.trim() : "";

            if (arrivalVal === "" || burstVal === "") {
                alert(`Please enter both Arrival Time and Burst Time for P${i + 1}.`);
                return null;
            }

            const at = Number(arrivalVal);
            const bt = Number(burstVal);

            if (isNaN(at) || at < 0) {
                alert(`Arrival Time for P${i + 1} must be a non-negative number.`);
                return null;
            }

            if (isNaN(bt) || bt <= 0) {
                alert(`Burst Time for P${i + 1} must be greater than 0.`);
                return null;
            }

            const processObj = {
                id: `P${i + 1}`,
                arrivalTime: at,
                burstTime: bt
            };

            if (isPriority && priorityInput) {
                const priVal = priorityInput.value.trim();
                const pri = Number(priVal);
                if (priVal === "" || isNaN(pri)) {
                    alert(`Please enter a valid Priority for P${i + 1}.`);
                    return null;
                }
                processObj.priority = pri;
            }

            processes.push(processObj);
        }

        return processes;
    }

    /* =========================================================
       ALGORITHM SELECTION & QUANTUM TOGGLE
    ========================================================= */
    function onAlgorithmChange() {
        const algo = algorithmSelect.value;

        // Toggle Quantum Container and Round Robin Queues
        if (algo === "roundrobin") {
            quantumContainer.style.display = "block";
            if (rrQueueContainer) rrQueueContainer.style.display = "block";
        } else {
            quantumContainer.style.display = "none";
            if (rrQueueContainer) rrQueueContainer.style.display = "none";
        }

        // Update Principle card
        updatePrinciple(algo);

        // Regenerate inputs to show/hide priority
        createProcessInputs();

        // Reset any existing simulation views
        resetSimulationState();
    }

    /* =========================================================
       SIMULATE FLOW
    ========================================================= */
    function handleSimulate() {
        const processes = getProcessesFromUI();
        if (!processes || processes.length === 0) return;

        const algo = algorithmSelect.value;
        let result = null;

        if (algo === "fcfs") {
            const fn = typeof fcfs === "function" ? fcfs : window.fcfs;
            if (!fn) { alert("FCFS module is not loaded."); return; }
            result = fn(processes);
        } else if (algo === "sjf") {
            const fn = typeof sjf === "function" ? sjf : window.sjf;
            if (!fn) { alert("SJF module is not loaded."); return; }
            result = fn(processes);
        } else if (algo === "srtf") {
            const fn = typeof srtf === "function" ? srtf : window.srtf;
            if (!fn) { alert("SRTF module is not loaded."); return; }
            result = fn(processes);
        } else if (algo === "priority") {
            const fn = typeof priority === "function" ? priority : window.priority;
            if (!fn) { alert("Priority module is not loaded."); return; }
            result = fn(processes);
        } else if (algo === "roundrobin") {
            const q = Number(timeQuantumInput.value);
            if (isNaN(q) || q < 1) {
                alert("Time Quantum must be an integer >= 1.");
                return;
            }
            const fn = typeof roundrobin === "function" ? roundrobin : (typeof roundRobin === "function" ? roundRobin : (window.roundrobin || window.roundRobin));
            if (!fn) { alert("Round Robin module is not loaded."); return; }
            result = fn(processes, q);
        } else {
            alert("Selected algorithm is not supported.");
            return;
        }

        // Store result globally
        window.currentSimulation = result;
        currentStep = 0;
        totalSteps = result.gantt.length;

        // Populate results table and metrics
        displayResults(result);

        // Reset interactive visualizers to step 0
        clearGantt();
        clearTimeline();
        resetStepExecution(totalSteps);

        // If Round Robin, show two-queue view and render initial step
        if (algo === "roundrobin") {
            if (rrQueueContainer) rrQueueContainer.style.display = "block";
            if (result.initialStep && typeof renderRoundRobinQueues === "function") {
                renderRoundRobinQueues(result.initialStep);
            }
        } else {
            if (rrQueueContainer) rrQueueContainer.style.display = "none";
        }

        // Update navigation button states
        previousBtn.disabled = true;
        nextBtn.disabled = totalSteps === 0;

        // Show Save Simulation button
        if (saveSimBtn) saveSimBtn.style.display = "block";

        // Persist to localStorage & sessionStorage
        if (window.OSLabStorage) {
            window.OSLabStorage.Local.saveModuleInputs("cpu_scheduling", {
                algorithm: algo,
                processCount: processCountInput.value,
                timeQuantum: timeQuantumInput ? timeQuantumInput.value : null
            });
            window.OSLabStorage.Session.saveStep("cpu_scheduling", 0);
        }
    }

    /* =========================================================
       STEP NAVIGATION: NEXT & PREVIOUS
    ========================================================= */
    function handleNext() {
        if (!window.currentSimulation || currentStep >= totalSteps) return;

        currentStep++;

        renderGantt(window.currentSimulation.gantt, currentStep, true);
        renderTimeline(window.currentSimulation.gantt, currentStep);
        updateStepExecution(window.currentSimulation.gantt, currentStep, totalSteps);

        // Update Round Robin Queues if active
        if (window.currentSimulation.steps && window.currentSimulation.steps[currentStep - 1] && typeof renderRoundRobinQueues === "function") {
            renderRoundRobinQueues(window.currentSimulation.steps[currentStep - 1]);
        }

        previousBtn.disabled = false;
        if (currentStep >= totalSteps) {
            nextBtn.disabled = true;
        }

        if (window.OSLabStorage && window.OSLabStorage.Session) {
            window.OSLabStorage.Session.saveStep("cpu_scheduling", currentStep);
        }
    }

    function handlePrevious() {
        if (!window.currentSimulation || currentStep <= 0) return;

        currentStep--;

        if (currentStep === 0) {
            clearGantt();
            clearTimeline();
            resetStepExecution(totalSteps);
            if (window.currentSimulation && window.currentSimulation.initialStep && typeof renderRoundRobinQueues === "function") {
                renderRoundRobinQueues(window.currentSimulation.initialStep);
            } else if (typeof clearRoundRobinQueues === "function") {
                clearRoundRobinQueues();
            }
            previousBtn.disabled = true;
            nextBtn.disabled = false;
        } else {
            renderGantt(window.currentSimulation.gantt, currentStep, false);
            renderTimeline(window.currentSimulation.gantt, currentStep);
            updateStepExecution(window.currentSimulation.gantt, currentStep, totalSteps);
            if (window.currentSimulation.steps && window.currentSimulation.steps[currentStep - 1] && typeof renderRoundRobinQueues === "function") {
                renderRoundRobinQueues(window.currentSimulation.steps[currentStep - 1]);
            }
            nextBtn.disabled = false;
        }

        if (window.OSLabStorage && window.OSLabStorage.Session) {
            window.OSLabStorage.Session.saveStep("cpu_scheduling", currentStep);
        }
    }

    /* =========================================================
       RESET
    ========================================================= */
    function resetSimulationState() {
        window.currentSimulation = null;
        currentStep = 0;
        totalSteps = 0;

        clearGantt();
        clearTimeline();
        clearResults();
        resetStepExecution(0);
        if (typeof clearRoundRobinQueues === "function") {
            clearRoundRobinQueues();
        }
        if (algorithmSelect.value !== "roundrobin" && rrQueueContainer) {
            rrQueueContainer.style.display = "none";
        }

        previousBtn.disabled = true;
        nextBtn.disabled = true;

        if (saveSimBtn) saveSimBtn.style.display = "none";
        if (window.OSLabStorage && window.OSLabStorage.Session) {
            window.OSLabStorage.Session.clearModuleSession("cpu_scheduling");
        }
    }

    function handleReset() {
        resetSimulationState();
        processCountInput.value = 4;
        createProcessInputs();
    }

    /* =========================================================
       EVENT LISTENERS & INITIALIZATION
    ========================================================= */
    algorithmSelect.addEventListener("change", onAlgorithmChange);
    processCountInput.addEventListener("input", createProcessInputs);
    simulateBtn.addEventListener("click", handleSimulate);
    resetBtn.addEventListener("click", handleReset);
    nextBtn.addEventListener("click", handleNext);
    previousBtn.addEventListener("click", handlePrevious);

    // Save Simulation to IndexedDB (CRUD Create)
    if (saveSimBtn) {
        saveSimBtn.addEventListener("click", async function () {
            if (!window.currentSimulation || !window.currentSimulation.processes) {
                alert("No simulation data to save. Run a simulation first.");
                return;
            }

            const algo = algorithmSelect.value.toUpperCase();
            const count = processCountInput.value;
            const avgWT = document.getElementById("avgWaiting") ? document.getElementById("avgWaiting").textContent : "-";
            const avgTAT = document.getElementById("avgTurnaround") ? document.getElementById("avgTurnaround").textContent : "-";
            const avgRT = document.getElementById("avgResponse") ? document.getElementById("avgResponse").textContent : "-";

            const defaultTitle = `${algo} CPU Scheduling (${count} Processes)`;
            const title = prompt("Enter a title for this simulation record:", defaultTitle);
            if (title === null) return;

            const notes = prompt("Enter any notes or observations (optional):", "") || "";

            try {
                await window.OSLabStorage.DB.add({
                    module: "CPU Scheduling",
                    algorithm: algo,
                    title: title.trim() || defaultTitle,
                    notes: notes.trim(),
                    input: {
                        algorithm: algo,
                        processCount: count,
                        processes: window.currentSimulation.processes.map(p => ({
                            id: p.id,
                            arrivalTime: p.arrivalTime,
                            burstTime: p.burstTime,
                            priority: p.priority
                        }))
                    },
                    result: {
                        avgWaiting: avgWT,
                        avgTurnaround: avgTAT,
                        avgResponse: avgRT,
                        totalSteps: totalSteps
                    }
                });

                if (window.OSLabStorage && window.OSLabStorage.showToast) {
                    window.OSLabStorage.showToast("CPU simulation saved to history!", "success");
                } else {
                    alert("CPU simulation saved to history!");
                }
            } catch (err) {
                console.error("Save failed:", err);
                alert("Could not save simulation: " + err.message);
            }
        });
    }

    // Restore saved algorithm from localStorage if present
    if (window.OSLabStorage && window.OSLabStorage.Local) {
        const savedInputs = window.OSLabStorage.Local.getModuleInputs("cpu_scheduling");
        if (savedInputs) {
            if (savedInputs.algorithm) {
                algorithmSelect.value = savedInputs.algorithm;
                onAlgorithmChange();
            }
            if (savedInputs.processCount) {
                processCountInput.value = savedInputs.processCount;
                createProcessInputs();
            }
        }
    }

    // Initial setup
    updatePrinciple(algorithmSelect.value);
    createProcessInputs();
    clearGantt();
    clearTimeline();
    clearResults();
    resetStepExecution(0);
});