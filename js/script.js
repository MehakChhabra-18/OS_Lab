console.log("OS Lab JavaScript is running...");

const simulateButton =
    document.getElementById("simulateBtn");

const referenceInput =
    document.getElementById("referenceString");

const frameInput =
    document.getElementById("frameCount");

const algorithmInput =
    document.getElementById("algorithm");


simulateButton.addEventListener("click", function () {

    const referenceString =
        referenceInput.value;

    const frameCount =
        Number(frameInput.value);

    const algorithm =
        algorithmInput.value;


    const referencePages =
        referenceString
            .split(" ")
            .map(Number);

    if (algorithm === "fifo") {

    const result = fifo(referencePages, frameCount);

    console.log("FIFO Result:", result);

    document.getElementById("pageFaults").textContent =
        result.pageFaults;

    document.getElementById("pageHits").textContent =
        result.pageHits;

    const totalPages = referencePages.length;

    const hitRatio =
        (result.pageHits / totalPages) * 100;

    document.getElementById("hitRatio").textContent =
        hitRatio.toFixed(2) + "%";
}


    console.log("Reference Pages:", referencePages);

    console.log("Number of Frames:", frameCount);

    console.log("Algorithm:", algorithm);

});

function fifo(referencePages,frameCount)
{
    const frames=[];
    const history=[];
    let pageFaults=0;
    let pageHits=0;
    let fifoIndex=0;
    for(let page of referencePages)
    {
        let result;
        if(frames.includes(page))
        {
            pageHits++;
            result="Hit";
        }
        else
        {
            pageFaults++;
            result="Fault";
            if(frames.length<frameCount)
            {
                frames.push(page);
            }
            else
            {
                frames[fifoIndex]=page;
                fifoIndex=(fifoIndex+1)%frameCount;
            }
        }

        history.push({page:page,
            frames:[...frames],
            result:result
        });
    }

    return {pageFaults,pageHits,history};
}