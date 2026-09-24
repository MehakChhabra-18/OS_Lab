console.log("CPU Scheduling JS loaded");

/* =========================================================
   DOM ELEMENTS
========================================================= */

const algorithmInput = document.getElementById("algorithm");
const processCountInput = document.getElementById("processCount");
const processInputs = document.getElementById("processInputs");

const simulateButton = document.getElementById("simulateBtn");
const resetButton = document.getElementById("resetBtn");

const quantumContainer = document.getElementById("quantumContainer");
const timeQuantumInput = document.getElementById("timeQuantum");

const ganttChart = document.getElementById("ganttChart");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const stepCounter = document.getElementById("stepCounter");

const currentProcess = document.getElementById("currentProcess");
const startTime = document.getElementById("startTime");
const completionTime = document.getElementById("completionTime");
const duration = document.getElementById("duration");

const explanationText = document.getElementById("explanationText");

const executionTimeline =
    document.getElementById("executionTimeline");

const principleTitle =
    document.getElementById("principleTitle");

const principleText =
    document.getElementById("principleText");

const resultsBody =
    document.getElementById("resultsBody");

const avgWaiting =
    document.getElementById("avgWaiting");

const avgTurnaround =
    document.getElementById("avgTurnaround");

const avgResponse =
    document.getElementById("avgResponse");

const totalCpuTime =
    document.getElementById("totalCpuTime");


/* =========================================================
   STATE
========================================================= */

let processes = [];
let simulationResult = null;

let currentStep = -1;

let executionSteps = [];

let animationTimer = null;


/* =========================================================
   ALGORITHM INFORMATION
========================================================= */

const algorithmInfo = {

    fcfs: {
        title: "💡 FCFS (First Come First Serve)",
        text:
            "Processes are executed in the order in which they arrive. " +
            "The process that arrives first gets the CPU first and runs until completion."
    },

    sjf: {
        title: "💡 SJF (Shortest Job First)",
        text:
            "Among the processes that have already arrived, the process " +
            "with the smallest burst time is selected next. SJF is non-preemptive."
    },

    srtf: {
        title: "💡 SRTF (Shortest Remaining Time First)",
        text:
            "SRTF is the preemptive version of SJF. At every point, " +
            "the process with the shortest remaining burst time gets the CPU."
    },

    priority: {
        title: "💡 Priority Scheduling",
        text:
            "The CPU is assigned to the process with the highest priority " +
            "among the processes that have arrived. A smaller priority number " +
            "represents a higher priority."
    },

    roundrobin: {
        title: "💡 Round Robin",
        text:
            "Each process gets the CPU for a fixed time quantum. " +
            "If the process is not finished, it goes to the back of the ready queue."
    }
};


/* =========================================================
   CREATE PROCESS INPUTS
========================================================= */

function createProcessInputs() {

    if (!processInputs) {
        console.error("processInputs element not found.");
        return;
    }

    let count = Number(processCountInput.value);

    if (!count || count < 1) {
        count = 1;
    }

    if (count > 10) {
        count = 10;
        processCountInput.value = 10;
    }

    const algorithm = algorithmInput.value;

    processInputs.innerHTML = "";

    const header =
        document.querySelector(".process-header");

    if (header) {

        if (algorithm === "priority") {

            header.innerHTML = `
                <span>Process ID</span>
                <span>Arrival Time (AT)</span>
                <span>Burst Time (BT)</span>
                <span>Priority</span>
            `;

            header.style.gridTemplateColumns =
                "70px 1fr 1fr 1fr";

        } else {

            header.innerHTML = `
                <span>Process ID</span>
                <span>Arrival Time (AT)</span>
                <span>Burst Time (BT)</span>
            `;

            header.style.gridTemplateColumns =
                "70px 1fr 1fr";
        }
    }


    for (let i = 0; i < count; i++) {

        const row = document.createElement("div");

        row.className = "process-row";

        if (algorithm === "priority") {

            row.style.gridTemplateColumns =
                "70px 1fr 1fr 1fr";

            row.innerHTML = `

                <span>P${i + 1}</span>

                <input
                    type="number"
                    class="arrival-input"
                    value="${i === 0 ? 0 : i}"
                    min="0"
                >

                <input
                    type="number"
                    class="burst-input"
                    value="${i + 1}"
                    min="1"
                >

                <input
                    type="number"
                    class="priority-input"
                    value="${i + 1}"
                    min="1"
                >

            `;

        } else {

            row.innerHTML = `

                <span>P${i + 1}</span>

                <input
                    type="number"
                    class="arrival-input"
                    value="${i === 0 ? 0 : i}"
                    min="0"
                >

                <input
                    type="number"
                    class="burst-input"
                    value="${i + 1}"
                    min="1"
                >

            `;
        }

        processInputs.appendChild(row);
    }
}


