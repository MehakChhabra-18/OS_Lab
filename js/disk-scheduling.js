/* =========================================================
   OS LAB - DISK SCHEDULING
   Complete Controller + Visualization
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 Disk Scheduling JS Loaded");

    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const algorithmSelect =
        document.getElementById("algorithm");

    const initialHeadInput =
        document.getElementById("initialHead");

    const requestQueueInput =
        document.getElementById("requestQueue");

    const simulateBtn =
        document.getElementById("simulateBtn");

    const resetBtn =
        document.getElementById("resetBtn");

    const previousBtn =
        document.getElementById("previousBtn");

    const nextBtn =
        document.getElementById("nextBtn");

    const canvas =
        document.getElementById("diskCanvas");

    const stepCounter =
        document.getElementById("stepCounter");

    const currentHead =
        document.getElementById("currentHead");

    const nextRequest =
        document.getElementById("nextRequest");

    const seekDistance =
        document.getElementById("seekDistance");

    const totalSeek =
        document.getElementById("totalSeek");

    const movementText =
        document.getElementById("movementText");

    const explanationText =
        document.getElementById("explanationText");

    const requestOrder =
        document.getElementById("requestOrder");

    const resultSeek =
        document.getElementById("resultSeek");

    const resultRequests =
        document.getElementById("resultRequests");

    const resultAverage =
        document.getElementById("resultAverage");


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (
        !algorithmSelect ||
        !initialHeadInput ||
        !requestQueueInput ||
        !simulateBtn ||
        !resetBtn ||
        !previousBtn ||
        !nextBtn ||
        !canvas
    ) {

        console.error(
            "❌ Disk Scheduling: Required HTML element missing."
        );

        return;
    }

    console.log("✅ All required HTML elements found");


    /* =====================================================
       CANVAS
       ===================================================== */

    const ctx =
        canvas.getContext("2d");

    let canvasWidth = 0;
    let canvasHeight = 650;


    /* =====================================================
       SIMULATION STATE
       ===================================================== */

    let simulationSteps = [];

    let currentStep = 0;

    let simulationStarted = false;

    let initialHead = 50;

    let requests = [];

    let selectedAlgorithm = "fcfs";


    /* =====================================================
       RESIZE CANVAS
       ===================================================== */

    function resizeCanvas() {

        const wrapper =
            canvas.parentElement;

        if (!wrapper) {

            console.error(
                "❌ Canvas wrapper not found"
            );

            return;
        }

        const width =
            wrapper.clientWidth;

        const height = 650;

        const dpr =
            window.devicePixelRatio || 1;


        /*
         * CSS size
         */

        canvas.style.width = "100%";

        canvas.style.height =
            height + "px";


        /*
         * Actual drawing buffer
         */

        canvas.width =
            Math.floor(width * dpr);

        canvas.height =
            Math.floor(height * dpr);


        /*
         * Scale drawing according to DPR
         */

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        canvasWidth = width;

        canvasHeight = height;


        drawVisualization();
    }


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* =====================================================
       PARSE REQUEST QUEUE
       ===================================================== */

    function parseRequests() {

        return requestQueueInput.value
            .split(",")
            .map(value =>
                Number(value.trim())
            )
            .filter(value =>
                Number.isFinite(value)
            );
    }


    /* =====================================================
       VALIDATE INPUT
       ===================================================== */

    function validateInput() {

        const head =
            Number(initialHeadInput.value);

        const queue =
            parseRequests();


        if (!Number.isFinite(head)) {

            alert(
                "Please enter a valid initial head position."
            );

            return false;
        }


        if (head < 0 || head > 199) {

            alert(
                "Head position must be between 0 and 199."
            );

            return false;
        }


        if (queue.length === 0) {

            alert(
                "Please enter at least one disk request."
            );

            return false;
        }


        for (const value of queue) {

            if (value < 0 || value > 199) {

                alert(
                    "All disk requests must be between 0 and 199."
                );

                return false;
            }
        }


        return true;
    }


    /* =====================================================
       FCFS
       ===================================================== */

    function fcfsAlgorithm() {

        return [...requests];
    }


    /* =====================================================
       SSTF
       ===================================================== */

    function sstfAlgorithm() {

        const remaining =
            [...requests];

        const sequence = [];

        let head =
            initialHead;


        while (remaining.length > 0) {

            let closestIndex = 0;

            let closestDistance =
                Math.abs(
                    remaining[0] - head
                );


            for (
                let i = 1;
                i < remaining.length;
                i++
            ) {

                const distance =
                    Math.abs(
                        remaining[i] - head
                    );


                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closestIndex =
                        i;
                }
            }


            const selected =
                remaining.splice(
                    closestIndex,
                    1
                )[0];


            sequence.push(selected);

            head = selected;
        }


        return sequence;
    }


    /* =====================================================
       SCAN
       ===================================================== */

    function scanAlgorithm() {

        const sorted =
            [...requests]
                .sort((a, b) => a - b);


        const right =
            sorted.filter(
                value =>
                    value >= initialHead
            );


        const left =
            sorted.filter(
                value =>
                    value < initialHead
            );


        const result = [
            ...right,
            199,
            ...left.reverse()
        ];


        return removeConsecutiveDuplicates(
            result
        );
    }


    /* =====================================================
       C-SCAN
       ===================================================== */

    function cscanAlgorithm() {

        const sorted =
            [...requests]
                .sort((a, b) => a - b);


        const right =
            sorted.filter(
                value =>
                    value >= initialHead
            );


        const left =
            sorted.filter(
                value =>
                    value < initialHead
            );


        const result = [
            ...right,
            199,
            0,
            ...left
        ];


        return removeConsecutiveDuplicates(
            result
        );
    }


    /* =====================================================
       LOOK
       ===================================================== */

    function lookAlgorithm() {

        const sorted =
            [...requests]
                .sort((a, b) => a - b);


        const right =
            sorted.filter(
                value =>
                    value >= initialHead
            );


        const left =
            sorted.filter(
                value =>
                    value < initialHead
            );


        return [
            ...right,
            ...left.reverse()
        ];
    }


    /* =====================================================
       C-LOOK
       ===================================================== */

    function clookAlgorithm() {

        const sorted =
            [...requests]
                .sort((a, b) => a - b);


        const right =
            sorted.filter(
                value =>
                    value >= initialHead
            );


        const left =
            sorted.filter(
                value =>
                    value < initialHead
            );


        return [
            ...right,
            ...left
        ];
    }


    /* =====================================================
       REMOVE CONSECUTIVE DUPLICATES
       ===================================================== */

    function removeConsecutiveDuplicates(array) {

        return array.filter(
            (value, index) => {

                if (index === 0) {
                    return true;
                }

                return value !==
                    array[index - 1];
            }
        );
    }


    /* =====================================================
       SELECT ALGORITHM
       ===================================================== */

    function calculateSequence() {

        selectedAlgorithm =
            algorithmSelect.value;


        switch (selectedAlgorithm) {

            case "fcfs":

                return fcfsAlgorithm();


            case "sstf":

                return sstfAlgorithm();


            case "scan":

                return scanAlgorithm();


            case "cscan":

                return cscanAlgorithm();


            case "look":

                return lookAlgorithm();


            case "clook":

                return clookAlgorithm();


            default:

                return fcfsAlgorithm();
        }
    }


    /* =====================================================
       CREATE STEP DATA
       ===================================================== */

    function createSteps(sequence) {

        const steps = [];

        let previous =
            initialHead;

        let total = 0;


        sequence.forEach(
            (request, index) => {

                const distance =
                    Math.abs(
                        request -
                        previous
                    );


                total += distance;


                steps.push({

                    step:
                        index + 1,

                    from:
                        previous,

                    to:
                        request,

                    distance:
                        distance,

                    total:
                        total
                });


                previous =
                    request;
            }
        );


        return steps;
    }


    /* =====================================================
       SIMULATE
       ===================================================== */

    function startSimulation() {

        console.log(
            "🔥 SIMULATE CLICKED"
        );


        if (!validateInput()) {
            return;
        }


        initialHead =
            Number(
                initialHeadInput.value
            );


        requests =
            parseRequests();


        selectedAlgorithm =
            algorithmSelect.value;


        const sequence =
            calculateSequence();


        console.log(
            "Algorithm:",
            selectedAlgorithm
        );


        console.log(
            "Sequence:",
            sequence
        );


        simulationSteps =
            createSteps(sequence);


        currentStep = 0;

        simulationStarted = true;


        updateRequestOrder(
            sequence
        );


        updateResults();

        updateUI();

        drawVisualization();
    }


    /* =====================================================
       NEXT STEP
       ===================================================== */

    function nextStep() {

        if (!simulationStarted) {

            console.warn(
                "Start simulation first."
            );

            return;
        }


        if (
            currentStep <
            simulationSteps.length
        ) {

            /*
             * ONLY MOVE ONE STEP.
             *
             * Algorithm never changes here.
             */

            currentStep++;

            updateUI();

            drawVisualization();


            console.log(
                "Current step:",
                currentStep
            );
        }
    }


    /* =====================================================
       PREVIOUS STEP
       ===================================================== */

    function previousStep() {

        if (!simulationStarted) {
            return;
        }


        if (currentStep > 0) {

            currentStep--;

            updateUI();

            drawVisualization();
        }
    }


    /* =====================================================
       UPDATE UI
       ===================================================== */

    function updateUI() {

        const totalSteps =
            simulationSteps.length;


        stepCounter.textContent =
            `Step ${currentStep} of ${totalSteps}`;


        previousBtn.disabled =
            currentStep <= 0;


        nextBtn.disabled =
            currentStep >= totalSteps;


        /* -----------------------------------------------
           STEP 0
           ----------------------------------------------- */

        if (currentStep === 0) {

            currentHead.textContent =
                initialHead;


            nextRequest.textContent =
                totalSteps > 0
                    ? simulationSteps[0].to
                    : "-";


            seekDistance.textContent =
                "-";


            totalSeek.textContent =
                "0";


            movementText.textContent =
                "Ready to begin";


            explanationText.textContent =
                `The disk head starts at ${initialHead}. ` +
                `Click Next Step to begin servicing requests.`;


            return;
        }


        /* -----------------------------------------------
           CURRENT STEP
           ----------------------------------------------- */

        const step =
            simulationSteps[
                currentStep - 1
            ];


        currentHead.textContent =
            step.to;


        nextRequest.textContent =
            currentStep <
            totalSteps
                ? simulationSteps[
                    currentStep
                  ].to
                : "Complete";


        seekDistance.textContent =
            `${step.distance} tracks`;


        totalSeek.textContent =
            `${step.total} tracks`;


        movementText.textContent =
            `${step.from} → ${step.to}`;


        explanationText.textContent =
            `The disk head moves from ${step.from} ` +
            `to ${step.to}. ` +
            `Seek distance = |${step.to} - ${step.from}| ` +
            `= ${step.distance} tracks.`;
    }


    /* =====================================================
       REQUEST ORDER
       ===================================================== */

    function updateRequestOrder(sequence) {

        if (!requestOrder) {
            return;
        }


        requestOrder.innerHTML = "";


        sequence.forEach(
            (value, index) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "order-item";


                item.innerHTML = `
                    <span class="order-number">
                        ${index + 1}
                    </span>

                    <span class="order-value">
                        ${value}
                    </span>
                `;


                requestOrder.appendChild(
                    item
                );
            }
        );
    }


    /* =====================================================
       RESULTS
       ===================================================== */

    function updateResults() {

        const total =
            simulationSteps.length > 0
                ? simulationSteps[
                    simulationSteps.length - 1
                  ].total
                : 0;


        const count =
            requests.length;


        const average =
            count > 0
                ? (
                    total / count
                ).toFixed(2)
                : "0.00";


        resultSeek.textContent =
            `${total} tracks`;


        resultRequests.textContent =
            count;


        resultAverage.textContent =
            `${average} tracks`;
    }


    /* =====================================================
       DRAW VISUALIZATION
       ===================================================== */

    function drawVisualization() {

        if (!ctx || canvasWidth <= 0) {
            return;
        }


        /*
         * Clear canvas
         */

        ctx.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        /*
         * Background
         */

        ctx.fillStyle =
            "#0a1830";


        ctx.fillRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        /* =================================================
           AXIS
           ================================================= */

        const left = 80;

        const right =
            canvasWidth - 80;

        const axisY = 100;

        const usableWidth =
            right - left;


        /*
         * Convert disk position to X
         */

        function getX(position) {

            return (
                left +
                (
                    position / 199
                ) *
                usableWidth
            );
        }


        /*
         * Main axis
         */

        ctx.strokeStyle =
            "#52688f";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            left,
            axisY
        );

        ctx.lineTo(
            right,
            axisY
        );

        ctx.stroke();


        /* =================================================
           AXIS TICKS + LABELS
           ================================================= */

        ctx.textAlign =
            "center";


        ctx.font =
            "13px Arial";


        for (
            let value = 0;
            value <= 190;
            value += 10
        ) {

            const x =
                getX(value);


            ctx.strokeStyle =
                "#52688f";

            ctx.lineWidth = 1.5;


            ctx.beginPath();

            ctx.moveTo(
                x,
                axisY - 8
            );

            ctx.lineTo(
                x,
                axisY + 8
            );

            ctx.stroke();


            ctx.fillStyle =
                "#93a6c5";


            ctx.fillText(
                value,
                x,
                axisY - 25
            );
        }


        /*
         * 199 label
         */

        const x199 =
            getX(199);


        ctx.strokeStyle =
            "#52688f";

        ctx.beginPath();

        ctx.moveTo(
            x199,
            axisY - 8
        );

        ctx.lineTo(
            x199,
            axisY + 8
        );

        ctx.stroke();


        ctx.fillStyle =
            "#93a6c5";


        ctx.fillText(
            "199",
            x199,
            axisY - 25
        );


        /* =================================================
           REQUEST POINTS
           ================================================= */

        const uniqueRequests =
            [...new Set(requests)];


        uniqueRequests.forEach(
            request => {

                const x =
                    getX(request);


                /*
                 * Request circle
                 */

                ctx.beginPath();

                ctx.arc(
                    x,
                    axisY,
                    9,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "#ffbf3f";


                ctx.shadowColor =
                    "#ffbf3f";


                ctx.shadowBlur =
                    13;


                ctx.fill();


                ctx.shadowBlur = 0;


                /*
                 * Request label
                 */

                ctx.fillStyle =
                    "#dce5f5";


                ctx.font =
                    "13px Arial";


                ctx.fillText(
                    request,
                    x,
                    axisY + 34
                );
            }
        );


        /* =================================================
           INITIAL HEAD
           ================================================= */

        const headX =
            getX(initialHead);


        ctx.beginPath();

        ctx.arc(
            headX,
            axisY,
            10,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ff3d9a";


        ctx.shadowColor =
            "#ff3d9a";


        ctx.shadowBlur =
            17;


        ctx.fill();


        ctx.shadowBlur = 0;


        /*
         * HEAD label
         */

        ctx.fillStyle =
            "#ff5cab";


        ctx.font =
            "bold 14px Arial";


        ctx.fillText(
            "HEAD",
            headX,
            axisY + 60
        );


        ctx.fillStyle =
            "#dce5f5";


        ctx.font =
            "13px Arial";


        ctx.fillText(
            initialHead,
            headX,
            axisY + 80
        );


        /* =================================================
           ZIG-ZAG PATH
           ================================================= */

        if (
            !simulationStarted ||
            currentStep === 0
        ) {

            return;
        }


        /*
         * Starting Y position
         */

        const laneStart = 175;

        /*
         * Distance between every movement
         */

        const laneHeight = 72;


        /*
         * Only show movements reached
         * so far.
         */

        const visibleSteps =
            simulationSteps.slice(
                0,
                currentStep
            );


        visibleSteps.forEach(
            (step, index) => {

                const fromX =
                    getX(step.from);


                const toX =
                    getX(step.to);


                const y =
                    laneStart +
                    index * laneHeight;


                /*
                 * Keep path inside canvas.
                 *
                 * If there are many steps,
                 * compress spacing.
                 */

                const actualY =
                    Math.min(
                        y,
                        canvasHeight - 45
                    );


                /* =========================================
                   VERTICAL DROP
                   ========================================= */

                ctx.strokeStyle =
                    "#ff3d9a";

                ctx.lineWidth = 2.5;

                ctx.shadowColor =
                    "#ff3d9a";

                ctx.shadowBlur = 8;


                ctx.beginPath();

                ctx.moveTo(
                    fromX,
                    axisY
                );

                ctx.lineTo(
                    fromX,
                    actualY
                );

                ctx.stroke();


                /* =========================================
                   HORIZONTAL MOVEMENT
                   ========================================= */

                ctx.beginPath();

                ctx.moveTo(
                    fromX,
                    actualY
                );

                ctx.lineTo(
                    toX,
                    actualY
                );

                ctx.stroke();


                ctx.shadowBlur = 0;


                /* =========================================
                   ARROW
                   ========================================= */

                drawArrowHead(
                    toX,
                    actualY,
                    toX >= fromX
                );


                /* =========================================
                   DESTINATION CIRCLE
                   ========================================= */

                ctx.beginPath();

                ctx.arc(
                    toX,
                    actualY,
                    8,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "#ffffff";

                ctx.fill();


                ctx.strokeStyle =
                    "#ff3d9a";

                ctx.lineWidth = 3;

                ctx.stroke();


                /* =========================================
                   DISTANCE LABEL
                   ========================================= */

                const middleX =
                    (
                        fromX +
                        toX
                    ) / 2;


                ctx.fillStyle =
                    "#ff8fc5";


                ctx.font =
                    "bold 13px Arial";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    `${step.distance} tracks`,
                    middleX,
                    actualY - 12
                );


                /* =========================================
                   STEP LABEL
                   ========================================= */

                ctx.fillStyle =
                    "#91a5c6";


                ctx.font =
                    "12px Arial";


                ctx.fillText(
                    `Step ${index + 1}`,
                    middleX,
                    actualY + 25
                );
            }
        );


        ctx.shadowBlur = 0;
    }


    /* =====================================================
       ARROW HEAD
       ===================================================== */

    function drawArrowHead(
        x,
        y,
        movingRight
    ) {

        const size = 10;


        ctx.fillStyle =
            "#ff3d9a";


        ctx.beginPath();


        if (movingRight) {

            ctx.moveTo(
                x,
                y
            );

            ctx.lineTo(
                x - size,
                y - size * 0.65
            );

            ctx.lineTo(
                x - size,
                y + size * 0.65
            );

        } else {

            ctx.moveTo(
                x,
                y
            );

            ctx.lineTo(
                x + size,
                y - size * 0.65
            );

            ctx.lineTo(
                x + size,
                y + size * 0.65
            );
        }


        ctx.closePath();

        ctx.fill();
    }


    /* =====================================================
       RESET
       ===================================================== */

    function resetSimulation() {

        console.log(
            "🔄 RESET CLICKED"
        );


        simulationSteps = [];

        currentStep = 0;

        simulationStarted = false;

        requests = [];


        initialHead =
            Number(
                initialHeadInput.value
            ) || 50;


        stepCounter.textContent =
            "Step 0 of 0";


        currentHead.textContent =
            "-";


        nextRequest.textContent =
            "-";


        seekDistance.textContent =
            "-";


        totalSeek.textContent =
            "-";


        movementText.textContent =
            "Run simulation to begin";


        explanationText.textContent =
            "Enter the disk requests and click Simulate to start the visualization.";


        requestOrder.innerHTML = `
            <span class="empty-order">
                No simulation yet
            </span>
        `;


        resultSeek.textContent =
            "-";


        resultRequests.textContent =
            "-";


        resultAverage.textContent =
            "-";


        previousBtn.disabled = true;

        nextBtn.disabled = true;


        drawVisualization();
    }


    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    simulateBtn.addEventListener(
        "click",
        startSimulation
    );


    resetBtn.addEventListener(
        "click",
        resetSimulation
    );


    nextBtn.addEventListener(
        "click",
        nextStep
    );


    previousBtn.addEventListener(
        "click",
        previousStep
    );


    /* =====================================================
       ALGORITHM CHANGE
       ===================================================== */

    algorithmSelect.addEventListener(
        "change",
        () => {

            /*
             * Changing algorithm resets the current
             * simulation.
             *
             * User must press Simulate again.
             */

            simulationStarted = false;

            simulationSteps = [];

            currentStep = 0;


            previousBtn.disabled =
                true;


            nextBtn.disabled =
                true;


            stepCounter.textContent =
                "Step 0 of 0";


            currentHead.textContent =
                "-";


            nextRequest.textContent =
                "-";


            seekDistance.textContent =
                "-";


            totalSeek.textContent =
                "-";


            movementText.textContent =
                "Run simulation to begin";


            explanationText.textContent =
                `Selected algorithm: ${
                    algorithmSelect
                        .options[
                            algorithmSelect
                                .selectedIndex
                        ].text
                }. Click Simulate to start.`;


            drawVisualization();


            console.log(
                "Algorithm changed:",
                algorithmSelect.value
            );
        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    resizeCanvas();

    resetSimulation();


    console.log(
        "✅ Disk Scheduling initialized successfully"
    );

});