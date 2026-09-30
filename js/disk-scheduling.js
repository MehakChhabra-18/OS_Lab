/* =========================================================
   OS LAB - DISK SCHEDULING CONTROLLER
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("DISK SCHEDULING CONTROLLER LOADED");


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
       CHECK ELEMENTS
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
            "Some required HTML elements are missing."
        );

        return;
    }


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

    let initialHead = 50;

    let requests = [];

    let simulationSteps = [];

    let currentStep = 0;

    let simulationStarted = false;


    /* =====================================================
       CANVAS RESIZE
       ===================================================== */

    function resizeCanvas() {

        const wrapper =
            canvas.parentElement;

        if (!wrapper) {
            return;
        }

        const width =
            wrapper.clientWidth || 900;

        const height = 650;

        const dpr =
            window.devicePixelRatio || 1;


        canvas.style.width = "100%";

        canvas.style.height =
            `${height}px`;


        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;


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
       PARSE REQUESTS
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
       VALIDATION
       ===================================================== */

    function validateInput() {

        const head =
            Number(initialHeadInput.value);

        const queue =
            parseRequests();


        if (!Number.isFinite(head)) {

            alert(
                "Please enter a valid initial HEAD position."
            );

            return false;
        }


        if (head < 0 || head > 199) {

            alert(
                "HEAD position must be between 0 and 199."
            );

            return false;
        }


        if (queue.length === 0) {

            alert(
                "Please enter at least one disk request."
            );

            return false;
        }


        for (const request of queue) {

            if (
                request < 0 ||
                request > 199
            ) {

                alert(
                    "Every request must be between 0 and 199."
                );

                return false;
            }
        }


        return true;
    }


    /* =====================================================
       GET SELECTED ALGORITHM
       ===================================================== */

    function getAlgorithmSequence() {

        const algorithm =
            algorithmSelect.value;


        console.log(
            "Selected algorithm:",
            algorithm
        );


        switch (algorithm) {

            case "fcfs":

                if (typeof fcfs !== "function") {

                    console.error(
                        "fcfs.js is not loaded."
                    );

                    return [];
                }

                return fcfs(
                    requests,
                    initialHead
                );


            case "sstf":

                if (typeof sstf !== "function") {

                    console.error(
                        "sstf.js is not loaded."
                    );

                    return [];
                }

                return sstf(
                    requests,
                    initialHead
                );


            case "scan":

                if (typeof scan !== "function") {

                    console.error(
                        "scan.js is not loaded."
                    );

                    return [];
                }

                return scan(
                    requests,
                    initialHead,
                    200
                );


            case "cscan":

                if (typeof cscan !== "function") {

                    console.error(
                        "cscan.js is not loaded."
                    );

                    return [];
                }

                return cscan(
                    requests,
                    initialHead,
                    200
                );


            case "look":

                if (typeof look !== "function") {

                    console.error(
                        "look.js is not loaded."
                    );

                    return [];
                }

                return look(
                    requests,
                    initialHead
                );


            case "clook":

                if (typeof clook !== "function") {

                    console.error(
                        "clook.js is not loaded."
                    );

                    return [];
                }

                return clook(
                    requests,
                    initialHead
                );


            default:

                console.error(
                    "Unknown algorithm:",
                    algorithm
                );

                return [];
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
            (destination, index) => {

                const distance =
                    Math.abs(
                        destination -
                        previous
                    );


                total += distance;


                steps.push({

                    step:
                        index + 1,

                    from:
                        previous,

                    to:
                        destination,

                    distance:
                        distance,

                    total:
                        total
                });


                previous =
                    destination;
            }
        );


        return steps;
    }


    /* =====================================================
       SIMULATE
       ===================================================== */

    function startSimulation() {

        console.log(
            "SIMULATE BUTTON CLICKED"
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


        const sequence =
            getAlgorithmSequence();


        console.log(
            "Generated sequence:",
            sequence
        );


        if (
            !sequence ||
            sequence.length === 0
        ) {

            alert(
                "Could not generate the scheduling sequence."
            );

            return;
        }


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


        console.log(
            "Simulation started successfully."
        );
    }


    /* =====================================================
       NEXT STEP
       ===================================================== */

    function nextStep() {

        if (!simulationStarted) {

            console.log(
                "Start simulation first."
            );

            return;
        }


        if (
            currentStep <
            simulationSteps.length
        ) {

            currentStep++;


            updateUI();

            drawVisualization();


            console.log(
                `Moved to step ${currentStep}`
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
       UPDATE STEP INFORMATION
       ===================================================== */

    function updateUI() {

        const totalSteps =
            simulationSteps.length;


        stepCounter.textContent =
            `Step ${currentStep} of ${totalSteps}`;


        previousBtn.disabled =
            currentStep === 0;


        nextBtn.disabled =
            currentStep >= totalSteps;


        /* -----------------------------------------------
           INITIAL STATE
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
                `HEAD starts at ${initialHead}. ` +
                `Click Next to perform the first movement.`;


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
            `HEAD moves from ${step.from} ` +
            `to ${step.to}. ` +
            `Seek distance = |${step.to} - ${step.from}| ` +
            `= ${step.distance} tracks.`;
    }


    /* =====================================================
       REQUEST ORDER
       ===================================================== */

    function updateRequestOrder(sequence) {

        requestOrder.innerHTML = "";


        sequence.forEach(
            (value, index) => {

                const item =
                    document.createElement("div");


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

        if (
            !ctx ||
            canvasWidth <= 0
        ) {
            return;
        }


        /* -----------------------------------------------
           CLEAR
           ----------------------------------------------- */

        ctx.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        /* -----------------------------------------------
           BACKGROUND
           ----------------------------------------------- */

        ctx.fillStyle =
            "#0a1830";


        ctx.fillRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        /* -----------------------------------------------
           AXIS CONFIG
           ----------------------------------------------- */

        const left = 70;

        const right =
            canvasWidth - 70;

        const axisY = 100;

        const usableWidth =
            right - left;


        function getX(position) {

            return (
                left +
                (
                    position / 199
                ) *
                usableWidth
            );
        }


        /* -----------------------------------------------
           MAIN AXIS
           ----------------------------------------------- */

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


        /* -----------------------------------------------
           AXIS NUMBERS
           ----------------------------------------------- */

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

            ctx.lineWidth = 1;


            ctx.beginPath();

            ctx.moveTo(
                x,
                axisY - 7
            );

            ctx.lineTo(
                x,
                axisY + 7
            );

            ctx.stroke();


            ctx.fillStyle =
                "#93a6c5";


            ctx.fillText(
                value,
                x,
                axisY - 20
            );
        }


        /* -----------------------------------------------
           199
           ----------------------------------------------- */

        const x199 =
            getX(199);


        ctx.strokeStyle =
            "#52688f";


        ctx.beginPath();

        ctx.moveTo(
            x199,
            axisY - 7
        );

        ctx.lineTo(
            x199,
            axisY + 7
        );

        ctx.stroke();


        ctx.fillStyle =
            "#93a6c5";


        ctx.fillText(
            "199",
            x199,
            axisY - 20
        );


        /* -----------------------------------------------
           REQUEST POINTS
           ----------------------------------------------- */

        const uniqueRequests =
            [...new Set(requests)];


        uniqueRequests.forEach(
            request => {

                const x =
                    getX(request);


                ctx.beginPath();

                ctx.arc(
                    x,
                    axisY,
                    8,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "#ffbf3f";


                ctx.shadowColor =
                    "#ffbf3f";


                ctx.shadowBlur =
                    10;


                ctx.fill();


                ctx.shadowBlur = 0;


                ctx.fillStyle =
                    "#dce5f5";


                ctx.font =
                    "13px Arial";


                ctx.fillText(
                    request,
                    x,
                    axisY + 30
                );
            }
        );


        /* -----------------------------------------------
           INITIAL HEAD
           ----------------------------------------------- */

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
            15;


        ctx.fill();


        ctx.shadowBlur = 0;


        ctx.fillStyle =
            "#ff5cab";


        ctx.font =
            "bold 14px Arial";


        ctx.fillText(
            "HEAD",
            headX,
            axisY + 55
        );


        /* -----------------------------------------------
           NO STEPS YET
           ----------------------------------------------- */

        if (
            !simulationStarted ||
            currentStep === 0
        ) {

            return;
        }


        /* =================================================
           MOVEMENT PATH
           ================================================= */

        const visibleSteps =
            simulationSteps.slice(
                0,
                currentStep
            );


        /*
         * Dynamically calculate lane height.
         *
         * This prevents the visualization from
         * going outside the canvas.
         */

        const availableHeight =
            canvasHeight - 170;


        const laneHeight =
            Math.max(
                35,
                Math.min(
                    72,
                    availableHeight /
                    Math.max(
                        visibleSteps.length,
                        1
                    )
                )
            );


        const laneStart = 175;


        visibleSteps.forEach(
            (step, index) => {

                const fromX =
                    getX(step.from);


                const toX =
                    getX(step.to);


                const y =
                    laneStart +
                    index * laneHeight;


                /* -----------------------------------------
                   VERTICAL LINE
                   ----------------------------------------- */

                ctx.strokeStyle =
                    "#ff3d9a";

                ctx.lineWidth = 2.5;

                ctx.shadowColor =
                    "#ff3d9a";

                ctx.shadowBlur = 7;


                ctx.beginPath();

                ctx.moveTo(
                    fromX,
                    index === 0
                        ? axisY
                        : y - laneHeight
                );

                ctx.lineTo(
                    fromX,
                    y
                );

                ctx.stroke();


                /* -----------------------------------------
                   HORIZONTAL MOVEMENT
                   ----------------------------------------- */

                ctx.beginPath();

                ctx.moveTo(
                    fromX,
                    y
                );

                ctx.lineTo(
                    toX,
                    y
                );

                ctx.stroke();


                ctx.shadowBlur = 0;


                /* -----------------------------------------
                   ARROW
                   ----------------------------------------- */

                drawArrowHead(
                    toX,
                    y,
                    toX >= fromX
                );


                /* -----------------------------------------
                   DESTINATION POINT
                   ----------------------------------------- */

                ctx.beginPath();

                ctx.arc(
                    toX,
                    y,
                    7,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "#ffffff";

                ctx.fill();


                ctx.strokeStyle =
                    "#ff3d9a";

                ctx.lineWidth = 2.5;

                ctx.stroke();


                /* -----------------------------------------
                   DISTANCE
                   ----------------------------------------- */

                const middleX =
                    (
                        fromX +
                        toX
                    ) / 2;


                ctx.fillStyle =
                    "#ff9dcc";


                ctx.font =
                    "bold 12px Arial";


                ctx.fillText(
                    `${step.distance}`,
                    middleX,
                    y - 9
                );


                /* -----------------------------------------
                   STEP LABEL
                   ----------------------------------------- */

                ctx.fillStyle =
                    "#8fa4c5";


                ctx.font =
                    "11px Arial";


                ctx.fillText(
                    `Step ${index + 1}`,
                    middleX,
                    y + 20
                );
            }
        );
    }


    /* =====================================================
       ARROW HEAD
       ===================================================== */

    function drawArrowHead(
        x,
        y,
        movingRight
    ) {

        const size = 9;


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
                y - size * 0.6
            );

            ctx.lineTo(
                x - size,
                y + size * 0.6
            );

        } else {

            ctx.moveTo(
                x,
                y
            );

            ctx.lineTo(
                x + size,
                y - size * 0.6
            );

            ctx.lineTo(
                x + size,
                y + size * 0.6
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
            "RESET BUTTON CLICKED"
        );


        initialHead =
            Number(
                initialHeadInput.value
            ) || 50;


        requests = [];

        simulationSteps = [];

        currentStep = 0;

        simulationStarted = false;


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
             * Changing algorithm requires
             * a fresh simulation.
             */

            simulationStarted = false;

            simulationSteps = [];

            currentStep = 0;


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


            const selectedText =
                algorithmSelect
                    .options[
                        algorithmSelect.selectedIndex
                    ].text;


            explanationText.textContent =
                `Selected: ${selectedText}. ` +
                `Click Simulate to generate the sequence.`;


            previousBtn.disabled = true;

            nextBtn.disabled = true;


            drawVisualization();
        }
    );


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    resizeCanvas();

    resetSimulation();


    console.log(
        "Disk Scheduling controller ready."
    );

});