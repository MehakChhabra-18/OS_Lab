// ==========================================
// MEMORY ALLOCATION CONTROLLER
// ==========================================

console.log("MEMORY ALLOCATION JS LOADED");


// ==========================================
// DOM ELEMENTS
// ==========================================

const algorithmSelect =
    document.getElementById("algorithm");

const memoryBlocksInput =
    document.getElementById("memoryBlocks");

const processesInput =
    document.getElementById("processes");

const simulateButton =
    document.getElementById("simulateBtn");

const resetButton =
    document.getElementById("resetBtn");

const previousButton =
    document.getElementById("previousBtn");

const nextButton =
    document.getElementById("nextBtn");

const saveSimBtn =
    document.getElementById("saveSimBtn");

const memoryBlocksDisplay =
    document.getElementById("memoryBlocksDisplay");

const allocationDisplay =
    document.getElementById("allocationDisplay");

const allocationOrder =
    document.getElementById("allocationOrder");

const stepCounter =
    document.getElementById("stepCounter");

const movementText =
    document.getElementById("movementText");

const currentProcess =
    document.getElementById("currentProcess");

const processSize =
    document.getElementById("processSize");

const allocatedBlock =
    document.getElementById("allocatedBlock");

const remainingSpace =
    document.getElementById("remainingSpace");

const explanationText =
    document.getElementById("explanationText");

const resultAllocated =
    document.getElementById("resultAllocated");

const resultUnallocated =
    document.getElementById("resultUnallocated");

const resultRemaining =
    document.getElementById("resultRemaining");


// ==========================================
// STATE
// ==========================================

let originalBlocks = [];

let processes = [];

let simulationSteps = [];

let currentStep = -1;

let finalMemory = [];

let finalAllocations = [];


// ==========================================
// SIMULATE
// ==========================================

simulateButton.addEventListener("click", function () {

    console.log("SIMULATE CLICKED");

    const blocks = parseInput(
        memoryBlocksInput.value
    );

    const processList = parseInput(
        processesInput.value
    );

    if (blocks.length === 0) {

        alert("Please enter valid memory blocks.");

        return;
    }

    if (processList.length === 0) {

        alert("Please enter valid processes.");

        return;
    }


    originalBlocks = blocks;

    processes = processList;


    const algorithm =
        algorithmSelect.value;


    // ======================================
    // RUN SELECTED ALGORITHM
    // ======================================

    let result;

if (algorithm === "first-fit") {

    result = firstFit(
        blocks,
        processList
    );

}

else if (algorithm === "best-fit") {

    result = bestFit(
        blocks,
        processList
    );

}

else if (algorithm === "worst-fit") {

    result = worstFit(
        blocks,
        processList
    );

}

else {

    alert(
        "This algorithm is not implemented yet."
    );

    return;
}


    simulationSteps =
        result.steps;

    finalMemory =
        result.finalMemory;

    finalAllocations =
        result.allocations;


    currentStep = -1;


    // ======================================
    // RESET UI
    // ======================================

    stepCounter.textContent =
        `Step 0 of ${simulationSteps.length}`;

    movementText.textContent =
        "Simulation ready";

    currentProcess.textContent =
        "-";

    processSize.textContent =
        "-";

    allocatedBlock.textContent =
        "-";

    remainingSpace.textContent =
        "-";

    explanationText.innerHTML =
        "Click <b>Next</b> to begin the First Fit allocation.";


    previousButton.disabled = true;

    nextButton.disabled =
        simulationSteps.length === 0;


    renderInitialMemory();

    renderAllocationStatus([]);

    renderOrder([]);


    resultAllocated.textContent = "-";

    resultUnallocated.textContent = "-";

    resultRemaining.textContent = "-";

    if (saveSimBtn) saveSimBtn.style.display = "block";

    if (window.OSLabStorage) {
        window.OSLabStorage.Local.saveModuleInputs("memory_allocation", {
            blocks: memoryBlocksInput.value,
            processes: processesInput.value,
            algorithm: algorithm
        });
        window.OSLabStorage.Session.saveStep("memory_allocation", 0);
    }
});


