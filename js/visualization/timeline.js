/**
 * Execution Timeline Visualization Module
 * Dynamically renders timeline items based on the current step of Gantt segments.
 * Highlighting active segment and handling empty state.
 */

const ExecutionTimeline = (function () {
    const container = document.getElementById("executionTimeline");

    /**
     * Resets the execution timeline to its empty initial state.
     */
    function clearTimeline() {
        if (!container) return;
        container.innerHTML = `<div class="empty-timeline">No execution yet</div>`;
    }

    /**
     * Renders timeline items up to currentStep (0 to ganttSegments.length).
     * @param {Array<{id: string, startTime: number, endTime: number}>} ganttSegments
     * @param {number} currentStep
     */
    function renderTimeline(ganttSegments, currentStep) {
        if (!container) return;

        if (!ganttSegments || ganttSegments.length === 0 || currentStep === 0) {
            clearTimeline();
            return;
        }

        container.innerHTML = "";
        const visibleSegments = ganttSegments.slice(0, currentStep);

        visibleSegments.forEach((segment, index) => {
            const isActive = index === visibleSegments.length - 1;
            const item = document.createElement("div");
            item.className = "timeline-item" + (isActive ? " active" : "");

            const numberDiv = document.createElement("div");
            numberDiv.className = "timeline-number";
            numberDiv.textContent = index + 1;

            const processDiv = document.createElement("div");
            processDiv.className = "timeline-process";
            processDiv.textContent = segment.id === "IDLE" ? "CPU Idle" : segment.id;

            const timeDiv = document.createElement("div");
            timeDiv.className = "timeline-time";
            const remText = typeof segment.remainingTime === "number" ? ` | Rem: ${segment.remainingTime}` : "";
            timeDiv.textContent = `${segment.startTime} - ${segment.endTime}${remText}`;

            item.appendChild(numberDiv);
            item.appendChild(processDiv);
            item.appendChild(timeDiv);

            container.appendChild(item);

            if (isActive) {
                // Ensure active timeline item is in view
                item.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        });
    }

    return {
        renderTimeline,
        clearTimeline
    };
})();

// Global functions for direct access
function renderTimeline(ganttSegments, currentStep) {
    ExecutionTimeline.renderTimeline(ganttSegments, currentStep);
}

function clearTimeline() {
    ExecutionTimeline.clearTimeline();
}
