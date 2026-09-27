/**
 * Priority CPU Scheduling Algorithm (Non-Preemptive)
 *
 * Scheduling rule:
 * - Select arrived process with highest priority.
 * - CONVENTION: A smaller numerical value indicates a HIGHER priority (e.g., 1 is higher priority than 2).
 * - Tie-breaking rule: priority -> arrival time -> process order
 * - Handles CPU idle time.
 *
 * @param {Array<{id: string, arrivalTime: number, burstTime: number, priority?: number}>} processes
 * @returns {{processes: Array, gantt: Array}}
 */
function priority(processes) {
    if (!processes || processes.length === 0) {
        return { processes: [], gantt: [] };
    }

    const remaining = processes.map((p, index) => ({
        ...p,
        originalIndex: index,
        priority: typeof p.priority === "number" && !isNaN(p.priority) ? p.priority : index + 1
    }));

    const resultMap = new Map();
    const gantt = [];
    let currentTime = 0;

    while (remaining.length > 0) {
        // Filter processes that have arrived
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

        // Sort arrived processes by priority (smaller number = higher priority)
        // -> arrivalTime -> originalIndex
        arrived.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
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

        // Remove executed process
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
    window.priority = priority;
}
if (typeof globalThis !== "undefined") {
    globalThis.priority = priority;
}
