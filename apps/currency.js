import { setupWindow } from "../window-manager.js";

export function openCurrency() {
    if (document.getElementById("currencyWindow")) return;

    const win = document.createElement("div");
    win.id = "currencyWindow";
    win.className = "app-window";
    win.style.width = "380px";
    win.style.height = "450px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-coins"></i>
                <span>Currency Converter</span>
            </div>
            <button class="c-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:0.8rem; opacity:0.6;">Amount</label>
                <input id="c-amount" type="number" value="1" 
                    style="width:100%; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none; font-size:1.2rem;">
            </div>
            
            <div style="display:flex; align-items:center; gap:10px;">
                <select id="c-from" style="flex:1; padding:10px; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:none; outline:none;">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="INR">INR</option>
                </select>
                <i class="fa-solid fa-right-left" style="opacity:0.4;"></i>
                <select id="c-to" style="flex:1; padding:10px; border-radius:8px; background:rgba(255,255,255,0.1); color:white; border:none; outline:none;">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="INR">INR</option>
                </select>
            </div>

            <div id="c-result-box" style="margin-top:10px; background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center; border:1px solid rgba(255,255,255,0.03);">
                <div id="c-result-text" style="font-size:1.8rem; font-weight:700;">--</div>
                <div id="c-rate-text" style="font-size:0.8rem; opacity:0.5; margin-top:5px;">Fetching rates...</div>
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const amountInput = win.querySelector("#c-amount");
    const fromSelect = win.querySelector("#c-from");
    const toSelect = win.querySelector("#c-to");
    const resultText = win.querySelector("#c-result-text");
    const rateText = win.querySelector("#c-rate-text");
    const closeBtn = win.querySelector(".c-close");

    async function convert() {
        const amount = amountInput.value || 0;
        const from = fromSelect.value;
        const to = toSelect.value;

        try {
            // Using a free, no-key-required API for demo
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const data = await res.json();
            const rate = data.rates[to];
            const result = (amount * rate).toFixed(2);

            resultText.innerText = `${result} ${to}`;
            rateText.innerText = `1 ${from} = ${rate.toFixed(4)} ${to}`;
        } catch (e) {
            resultText.innerText = "Error";
            rateText.innerText = "Failed to fetch rates.";
        }
    }

    amountInput.oninput = convert;
    fromSelect.onchange = convert;
    toSelect.onchange = convert;

    convert();
    closeBtn.onclick = () => win.remove();
}
