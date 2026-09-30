function sstf(requests, initialHead) {

    const remaining = [...requests];

    const steps = [];

    let currentHead = initialHead;

    let totalSeek = 0;

    while (remaining.length > 0) {

        let closestIndex = 0;

        let closestDistance =
            Math.abs(
                remaining[0] - currentHead
            );

        for (
            let i = 1;
            i < remaining.length;
            i++
        ) {

            const distance =
                Math.abs(
                    remaining[i] - currentHead
                );

            if (
                distance < closestDistance
            ) {

                closestDistance =
                    distance;

                closestIndex =
                    i;
            }
        }

        const nextRequest =
            remaining[closestIndex];

        const distance =
            Math.abs(
                nextRequest - currentHead
            );

        totalSeek += distance;

        steps.push({
            from: currentHead,
            to: nextRequest,
            distance: distance,
            total: totalSeek
        });

        currentHead =
            nextRequest;

        remaining.splice(
            closestIndex,
            1
        );
    }

    return steps;
}

window.sstf = sstf;