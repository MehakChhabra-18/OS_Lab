/* =========================================================
   C-SCAN - CIRCULAR SCAN DISK SCHEDULING
   ========================================================= */

function cscan(requests, initialHead, diskSize = 200) {

    const sorted = [...requests].sort((a, b) => a - b);

    const right = sorted.filter(
        request => request >= initialHead
    );

    const left = sorted.filter(
        request => request < initialHead
    );

    /*
     * C-SCAN:
     *
     * HEAD moves only in one direction.
     *
     * 1. Service requests towards the right
     * 2. Reach disk end (199)
     * 3. Jump back to disk beginning (0)
     * 4. Continue in the same direction
     * 5. Service remaining requests
     */

    const sequence = [
        ...right,
        diskSize - 1,
        0,
        ...left
    ];

    /*
     * Avoid duplicate consecutive positions.
     */

    return sequence.filter(
        (value, index) =>
            index === 0 ||
            value !== sequence[index - 1]
    );
}