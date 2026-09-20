console.log("OS Lab JavaScript is running...");

const simulateButton =
    document.getElementById("simulateBtn");

const referenceInput =
    document.getElementById("referenceString");

const frameInput =
    document.getElementById("frameCount");

const algorithmInput =
    document.getElementById("algorithm");


simulateButton.addEventListener("click", function () {

    const referenceString =
        referenceInput.value;

    const frameCount =
        Number(frameInput.value);

    const algorithm =
        algorithmInput.value;


    const referencePages =
        referenceString
            .split(" ")
            .map(Number);


    console.log("Reference Pages:", referencePages);

    console.log("Number of Frames:", frameCount);

    console.log("Algorithm:", algorithm);

});