/* =========================================================
   GET PROCESSES FROM INPUT
========================================================= */

function readProcesses() {

    const rows = processInputs.children;

    const result = [];

    for (let i = 0; i < rows.length; i++) {

        const row = rows[i];

        const arrivalInput =
            row.querySelector(".arrival-input");

        const burstInput =
            row.querySelector(".burst-input");

        const priorityInput =
            row.querySelector(".priority-input");


        const arrivalTime =
            Number(arrivalInput.value);

        const burstTime =
            Number(burstInput.value);


        if (
            Number.isNaN(arrivalTime) ||
            Number.isNaN(burstTime) ||
            arrivalTime < 0 ||
            burstTime <= 0
        ) {

            alert(
                `Please enter valid values for P${i + 1}.`
            );

            return null;
        }


        const process = {

            id: `P${i + 1}`,

            arrivalTime: arrivalTime,

            burstTime: burstTime,

            priority:
                priorityInput
                    ? Number(priorityInput.value)
                    : 0,

            remainingTime: burstTime,

            startTime: null,

            completionTime: null,

            firstStartTime: null,

            executed: 0
        };


        result.push(process);
    }


    return result;
}


/* =========================================================
   FCFS
========================================================= */

function fcfs(processList) {

    const sorted =
        [...processList].sort(
            (a, b) =>
                a.arrivalTime - b.arrivalTime
        );


    let time = 0;

    const segments = [];

    const completed = [];


    for (const process of sorted) {

        if (time < process.arrivalTime) {

            segments.push({
                id: "IDLE",
                startTime: time,
                endTime: process.arrivalTime
            });

            time = process.arrivalTime;
        }


        const start = time;

        const end =
            start + process.burstTime;


        segments.push({
            id: process.id,
            startTime: start,
            endTime: end
        });


        completed.push({
            ...process,

            startTime: start,

            completionTime: end,

            firstStartTime: start
        });


        time = end;
    }


    return buildResult(
        completed,
        segments
    );
}


/* =========================================================
   SJF
========================================================= */

function sjf(processList) {

    const remaining =
        processList.map(p => ({
            ...p,
            remainingTime: p.burstTime
        }));


    const completed = [];

    const segments = [];

    let time = 0;


    while (completed.length < remaining.length) {

        const available =
            remaining.filter(
                p =>
                    p.completionTime == null &&
                    p.arrivalTime <= time
            );


        if (available.length === 0) {

            const nextArrival =
                Math.min(
                    ...remaining
                        .filter(
                            p =>
                                p.completionTime == null
                        )
                        .map(
                            p => p.arrivalTime
                        )
                );


            segments.push({
                id: "IDLE",
                startTime: time,
                endTime: nextArrival
            });


            time = nextArrival;

            continue;
        }


        available.sort(
            (a, b) => {

                if (a.burstTime !== b.burstTime) {

                    return (
                        a.burstTime -
                        b.burstTime
                    );
                }

                return (
                    a.arrivalTime -
                    b.arrivalTime
                );
            }
        );


        const process = available[0];

        const start = time;

        const end =
            time + process.burstTime;


        segments.push({
            id: process.id,
            startTime: start,
            endTime: end
        });


        process.startTime = start;

        process.firstStartTime = start;

        process.completionTime = end;


        time = end;

        completed.push(process);
    }


    return buildResult(
        completed,
        segments
    );
}


