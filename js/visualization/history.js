const historyBody = document.getElementById("historyBody");

function displayHistoryUntil(history, lastIndex) {
    historyBody.innerHTML = "";

    for (let i = 0; i <= lastIndex; i++) {
        const step = history[i];
        const row = document.createElement("tr");
        const frames = step.frames.join(", ");
        const resultClass = step.result === "Hit"
            ? "history-hit"
            : "history-fault";

        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${step.page}</td>
            <td>[${frames}]</td>
            <td class="${resultClass}">
                ${step.result}
            </td>
        `;

        historyBody.appendChild(row);
    }
}

function clearHistory() {
    historyBody.innerHTML = "";
}