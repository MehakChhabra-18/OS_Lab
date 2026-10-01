// ==========================================
// WORST FIT MEMORY ALLOCATION
// ==========================================

function worstFit(blocks, processes) {

    const memory = [...blocks];

    const steps = [];

    const allocations =
        new Array(processes.length).fill(-1);

    for (let i = 0; i < processes.length; i++) {

        const processSize = processes[i];

        let selectedBlock = -1;
        let largestBlock = -1;

        // Find the LARGEST block that can
        // accommodate the process
        for (let j = 0; j < memory.length; j++) {

            if (memory[j] >= processSize) {

                if (memory[j] > largestBlock) {

                    largestBlock = memory[j];
                    selectedBlock = j;

                }

            }

        }

        // Allocate process
        if (selectedBlock !== -1) {

            memory[selectedBlock] -= processSize;

            allocations[i] = selectedBlock;

        }

        // Save state for visualization
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