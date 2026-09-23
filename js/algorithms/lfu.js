console.log("lfu.js loaded");
window.lfu=function(referencePages,frameCount)
{
    const frames=[];
    const history=[];
    const frequency={};
    const lastUsed={};
    let pageFaults=0;
    let pageHits=0;
    for(let i=0;i<referencePages.length;i++)
    {
        const page=referencePages[i];
        let result;
        if(frames.includes(page))
        {
            pageHits++;
            result="Hit";
            frequency[page]++;
            lastUsed[page]=i;
        }
        else
        {
            pageFaults++;
            result="Fault";
            if(frames.length<frameCount)
            {
                frames.push(page);
                frequency[page]=1;
                lastUsed[page]=i;
            }
            else
            {
                let replaceIndex=0;
                for(let j=1;j<frames.length;j++)
                {
                    const currentPage=frames[j];
                    const selectedPage=frames[replaceIndex];

                    if(frequency[currentPage]<frequency[selectedPage])
                    {
                        replaceIndex=j;
                    }
                    else if(frequency[currentPage]==frequency[selectedPage])
                    {
                        if(lastUsed[currentPage]<lastUsed[selectedPage])
                        {
                            replaceIndex=j;
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
            page:page,
            frames:[...frames],
            result:result
        });
    }

    return {
        pageFaults:pageFaults,
        pageHits:pageHits,
        history:history
    };
};