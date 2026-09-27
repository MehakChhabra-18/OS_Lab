/**
 * Shortest Remaining Time First (SRTF) CPU Scheduling Algorithm
 * Preemptive scheduling based on shortest remaining burst time.
 * Merges consecutive Gantt segments of the same process.
 * Handles CPU idle time and tracks response time on first CPU acquisition.
 *
 * @param {Array<{id: string, arrivalTime: number, burstTime: number, priority?: number}>} processes
 * @returns {{processes: Array, gantt: Array}}
 */
function srtf(processes) {
    if (!processes || processes.length === 0) {
        return { processes: [], gantt: [] };
    }

    const procs = processes.map((p, index) => ({
        ...p,
        originalIndex: index,
        remainingTime: p.burstTime,
        firstStartTime: -1,
        completionTime: -1
    }));

    const totalProcesses = procs.length;
    let completed = 0;
    let currentTime = 0;
    const rawGantt = [];

    // Helper to add/merge Gantt segments
    function recordExecution(id, start, end) {
        if (rawGantt.length > 0 && rawGantt[rawGantt.length - 1].id === id && rawGantt[rawGantt.length - 1].endTime === start) {
            rawGantt[rawGantt.length - 1].endTime = end;
        } else {
            rawGantt.push({ id, startTime: start, endTime: end });
        }
    }

    // Safety limit to avoid infinite loops if bad inputs
    const maxTime = Math.max(...procs.map(p => p.arrivalTime)) + procs.reduce((sum, p) => sum + p.burstTime, 0) + 1000;

    while (completed < totalProcesses && currentTime < maxTime) {
        // Find arrived processes with remaining time
        const arrived = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (arrived.length === 0) {
            // CPU is idle until next process arrives
            const unarrived = procs.filter(p => p.remainingTime > 0);
            if (unarrived.length === 0) break;

            const nextArrival = Math.min(...unarrived.map(p => p.arrivalTime));
            recordExecution("IDLE", currentTime, nextArrival);
            currentTime = nextArrival;
            continue;
        }

        // Select process with shortest remaining burst time
        arrived.sort((a, b) => {
            if (a.remainingTime !== b.remainingTime) {
                return a.remainingTime - b.remainingTime;
            }
            if (a.arrivalTime !== b.arrivalTime) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.originalIndex - b.originalIndex;
        });

        const selected = arrived[0];

        // Track first start time
        if (selected.firstStartTime === -1) {
            selected.firstStartTime = currentTime;
        }

        // Execute for 1 time unit
        recordExecution(selected.id, currentTime, currentTime + 1);
        selected.remainingTime -= 1;
        currentTime += 1;

        if (selected.remainingTime === 0) {
            selected.completionTime = currentTime;
            completed++;
        }
    }

    const resultMap = new Map();
    for (const p of procs) {
        const startTime = p.firstStartTime !== -1 ? p.firstStartTime : p.arrivalTime;
        const completionTime = p.completionTime !== -1 ? p.completionTime : startTime + p.burstTime;
        const turnaroundTime = completionTime - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        const responseTime = startTime - p.arrivalTime;

        resultMap.set(p.id, {
            id: p.id,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            startTime: startTime,
            completionTime: completionTime,
            turnaroundTime: turnaroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime,
            priority: p.priority
        });
    }

    const resultProcesses = processes.map(p => resultMap.get(p.id));

    return {
        processes: resultProcesses,
        gantt: rawGantt
    };
}

if (typeof window !== "undefined") {
    window.srtf = srtf;
}
if (typeof globalThis !== "undefined") {
    globalThis.srtf = srtf;
}