/* =========================================================
   SRTF
========================================================= */

function srtf(processList) {

    const list =
        processList.map(p => ({
            ...p,
            remainingTime: p.burstTime,
            firstStartTime: null
        }));


    const segments = [];

    let completedCount = 0;

    let time = 0;

    let currentId = null;

    let segmentStart = 0;


    while (
        completedCount <
        list.length
    ) {

        const available =
            list.filter(
                p =>
                    p.arrivalTime <= time &&
                    p.remainingTime > 0
            );


        if (available.length === 0) {

            const nextArrival =
                Math.min(
                    ...list
                        .filter(
                            p =>
                                p.remainingTime > 0
                        )
                        .map(
                            p => p.arrivalTime
                        )
                );


            if (currentId !== null) {

                segments.push({
                    id: currentId,
                    startTime: segmentStart,
                    endTime: time
                });

                currentId = null;
            }


            segments.push({
                id: "IDLE",
                startTime: time,
                endTime: nextArrival
            });


            time = nextArrival;

            continue;
        }


        available.sort(
            (a, b) => {

                if (
                    a.remainingTime !==
                    b.remainingTime
                ) {

                    return (
                        a.remainingTime -
                        b.remainingTime
                    );
                }

                return (
                    a.arrivalTime -
                    b.arrivalTime
                );
            }
        );


        const process = available[0];


        if (currentId !== process.id) {

            if (currentId !== null) {

                segments.push({
                    id: currentId,
                    startTime: segmentStart,
                    endTime: time
                });
            }

            currentId = process.id;

            segmentStart = time;


            if (
                process.firstStartTime === null
            ) {

                process.firstStartTime = time;
            }
        }


        process.remainingTime--;

        time++;


        if (process.remainingTime === 0) {

            process.completionTime = time;

            completedCount++;
        }
    }


    if (currentId !== null) {

        segments.push({
            id: currentId,
            startTime: segmentStart,
            endTime: time
        });
    }


    return buildResult(
        list,
        mergeSegments(segments)
    );
}


/* =========================================================
   PRIORITY
========================================================= */

function priorityScheduling(processList) {

    const remaining =
        processList.map(p => ({
            ...p
        }));


    const completed = [];

    const segments = [];

    let time = 0;


    while (
        completed.length <
        remaining.length
    ) {

        const available =
            remaining.filter(
                p =>
                    p.completionTime == null &&
                    p.arrivalTime <= time
            );


        if (available.length === 0) {

            const nextArrival =
                Math.min(
                    ...remaining
                        .filter(
                            p =>
                                p.completionTime == null
                        )
                        .map(
                            p => p.arrivalTime
                        )
                );


            segments.push({
                id: "IDLE",
                startTime: time,
                endTime: nextArrival
            });


            time = nextArrival;

            continue;
        }


        available.sort(
            (a, b) => {

                if (
                    a.priority !==
                    b.priority
                ) {

                    return (
                        a.priority -
                        b.priority
                    );
                }

                return (
                    a.arrivalTime -
                    b.arrivalTime
                );
            }
        );


        const process = available[0];

        const start = time;

        const end =
            time + process.burstTime;


        segments.push({
            id: process.id,
            startTime: start,
            endTime: end
        });


        process.startTime = start;

        process.firstStartTime = start;

        process.completionTime = end;


        time = end;

        completed.push(process);
    }


    return buildResult(
        completed,
        segments
    );
}


/* =========================================================
   ROUND ROBIN
========================================================= */

