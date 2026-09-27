/**
 * First Come First Serve (FCFS) CPU Scheduling Algorithm
 * Non-preemptive scheduling based on process arrival time.
 * Handles CPU idle time and provides Gantt segments.
 *
 * @param {Array<{id: string, arrivalTime: number, burstTime: number, priority?: number}>} processes
 * @returns {{processes: Array, gantt: Array}}
 */
function fcfs(processes) {
    if (!processes || processes.length === 0) {
        return { processes: [], gantt: [] };
    }

    // Clone processes to avoid mutating input
    const procs = processes.map((p, index) => ({
        ...p,
        originalIndex: index
    }));

    // Sort by arrival time; tie-break by original index/order
    procs.sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) {
            return a.arrivalTime - b.arrivalTime;
        }
        return a.originalIndex - b.originalIndex;
    });

    let currentTime = 0;
    const gantt = [];
    const resultMap = new Map();

    for (const process of procs) {
        // Handle CPU Idle time
        if (currentTime < process.arrivalTime) {
            gantt.push({
                id: "IDLE",
                startTime: currentTime,
                endTime: process.arrivalTime
            });
            currentTime = process.arrivalTime;
        }

        const startTime = currentTime;
        const completionTime = startTime + process.burstTime;
        const turnaroundTime = completionTime - process.arrivalTime;
        const waitingTime = turnaroundTime - process.burstTime;
        const responseTime = startTime - process.arrivalTime;

        gantt.push({
            id: process.id,
            startTime: startTime,
            endTime: completionTime
        });

        resultMap.set(process.id, {
            id: process.id,
            arrivalTime: process.arrivalTime,
            burstTime: process.burstTime,
            startTime: startTime,
            completionTime: completionTime,
            turnaroundTime: turnaroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime,
            priority: process.priority
        });

        currentTime = completionTime;
    }

    // Return processes in original input order
    const resultProcesses = processes.map(p => resultMap.get(p.id));

    return {
        processes: resultProcesses,
        gantt: gantt
    };
}

if (typeof window !== "undefined") {
    window.fcfs = fcfs;
}
if (typeof globalThis !== "undefined") {
    globalThis.fcfs = fcfs;
}