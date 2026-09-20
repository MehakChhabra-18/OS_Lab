function fifo(referencePages, frameCount) {
    const frames = [];
    const history = [];
    let pageFaults = 0;
    let pageHits = 0;
    let fifoIndex = 0;

    for (let page of referencePages) {
        let result;

        if (frames.includes(page)) {
            pageHits++;
            result = "Hit";
        } else {
            pageFaults++;
            result = "Fault";

            if (frames.length < frameCount) {
                frames.push(page);
            } else {
                frames[fifoIndex] = page;
                fifoIndex = (fifoIndex + 1) % frameCount;
            }
        }

        history.push({
            page: page,
            frames: [...frames],
            result: result
        });
    }

    return {
        pageFaults,
        pageHits,
        history
    };
}