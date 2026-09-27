/**
 * ============================================================
 * ROUND ROBIN CPU SCHEDULING
 * ============================================================
 *
 * Features:
 * 1. Standard Round Robin scheduling
 * 2. Time Quantum support
 * 3. Remaining Burst Time tracking
 * 4. Gantt chart data
 * 5. Step-by-step execution snapshots
 * 6. CPU / Running visualization
 * 7. FIFO Ready Queue visualization
 * 8. Process status visualization
 *
 * Expected process format:
 *
 * {
 *     id: "P1",
 *     arrivalTime: 0,
 *     burstTime: 5
 * }
 *
 * Returns:
 *
 * {
 *     processes: [],
 *     gantt: [],
 *     steps: [],
 *     initialStep: {}
 * }
 */


/* ============================================================
   ROUND ROBIN ALGORITHM
============================================================ */

function roundrobin(processes, quantum) {

    const q =
        Number(quantum) > 0
            ? Number(quantum)
            : 2;


    /* --------------------------------------------------------
       EMPTY INPUT
    -------------------------------------------------------- */

    if (!processes || processes.length === 0) {

        return {
            processes: [],
            gantt: [],
            steps: [],
            initialStep: null
        };

    }


    /* --------------------------------------------------------
       CLONE PROCESSES
    -------------------------------------------------------- */

    const procs = processes.map((process, index) => ({

        ...process,

        originalIndex: index,

        remainingTime:
            Number(process.burstTime),

        firstStartTime: -1,

        completionTime: -1,

        status: "WAITING"

    }));


    /* --------------------------------------------------------
       SORT BY ARRIVAL TIME
    -------------------------------------------------------- */

    const unarrived =
        [...procs].sort((a, b) => {

            if (
                a.arrivalTime !==
                b.arrivalTime
            ) {

                return (
                    a.arrivalTime -
                    b.arrivalTime
                );

            }

            return (
                a.originalIndex -
                b.originalIndex
            );

        });


    /* --------------------------------------------------------
       DATA STRUCTURES
    -------------------------------------------------------- */

    const readyQueue = [];

    const gantt = [];

    const steps = [];

    let currentTime = 0;

    let stepCounter = 1;


    /* ========================================================
       PROCESS STATUS SNAPSHOT
    ======================================================== */

    function getProcessStatusesSnapshot() {

        return procs.map(process => ({

            id: process.id,

            burstTime:
                process.burstTime,

            remainingTime:
                process.remainingTime,

            status:
                process.status

        }));

    }


    /* ========================================================
       CHECK NEW ARRIVALS
    ======================================================== */

    function checkArrivals(targetTime) {

        while (
            unarrived.length > 0 &&
            unarrived[0].arrivalTime <=
                targetTime
        ) {

            const arriving =
                unarrived.shift();


            arriving.status = "READY";


            readyQueue.push(
                arriving
            );

        }

    }


    /* ========================================================
       INITIAL ARRIVALS
    ======================================================== */

    checkArrivals(currentTime);


    /* ========================================================
       INITIAL STEP
    ======================================================== */

    const initialStep = {

        stepIndex: 0,

        timeQuantum: q,

        currentTime: 0,

        runningProcess: null,

        readyQueue:
            readyQueue.map(process => ({

                id: process.id,

                burstTime:
                    process.burstTime,

                remainingTime:
                    process.remainingTime

            })),

        processStatuses:
            getProcessStatusesSnapshot(),

        explanation:
            "Initial state. Click Next to begin execution."

    };


    /* ========================================================
       MAIN ROUND ROBIN LOOP
    ======================================================== */

    while (
        readyQueue.length > 0 ||
        unarrived.length > 0
    ) {


        /* ----------------------------------------------------
           CPU IDLE
        ---------------------------------------------------- */

        if (readyQueue.length === 0) {

            const nextArrival =
                unarrived[0].arrivalTime;


            const idleStart =
                currentTime;


            currentTime =
                nextArrival;


            checkArrivals(
                currentTime
            );


            gantt.push({

                id: "IDLE",

                startTime:
                    idleStart,

                endTime:
                    currentTime,

                remainingTime: 0

            });


            steps.push({

                stepIndex:
                    stepCounter++,

                timeQuantum: q,

                currentTime:
                    currentTime,

                runningProcess: {

                    id: "IDLE",

                    burstTime: 0,

                    startTime:
                        idleStart,

                    endTime:
                        currentTime,

                    executed:
                        currentTime -
                        idleStart,

                    remainingTime: 0,

                    status: "IDLE"

                },

                readyQueue:
                    readyQueue.map(
                        process => ({

                            id:
                                process.id,

                            burstTime:
                                process.burstTime,

                            remainingTime:
                                process.remainingTime

                        })
                    ),

                processStatuses:
                    getProcessStatusesSnapshot(),

                explanation:
                    `CPU is idle from time ${idleStart} to ${currentTime} because no process has arrived.`

            });


            continue;

        }


        /* ----------------------------------------------------
           TAKE FIRST PROCESS FROM READY QUEUE
        ---------------------------------------------------- */

        const current =
            readyQueue.shift();


        current.status =
            "RUNNING";


        /* ----------------------------------------------------
           FIRST CPU RESPONSE
        ---------------------------------------------------- */

        if (
            current.firstStartTime === -1
        ) {

            current.firstStartTime =
                currentTime;

        }


        /* ----------------------------------------------------
           EXECUTION TIME
        ---------------------------------------------------- */

        const executeTime =
            Math.min(
                q,
                current.remainingTime
            );


        const startTime =
            currentTime;


        const endTime =
            startTime +
            executeTime;


        /* ----------------------------------------------------
           EXECUTE PROCESS
        ---------------------------------------------------- */

        current.remainingTime -=
            executeTime;


        currentTime =
            endTime;


        /* ----------------------------------------------------
           CHECK ARRIVALS DURING EXECUTION
        ---------------------------------------------------- */

        checkArrivals(
            currentTime
        );


        /* ----------------------------------------------------
           PROCESS STATUS
        ---------------------------------------------------- */

        let processStatus;

        let explanationText;


        if (
            current.remainingTime > 0
        ) {

            processStatus =
                "TIME QUANTUM EXPIRED";


            current.status =
                "READY";


            /*
             * Important:
             * Process goes to BACK of FIFO queue.
             */

            readyQueue.push(
                current
            );


            explanationText =
                `Process ${current.id} executes from ${startTime} to ${endTime}. ` +
                `Time quantum of ${q} expires. ` +
                `${current.remainingTime} unit(s) of burst time remain, ` +
                `so ${current.id} moves to the back of the Ready Queue.`;

        }

        else {

            processStatus =
                "COMPLETED";


            current.status =
                "COMPLETED";


            current.completionTime =
                currentTime;


            explanationText =
                `Process ${current.id} executes from ${startTime} to ${endTime}. ` +
                `Its remaining burst time becomes 0, so ${current.id} is completed.`;

        }


        /* ----------------------------------------------------
           GANTT SEGMENT
        ---------------------------------------------------- */

        gantt.push({

            id:
                current.id,

            startTime:
                startTime,

            endTime:
                endTime,

            remainingTime:
                current.remainingTime

        });


        /* ====================================================
           STEP SNAPSHOT
        ==================================================== */

        steps.push({

            stepIndex:
                stepCounter++,

            timeQuantum:
                q,

            currentTime:
                currentTime,


            runningProcess: {

                id:
                    current.id,

                burstTime:
                    current.burstTime,

                startTime:
                    startTime,

                endTime:
                    endTime,

                executed:
                    executeTime,

                remainingTime:
                    current.remainingTime,

                status:
                    processStatus

            },


            /*
             * IMPORTANT:
             * This is the queue AFTER the current
             * process has finished its time slice.
             */

            readyQueue:
                readyQueue.map(
                    process => ({

                        id:
                            process.id,

                        burstTime:
                            process.burstTime,

                        remainingTime:
                            process.remainingTime

                    })
                ),


            processStatuses:
                getProcessStatusesSnapshot(),


            explanation:
                explanationText

        });

    }


    /* ========================================================
       CALCULATE FINAL PROCESS VALUES
    ======================================================== */

    const resultMap =
        new Map();


    for (
        const process of procs
    ) {

        const startTime =
            process.firstStartTime !== -1
                ? process.firstStartTime
                : process.arrivalTime;


        const completionTime =
            process.completionTime !== -1
                ? process.completionTime
                : startTime +
                  process.burstTime;


        const turnaroundTime =
            completionTime -
            process.arrivalTime;


        const waitingTime =
            turnaroundTime -
            process.burstTime;


        const responseTime =
            startTime -
            process.arrivalTime;


        resultMap.set(

            process.id,

            {

                id:
                    process.id,

                arrivalTime:
                    process.arrivalTime,

                burstTime:
                    process.burstTime,

                startTime:
                    startTime,

                completionTime:
                    completionTime,

                turnaroundTime:
                    turnaroundTime,

                waitingTime:
                    waitingTime,

                responseTime:
                    responseTime,

                priority:
                    process.priority

            }

        );

    }


    /* --------------------------------------------------------
       PRESERVE ORIGINAL PROCESS ORDER
    -------------------------------------------------------- */

    const resultProcesses =
        processes.map(
            process =>
                resultMap.get(
                    process.id
                )
        );


    /* ========================================================
       RETURN
    ======================================================== */

    return {

        processes:
            resultProcesses,

        gantt:
            gantt,

        steps:
            steps,

        initialStep:
            initialStep

    };

}



