// ==========================================
// BEST FIT MEMORY ALLOCATION
// ==========================================

function bestFit(blocks, processes) {

    const memory = [...blocks];

    const steps = [];

    const allocations =
        new Array(processes.length).fill(-1);

    for (let i = 0; i < processes.length; i++) {

        const processSize = processes[i];

        let selectedBlock = -1;
        let smallestDifference = Infinity;

        // Find the smallest block that can fit
        // the current process
        for (let j = 0; j < memory.length; j++) {

            if (memory[j] >= processSize) {

                const difference =
                    memory[j] - processSize;

                if (difference < smallestDifference) {

                    smallestDifference = difference;
                    selectedBlock = j;

                }
            }
        }

        // Allocate
        if (selectedBlock !== -1) {

            memory[selectedBlock] -= processSize;

            allocations[i] = selectedBlock;

        }

        // Save this step
        steps.push({

            processIndex: i,

            processSize: processSize,

            blockIndex: selectedBlock,

            allocated: selectedBlock !== -1,

            remaining:
                selectedBlock !== -1
                    ? memory[selectedBlock]
                    : null,

            memory: [...memory],

            allocations: [...allocations]

        });

    }

    return {

        steps: steps,

        allocations: allocations,

        finalMemory: memory

    };
}