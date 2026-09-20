console.log("lru.js loaded");

window.lru = function(referencePages, frameCount) {

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

                for (let framePage of frames) {

                    if (
                        lastUsed.get(framePage) <
                        lastUsed.get(lruPage)
                    ) {
                        lruPage = framePage;
                    }
                }

                const replaceIndex =
                    frames.indexOf(lruPage);

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

    return {
        pageFaults: pageFaults,
        pageHits: pageHits,
        history: history
    };
};