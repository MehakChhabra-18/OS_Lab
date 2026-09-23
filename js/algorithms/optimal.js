console.log("optimal.js loaded");
window.optimal=function(referencePages,frameCount)
{
    const frames=[];
    const history=[];
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
                let replaceIndex=0;
                let farthestUse=-1;
                for(let j=0;j<frames.length;j++)
                {
                    const currentPage=frames[j];
                    let nextUse=-1;
                    for(let k=i+1;k<referencePages.length;k++)
                    {
                        if(referencePages[k]===currentPage)
                        {
                            nextUse=k;
                            break;
                        }
                    }

                    if(nextUse===-1)
                    {
                        replaceIndex=j;
                        farthestUse=Infinity;
                        break;
                    }

                    if(nextUse>farthestUse)
                    {
                        farthestUse=nextUse;
                        replaceIndex=j;
                    }
                }

                frames[replaceIndex]=page;
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