/* =========================================================
   FCFS - FIRST COME FIRST SERVE
   ========================================================= */

function fcfs(requests, initialHead) {

    console.log("FCFS FUNCTION CALLED");

    console.log("FCFS Requests:", requests);

    console.log("FCFS Initial Head:", initialHead);


    // Safety check
    if (!Array.isArray(requests)) {

        console.error(
            "FCFS ERROR: requests must be an array",
            requests
        );

        return [];
    }


    /*
     * FCFS simply serves requests
     * in the exact order in which
     * they were given.
     */

    return [...requests];
}