/* =========================================================
   LOOK - DISK SCHEDULING ALGORITHM
   ========================================================= */

function look(requests, initialHead) {

    /*
     * Sort all requests
     */
    const sorted = [...requests].sort((a, b) => a - b);

    /*
     * Requests on the right side of HEAD
     */
    const right = sorted.filter(
        request => request >= initialHead
    );

    /*
     * Requests on the left side of HEAD
     */
    const left = sorted.filter(
        request => request < initialHead
    );

    /*
     * LOOK:
     *
     * HEAD moves towards the right
     * ↓
     * services all requests on the right
     * ↓
     * DOES NOT go to 199
     * ↓
     * reverses at the last request
     * ↓
     * services requests on the left
     */

    const sequence = [
        ...right,
        ...left.reverse()
    ];

    return sequence.filter(
        (value, index) =>
            index === 0 ||
            value !== sequence[index - 1]
    );
}