/**
 * OS Lab — Background Algorithm Web Worker
 * Performs heavy or asynchronous algorithm simulations off the main UI thread.
 * Returns calculated step histories, metrics, and state transitions to the main thread.
 */

/* =========================================================
   PAGE REPLACEMENT IMPLEMENTATIONS (Self-Contained)
   ========================================================= */

function runFifo(referencePages, frameCount) {
    const frames = [];
    const history = [];
    let pageFaults = 0;
    let pageHits = 0;
    let fifoIndex = 0;

    for (const page of referencePages) {
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

    return { pageFaults, pageHits, history };
}

function runLru(referencePages, frameCount) {
    const frames = [];
    const history = [];
    const lastUsed = new Map();
    let pageFaults = 0;
    let pageHits = 0;

    for (let i = 0; i < referencePages.length; i++) {
        const page = referencePages[i];
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
                let lruPage = frames[0];
                for (const framePage of frames) {
                    if (lastUsed.get(framePage) < lastUsed.get(lruPage)) {
                        lruPage = framePage;
                    }
                }
                const replaceIndex = frames.indexOf(lruPage);
                frames[replaceIndex] = page;
            }
        }
        lastUsed.set(page, i);

        history.push({
            page: page,
            frames: [...frames],
            result: result
        });
    }

    return { pageFaults, pageHits, history };
}

function runOptimal(referencePages, frameCount) {
    const frames = [];
    const history = [];
    let pageFaults = 0;
    let pageHits = 0;

    for (let i = 0; i < referencePages.length; i++) {
        const page = referencePages[i];
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
                let replaceIndex = 0;
                let farthestUse = -1;

                for (let j = 0; j < frames.length; j++) {
                    const currentPage = frames[j];
                    let nextUse = -1;

                    for (let k = i + 1; k < referencePages.length; k++) {
                        if (referencePages[k] === currentPage) {
                            nextUse = k;
                            break;
                        }
                    }

                    if (nextUse === -1) {
                        replaceIndex = j;
                        farthestUse = Infinity;
                        break;
                    }

                    if (nextUse > farthestUse) {
                        farthestUse = nextUse;
                        replaceIndex = j;
                    }
                }

                frames[replaceIndex] = page;
            }
        }

        history.push({
            page: page,
            frames: [...frames],
            result: result
        });
    }

    return { pageFaults, pageHits, history };
}

function runLfu(referencePages, frameCount) {
    const frames = [];
    const history = [];
    const frequency = {};
    const lastUsed = {};
    let pageFaults = 0;
    let pageHits = 0;

    for (let i = 0; i < referencePages.length; i++) {
        const page = referencePages[i];
        let result;

        if (frames.includes(page)) {
            pageHits++;
            result = "Hit";
            frequency[page]++;
            lastUsed[page] = i;
        } else {
            pageFaults++;
            result = "Fault";
            if (frames.length < frameCount) {
                frames.push(page);
                frequency[page] = 1;
                lastUsed[page] = i;
            } else {
                let replaceIndex = 0;
                for (let j = 1; j < frames.length; j++) {
                    const currentPage = frames[j];
                    const selectedPage = frames[replaceIndex];

                    if (frequency[currentPage] < frequency[selectedPage]) {
                        replaceIndex = j;
                    } else if (frequency[currentPage] === frequency[selectedPage]) {
                        if (lastUsed[currentPage] < lastUsed[selectedPage]) {
                            replaceIndex = j;
                        }
                    }
                }

                const removedPage = frames[replaceIndex];
                delete frequency[removedPage];
                delete lastUsed[removedPage];

                frames[replaceIndex] = page;
                frequency[page] = 1;
                lastUsed[page] = i;
            }
        }

        history.push({
            page: page,
            frames: [...frames],
            result: result
        });
    }

    return { pageFaults, pageHits, history };
}

/* =========================================================
   WORKER MESSAGE DISPATCHER
   ========================================================= */

self.addEventListener("message", function (e) {
    const data = e.data || {};
    const { id, type, algorithm, payload } = data;

    try {
        let result = null;

        if (type === "PAGE_REPLACEMENT") {
            const { referencePages, frameCount } = payload;
            if (!Array.isArray(referencePages) || !frameCount) {
                throw new Error("Invalid parameters for Page Replacement");
            }

            switch (algorithm) {
                case "fifo":
                    result = runFifo(referencePages, frameCount);
                    break;
                case "lru":
                    result = runLru(referencePages, frameCount);
                    break;
                case "optimal":
                    result = runOptimal(referencePages, frameCount);
                    break;
                case "lfu":
                    result = runLfu(referencePages, frameCount);
                    break;
                default:
                    throw new Error(`Unsupported algorithm: ${algorithm}`);
            }
        } else {
            throw new Error(`Unsupported calculation type: ${type}`);
        }

        self.postMessage({
            id,
            success: true,
            result
        });
    } catch (err) {
        self.postMessage({
            id,
            success: false,
            error: err.message || "Computation error in worker"
        });
    }
});
