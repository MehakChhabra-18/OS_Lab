/* =========================================================
   SCAN - ELEVATOR DISK SCHEDULING ALGORITHM
   ========================================================= */

function scan(requests, initialHead, diskSize = 200) {

    const sorted = [...requests].sort((a, b) => a - b);

    const right = sorted.filter(
        request => request >= initialHead
    );

    const left = sorted.filter(
        request => request < initialHead
    );

    /*
     * SCAN:
     *
     * HEAD moves towards the right
     * ↓
     * services all requests on the right
     * ↓
     * reaches disk end
     * ↓
     * reverses direction
     * ↓
     * services requests on the left
     */

    const sequence = [
        ...right,
        diskSize - 1,
        ...left.reverse()
    ];

    /*
     * Remove duplicate 199 if it is already
     * present in the request queue.
     */

    return sequence.filter(
        (value, index) =>
            index === 0 ||
            value !== sequence[index - 1]
    );
}