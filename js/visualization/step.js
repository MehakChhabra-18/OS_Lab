const currentPage = document.getElementById("currentPage");
const currentResult = document.getElementById("currentResult");
const explanation = document.getElementById("explanation");

const stepCounter = document.getElementById("stepCounter");
const navigationStep = document.getElementById("navigationStep");

function updateStepInfo(step, index, totalSteps, frameCount) {

    currentPage.textContent = step.page;
    currentResult.textContent = step.result;

    currentResult.classList.remove("hit", "fault");

    if (step.result === "Hit") {

        currentResult.classList.add("hit");

        explanation.textContent =
            `Page ${step.page} is already present in memory, so no replacement is needed.`;

    } else {

        currentResult.classList.add("fault");

        if (step.frames.length < frameCount) {

            explanation.textContent =
                `Page ${step.page} caused a page fault and was loaded into an empty frame.`;

        } else {

            explanation.textContent =
                `Page ${step.page} caused a page fault and FIFO replaced the oldest page.`;
        }
    }

    stepCounter.textContent =
        `Step ${index + 1} of ${totalSteps}`;

    navigationStep.textContent =
        `Step ${index + 1} of ${totalSteps}`;
}

function resetStepInfo() {

    currentPage.textContent = "-";

    currentResult.textContent = "-";

    currentResult.classList.remove(
        "hit",
        "fault"
    );

    explanation.textContent =
        "Click Simulate to start the visualization.";

    stepCounter.textContent =
        "Step 0 of 0";

    navigationStep.textContent =
        "Step 0 of 0";
}