function roundRobin(
    processList,
    quantum
) {

    const list =
        processList
            .map(p => ({
                ...p,
                remainingTime: p.burstTime,
                firstStartTime: null
            }))
            .sort(
                (a, b) =>
                    a.arrivalTime -
                    b.arrivalTime
            );


    const queue = [];

    const segments = [];

    let time = 0;

    let index = 0;

    let completedCount = 0;


    while (
        completedCount <
        list.length
    ) {


        while (
            index < list.length &&
            list[index].arrivalTime <= time
        ) {

            queue.push(list[index]);

            index++;
        }


        if (queue.length === 0) {

            if (index < list.length) {

                const nextArrival =
                    list[index].arrivalTime;


                segments.push({
                    id: "IDLE",
                    startTime: time,
                    endTime: nextArrival
                });


                time = nextArrival;

                continue;
            }
        }


        const process =
            queue.shift();


        if (
            process.firstStartTime === null
        ) {

            process.firstStartTime = time;
        }


        const executionTime =
            Math.min(
                quantum,
                process.remainingTime
            );


        const start = time;

        const end =
            time + executionTime;


        segments.push({
            id: process.id,
            startTime: start,
            endTime: end
        });


        process.remainingTime -=
            executionTime;


        time = end;


        while (
            index < list.length &&
            list[index].arrivalTime <= time
        ) {

            queue.push(list[index]);

            index++;
        }


        if (
            process.remainingTime > 0
        ) {

            queue.push(process);

        } else {

            process.completionTime =
                time;

            completedCount++;
        }
    }


    return buildResult(
        list,
        mergeSegments(segments)
    );
}


/* =========================================================
   MERGE SAME GANTT SEGMENTS
========================================================= */

function mergeSegments(segments) {

    if (!segments.length) {
        return [];
    }


    const merged = [
        { ...segments[0] }
    ];


    for (
        let i = 1;
        i < segments.length;
        i++
    ) {

        const previous =
            merged[merged.length - 1];

        const current =
            segments[i];


        if (
            previous.id === current.id &&
            previous.endTime ===
            current.startTime
        ) {

            previous.endTime =
                current.endTime;

        } else {

            merged.push({
                ...current
            });
        }
    }


    return merged;
}


/* =========================================================
   BUILD FINAL RESULT
========================================================= */

function buildResult(
    processList,
    segments
) {

    const result = processList.map(p => {

        const start =
            p.firstStartTime ??
            p.startTime;


        const completion =
            p.completionTime;


        const turnaround =
            completion -
            p.arrivalTime;


        const waiting =
            turnaround -
            p.burstTime;


        const response =
            start -
            p.arrivalTime;


        return {

            id: p.id,

            arrivalTime:
                p.arrivalTime,

            burstTime:
                p.burstTime,

            priority:
                p.priority,

            startTime:
                start,

            completionTime:
                completion,

            turnaroundTime:
                turnaround,

            waitingTime:
                waiting,

            responseTime:
                response
        };
    });


    return {

        processes: result,

        gantt: segments
    };
}


/* =========================================================
   SIMULATE
========================================================= */

simulateButton.addEventListener(
    "click",
    function () {

        console.log("SIMULATE CLICKED");


        processes =
            readProcesses();


        if (!processes) {
            return;
        }


        const algorithm =
            algorithmInput.value;


        let result;


        if (algorithm === "fcfs") {

            result =
                fcfs(processes);

        } else if (algorithm === "sjf") {

            result =
                sjf(processes);

        } else if (algorithm === "srtf") {

            result =
                srtf(processes);

        } else if (algorithm === "priority") {

            result =
                priorityScheduling(
                    processes
                );

        } else if (
            algorithm === "roundrobin"
        ) {

            const quantum =
                Number(
                    timeQuantumInput.value
                );


            if (
                !quantum ||
                quantum <= 0
            ) {

                alert(
                    "Please enter a valid Time Quantum."
                );

                return;
            }


            result =
                roundRobin(
                    processes,
                    quantum
                );
        }


        simulationResult = result;

        executionSteps =
            result.gantt;


        currentStep = -1;


        updatePrinciple(
            algorithm
        );


        renderResults(
            result.processes
        );


        renderTimeline(
            result.gantt
        );


        clearGantt();


        updateNavigation();


        resetStepInfo();


        console.log(
            "Simulation Result:",
            result
        );
    }
);


