/*
    =========================================================
    FCFS DISK SCHEDULING
    =========================================================

    Input:
        initialHead
        requests[]

    Output:
        {
            order: [],
            movements: [],
            totalSeek: number
        }
*/


function fcfs(initialHead, requests) {

    const order = [...requests];

    const movements = [];

    let currentHead = initialHead;

    let totalSeek = 0;


    for (let i = 0; i < order.length; i++) {

        const nextHead = order[i];

        const distance = Math.abs(
            nextHead - currentHead
        );


        totalSeek += distance;


        movements.push({

            from: currentHead,

            to: nextHead,

            distance: distance,

            request: nextHead,

            step: i + 1

        });


        currentHead = nextHead;
    }


    return {

        order: order,

        movements: movements,

        totalSeek: totalSeek

    };
}