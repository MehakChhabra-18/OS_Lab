console.log("script.js loaded");

const simulateButton = document.getElementById("simulateBtn");
const resetButton = document.getElementById("resetBtn");

const referenceInput = document.getElementById("referenceString");
const frameInput = document.getElementById("frameCount");
const algorithmInput = document.getElementById("algorithm");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const speedControl = document.getElementById("speedControl");
const speedValue = document.getElementById("speedValue");

let simulationHistory = [];
let currentStep = -1;
let currentFrameCount = 0;

console.log("Simulate button:", simulateButton);
console.log("FIFO function:", typeof fifo);


/* SIMULATE */

simulateButton.addEventListener("click", function () {

    console.log("SIMULATE BUTTON CLICKED");

    const referenceString = referenceInput.value.trim();
    const frameCount = Number(frameInput.value);
    const algorithm = algorithmInput.value;

    console.log("Reference:", referenceString);
    console.log("Frames:", frameCount);
    console.log("Algorithm:", algorithm);

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

    let result;

    if (algorithm === "fifo") {

        console.log("Running FIFO...");

        result = fifo(
            referencePages,
            frameCount
        );

    } else {

        alert(
            algorithm.toUpperCase() +
            " is not implemented yet."
        );

        return;
    }

    console.log("FIFO RESULT:", result);

    simulationHistory = result.history;
    currentStep = -1;
    currentFrameCount = frameCount;

    displayReferenceString(referencePages);

    clearHistory();
    hideResults();
    clearCanvas();
    resetStepInfo();

    previousBtn.disabled = true;
    nextBtn.disabled = false;

    console.log("Simulation ready!");
});


/* NEXT */

nextBtn.addEventListener("click", function () {

    console.log("NEXT CLICKED");

    if (
        currentStep <
        simulationHistory.length - 1
    ) {
        showStep(currentStep + 1);
    }
});


/* PREVIOUS */

previousBtn.addEventListener("click", function () {

    console.log("PREVIOUS CLICKED");

    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
});

function showStep(index) {
    if (index < 0 || index >= simulationHistory.length) {
        return;
    }

    currentStep = index;

    const step = simulationHistory[index];

    drawFrames(
        step.frames,
        currentFrameCount
    );

    updateStepInfo(
        step,
        index,
        simulationHistory.length,
        currentFrameCount
    );

    highlightReferencePage(index);

    displayHistoryUntil(
        simulationHistory,
        index
    );

    previousBtn.disabled = index === 0;
    nextBtn.disabled =
        index === simulationHistory.length - 1;

    if (index === simulationHistory.length - 1) {
        showFinalResults(simulationHistory);
    } else {
        hideResults();
    }
}

/* SPEED */

speedControl.addEventListener("input", function () {

    speedValue.textContent =
        speedControl.value + "s";
});


/* RESET */

resetButton.addEventListener("click", function () {

    console.log("RESET CLICKED");

    simulationHistory = [];
    currentStep = -1;
    currentFrameCount = 0;

    referenceInput.value = "";
    frameInput.value = "";
    algorithmInput.value = "fifo";

    clearCanvas();
    clearHistory();
    clearReference();

    resetStepInfo();
    hideResults();

    previousBtn.disabled = true;
    nextBtn.disabled = true;
});