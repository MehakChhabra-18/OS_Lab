/* =========================================================
   C-LOOK - CIRCULAR LOOK DISK SCHEDULING
   ========================================================= */

function clook(requests, initialHead) {

    /*
     * Sort requests
     */
    const sorted =
        [...requests].sort((a, b) => a - b);


    /*
     * Requests on the right side of HEAD
     */
    const right =
        sorted.filter(
            request => request >= initialHead
        );


    /*
     * Requests on the left side of HEAD
     */
    const left =
        sorted.filter(
            request => request < initialHead
        );


    /*
     * C-LOOK:
     *
     * 1. Move towards the right
     * 2. Service requests
     * 3. Stop at the LAST REQUEST
     *    (does NOT go to 199)
     * 4. Jump directly to the FIRST REQUEST
     *    (does NOT go to 0)
     * 5. Continue towards the right
     */

    const sequence = [
        ...right,
        ...left
    ];


    /*
     * Remove consecutive duplicates
     */

    return sequence.filter(
        (value, index) =>
            index === 0 ||
            value !== sequence[index - 1]
    );
}