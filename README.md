# ⚙️ OS Lab — Operating System Visualizer

An interactive, browser-based project for exploring Operating System algorithms through visual simulations.

## 📖 Overview

OS Lab brings together these Operating System modules:

- **Page Replacement** — FIFO, LRU, Optimal, and LFU.
- **CPU Scheduling** — FCFS, Priority, Round Robin, SJF, and SRTF.
- **Disk Scheduling** — C-LOOK, C-SCAN, FCFS, LOOK, SCAN, and SSTF.
- **Memory Allocation** — Best Fit, First Fit, and Worst Fit.
- **Simulation History** — A dedicated page for simulation history.

The project is built using HTML5, CSS3, and vanilla JavaScript.

## 🧰 Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- Git and GitHub

## 🚀 Run Locally

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` using the Live Server extension.
4. Visit the local URL provided by Live Server in your browser.

To clone the repository, replace the placeholder with your repository URL:

```bash
git clone <https://github.com/MehakChhabra-18/OS_Lab>
```

## 📁 Project Structure

```text
OS_Lab/
├── css/
│   ├── disk-scheduling.css
│   ├── history.css
│   ├── landing.css
│   ├── memory-allocation.css
│   ├── navbar.css
│   ├── scheduling.css
│   └── style.css
├── data/
│   ├── modules-config.js
│   └── modules.json
├── js/
│   ├── algorithms/
│   │   ├── fifo.js
│   │   ├── lfu.js
│   │   ├── lru.js
│   │   └── optimal.js
│   ├── cpu/
│   │   ├── fcfs.js
│   │   ├── priority.js
│   │   ├── roundrobin.js
│   │   ├── sjf.js
│   │   └── srtf.js
│   ├── disk/
│   │   ├── clook.js
│   │   ├── cscan.js
│   │   ├── fcfs.js
│   │   ├── look.js
│   │   ├── scan.js
│   │   └── sstf.js
│   ├── memory/
│   │   ├── best-fit.js
│   │   ├── first-fit.js
│   │   ├── memory-allocation.js
│   │   └── worst-fit.js
│   ├── visualization/
│   │   ├── canvas.js
│   │   ├── gantt.js
│   │   ├── history.js
│   │   ├── reference.js
│   │   ├── results.js
│   │   ├── step-execution.js
│   │   ├── step.js
│   │   └── timeline.js
│   ├── workers/
│   │   └── algorithm-worker.js
│   ├── app-common.js
│   ├── cpu-scheduling.js
│   ├── disk-scheduling.js
│   ├── history.js
│   ├── script.js
│   └── storage.js
├── _test_disk-scheduling.html
├── _test_memory-allocation.html
├── cpu-scheduling.html
├── disk-scheduling.html
├── history.html
├── index.html
├── LICENSE.md
├── memory-allocation.html
├── page-replacement.html
├── README.md
└── service-worker.js
```

## 📄 Modules

### 1. Page Replacement

The project contains JavaScript files for:

- FIFO — First-In, First-Out
- LRU — Least Recently Used
- Optimal Page Replacement
- LFU — Least Frequently Used

### 2. CPU Scheduling

The project contains JavaScript files for:

- FCFS — First-Come, First-Served
- Priority Scheduling
- Round Robin
- SJF — Shortest Job First
- SRTF — Shortest Remaining Time First

### 3. Disk Scheduling

The project contains JavaScript files for:

- FCFS — First-Come, First-Served
- SSTF — Shortest Seek Time First
- SCAN
- C-SCAN — Circular SCAN
- LOOK
- C-LOOK — Circular LOOK

### 4. Memory Allocation

The project contains JavaScript files for:

- First Fit
- Best Fit
- Worst Fit

### 5. Simulation History

The project includes a Simulation History page and related JavaScript files.

*Note: The algorithm lists above reflect the files visible in the project structure. Their presence does not independently confirm that every algorithm or feature works correctly.*

## 👤 Author

**Mehak**

- GitHub: [MehakChhabra-18](https://github.com/MehakChhabra-18)

## 📜 License

See [`LICENSE.md`](LICENSE.md) for the project's license.

---

**OS Lab — Visualize. Learn. Experiment.**