/* ============================================================
   ROUND ROBIN VISUALIZATION
============================================================ */

/**
 * Renders:
 *
 * ┌───────────────────────────────────────────────┐
 * │ Time Quantum     Current Time                 │
 * │                                               │
 * │ ┌──────────┐   ┌───────────────────────────┐ │
 * │ │   CPU    │   │       READY QUEUE         │ │
 * │ │          │   │                           │ │
 * │ │    P2    │   │ P3   BT:4   Rem:4         │ │
 * │ │          │   │ P1   BT:5   Rem:3         │ │
 * │ │ Rem: 1   │   │ P4   BT:2   Rem:2         │ │
 * │ └──────────┘   └───────────────────────────┘ │
 * │                                               │
 * │ Process Status                                │
 * └───────────────────────────────────────────────┘
 */

function renderRoundRobinQueues(
    stepData
) {


    /* --------------------------------------------------------
       GET DOM ELEMENTS
    -------------------------------------------------------- */

    const container =
        document.getElementById(
            "rrQueueContainer"
        );


    const quantumValEl =
        document.getElementById(
            "rrQuantumVal"
        );


    const currentTimeValEl =
        document.getElementById(
            "rrCurrentTimeVal"
        );


    const cpuProcessEl =
        document.getElementById(
            "rrCpuProcess"
        );


    const readyQueueEl =
        document.getElementById(
            "rrReadyQueue"
        );


    const processStatusesEl =
        document.getElementById(
            "rrProcessStatuses"
        );


    if (!container) {

        return;

    }


    /* --------------------------------------------------------
       SHOW ROUND ROBIN SECTION
    -------------------------------------------------------- */

    container.style.display =
        "block";


    /* --------------------------------------------------------
       CLEAR STATE
    -------------------------------------------------------- */

    if (!stepData) {

        clearRoundRobinQueues();

        return;

    }


    /* ========================================================
       TOP BADGES
    ======================================================== */

    if (quantumValEl) {

        quantumValEl.textContent =
            stepData.timeQuantum ??
            "-";

    }


    if (currentTimeValEl) {

        currentTimeValEl.textContent =
            stepData.currentTime ??
            "0";

    }



    /* ========================================================
       CPU / RUNNING PROCESS
    ======================================================== */

    if (cpuProcessEl) {

        cpuProcessEl.innerHTML =
            "";


        const running =
            stepData.runningProcess;


        /* ----------------------------------------------------
           STEP 0
        ---------------------------------------------------- */

        if (!running) {

            cpuProcessEl.innerHTML = `

                <div class="rr-empty-label">

                    CPU Idle

                </div>

            `;

        }


        /* ----------------------------------------------------
           CPU IDLE
        ---------------------------------------------------- */

        else if (
            running.id === "IDLE"
        ) {

            cpuProcessEl.innerHTML = `

                <div class="rr-idle-box">

                    <div class="rr-idle-title">
                        CPU IDLE
                    </div>

                    <div class="rr-idle-time">

                        ${running.startTime}
                        →
                        ${running.endTime}

                    </div>

                </div>

            `;

        }


        /* ----------------------------------------------------
           RUNNING PROCESS
        ---------------------------------------------------- */

        else {

            let statusClass =
                "running";


            if (
                running.status ===
                "COMPLETED"
            ) {

                statusClass =
                    "completed";

            }


            if (
                running.status ===
                "TIME QUANTUM EXPIRED"
            ) {

                statusClass =
                    "expired";

            }


            cpuProcessEl.innerHTML = `

                <div class="rr-running-box">

                    <div class="rr-running-pid">

                        ${running.id}

                    </div>


                    <div class="rr-running-info">

                        <span>

                            BT:

                            <strong>
                                ${running.burstTime}
                            </strong>

                        </span>


                        <span>

                            Executed:

                            <strong>
                                ${running.executed}
                            </strong>

                        </span>

                    </div>


                    <div class="rr-remaining">

                        Remaining Burst:

                        <strong>
                            ${running.remainingTime}
                        </strong>

                    </div>


                    <div class="rr-running-status ${statusClass}">

                        ${running.status}

                    </div>

                </div>

            `;

        }

    }



    /* ========================================================
       READY QUEUE
    ======================================================== */

    if (readyQueueEl) {

        readyQueueEl.innerHTML =
            "";


        const queue =
            stepData.readyQueue ||
            [];


        /* ----------------------------------------------------
           EMPTY QUEUE
        ---------------------------------------------------- */

        if (
            queue.length === 0
        ) {

            readyQueueEl.innerHTML = `

                <div class="rr-empty-queue">

                    <span>✓</span>

                    Ready Queue is empty

                </div>

            `;

        }


        /* ----------------------------------------------------
           QUEUE ITEMS
        ---------------------------------------------------- */

        else {

            queue.forEach(
                (
                    process,
                    index
                ) => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "rr-ready-item";


                    /*
                     * FIRST ITEM = FRONT
                     */

                    if (index === 0) {

                        item.classList.add(
                            "queue-front"
                        );

                    }


                    item.innerHTML = `

                        <div class="rr-position">

                            ${index + 1}

                        </div>


                        <div class="rr-process-name">

                            ${process.id}

                        </div>


                        <div class="rr-process-bt">

                            BT:

                            <strong>
                                ${process.burstTime}
                            </strong>

                        </div>


                        <div class="rr-process-remaining">

                            Remaining:

                            <strong>
                                ${process.remainingTime}
                            </strong>

                        </div>

                    `;


                    readyQueueEl.appendChild(
                        item
                    );

                }
            );

        }

    }



    /* ========================================================
       PROCESS STATUS
    ======================================================== */

    if (processStatusesEl) {

        processStatusesEl.innerHTML =
            "";


        const statuses =
            stepData.processStatuses ||
            [];


        statuses.forEach(
            process => {


                const chip =
                    document.createElement(
                        "div"
                    );


                chip.className =
                    "rr-status-chip";


                const status =
                    process.status ||
                    "WAITING";


                let displayStatus =
                    status;


                if (
                    status ===
                    "COMPLETED"
                ) {

                    displayStatus =
                        "DONE";

                }


                chip.innerHTML = `

                    <strong>
                        ${process.id}
                    </strong>


                    <span class="status-badge ${status.toLowerCase()}">

                        ${displayStatus}

                    </span>


                    <span class="status-remaining">

                        Rem:
                        ${process.remainingTime}

                    </span>

                `;


                processStatusesEl.appendChild(
                    chip
                );

            }
        );

    }

}



