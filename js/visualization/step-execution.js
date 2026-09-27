/**
 * Step Execution Visualization Module
 * Updates the step info grid, dynamic explanation text, and step counter.
 */

const StepExecution = (function () {
    const currentProcessEl = document.getElementById("currentProcess");
    const startTimeEl = document.getElementById("startTime");
    const completionTimeEl = document.getElementById("completionTime");
    const durationEl = document.getElementById("duration");
    const explanationTextEl = document.getElementById("explanationText");
    const stepCounterEl = document.getElementById("stepCounter");

    /**
     * Resets the step execution UI to initial state.
     * @param {number} totalSteps - Optional total steps if simulation is initialized at step 0
     */
    function resetStepExecution(totalSteps = 0) {
        if (currentProcessEl) currentProcessEl.textContent = "-";
        if (startTimeEl) startTimeEl.textContent = "-";
        if (completionTimeEl) completionTimeEl.textContent = "-";
        if (durationEl) durationEl.textContent = "-";

        if (totalSteps > 0) {
            if (explanationTextEl) {
                explanationTextEl.textContent = "Click Next to begin step-by-step execution.";
            }
            if (stepCounterEl) {
                stepCounterEl.textContent = `Step 0 of ${totalSteps}`;
            }
        } else {
            if (explanationTextEl) {
                explanationTextEl.textContent = "Click Simulate to start the visualization.";
            }
            if (stepCounterEl) {
                stepCounterEl.textContent = "Step 0 of 0";
            }
        }
    }

    /**
     * Updates step information based on the current step.
     * @param {Array<{id: string, startTime: number, endTime: number}>} ganttSegments
     * @param {number} currentStep - Currently reached step (1 to totalSteps)
     * @param {number} totalSteps - Total number of Gantt segments
     */
    function updateStepExecution(ganttSegments, currentStep, totalSteps) {
        if (!ganttSegments || ganttSegments.length === 0 || currentStep === 0) {
            resetStepExecution(totalSteps);
            return;
        }

        const segment = ganttSegments[currentStep - 1];
        if (!segment) return;

        const duration = segment.endTime - segment.startTime;
        const isIdle = segment.id === "IDLE";

        if (currentProcessEl) currentProcessEl.textContent = segment.id;
        if (startTimeEl) startTimeEl.textContent = String(segment.startTime);
        if (completionTimeEl) completionTimeEl.textContent = String(segment.endTime);
        if (durationEl) durationEl.textContent = String(duration);

        if (stepCounterEl) {
            stepCounterEl.textContent = `Step ${currentStep} of ${totalSteps}`;
        }

        if (explanationTextEl) {
            if (segment.explanation) {
                explanationTextEl.textContent = segment.explanation;
            } else if (isIdle) {
                explanationTextEl.textContent = `CPU is idle from time ${segment.startTime} to ${segment.endTime} because no process has arrived.`;
            } else if (segment.remainingTime !== undefined) {
                explanationTextEl.textContent = `Process ${segment.id} executes from time ${segment.startTime} to ${segment.endTime} (Remaining BT: ${segment.remainingTime}).`;
            } else {
                explanationTextEl.textContent = `Process ${segment.id} executes from time ${segment.startTime} to ${segment.endTime}.`;
            }
        }
    }

    return {
        updateStepExecution,
        resetStepExecution
    };
})();

// Global functions for direct access
function updateStepExecution(ganttSegments, currentStep, totalSteps) {
    StepExecution.updateStepExecution(ganttSegments, currentStep, totalSteps);
}

function resetStepExecution(totalSteps) {
    StepExecution.resetStepExecution(totalSteps);
}
