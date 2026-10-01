// ==========================================
// FIRST FIT MEMORY ALLOCATION
// ==========================================

function firstFit(blocks, processes) {

    const memory = [...blocks];

    const steps = [];

    const allocations = new Array(processes.length).fill(-1);

    for (let i = 0; i < processes.length; i++) {

        const processSize = processes[i];

        let selectedBlock = -1;

        // Find the FIRST block that can accommodate
        // the current process
        for (let j = 0; j < memory.length; j++) {

            if (memory[j] >= processSize) {

                selectedBlock = j;
                break;
            }
        }

        // Allocate process
        if (selectedBlock !== -1) {

            const remaining =
                memory[selectedBlock] - processSize;

            allocations[i] = selectedBlock;

            memory[selectedBlock] = remaining;

        }

        // Save state after this process
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