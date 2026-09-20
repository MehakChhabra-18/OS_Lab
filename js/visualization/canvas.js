const canvas = document.getElementById("memoryCanvas");
const ctx = canvas.getContext("2d");

function clearCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFrames(frames, frameCount) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const boxWidth = 180;
    const boxHeight = 55;
    const gap = 8;

    const totalHeight =
        frameCount * boxHeight +
        (frameCount - 1) * gap;

    const startX =
        (canvas.width - boxWidth) / 2;

    const startY =
        (canvas.height - totalHeight) / 2;

    ctx.fillStyle = "#a5b4fc";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillText(
        "Memory Frames",
        canvas.width / 2,
        startY - 25
    );

    for (let i = 0; i < frameCount; i++) {
        const x = startX;
        const y = startY + i * (boxHeight + gap);
        const page = frames[i];

        ctx.fillStyle = "#101d35";
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(
            x,
            y,
            boxWidth,
            boxHeight,
            8
        );
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (page !== undefined) {
            ctx.fillStyle = "#f8fafc";
            ctx.font = "bold 24px Arial";

            ctx.fillText(
                page,
                x + boxWidth / 2,
                y + boxHeight / 2
            );
        } else {
            ctx.fillStyle = "#64748b";
            ctx.font = "22px Arial";

            ctx.fillText(
                "-",
                x + boxWidth / 2,
                y + boxHeight / 2
            );
        }
    }
}