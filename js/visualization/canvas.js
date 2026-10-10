const canvas = document.getElementById("memoryCanvas");
const ctx = canvas.getContext("2d");

/**
 * Theme-aware palette, resolved at draw time (not at script load)
 * so the frames repaint correctly after a theme switch.
 */
function getMemoryPalette() {
    const isLight =
        document.documentElement.classList.contains("light-theme");

    if (isLight) {
        return {
            title: "#4f46e5",
            frameFill: "#ffffff",
            frameStroke: "#6366f1",
            pageText: "#0f172a",
            emptyText: "#64748b"
        };
    }

    return {
        title: "#a5b4fc",
        frameFill: "#101d35",
        frameStroke: "#6366f1",
        pageText: "#f8fafc",
        emptyText: "#64748b"
    };
}

// Last drawn state, replayed when the theme changes
let lastDrawnFrames = null;

function clearCanvas() {
    lastDrawnFrames = null;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFrames(frames, frameCount) {
    lastDrawnFrames = { frames, frameCount };

    const palette = getMemoryPalette();

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

    ctx.fillStyle = palette.title;
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

        ctx.fillStyle = palette.frameFill;
        ctx.strokeStyle = palette.frameStroke;
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
            ctx.fillStyle = palette.pageText;
            ctx.font = "bold 24px Arial";

            ctx.fillText(
                page,
                x + boxWidth / 2,
                y + boxHeight / 2
            );
        } else {
            ctx.fillStyle = palette.emptyText;
            ctx.font = "22px Arial";

            ctx.fillText(
                "-",
                x + boxWidth / 2,
                y + boxHeight / 2
            );
        }
    }
}

// Repaint the frames with the matching palette on a theme switch
window.addEventListener("oslab:themechange", () => {
    try {
        if (!lastDrawnFrames) {
            return;
        }

        drawFrames(
            lastDrawnFrames.frames,
            lastDrawnFrames.frameCount
        );
    } catch (_) {
        /* never let a theme switch break the page */
    }
});