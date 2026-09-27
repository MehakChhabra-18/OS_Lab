function fcfsDiskScheduling(initialHead, requests) {

    const sequence = [initialHead, ...requests];

    const movements = [];
    let totalSeekTime = 0;

    for (let i = 0; i < sequence.length - 1; i++) {

        const from = sequence[i];
        const to = sequence[i + 1];

        const movement = Math.abs(to - from);

        totalSeekTime += movement;

        movements.push({
            step: i + 1,
            from: from,
            to: to,
            movement: movement,
            totalSeekTime: totalSeekTime
        });
    }

    const averageSeekTime =
        requests.length > 0
            ? totalSeekTime / requests.length
            : 0;

    return {
        algorithm: "FCFS",
        initialHead: initialHead,
        requests: [...requests],
        sequence: sequence,
        movements: movements,
        totalSeekTime: totalSeekTime,
        averageSeekTime: averageSeekTime
    };
}