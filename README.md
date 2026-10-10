
# ⚙️ OS Lab — Operating System Visualizer

### Visualize · Learn · Experiment

An interactive, browser-based learning platform for understanding Operating System algorithms through step-by-step simulations and visual representations.

![HTML5](https://img.shields.io/badge/HTML5-Structure-orange?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Responsive UI](https://img.shields.io/badge/UI-Responsive-6C63FF)
![Project](https://img.shields.io/badge/Project-Educational-2E8B57)

</div>

---

## 📖 Overview

**OS Lab** is a frontend web application designed to make core Operating System concepts easier to learn and explore. Instead of only reading about algorithms, users can enter input, run simulations, follow execution steps, and inspect results through an interactive interface.

The application brings together multiple OS topics in one place, including page replacement, CPU scheduling, disk scheduling, memory allocation, and simulation history.

It is built with **HTML5, CSS3, and vanilla JavaScript**, without a frontend framework.

## 🎯 Objectives

- Make Operating System algorithms easier to understand through visualization.
- Demonstrate how algorithm decisions affect execution and results.
- Allow learners to experiment with custom inputs.
- Present simulation steps and useful performance metrics.
- Apply frontend development concepts such as DOM manipulation, input validation, canvas rendering, and browser storage.

## ✨ Modules and Features

### 1. 📄 Page Replacement

Explore how pages are loaded into a limited number of memory frames and how page hits and page faults occur.

The visualizer is designed around a reference string and a configurable frame count. Users can follow execution step by step and inspect the resulting statistics.

Algorithms associated with this module:

- **FIFO** — First-In, First-Out
- **LRU** — Least Recently Used
- **Optimal Page Replacement**
- **LFU** — Least Frequently Used

> Before submission, confirm that each listed algorithm is implemented and selectable in your current code. Remove any algorithm that is not working.

### 2. 🖥️ CPU Scheduling

Explore how a CPU scheduler determines the order in which processes receive CPU time.

This module provides an interface for experimenting with scheduling inputs and understanding execution order and scheduling results.

> Add the exact scheduling algorithms implemented in your code here. Do not list algorithms that are not implemented.

### 3. 💽 Disk Scheduling

Understand how disk requests are ordered and how disk-head movement affects seek distance.

The module accepts disk request inputs and an initial head position, then visualizes request servicing and the resulting head movement.

Algorithms associated with this module:

- **FCFS** — First-Come, First-Served
- **SSTF** — Shortest Seek Time First
- **SCAN**
- **C-SCAN** — Circular SCAN
- **LOOK**
- **C-LOOK** — Circular LOOK

> Confirm that all listed algorithms are implemented and working in your current version.

### 4. 🧠 Memory Allocation

Explore how processes can be assigned to available memory blocks using different allocation strategies.

Strategies associated with this module:

- **First Fit**
- **Best Fit**
- **Worst Fit**

The goal is to help learners compare how allocation strategies select memory blocks for incoming processes.

### 5. 📚 Simulation History

A dedicated page for reviewing saved simulation records.

Depending on the current implementation, history functionality may include:

- Viewing saved simulations.
- Searching or filtering records.
- Inspecting individual simulation details.
- Editing and deleting records.
- Persisting records using browser storage.

**Storage note:** Keep only the operations and storage mechanisms you have tested successfully in the final version.

## 🧰 Technology Stack

| Technology | Role |
|---|---|
| HTML5 | Page structure and form controls |
| CSS3 | Styling, layout, and responsive design |
| Vanilla JavaScript | Algorithm logic, validation, and interactions |
| Canvas API | Drawing simulation visualizations where used |
| IndexedDB | Browser-side storage for structured records, if enabled |
| Web Storage API | Local or session-based browser storage, if used |
| Git and GitHub | Source control and repository hosting |

No React, frontend framework, or build step is required for the basic static website.

## 🧭 How to Use

1. Open the home page.
2. Select an OS module from the navigation bar.
3. Enter the inputs required by that module.
4. Select an algorithm, if the module offers a choice.
5. Start the simulation.
6. Use the available step controls to inspect execution.
7. Review the final results and metrics.
8. Open Simulation History to review saved runs, if history saving is enabled.

The exact controls and metrics depend on the selected module and current implementation.

## 🚀 Run Locally

### Requirements

- A modern browser such as Google Chrome, Microsoft Edge, or Firefox.
- Visual Studio Code is recommended.
- The Live Server extension is recommended for local testing.

### Steps

**1. Clone the repository**

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

**2. Navigate to the project folder**

```bash
cd <YOUR_PROJECT_FOLDER>
```

**3. Open the folder in Visual Studio Code**

```bash
code .
```

**4. Start the website**

Open `index.html` with the VS Code **Live Server** extension, then visit the local URL shown by the extension.

You can also open `index.html` directly for basic static-page checks. However, browser features such as modules, IndexedDB workflows, and service workers should be tested using an appropriate local server. Service workers generally require HTTPS or a trusted localhost context.

## 📁 Project Structure

The following is an example structure based on the project's modules. **Adjust filenames to match the actual repository** before committing this section.

```text
OS-Lab/
├── index.html
├── page-replacement.html
├── cpu-scheduling.html
├── disk-scheduling.html
├── memory-allocation.html
├── history.html
├── css/
│   ├── navbar.css
│   ├── page-replacement.css
│   ├── cpu-scheduling.css
│   ├── disk-scheduling.css
│   ├── memory-allocation.css
│   └── history.css
├── js/
│   ├── script.js
│   ├── fifo.js
│   ├── canvas.js
│   ├── history.js
│   ├── reference.js
│   ├── results.js
│   ├── storage.js
│   └── app-common.js
└── README.md
```

Some files shown above may not exist in your latest version, and additional files may be present. Keep this tree accurate to your repository.

## 🧪 Testing Checklist

Before submitting or deploying the project, test the following:

- [ ] Each navigation link opens the correct page.
- [ ] Each implemented algorithm produces the expected output for known sample inputs.
- [ ] Empty, invalid, and out-of-range inputs are handled appropriately.
- [ ] Step navigation does not skip or misrepresent simulation states.
- [ ] Final statistics match the algorithm's execution.
- [ ] Canvas visualizations update correctly when a simulation runs.
- [ ] History records save and reload correctly, if persistence is implemented.
- [ ] Search, edit, and delete operations work, if provided.
- [ ] The interface remains usable on desktop, tablet, and mobile.
- [ ] Browser DevTools shows no unexpected JavaScript errors or missing files.
- [ ] The deployed website works independently of local file paths.

## 💡 Learning Outcomes

Through this project, learners can practice:

- Translating algorithm logic into JavaScript.
- Understanding Operating System concepts through concrete examples.
- Validating user input and handling edge cases.
- Updating the DOM based on simulation state.
- Rendering visual output with the Canvas API.
- Organizing a multi-page frontend project.
- Using browser storage APIs where implemented.
- Creating responsive interfaces with CSS.
- Tracking code changes using Git and GitHub.

## 🔮 Possible Future Improvements

- Add further Operating System algorithm visualizers.
- Provide side-by-side comparisons of algorithms.
- Add explanations for every execution step.
- Export simulation results for reports or revision.
- Improve keyboard accessibility and guided learning.
- Expand offline support if it fits the project requirements.

These are potential enhancements, not claims about existing functionality.

## 🤝 Contributing

Suggestions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your change.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## 👤 Author

**Mehak**

- GitHub: (https://github.com/MehakChhabra-18)

## 📄 License

No license is specified by this README. If you intend to allow reuse, modification, or redistribution, add an appropriate `LICENSE` file to the repository.

---

**OS Lab — Visualize. Learn. Experiment.**

Made for interactive learning of Operating System concepts.

</div>