// ==========================================
// NEXT
// ==========================================

nextButton.addEventListener("click", function () {

    if (
        currentStep >=
        simulationSteps.length - 1
    ) {

        return;
    }


    currentStep++;

    renderStep(currentStep);

    if (window.OSLabStorage && window.OSLabStorage.Session) {
        window.OSLabStorage.Session.saveStep("memory_allocation", currentStep);
    }

});


// ==========================================
// PREVIOUS
// ==========================================

previousButton.addEventListener("click", function () {

    if (currentStep <= 0) {

        return;
    }


    currentStep--;

    renderStep(currentStep);

    if (window.OSLabStorage && window.OSLabStorage.Session) {
        window.OSLabStorage.Session.saveStep("memory_allocation", currentStep);
    }

});


// ==========================================
// RESET
// ==========================================

resetButton.addEventListener("click", function () {

    console.log("RESET CLICKED");

    originalBlocks = [];

    processes = [];

    simulationSteps = [];

    currentStep = -1;

    finalMemory = [];

    finalAllocations = [];


    memoryBlocksInput.value =
        "100, 500, 200, 300, 600";

    processesInput.value =
        "212, 417, 112, 426";

    algorithmSelect.value =
        "first-fit";


    memoryBlocksDisplay.innerHTML = `
        <div class="empty-state">
            Run simulation to visualize memory.
        </div>
    `;


    allocationDisplay.innerHTML = `
        <div class="empty-state">
            No allocation yet.
        </div>
    `;


    allocationOrder.innerHTML = `
        <span class="empty-order">
            No simulation yet
        </span>
    `;


    stepCounter.textContent =
        "Step 0 of 0";

    movementText.textContent =
        "Run simulation to begin";


    currentProcess.textContent =
        "-";

    processSize.textContent =
        "-";

    allocatedBlock.textContent =
        "-";

    remainingSpace.textContent =
        "-";


    explanationText.innerHTML =
        "Enter memory blocks and processes, then click <b>Simulate</b> to start the visualization.";


    resultAllocated.textContent =
        "-";

    resultUnallocated.textContent =
        "-";

    resultRemaining.textContent =
        "-";


    previousButton.disabled = true;

    nextButton.disabled = true;

    if (saveSimBtn) saveSimBtn.style.display = "none";

    if (window.OSLabStorage && window.OSLabStorage.Session) {
        window.OSLabStorage.Session.clearModuleSession("memory_allocation");
    }
});


// ==========================================
// PARSE INPUT
// ==========================================

function parseInput(value) {

    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(number =>
            Number.isFinite(number) &&
            number > 0
        );

}


// ==========================================
// INITIAL MEMORY
// ==========================================

function renderInitialMemory() {

    memoryBlocksDisplay.innerHTML = "";


    originalBlocks.forEach(
        (size, index) => {

            const block =
                document.createElement("div");

            block.className =
                "memory-block";


            block.innerHTML = `

                <div class="block-left">

                    <span class="block-title">
                        Block ${index + 1}
                    </span>

                    <span class="block-size">
                        Size: ${size}
                    </span>

                </div>

                <div class="block-right">

                    <span class="block-process">
                        Free
                    </span>

                </div>

            `;


            memoryBlocksDisplay.appendChild(
                block
            );

        }
    );

}


// ==========================================
// RENDER CURRENT STEP
// ==========================================

