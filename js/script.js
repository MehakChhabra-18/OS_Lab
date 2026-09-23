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

const principleTitle = document.getElementById("principleTitle");
const principleText = document.getElementById("principleText");

let simulationHistory = [];
let currentStep = -1;
let currentFrameCount = 0;
let currentAlgorithm = "";


/* SIMULATE */

simulateButton.addEventListener("click", function () {

    console.log("SIMULATE BUTTON CLICKED");

    const referenceString =
        referenceInput.value.trim();

    const frameCount =
        Number(frameInput.value);

    const algorithm =
        algorithmInput.value;

    if (referenceString === "") {
        alert("Please enter a reference string.");
        return;
    }

    if (!frameCount || frameCount < 1) {
        alert("Please enter a valid number of frames.");
        return;
    }

    const referencePages =
        referenceString
            .split(/\s+/)
            .map(Number);

    if (referencePages.some(page => isNaN(page))) {
        alert("Reference string should contain numbers only.");
        return;
    }

    let result;

    if (algorithm === "fifo") {

        result =
            fifo(referencePages, frameCount);

    } else if (algorithm === "lru") {

        result =
            lru(referencePages, frameCount);

    }

    else if(algorithm==="optimal")
    {
        result=optimal(referencePages,frameCount);
    }
    
    else if(algorithm==="lfu")
    {
        result=lfu(referencePages,frameCount);
    }

    else {

        alert(
            algorithm.toUpperCase() +
            " is not implemented yet."
        );

        return;
    }

    console.log("Simulation Result:", result);

    simulationHistory =
        result.history;

    currentStep = -1;
    currentFrameCount = frameCount;
    currentAlgorithm = algorithm;

    displayReferenceString(
        referencePages
    );

    clearHistory();
    hideResults();
    clearCanvas();
    resetStepInfo();

    updatePrinciple(algorithm);

    previousBtn.disabled = true;
    nextBtn.disabled = false;
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


/* SHOW STEP */

function showStep(index) {

    if (
        index < 0 ||
        index >= simulationHistory.length
    ) {
        return;
    }

    currentStep = index;

    const step =
        simulationHistory[index];

    drawFrames(
        step.frames,
        currentFrameCount
    );

    updateStepInfo(
        step,
        index,
        simulationHistory.length,
        currentFrameCount,
        currentAlgorithm
    );

    highlightReferencePage(index);

    displayHistoryUntil(
        simulationHistory,
        index
    );

    previousBtn.disabled =
        index === 0;

    nextBtn.disabled =
        index === simulationHistory.length - 1;

    if (
        index === simulationHistory.length - 1
    ) {
        showFinalResults(
            simulationHistory
        );
    } else {
        hideResults();
    }
}


/* SPEED */

speedControl.addEventListener(
    "input",
    function () {

        speedValue.textContent =
            speedControl.value + "s";
    }
);


/* UPDATE PRINCIPLE */

function updatePrinciple(algorithm) {

    if (algorithm === "fifo") {

        principleTitle.textContent =
            "FIFO Principle";

        principleText.textContent =
            "When a page fault occurs and all frames are full, the page that has been in memory the longest (first in) is removed (first out).";

    } else if (algorithm === "lru") {

        principleTitle.textContent =
            "LRU Principle";

        principleText.textContent =
            "When a page fault occurs and all frames are full, the page that has not been used for the longest time is removed.";
    }

    else if(algorithm==="optimal")
    {
        principleTitle.textContent="Optimal Principle";
        principleText.textContent="When a page fault occurs and all frame sare full, the page whose next use is farthest in the future is replaced.";
    }

    else if (algorithm === "lfu") {

        principleTitle.textContent =
            "LFU Principle";

        principleText.textContent =
            "When a page fault occurs and all frames are full, the page with the lowest usage frequency is replaced. If frequencies are equal, the least recently used page is replaced.";
    }
}


/* RESET */

resetButton.addEventListener(
    "click",
    function () {

        console.log("RESET CLICKED");

        simulationHistory = [];
        currentStep = -1;
        currentFrameCount = 0;
        currentAlgorithm = "";

        referenceInput.value = "";
        frameInput.value = "";
        algorithmInput.value = "fifo";

        clearCanvas();
        clearHistory();
        referenceDisplay.innerHTML = "";

        resetStepInfo();
        hideResults();

        previousBtn.disabled = true;
        nextBtn.disabled = true;

        principleTitle.textContent =
            "FIFO Principle";

        principleText.textContent =
            "When a page fault occurs and all frames are full, the page that has been in memory the longest (first in) is removed (first out).";
    }
);