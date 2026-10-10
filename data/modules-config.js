/**
 * OS Lab — Module Configuration (script-tag fallback)
 * ---------------------------------------------------------------------------
 * data/modules.json cannot be read via fetch() when the site is opened directly
 * from disk (file:// protocol), because browsers block XHR/fetch to local files.
 *
 * This file mirrors data/modules.json and exposes the exact same shape through a
 * global, so app-common.js can fall back to loading it with a <script> tag,
 * which IS allowed on file://. Keep both files in sync when editing modules.
 * ---------------------------------------------------------------------------
 */
window.OSLabModuleConfig = {
    name: "OS Lab — Operating System Visualizer",
    version: "1.0.0",
    description:
        "Interactive web platform to visualize core Operating System algorithms step-by-step.",
    author: "OS Lab Team",
    modules: [
        {
            id: "page-replacement",
            name: "Page Replacement",
            category: "Memory Management",
            icon: "▤",
            page: "page-replacement.html",
            description:
                "Simulate and visualize how virtual memory handles page faults and frame allocation across different replacement policies.",
            algorithms: [
                {
                    id: "fifo",
                    name: "First-In First-Out (FIFO)",
                    timeComplexity: "O(1)",
                    spaceComplexity: "O(f)",
                    summary:
                        "Replaces the oldest page present in memory. Suffers from Belady's Anomaly.",
                },
                {
                    id: "lru",
                    name: "Least Recently Used (LRU)",
                    timeComplexity: "O(f)",
                    spaceComplexity: "O(f)",
                    summary:
                        "Replaces the page that has not been referenced for the longest period.",
                },
                {
                    id: "optimal",
                    name: "Optimal (OPT)",
                    timeComplexity: "O(f × n)",
                    spaceComplexity: "O(f)",
                    summary:
                        "Replaces the page that will not be used for the longest time in the future. Theoretical benchmark.",
                },
                {
                    id: "lfu",
                    name: "Least Frequently Used (LFU)",
                    timeComplexity: "O(f)",
                    spaceComplexity: "O(f + p)",
                    summary:
                        "Replaces the page with the lowest reference frequency count. Ties resolved by LRU.",
                },
            ],
            presets: [
                {
                    name: "Classic 7 0 1 2",
                    referenceString: "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1",
                    frameCount: 3,
                },
                {
                    name: "Belady Demo",
                    referenceString: "1 2 3 4 1 2 5 1 2 3 4 5",
                    frameCount: 4,
                },
                {
                    name: "High Locality",
                    referenceString: "2 3 2 1 5 2 4 5 3 2 5 2",
                    frameCount: 3,
                },
            ],
        },
        {
            id: "cpu-scheduling",
            name: "CPU Scheduling",
            category: "Process Management",
            icon: "▥",
            page: "cpu-scheduling.html",
            description:
                "Examine how the CPU dispatcher schedules ready processes to optimize turnaround and waiting times.",
            algorithms: [
                {
                    id: "fcfs",
                    name: "First-Come First-Served (FCFS)",
                    type: "Non-preemptive",
                    summary:
                        "Executes processes in order of arrival. Can lead to the convoy effect.",
                },
                {
                    id: "sjf",
                    name: "Shortest Job First (SJF)",
                    type: "Non-preemptive",
                    summary:
                        "Selects the process with the smallest CPU burst time. Optimal average waiting time.",
                },
                {
                    id: "srtf",
                    name: "Shortest Remaining Time First (SRTF)",
                    type: "Preemptive",
                    summary:
                        "Preempts currently running job if a newly arrived process has a shorter remaining burst.",
                },
                {
                    id: "priority",
                    name: "Priority Scheduling",
                    type: "Non-preemptive",
                    summary:
                        "Allocates CPU according to explicit priority ranking (lower number = higher priority).",
                },
                {
                    id: "roundrobin",
                    name: "Round Robin (RR)",
                    type: "Preemptive",
                    summary:
                        "Dispatches processes in cyclic queue with a fixed time quantum slice.",
                },
            ],
        },
        {
            id: "disk-scheduling",
            name: "Disk Scheduling",
            category: "Storage Management",
            icon: "◈",
            page: "disk-scheduling.html",
            description:
                "Visualize physical disk head seek movement across magnetic cylinders to minimize seek overhead.",
            algorithms: [
                {
                    id: "fcfs",
                    name: "FCFS",
                    summary: "Services disk track requests in order received.",
                },
                {
                    id: "sstf",
                    name: "SSTF",
                    summary: "Selects the track closest to the current head position.",
                },
                {
                    id: "scan",
                    name: "SCAN (Elevator)",
                    summary:
                        "Sweeps toward one end serving requests, then reverses direction.",
                },
                {
                    id: "cscan",
                    name: "C-SCAN (Circular SCAN)",
                    summary:
                        "Sweeps to the end, then jumps back to cylinder 0 without servicing on return.",
                },
                {
                    id: "look",
                    name: "LOOK",
                    summary:
                        "Sweeps in one direction up to the last request, then reverses without reaching disk bounds.",
                },
                {
                    id: "clook",
                    name: "C-LOOK",
                    summary:
                        "Sweeps in one direction up to the last request, then jumps directly to the lowest request.",
                },
            ],
        },
        {
            id: "memory-allocation",
            name: "Memory Allocation",
            category: "Memory Management",
            icon: "▦",
            page: "memory-allocation.html",
            description:
                "Simulate contiguous memory partition allocation policies for incoming processes.",
            algorithms: [
                {
                    id: "first-fit",
                    name: "First Fit",
                    summary:
                        "Allocates the first hole from the beginning that is big enough.",
                },
                {
                    id: "best-fit",
                    name: "Best Fit",
                    summary:
                        "Allocates the smallest hole that is big enough, minimizing leftover fragment.",
                },
                {
                    id: "worst-fit",
                    name: "Worst Fit",
                    summary:
                        "Allocates the largest hole available, leaving the largest remaining fragment.",
                },
            ],
        },
    ],
};