/* ============================================================
   CLEAR ROUND ROBIN VISUALIZATION
============================================================ */

function clearRoundRobinQueues() {


    const quantumValEl =
        document.getElementById(
            "rrQuantumVal"
        );


    const currentTimeValEl =
        document.getElementById(
            "rrCurrentTimeVal"
        );


    const cpuProcessEl =
        document.getElementById(
            "rrCpuProcess"
        );


    const readyQueueEl =
        document.getElementById(
            "rrReadyQueue"
        );


    const processStatusesEl =
        document.getElementById(
            "rrProcessStatuses"
        );


    /* --------------------------------------------------------
       RESET QUANTUM
    -------------------------------------------------------- */

    if (quantumValEl) {

        quantumValEl.textContent =
            "-";

    }


    /* --------------------------------------------------------
       RESET TIME
    -------------------------------------------------------- */

    if (currentTimeValEl) {

        currentTimeValEl.textContent =
            "-";

    }


    /* --------------------------------------------------------
       RESET CPU
    -------------------------------------------------------- */

    if (cpuProcessEl) {

        cpuProcessEl.innerHTML = `

            <div class="rr-empty-label">

                CPU Idle

            </div>

        `;

    }


    /* --------------------------------------------------------
       RESET READY QUEUE
    -------------------------------------------------------- */

    if (readyQueueEl) {

        readyQueueEl.innerHTML = `

            <div class="rr-empty-queue">

                Queue Empty

            </div>

        `;

    }


    /* --------------------------------------------------------
       RESET STATUS
    -------------------------------------------------------- */

    if (processStatusesEl) {

        processStatusesEl.innerHTML =
            "";

    }

}



/* ============================================================
   GLOBAL EXPORTS
============================================================ */

if (
    typeof window !==
    "undefined"
) {

    window.roundrobin =
        roundrobin;


    window.roundRobin =
        roundrobin;


    window.renderRoundRobinQueues =
        renderRoundRobinQueues;


    window.clearRoundRobinQueues =
        clearRoundRobinQueues;

}


if (
    typeof globalThis !==
    "undefined"
) {

    globalThis.roundrobin =
        roundrobin;


    globalThis.roundRobin =
        roundrobin;


    globalThis.renderRoundRobinQueues =
        renderRoundRobinQueues;


    globalThis.clearRoundRobinQueues =
        clearRoundRobinQueues;

}