function renderStep(stepIndex) {

    const step =
        simulationSteps[stepIndex];


    if (!step) {

        return;
    }


    // ======================================
    // STEP COUNTER
    // ======================================

    stepCounter.textContent =
        `Step ${stepIndex + 1} of ${simulationSteps.length}`;


    // ======================================
    // PROCESS INFO
    // ======================================

    currentProcess.textContent =
        `P${step.processIndex + 1}`;

    processSize.textContent =
        step.processSize;


    // ======================================
    // BLOCK INFO
    // ======================================

    if (step.allocated) {

        allocatedBlock.textContent =
            `Block ${step.blockIndex + 1}`;

        remainingSpace.textContent =
            step.remaining;

        movementText.textContent =
            `P${step.processIndex + 1} allocated`;

    }

    else {

        allocatedBlock.textContent =
            "Not Allocated";

        remainingSpace.textContent =
            "-";

        movementText.textContent =
            `P${step.processIndex + 1} could not be allocated`;

    }


    // ======================================
    // EXPLANATION
    // ======================================

    if (step.allocated) {

        explanationText.innerHTML =

            `First Fit checks memory blocks from the beginning and `
            + `allocates <b>P${step.processIndex + 1}</b> `
            + `to the first block large enough to hold `
            + `<b>${step.processSize}</b> units.`;

    }

    else {

        explanationText.innerHTML =

            `<b>P${step.processIndex + 1}</b> `
            + `requires <b>${step.processSize}</b> units, `
            + `but no remaining memory block is large enough. `
            + `Therefore, the process is not allocated.`;

    }


    // ======================================
    // MEMORY VISUALIZATION
    // ======================================

    renderMemoryState(step);


    // ======================================
    // ALLOCATION STATUS
    // ======================================

    renderAllocationStatus(
        step.allocations
    );


    // ======================================
    // ORDER
    // ======================================

    renderOrder(
        step.allocations
    );


    // ======================================
    // NAVIGATION
    // ======================================

    previousButton.disabled =
        stepIndex === 0;

    nextButton.disabled =
        stepIndex === simulationSteps.length - 1;


    // ======================================
    // FINAL RESULTS
    // ======================================

    if (
        stepIndex ===
        simulationSteps.length - 1
    ) {

        showFinalResults(step);

    }

}


// ==========================================
// MEMORY STATE
// ==========================================

function renderMemoryState(step) {

    memoryBlocksDisplay.innerHTML = "";


    step.memory.forEach(
        (remaining, index) => {

            const original =
                originalBlocks[index];

            const block =
                document.createElement("div");


            let processNumber = null;


            for (
                let p = 0;
                p <= step.processIndex;
                p++
            ) {

                if (
                    step.allocations[p] === index
                ) {

                    processNumber =
                        p + 1;

                }

            }


            block.className =
                "memory-block";


            if (processNumber !== null) {

                block.classList.add(
                    "allocated"
                );

            }


            if (
                index === step.blockIndex
            ) {

                block.classList.add(
                    "current"
                );

            }


            block.innerHTML = `

                <div class="block-left">

                    <span class="block-title">
                        Block ${index + 1}
                    </span>

                    <span class="block-size">
                        Original: ${original}
                    </span>

                </div>

                <div class="block-right">

                    ${
                        processNumber !== null

                        ? `

                            <span class="block-process">
                                P${processNumber}
                            </span>

                            <span class="block-remaining">
                                Remaining: ${remaining}
                            </span>

                          `

                        : `

                            <span class="block-process">
                                Free
                            </span>

                            <span class="block-remaining">
                                Available: ${remaining}
                            </span>

                          `
                    }

                </div>

            `;


            memoryBlocksDisplay.appendChild(
                block
            );

        }
    );

}


// ==========================================
// ALLOCATION STATUS
// ==========================================

function renderAllocationStatus(
    allocations
) {

    allocationDisplay.innerHTML = "";


    if (!processes.length) {

        allocationDisplay.innerHTML = `
            <div class="empty-state">
                No allocation yet.
            </div>
        `;

        return;
    }


    processes.forEach(
        (size, index) => {

            const blockIndex =
                allocations[index];


            const item =
                document.createElement("div");


            item.className =
                "allocation-item";


            if (blockIndex !== -1) {

                item.classList.add(
                    "success"
                );

            }

            else {

                item.classList.add(
                    "failed"
                );

            }


            item.innerHTML = `

                <div>

                    <div class="process-label">
                        P${index + 1}
                    </div>

                    <small>
                        Size: ${size}
                    </small>

                </div>

                <div class="allocation-status">

                    ${
                        blockIndex !== -1

                        ? `Block ${blockIndex + 1}`

                        : `Not Allocated`
                    }

                </div>

            `;


            allocationDisplay.appendChild(
                item
            );

        }
    );

}


