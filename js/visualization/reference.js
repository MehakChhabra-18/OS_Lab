const referenceDisplay = document.getElementById("referenceDisplay");

function displayReferenceString(pages) {
    referenceDisplay.innerHTML = "";

    pages.forEach((page, index) => {
        const box = document.createElement("div");

        box.className = "reference-page";
        box.textContent = page;
        box.dataset.index = index;

        referenceDisplay.appendChild(box);
    });
}

function highlightReferencePage(index) {
    const pages = document.querySelectorAll(".reference-page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    if (pages[index]) {
        pages[index].classList.add("active");
    }
}

function clearReference() {
    referenceDisplay.innerHTML = "";
}