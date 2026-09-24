function fcfs(processes)
{
    const sorted=[...processes].sort(
        (a,b)=>a.arrivalTime-b.arrivalTime
    );

    let currentTime=0;
    const result=[];
    const gantt=[];
    for(let process of sorted)
    {
        if(currentTime<process.arrivalTime)
        {
            currentTime=process.arrivalTime;
        }

        const startTime=currentTime;
        const completionTime=startTime+process.burstTime;
        const turnaroundTime=completionTime-process.arrivalTime;
        const waitingTime=turnaroundTime-process.burstTime;
        const responseTime=startTime-process.arrivalTime;

        result.push({
            id:process.id,
            arrivalTime:process.arrivalTime,
            burstTime:process.burstTime,
            startTime:startTime,
            completionTime:completionTime,
            turnaroundTime:turnaroundTime,
            waitingTime:waitingTime,
            responseTime:responseTime   
        });

        gantt.push({
            id:process.id,
            startTime:startTime,
            endTime:completionTime
        });

        currentTime=completionTime;
    }

    return {
        processes:result,
        gantt:gantt
    };
}