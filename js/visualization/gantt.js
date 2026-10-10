/**
 * Gantt Chart Visualization Module
 * Uses HTML5 Canvas API to render process blocks, time labels, and timelines.
 * Renders step-by-step with subtle entrance animation on the active segment.
 */

const GanttVisualizer = (function () {
    const canvas = document.getElementById("ganttCanvas");
    const container = document.getElementById("ganttChart");
    let ctx = null;

    if (canvas) {
        ctx = canvas.getContext("2d");
    }

    // Curated color palette for processes
    const processColors = {
        P1: "#4d8dff",
        P2: "#48d6b0",
        P3: "#ffc533",
        P4: "#ed55b7",
        P5: "#a78bfa",
        P6: "#fb923c",
        P7: "#38bdf8",
        P8: "#34d399",
        P9: "#f43f5e",
        P10: "#e879f9",
        IDLE: "#334155"
    };

    function getColor(id) {
        if (!id) return "#64748b";
        const upper = id.toUpperCase();
        if (upper === "IDLE") return processColors.IDLE;
        if (processColors[upper]) return processColors[upper];
        // Hash for other process IDs
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 75%, 60%)`;
    }

    function getTextColor(bgColor) {
        if (bgColor === "#ffc533") return "#0b1220";
        return "#ffffff";
    }

    /**
     * Theme-aware chrome colors (baseline, timeline, borders, labels).
     * Resolved at draw time so a theme switch repaints immediately.
     */
    function getPalette() {
        const isLight =
            document.documentElement.classList.contains("light-theme");

        if (isLight) {
            return {
                baseline: "#cbd5e1",
                placeholder: "#64748b",
                timeline: "#cbd5e1",
                blockBorder: "#0f172a",
                tick: "#94a3b8",
                timeLabel: "#475569"
            };
        }

        return {
            baseline: "#29385e",
            placeholder: "#64748b",
            timeline: "#2e3f6b",
            blockBorder: "#0b1428",
            tick: "#5b70a8",
            timeLabel: "#c5d0f5"
        };
    }

    let animationFrameId = null;

    // Last render state, replayed when the theme changes
    let lastRender = null;
    let wasCleared = false;

    /**
     * Clears the Gantt chart canvas and resets state.
     */
    function clearGantt() {
        lastRender = null;
        wasCleared = true;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (!canvas || !ctx) return;

        const palette = getPalette();

        const dpr = window.devicePixelRatio || 1;
        const width = container ? Math.max(container.clientWidth - 40, 500) : 500;
        const height = 160;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        // Draw empty baseline
        ctx.strokeStyle = palette.baseline;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, 95);
        ctx.lineTo(width - 30, 95);
        ctx.stroke();

        // Draw empty placeholder text
        ctx.fillStyle = palette.placeholder;
        ctx.font = "14px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Click Next to view Gantt chart step-by-step", width / 2, 55);
    }

    /**
     * Renders Gantt chart up to currentStep (0-indexed segments: 0 to currentStep - 1).
     * @param {Array<{id: string, startTime: number, endTime: number}>} ganttSegments - Complete Gantt array
     * @param {number} currentStep - Number of segments to render (0 to ganttSegments.length)
     * @param {boolean} animateLast - Whether to perform a subtle entrance animation on the last segment
     */
    function renderGantt(ganttSegments, currentStep, animateLast = false) {
        lastRender = { segments: ganttSegments, step: currentStep };
        wasCleared = false;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (!canvas || !ctx) return;

        if (!ganttSegments || ganttSegments.length === 0 || currentStep === 0) {
            clearGantt();
            return;
        }

        const palette = getPalette();

        const segmentsToDraw = ganttSegments.slice(0, currentStep);
        const totalSimTime = ganttSegments[ganttSegments.length - 1].endTime;

        const containerWidth = container ? Math.max(container.clientWidth - 40, 500) : 500;
        const paddingLeft = 35;
        const paddingRight = 45;
        const availableWidth = containerWidth - paddingLeft - paddingRight;

        // Calculate dynamic pixels per time unit
        const pixelsPerUnit = Math.max(38, Math.min(90, Math.floor(availableWidth / Math.max(1, totalSimTime))));
        const chartWidth = Math.max(containerWidth, paddingLeft + totalSimTime * pixelsPerUnit + paddingRight);
        const height = 160;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = chartWidth * dpr;
        canvas.height = height * dpr;
        canvas.style.width = chartWidth + "px";
        canvas.style.height = height + "px";

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const blockY = 28;
        const blockHeight = 54;
        const timelineY = blockY + blockHeight + 16;

        function drawFrame(lastSegmentProgress = 1.0) {
            ctx.clearRect(0, 0, chartWidth, height);

            // Draw horizontal timeline baseline
            ctx.strokeStyle = palette.timeline;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, timelineY);
            const activeEndTime = segmentsToDraw[segmentsToDraw.length - 1].endTime;
            const timelineEndX = paddingLeft + activeEndTime * pixelsPerUnit + 15;
            ctx.lineTo(Math.max(timelineEndX, chartWidth - paddingRight), timelineY);
            ctx.stroke();

            // Set of time labels already drawn to avoid overlaps
            const drawnTimes = new Set();

            segmentsToDraw.forEach((segment, index) => {
                const isLast = index === segmentsToDraw.length - 1;
                const segStart = segment.startTime;
                const segEnd = segment.endTime;
                const segDuration = segEnd - segStart;

                const startX = paddingLeft + segStart * pixelsPerUnit;
                const fullWidth = segDuration * pixelsPerUnit;
                const curWidth = isLast ? fullWidth * lastSegmentProgress : fullWidth;

                const bgColor = getColor(segment.id);
                const textColor = getTextColor(bgColor);

                // Draw Process Block
                ctx.save();
                if (isLast && animateLast) {
                    ctx.shadowColor = bgColor;
                    ctx.shadowBlur = 10 * lastSegmentProgress;
                }

                // Rounded rectangle for block
                const radius = 6;
                ctx.beginPath();
                ctx.moveTo(startX + radius, blockY);
                ctx.lineTo(startX + curWidth - radius, blockY);
                ctx.quadraticCurveTo(startX + curWidth, blockY, startX + curWidth, blockY + radius);
                ctx.lineTo(startX + curWidth, blockY + blockHeight - radius);
                ctx.quadraticCurveTo(startX + curWidth, blockY + blockHeight, startX + curWidth - radius, blockY + blockHeight);
                ctx.lineTo(startX + radius, blockY + blockHeight);
                ctx.quadraticCurveTo(startX, blockY + blockHeight, startX, blockY + blockHeight - radius);
                ctx.lineTo(startX, blockY + radius);
                ctx.quadraticCurveTo(startX, blockY, startX + radius, blockY);
                ctx.closePath();

                ctx.fillStyle = bgColor;
                ctx.fill();

                // Border between blocks
                ctx.strokeStyle = palette.blockBorder;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

                // Draw Text (ID) inside block
                if (curWidth > 18) {
                    ctx.save();
                    ctx.fillStyle = textColor;
                    ctx.font = "bold 15px Arial, sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    const centerX = startX + curWidth / 2;
                    const centerY = blockY + blockHeight / 2;
                    ctx.fillText(segment.id, centerX, centerY);
                    ctx.restore();
                }

                // Draw Start Time tick & label
                if (!drawnTimes.has(segStart)) {
                    drawnTimes.add(segStart);
                    drawTimeTick(startX, timelineY, segStart);
                }

                // Draw End Time tick & label for current segment
                if (isLast || !drawnTimes.has(segEnd)) {
                    const endX = startX + curWidth;
                    drawnTimes.add(segEnd);
                    drawTimeTick(endX, timelineY, segEnd);
                }
            });
        }

        function drawTimeTick(x, y, timeValue) {
            ctx.save();
            // Vertical tick mark
            ctx.strokeStyle = palette.tick;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y - 6);
            ctx.lineTo(x, y + 6);
            ctx.stroke();

            // Time number label below tick
            ctx.fillStyle = palette.timeLabel;
            ctx.font = "bold 13px Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(timeValue), x, y + 22);
            ctx.restore();
        }

        if (animateLast) {
            const startTime = performance.now();
            const duration = 240; // ms

            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(1.0, elapsed / duration);
                // Ease out quad
                const eased = 1 - (1 - progress) * (1 - progress);
                drawFrame(eased);

                if (progress < 1.0) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    animationFrameId = null;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        } else {
            drawFrame(1.0);
        }

        // Auto-scroll container to keep active segment in view
        if (container) {
            const activeEndX = paddingLeft + segmentsToDraw[segmentsToDraw.length - 1].endTime * pixelsPerUnit;
            if (activeEndX > container.scrollLeft + container.clientWidth - 40) {
                container.scrollTo({
                    left: activeEndX - container.clientWidth + 80,
                    behavior: "smooth"
                });
            } else if (activeEndX < container.scrollLeft) {
                container.scrollTo({
                    left: Math.max(0, activeEndX - 100),
                    behavior: "smooth"
                });
            }
        }
    }

    // Repaint with the matching palette when the theme toggles
    window.addEventListener("oslab:themechange", () => {
        try {
            if (wasCleared) {
                clearGantt();
            } else if (lastRender) {
                renderGantt(lastRender.segments, lastRender.step, false);
            }
            // Nothing rendered yet: leave the blank canvas alone
        } catch (_) {
            /* never let a theme switch break the page */
        }
    });

    return {
        renderGantt,
        clearGantt
    };
})();

// Global functions for direct access
function renderGantt(ganttSegments, currentStep, animateLast) {
    GanttVisualizer.renderGantt(ganttSegments, currentStep, animateLast);
}

function clearGantt() {
    GanttVisualizer.clearGantt();
}
