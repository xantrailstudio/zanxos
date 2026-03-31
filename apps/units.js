import { setupWindow } from "../window-manager.js";

export function openUnits() {
    if (document.getElementById("unitsWindow")) return;

    const win = document.createElement("div");
    win.id = "unitsWindow";
    win.className = "app-window";
    win.style.width = "380px";
    win.style.height = "420px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-ruler-combined"></i>
                <span>Unit Converter</span>
            </div>
            <button class="u-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:20px;">
            <select id="u-type" style="width:100%; padding:12px; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:none; outline:none; font-weight:600;">
                <option value="length">Length (km to m)</option>
                <option value="weight">Weight (kg to g)</option>
                <option value="temp">Temperature (C to F)</option>
            </select>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <label id="u-from-label" style="font-size:0.8rem; opacity:0.6;">From</label>
                <input id="u-input" type="number" value="1" 
                    style="width:100%; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none; font-size:1.1rem;">
            </div>

            <div style="text-align:center; opacity:0.3;">
                <i class="fa-solid fa-arrow-down"></i>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <label id="u-to-label" style="font-size:0.8rem; opacity:0.6;">To</label>
                <input id="u-result" readonly 
                    style="width:100%; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:white; outline:none; font-size:1.1rem;">
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const typeSelect = win.querySelector("#u-type");
    const input = win.querySelector("#u-input");
    const result = win.querySelector("#u-result");
    const fromLabel = win.querySelector("#u-from-label");
    const toLabel = win.querySelector("#u-to-label");
    const closeBtn = win.querySelector(".u-close");

    function update() {
        const type = typeSelect.value;
        const val = parseFloat(input.value) || 0;

        if (type === "length") {
            fromLabel.innerText = "Kilometers (km)";
            toLabel.innerText = "Meters (m)";
            result.value = val * 1000;
        } else if (type === "weight") {
            fromLabel.innerText = "Kilograms (kg)";
            toLabel.innerText = "Grams (g)";
            result.value = val * 1000;
        } else if (type === "temp") {
            fromLabel.innerText = "Celsius (°C)";
            toLabel.innerText = "Fahrenheit (°F)";
            result.value = (val * 9 / 5) + 32;
        }
    }

    typeSelect.onchange = update;
    input.oninput = update;

    update();
    closeBtn.onclick = () => win.remove();
}