// ==========================================
// ALLOCATION ORDER
// ==========================================

function renderOrder(
    allocations
) {

    allocationOrder.innerHTML = "";


    if (!allocations.length) {

        allocationOrder.innerHTML = `
            <span class="empty-order">
                No simulation yet
            </span>
        `;

        return;
    }


    allocations.forEach(
        (blockIndex, processIndex) => {

            const item =
                document.createElement("div");


            item.className =
                "order-item";


            if (blockIndex !== -1) {

                item.innerHTML = `

                    <span>
                        P${processIndex + 1}
                    </span>

                    → Block ${blockIndex + 1}

                `;

            }

            else {

                item.innerHTML = `

                    <span>
                        P${processIndex + 1}
                    </span>

                    → Not Allocated

                `;

            }


            allocationOrder.appendChild(
                item
            );

        }
    );

}


// ==========================================
// FINAL RESULTS
// ==========================================

function showFinalResults(step) {

    let allocated = 0;

    let unallocated = 0;


    step.allocations.forEach(
        block => {

            if (block !== -1) {

                allocated++;

            }

            else {

                unallocated++;

            }

        }
    );


    const remainingMemory =
        step.memory.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    resultAllocated.textContent =
        allocated;

    resultUnallocated.textContent =
        unallocated;

    resultRemaining.textContent =
        remainingMemory;

}

// Save Simulation to IndexedDB (CRUD Create)
if (saveSimBtn) {
    saveSimBtn.addEventListener("click", async function () {
        if (!simulationSteps || simulationSteps.length === 0) {
            alert("No simulation data to save. Run a simulation first.");
            return;
        }

        const algo = algorithmSelect.value;
        const algoName = algo === "first-fit" ? "First Fit" : (algo === "best-fit" ? "Best Fit" : "Worst Fit");
        const allocCount = resultAllocated.textContent !== "-" ? resultAllocated.textContent : "0";
        const unallocCount = resultUnallocated.textContent !== "-" ? resultUnallocated.textContent : "0";
        const remMem = resultRemaining.textContent !== "-" ? resultRemaining.textContent : "0";

        const defaultTitle = `${algoName} Memory Allocation (${processes.length} Processes)`;
        const title = prompt("Enter a title for this simulation record:", defaultTitle);
        if (title === null) return;

        const notes = prompt("Enter any notes or observations (optional):", "") || "";

        try {
            await window.OSLabStorage.DB.add({
                module: "Memory Allocation",
                algorithm: algoName,
                title: title.trim() || defaultTitle,
                notes: notes.trim(),
                input: {
                    blocks: memoryBlocksInput.value.trim(),
                    processes: processesInput.value.trim(),
                    totalBlocks: originalBlocks.length,
                    totalProcesses: processes.length
                },
                result: {
                    allocatedCount: allocCount,
                    unallocatedCount: unallocCount,
                    remainingMemory: remMem,
                    totalSteps: simulationSteps.length
                }
            });

            if (window.OSLabStorage && window.OSLabStorage.showToast) {
                window.OSLabStorage.showToast("Memory simulation saved to history!", "success");
            } else {
                alert("Memory simulation saved to history!");
            }
        } catch (err) {
            console.error("Save memory simulation failed:", err);
            alert("Could not save simulation: " + err.message);
        }
    });
}

// Restore saved inputs from localStorage
document.addEventListener("DOMContentLoaded", function () {
    if (window.OSLabStorage && window.OSLabStorage.Local) {
        const savedInputs = window.OSLabStorage.Local.getModuleInputs("memory_allocation");
        if (savedInputs) {
            if (savedInputs.algorithm) algorithmSelect.value = savedInputs.algorithm;
            if (savedInputs.blocks) memoryBlocksInput.value = savedInputs.blocks;
            if (savedInputs.processes) processesInput.value = savedInputs.processes;
        }
    }
});