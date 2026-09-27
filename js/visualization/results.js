/**
 * Results Visualization & Metrics Calculation Module
 * Updates the Process Table and computes Turnaround Time, Waiting Time,
 * Response Time, and system averages.
 * Also provides backward-compatibility for page-replacement.html.
 */

const ResultsVisualizer = (function () {
    const resultsBody = document.getElementById("resultsBody");
    const avgWaitingEl = document.getElementById("avgWaiting");
    const avgTurnaroundEl = document.getElementById("avgTurnaround");
    const avgResponseEl = document.getElementById("avgResponse");
    const totalCpuTimeEl = document.getElementById("totalCpuTime");

    function formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return "-";
        return Number.isInteger(num) ? String(num) : num.toFixed(2);
    }

    /**
     * Calculates metrics and displays the process table and averages.
     * @param {{processes: Array, gantt: Array}} simulationResult
     */
    function displayResults(simulationResult) {
        if (!resultsBody || !simulationResult || !simulationResult.processes) return;

        const processes = simulationResult.processes;
        const totalProcs = processes.length;

        if (totalProcs === 0) {
            clearResults();
            return;
        }

        let totalWT = 0;
        let totalTAT = 0;
        let totalRT = 0;
        let totalBT = 0;

        resultsBody.innerHTML = "";

        processes.forEach(p => {
            const at = Number(p.arrivalTime);
            const bt = Number(p.burstTime);
            const st = Number(p.startTime);
            const ct = Number(p.completionTime);

            const tat = ct - at;
            const wt = tat - bt;
            const rt = st - at;

            totalTAT += tat;
            totalWT += wt;
            totalRT += rt;
            totalBT += bt;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${p.id}</strong></td>
                <td>${at}</td>
                <td>${bt}</td>
                <td>${st}</td>
                <td>${ct}</td>
                <td>${tat}</td>
                <td>${wt}</td>
                <td>${rt}</td>
            `;
            resultsBody.appendChild(tr);
        });

        const avgWT = totalWT / totalProcs;
        const avgTAT = totalTAT / totalProcs;
        const avgRT = totalRT / totalProcs;

        if (avgWaitingEl) avgWaitingEl.textContent = formatNumber(avgWT);
        if (avgTurnaroundEl) avgTurnaroundEl.textContent = formatNumber(avgTAT);
        if (avgResponseEl) avgResponseEl.textContent = formatNumber(avgRT);
        if (totalCpuTimeEl) totalCpuTimeEl.textContent = String(totalBT);
    }

    /**
     * Clears results table and metrics.
     */
    function clearResults() {
        if (resultsBody) resultsBody.innerHTML = "";
        if (avgWaitingEl) avgWaitingEl.textContent = "-";
        if (avgTurnaroundEl) avgTurnaroundEl.textContent = "-";
        if (avgResponseEl) avgResponseEl.textContent = "-";
        if (totalCpuTimeEl) totalCpuTimeEl.textContent = "-";
    }

    return {
        displayResults,
        clearResults
    };
})();

// Global functions for direct access
function displayResults(simulationResult) {
    ResultsVisualizer.displayResults(simulationResult);
}

function clearResults() {
    ResultsVisualizer.clearResults();
}

/* =========================================================
   BACKWARD-COMPATIBILITY FOR PAGE-REPLACEMENT.HTML
========================================================= */
function showFinalResults(history) {
    const pageFaults = document.getElementById("pageFaults");
    const pageHits = document.getElementById("pageHits");
    const hitRatio = document.getElementById("hitRatio");
    const resultCard = document.getElementById("resultCard");

    if (!pageFaults || !pageHits || !hitRatio) return;

    let faults = 0;
    let hits = 0;

    history.forEach(step => {
        if (step.result === "Fault") {
            faults++;
        } else {
            hits++;
        }
    });

    const total = history.length;
    const ratio = total > 0 ? (hits / total) * 100 : 0;

    pageFaults.textContent = faults;
    pageHits.textContent = hits;
    hitRatio.textContent = ratio.toFixed(2) + "%";

    if (resultCard) {
        resultCard.style.display = "block";
    }
}

function hideResults() {
    const resultCard = document.getElementById("resultCard");
    if (resultCard) {
        resultCard.style.display = "none";
    }
}