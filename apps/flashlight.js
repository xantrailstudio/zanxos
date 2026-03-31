import { setupWindow } from "../window-manager.js";

export function openFlashlight() {
    if (document.getElementById("flashlightWindow")) return;

    const win = document.createElement("div");
    win.id = "flashlightWindow";
    win.className = "app-window";
    win.style.width = "350px";
    win.style.height = "400px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-lightbulb"></i>
                <span>Night Light</span>
            </div>
            <button class="f-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:25px; align-items:center; justify-content:center; height:calc(100% - 40px); text-align:center;">
            <div id="f-preview" style="width:100px; height:100px; border-radius:50%; background:#fff; box-shadow:0 0 20px #fff; transition:all 0.3s; margin-bottom:10px;"></div>
            
            <div style="width:100%; display:flex; flex-direction:column; gap:10px;">
                <label style="font-size:0.85rem; opacity:0.6;">Color Temperature</label>
                <input type="range" id="f-temp" min="0" max="100" value="0" style="width:100%; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; opacity:0.4;">
                    <span>Cool</span>
                    <span>Warm</span>
                </div>
            </div>

            <div style="width:100%; display:flex; flex-direction:column; gap:10px;">
                <label style="font-size:0.85rem; opacity:0.6;">Intensity</label>
                <input type="range" id="f-intensity" min="0" max="100" value="100" style="width:100%; cursor:pointer;">
            </div>

            <button id="f-toggle" style="padding:12px 30px; border-radius:30px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer; box-shadow:0 5px 15px rgba(255,255,255,0.2);">
                TURN ON
            </button>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const preview = win.querySelector("#f-preview");
    const tempInput = win.querySelector("#f-temp");
    const intensityInput = win.querySelector("#f-intensity");
    const toggleBtn = win.querySelector("#f-toggle");
    const closeBtn = win.querySelector(".f-close");

    let isOn = false;
    let overlay = null;

    function updateLight() {
        const temp = tempInput.value;
        const intensity = intensityInput.value / 100;

        // Calculate color based on temp (0-100)
        // 0 is white/blueish, 100 is warm/orange
        const r = 255;
        const g = 255 - (temp * 1.5);
        const b = 255 - (temp * 2);
        const color = `rgba(${r}, ${g}, ${b}, ${intensity * 0.3})`;
        const previewColor = `rgb(${r}, ${g}, ${b})`;

        preview.style.background = previewColor;
        preview.style.boxShadow = `0 0 ${20 + (intensity * 30)}px ${previewColor}`;
        preview.style.opacity = isOn ? intensity : 0.3;

        if (isOn && overlay) {
            overlay.style.background = color;
        }
    }

    toggleBtn.onclick = () => {
        isOn = !isOn;
        if (isOn) {
            toggleBtn.innerText = "TURN OFF";
            toggleBtn.style.background = "#ff5f56";
            toggleBtn.style.color = "#fff";

            overlay = document.createElement("div");
            overlay.id = "f-overlay";
            overlay.style.cssText = "position:fixed; inset:0; pointer-events:none; z-index:10000; transition:background 0.3s;";
            document.body.appendChild(overlay);
        } else {
            toggleBtn.innerText = "TURN ON";
            toggleBtn.style.background = "#fff";
            toggleBtn.style.color = "#000";
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
        }
        updateLight();
    };

    tempInput.oninput = updateLight;
    intensityInput.oninput = updateLight;

    closeBtn.onclick = () => {
        if (overlay) overlay.remove();
        win.remove();
    };

    updateLight();
}
