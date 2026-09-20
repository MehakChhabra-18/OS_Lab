const resultCard = document.getElementById("resultCard");
const pageFaults = document.getElementById("pageFaults");
const pageHits = document.getElementById("pageHits");
const hitRatio = document.getElementById("hitRatio");

function showFinalResults(history) {
    let faults = 0;
    let hits = 0;

    history.forEach(step => {
        if (step.result === "Fault") {
            faults++;
        } else {
            hits++;
        }
    });

    const total = history.length;

    const ratio = (hits / total) * 100;

    pageFaults.textContent = faults;
    pageHits.textContent = hits;
    hitRatio.textContent = ratio.toFixed(2) + "%";

    resultCard.style.display = "block";
}

function hideResults() {
    resultCard.style.display = "none";
}