/* =========================================================
   NEXT BUTTON
========================================================= */

nextBtn.addEventListener(
    "click",
    function () {

        if (
            currentStep <
            executionSteps.length - 1
        ) {

            showStep(
                currentStep + 1
            );
        }
    }
);


/* =========================================================
   PREVIOUS BUTTON
========================================================= */

previousBtn.addEventListener(
    "click",
    function () {

        if (currentStep > 0) {

            showStep(
                currentStep - 1
            );
        }
    }
);


/* =========================================================
   SHOW STEP
========================================================= */

function showStep(index) {

    if (
        index < 0 ||
        index >= executionSteps.length
    ) {

        return;
    }


    currentStep = index;


    const step =
        executionSteps[index];


    drawGanttUntil(
        executionSteps,
        index
    );


    updateStepInformation(
        step,
        index
    );


    updateTimelineActive(
        index
    );


    updateNavigation();
}


/* =========================================================
   STEP INFORMATION
========================================================= */

function updateStepInformation(
    step,
    index
) {

    if (step.id === "IDLE") {

        currentProcess.textContent =
            "IDLE";

        currentProcess.style.color =
            "#9ca9ca";

        explanationText.textContent =
            `CPU is idle from time ${step.startTime} ` +
            `to ${step.endTime} because no process ` +
            `is available in the ready queue.`;

    } else {

        currentProcess.textContent =
            step.id;

        currentProcess.style.color =
            "#6fa1ff";


        explanationText.textContent =
            `${step.id} is executing from time ` +
            `${step.startTime} to ${step.endTime}. ` +
            `Execution duration is ` +
            `${step.endTime - step.startTime} time unit(s).`;
    }


    startTime.textContent =
        step.startTime;


    completionTime.textContent =
        step.endTime;


    duration.textContent =
        step.endTime -
        step.startTime;


    stepCounter.textContent =
        `Step ${index + 1} of ${executionSteps.length}`;
}


/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {

    previousBtn.disabled =
        currentStep <= 0;


    nextBtn.disabled =
        currentStep >=
        executionSteps.length - 1;
}


/* =========================================================
   CANVAS
========================================================= */

function getGanttCanvas() {

    let canvas =
        document.getElementById(
            "ganttCanvas"
        );


    if (!canvas) {

        ganttChart.innerHTML = "";

        canvas =
            document.createElement(
                "canvas"
            );

        canvas.id =
            "ganttCanvas";

        ganttChart.appendChild(
            canvas
        );
    }


    return canvas;
}


function clearGantt() {

    if (!ganttChart) {
        return;
    }


    ganttChart.innerHTML = "";


    const empty =
        document.createElement(
            "div"
        );

    empty.className =
        "empty-gantt";

    empty.textContent =
        "Use Next to visualize the Gantt chart";

    ganttChart.appendChild(
        empty
    );
}


