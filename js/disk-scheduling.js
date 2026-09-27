document.addEventListener("DOMContentLoaded", () => {

    console.log("Disk Scheduling module loaded");


    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const algorithmInput =
        document.getElementById("diskAlgorithm");

    const diskSizeInput =
        document.getElementById("diskSize");

    const headInput =
        document.getElementById("initialHead");

    const requestInput =
        document.getElementById("diskRequests");

    const simulateBtn =
        document.getElementById("simulateBtn");

    const resetBtn =
        document.getElementById("resetBtn");


    // Results
    const sequenceDisplay =
        document.getElementById("seekSequence");

    const totalSeekDisplay =
        document.getElementById("totalSeekTime");

    const averageSeekDisplay =
        document.getElementById("averageSeekTime");

    const requestCountDisplay =
        document.getElementById("requestCount");


    // ==========================================
    // CHECK REQUIRED ELEMENTS
    // ==========================================

    if (
        !algorithmInput ||
        !diskSizeInput ||
        !headInput ||
        !requestInput ||
        !simulateBtn
    ) {
        console.error(
            "Disk Scheduling: Required elements not found."
        );

        return;
    }


    // ==========================================
    // SIMULATION STATE
    // ==========================================

    let simulationResult = null;

    let currentStep = 0;


    // ==========================================
    // READ REQUESTS
    // ==========================================

    function getRequests() {

        const value = requestInput.value.trim();

        if (!value) {
            return [];
        }

        return value
            .split(",")
            .map(value => Number(value.trim()))
            .filter(value => !Number.isNaN(value));
    }


    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    function validateInput() {

        const diskSize =
            Number(diskSizeInput.value);

        const initialHead =
            Number(headInput.value);

        const requests =
            getRequests();


        if (!Number.isInteger(diskSize) || diskSize <= 0) {

            alert("Please enter a valid disk size.");

            return false;
        }


        if (
            !Number.isInteger(initialHead) ||
            initialHead < 0 ||
            initialHead >= diskSize
        ) {

            alert(
                `Head position must be between 0 and ${diskSize - 1}.`
            );

            return false;
        }


        if (requests.length === 0) {

            alert(
                "Please enter at least one disk request."
            );

            return false;
        }


        for (const request of requests) {

            if (
                !Number.isInteger(request) ||
                request < 0 ||
                request >= diskSize
            ) {

                alert(
                    `Every request must be between 0 and ${diskSize - 1}.`
                );

                return false;
            }
        }


        return true;
    }


    // ==========================================
    // RUN SIMULATION
    // ==========================================

    function simulate() {

        console.log("SIMULATE CLICKED");


        if (!validateInput()) {
            return;
        }


        const algorithm =
            algorithmInput.value;

        const diskSize =
            Number(diskSizeInput.value);

        const initialHead =
            Number(headInput.value);

        const requests =
            getRequests();


        console.log("Algorithm:", algorithm);
        console.log("Disk Size:", diskSize);
        console.log("Initial Head:", initialHead);
        console.log("Requests:", requests);


        // --------------------------------------
        // FCFS
        // --------------------------------------

        if (algorithm === "fcfs") {

            simulationResult =
                fcfsDiskScheduling(
                    initialHead,
                    requests
                );
        }


        else {

            alert(
                "Only FCFS is implemented in Milestone 1."
            );

            return;
        }


        currentStep = 0;


        console.log(
            "FCFS RESULT:",
            simulationResult
        );


        updateResults();
    }


    // ==========================================
    // UPDATE RESULTS
    // ==========================================

    function updateResults() {

        if (!simulationResult) {
            return;
        }


        // --------------------------------------
        // SEEK SEQUENCE
        // --------------------------------------

        if (sequenceDisplay) {

            sequenceDisplay.textContent =
                simulationResult.sequence.join(" → ");
        }


        // --------------------------------------
        // TOTAL SEEK TIME
        // --------------------------------------

        if (totalSeekDisplay) {

            totalSeekDisplay.textContent =
                simulationResult.totalSeekTime;
        }


        // --------------------------------------
        // AVERAGE SEEK TIME
        // --------------------------------------

        if (averageSeekDisplay) {

            averageSeekDisplay.textContent =
                simulationResult.averageSeekTime.toFixed(2);
        }


        // --------------------------------------
        // REQUEST COUNT
        // --------------------------------------

        if (requestCountDisplay) {

            requestCountDisplay.textContent =
                simulationResult.requests.length;
        }
    }


    // ==========================================
    // RESET
    // ==========================================

    function resetSimulation() {

        simulationResult = null;

        currentStep = 0;


        if (sequenceDisplay) {
            sequenceDisplay.textContent = "-";
        }


        if (totalSeekDisplay) {
            totalSeekDisplay.textContent = "-";
        }


        if (averageSeekDisplay) {
            averageSeekDisplay.textContent = "-";
        }


        if (requestCountDisplay) {
            requestCountDisplay.textContent = "-";
        }


        console.log("Disk scheduling reset");
    }


    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    simulateBtn.addEventListener(
        "click",
        simulate
    );


    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            resetSimulation
        );
    }

});