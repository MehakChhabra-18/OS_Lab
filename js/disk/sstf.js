/* =========================================================
   SSTF - SHORTEST SEEK TIME FIRST
   ========================================================= */

function sstf(requests, initialHead) {

    console.log("SSTF FUNCTION CALLED");
    console.log("SSTF Requests:", requests);
    console.log("SSTF Initial Head:", initialHead);

    // Safety check
    if (!Array.isArray(requests)) {

        console.error(
            "SSTF ERROR: requests must be an array",
            requests
        );

        return [];
    }

    // Make a copy so original request array is not modified
    const remaining = [...requests];

    const sequence = [];

    let head = initialHead;


    /* =====================================================
       SSTF ALGORITHM

       At every step:
       1. Look at all unserved requests
       2. Calculate distance from current HEAD
       3. Pick the closest request
       4. Move HEAD there
       5. Remove that request
       ===================================================== */

    while (remaining.length > 0) {

        let closestIndex = 0;

        let shortestDistance =
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
                distance < shortestDistance
            ) {

                shortestDistance =
                    distance;

                closestIndex =
                    i;
            }
        }


        // Selected request
        const selected =
            remaining[closestIndex];


        // Add ONLY the number
        sequence.push(selected);


        // Move HEAD
        head = selected;


        // Remove served request
        remaining.splice(
            closestIndex,
            1
        );
    }


    console.log(
        "SSTF Generated Sequence:",
        sequence
    );


    /*
     * IMPORTANT:
     *
     * Return only numbers.
     *
     * Controller expects:
     *
     * [65, 67, 98, 122, ...]
     *
     * NOT:
     *
     * [{request:65, distance:12}, ...]
     */

    return sequence;
}