function drawGanttUntil(
    segments,
    index
) {

    if (!segments.length) {
        return;
    }


    const visible =
        segments.slice(
            0,
            index + 1
        );


    ganttChart.innerHTML = "";


    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.id =
        "ganttCanvas";


    const totalTime =
        segments[
            segments.length - 1
        ].endTime;


    const minWidth =
        Math.max(
            700,
            totalTime * 90
        );


    canvas.width =
        minWidth;

    canvas.height =
        165;

    canvas.style.width =
        `${minWidth}px`;

    canvas.style.height =
        "165px";


    ganttChart.style.overflowX =
        "auto";


    ganttChart.appendChild(
        canvas
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const left =
        35;

    const top =
        40;

    const blockHeight =
        60;


    const usableWidth =
        minWidth - 70;


    const scale =
        usableWidth /
        Math.max(
            totalTime,
            1
        );


    const colors = [
        "#468cff",
        "#8857f5",
        "#f4c45e",
        "#e951a5",
        "#48d6b0"
    ];


    visible.forEach(
        (segment, i) => {

            const x =
                left +
                segment.startTime *
                scale;


            const width =
                Math.max(
                    50,
                    (
                        segment.endTime -
                        segment.startTime
                    ) * scale
                );


            let fill;


            if (
                segment.id ===
                "IDLE"
            ) {

                fill = "#3a4563";

            } else {

                fill =
                    colors[
                        i %
                        colors.length
                    ];
            }


            ctx.fillStyle =
                fill;


            ctx.fillRect(
                x,
                top,
                width,
                blockHeight
            );


            ctx.strokeStyle =
                "#080d1c";

            ctx.lineWidth =
                2;


            ctx.strokeRect(
                x,
                top,
                width,
                blockHeight
            );


            ctx.fillStyle =
                "#071020";


            ctx.font =
                "bold 17px Arial";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                segment.id,
                x + width / 2,
                top + blockHeight / 2
            );


            ctx.font =
                "14px Arial";


            ctx.fillStyle =
                "#dce4ff";


            ctx.textBaseline =
                "top";


            ctx.fillText(
                segment.startTime,
                x,
                top +
                blockHeight +
                8
            );


            if (
                i ===
                visible.length - 1
            ) {

                ctx.fillText(
                    segment.endTime,
                    x + width,
                    top +
                    blockHeight +
                    8
                );
            }
        }
    );
}


/* =========================================================
   DYNAMIC EXECUTION TIMELINE
========================================================= */

