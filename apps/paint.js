import { setupWindow } from "../window-manager.js";

export function openPaint() {
    if (document.getElementById("paintWindow")) return;

    const win = document.createElement("div");
    win.id = "paintWindow";
    win.className = "app-window";
    win.style.width = "600px";
    win.style.height = "500px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-palette"></i>
                <span>Paint</span>
            </div>
            <button class="p-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="display:flex; flex-direction:column; height:calc(100% - 40px); background:#fff;">
            <div style="padding:10px; background:#f0f0f0; border-bottom:1px solid #ddd; display:flex; gap:10px; align-items:center;">
                <input type="color" id="p-color" value="#000000" style="width:30px; height:30px; border:none; cursor:pointer;">
                <input type="range" id="p-size" min="1" max="20" value="5" style="width:100px;">
                <button id="p-clear" style="padding:5px 10px; border-radius:4px; border:1px solid #ccc; background:#fff; cursor:pointer; font-size:0.8rem;">Clear</button>
            </div>
            <canvas id="p-canvas" style="flex:1; cursor:crosshair;"></canvas>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const canvas = win.querySelector("#p-canvas");
    const ctx = canvas.getContext("2d");
    const colorInput = win.querySelector("#p-color");
    const sizeInput = win.querySelector("#p-size");
    const clearBtn = win.querySelector("#p-clear");
    const closeBtn = win.querySelector(".p-close");

    let painting = false;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.putImageData(tempImage, 0, 0);
    }

    // Delay resize until visible
    setTimeout(resizeCanvas, 0);

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function finishedPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = sizeInput.value;
        ctx.lineCap = "round";
        ctx.strokeStyle = colorInput.value;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);

    // Touch support
    canvas.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    canvas.addEventListener("touchend", () => {
        canvas.dispatchEvent(new MouseEvent("mouseup"));
    });

    canvas.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    clearBtn.onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    closeBtn.onclick = () => win.remove();
}
