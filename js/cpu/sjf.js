/**
 * Shortest Job First (SJF) CPU Scheduling Algorithm
 * Non-preemptive scheduling based on shortest burst time of arrived processes.
 * Tie-breaking rule: shortest burst time -> arrival time -> process order
 * Handles CPU idle time.
 *
 * @param {Array<{id: string, arrivalTime: number, burstTime: number, priority?: number}>} processes
 * @returns {{processes: Array, gantt: Array}}
 */
function sjf(processes) {
    if (!processes || processes.length === 0) {
        return { processes: [], gantt: [] };
    }

    const remaining = processes.map((p, index) => ({
        ...p,
        originalIndex: index
    }));

    const resultMap = new Map();
    const gantt = [];
    let currentTime = 0;

    while (remaining.length > 0) {
        // Find arrived processes
        const arrived = remaining.filter(p => p.arrivalTime <= currentTime);

        // CPU Idle handling
        if (arrived.length === 0) {
            const nextArrivalTime = Math.min(...remaining.map(p => p.arrivalTime));
            gantt.push({
                id: "IDLE",
                startTime: currentTime,
                endTime: nextArrivalTime
            });
            currentTime = nextArrivalTime;
            continue;
        }

        // Sort arrived processes by burstTime -> arrivalTime -> originalIndex
        arrived.sort((a, b) => {
            if (a.burstTime !== b.burstTime) {
                return a.burstTime - b.burstTime;
            }
            if (a.arrivalTime !== b.arrivalTime) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.originalIndex - b.originalIndex;
        });

        const selected = arrived[0];

        const startTime = currentTime;
        const completionTime = startTime + selected.burstTime;
        const turnaroundTime = completionTime - selected.arrivalTime;
        const waitingTime = turnaroundTime - selected.burstTime;
        const responseTime = startTime - selected.arrivalTime;

        gantt.push({
            id: selected.id,
            startTime: startTime,
            endTime: completionTime
        });

        resultMap.set(selected.id, {
            id: selected.id,
            arrivalTime: selected.arrivalTime,
            burstTime: selected.burstTime,
            startTime: startTime,
            completionTime: completionTime,
            turnaroundTime: turnaroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime,
            priority: selected.priority
        });

        currentTime = completionTime;

        // Remove executed process from remaining
        const idx = remaining.findIndex(p => p.id === selected.id);
        remaining.splice(idx, 1);
    }

    const resultProcesses = processes.map(p => resultMap.get(p.id));

    return {
        processes: resultProcesses,
        gantt: gantt
    };
}

if (typeof window !== "undefined") {
    window.sjf = sjf;
}
if (typeof globalThis !== "undefined") {
    globalThis.sjf = sjf;
}