function renderTimeline(
    segments
) {

    if (!executionTimeline) {
        return;
    }


    executionTimeline.innerHTML =
        "";


    if (!segments.length) {

        executionTimeline.innerHTML =
            `
            <div class="empty-timeline">
                No execution yet
            </div>
            `;

        return;
    }


    segments.forEach(
        (segment, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "timeline-item";


            item.dataset.index =
                index;


            item.innerHTML = `

                <div class="timeline-number">
                    ${index + 1}
                </div>

                <div class="timeline-process">
                    <strong>
                        ${segment.id}
                    </strong>
                </div>

                <div class="timeline-time">
                    ${segment.startTime}
                    →
                    ${segment.endTime}
                </div>

            `;


            executionTimeline.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   ACTIVE TIMELINE ITEM
========================================================= */

function updateTimelineActive(
    index
) {

    const items =
        executionTimeline.querySelectorAll(
            ".timeline-item"
        );


    items.forEach(
        (item, i) => {

            item.classList.toggle(
                "active",
                i === index
            );
        }
    );


    const active =
        executionTimeline.querySelector(
            `.timeline-item[data-index="${index}"]`
        );


    if (active) {

        active.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }
}


/* =========================================================
   RESULTS TABLE
========================================================= */

function renderResults(
    resultProcesses
) {

    resultsBody.innerHTML =
        "";


    let waitingSum = 0;

    let turnaroundSum = 0;

    let responseSum = 0;

    let cpuTime = 0;


    resultProcesses.forEach(
        process => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>${process.id}</td>

                <td>${process.arrivalTime}</td>

                <td>${process.burstTime}</td>

                <td>${process.startTime}</td>

                <td>${process.completionTime}</td>

                <td>${process.turnaroundTime}</td>

                <td>${process.waitingTime}</td>

                <td>${process.responseTime}</td>

            `;


            resultsBody.appendChild(
                row
            );


            waitingSum +=
                process.waitingTime;

            turnaroundSum +=
                process.turnaroundTime;

            responseSum +=
                process.responseTime;

            cpuTime +=
                process.burstTime;
        }
    );


    const count =
        resultProcesses.length;


    avgWaiting.textContent =
        (
            waitingSum / count
        ).toFixed(2);


    avgTurnaround.textContent =
        (
            turnaroundSum / count
        ).toFixed(2);


    avgResponse.textContent =
        (
            responseSum / count
        ).toFixed(2);


    totalCpuTime.textContent =
        `${cpuTime} units`;
}


/* =========================================================
   PRINCIPLE
========================================================= */

function updatePrinciple(
    algorithm
) {

    const info =
        algorithmInfo[
            algorithm
        ];


    if (!info) {
        return;
    }


    principleTitle.textContent =
        info.title;


    principleText.textContent =
        info.text;
}


/* =========================================================
   ALGORITHM CHANGE
========================================================= */

algorithmInput.addEventListener(
    "change",
    function () {

        if (
            algorithmInput.value ===
            "roundrobin"
        ) {

            quantumContainer.style.display =
                "block";

        } else {

            quantumContainer.style.display =
                "none";
        }


        createProcessInputs();


        updatePrinciple(
            algorithmInput.value
        );
    }
);


/* =========================================================
   PROCESS COUNT CHANGE
========================================================= */

processCountInput.addEventListener(
    "change",
    createProcessInputs
);


/* =========================================================
   RESET
========================================================= */

resetButton.addEventListener(
    "click",
    function () {

        if (animationTimer) {

            clearInterval(
                animationTimer
            );

            animationTimer = null;
        }


        currentStep = -1;

        processes = [];

        simulationResult = null;

        executionSteps = [];


        clearGantt();


        executionTimeline.innerHTML =
            `
            <div class="empty-timeline">
                No execution yet
            </div>
            `;


        resultsBody.innerHTML =
            "";


        avgWaiting.textContent =
            "-";

        avgTurnaround.textContent =
            "-";

        avgResponse.textContent =
            "-";

        totalCpuTime.textContent =
            "-";


        resetStepInfo();


        updateNavigation();


        processCountInput.value =
            "4";


        algorithmInput.value =
            "fcfs";


        quantumContainer.style.display =
            "none";


        createProcessInputs();


        updatePrinciple(
            "fcfs"
        );
    }
);


/* =========================================================
   RESET STEP INFORMATION
========================================================= */

function resetStepInfo() {

    currentProcess.textContent =
        "-";

    startTime.textContent =
        "-";

    completionTime.textContent =
        "-";

    duration.textContent =
        "-";


    stepCounter.textContent =
        "Step 0 of 0";


    explanationText.textContent =
        "Click Simulate to start the visualization.";
}


/* =========================================================
   FORMULA CHEAT SHEET
========================================================= */

function createFormulaSheet() {

    if (
        document.getElementById(
            "formulaCard"
        )
    ) {

        return;
    }


    const card =
        document.createElement(
            "section"
        );


    card.id =
        "formulaCard";

    card.className =
        "card formula-card";


    card.innerHTML = `

        <div class="card-title">

            <span>ƒ</span>

            <h2>
                CPU Scheduling Formula Cheat Sheet
            </h2>

        </div>


        <div class="formula-grid">

            <div class="formula-item">

                <strong>
                    Completion Time (CT)
                </strong>

                <span>
                    Time at which the process finishes execution.
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Turnaround Time (TAT)
                </strong>

                <span>
                    TAT = CT − AT
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Waiting Time (WT)
                </strong>

                <span>
                    WT = TAT − BT
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Response Time (RT)
                </strong>

                <span>
                    RT = First Start Time − AT
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Average Waiting Time
                </strong>

                <span>
                    Σ WT / Number of Processes
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Average Turnaround Time
                </strong>

                <span>
                    Σ TAT / Number of Processes
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Average Response Time
                </strong>

                <span>
                    Σ RT / Number of Processes
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    CPU Burst Time
                </strong>

                <span>
                    Total CPU execution time of all processes.
                </span>

            </div>


            <div class="formula-item">

                <strong>
                    Round Robin
                </strong>

                <span>
                    Process executes for at most the given Time Quantum.
                </span>

            </div>

        </div>
    `;


    document
        .querySelector("main")
        .appendChild(card);
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createProcessInputs();

        createFormulaSheet();

        updatePrinciple(
            algorithmInput.value
        );

        clearGantt();

        updateNavigation();

        resetStepInfo();
    }
);