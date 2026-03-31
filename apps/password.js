import { setupWindow } from "../window-manager.js";

export function openPassword() {
    if (document.getElementById("passwordWindow")) return;

    const win = document.createElement("div");
    win.id = "passwordWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "420px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Password Generator</span>
            </div>
            <button class="pg-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:20px;">
            <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); text-align:center;">
                <div id="pg-output" style="font-size:1.4rem; font-family:monospace; word-break:break-all; min-height:1.4em;">********</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label style="font-size:0.9rem; opacity:0.8;">Length: <span id="pg-length-val">12</span></label>
                    <input type="range" id="pg-length" min="6" max="32" value="12" style="width:150px;">
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
                        <input type="checkbox" id="pg-upper" checked> Uppercase
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
                        <input type="checkbox" id="pg-lower" checked> Lowercase
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
                        <input type="checkbox" id="pg-numbers" checked> Numbers
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
                        <input type="checkbox" id="pg-symbols" checked> Symbols
                    </label>
                </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:5px;">
                <button id="pg-generate" style="flex:1; padding:12px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">GENERATE</button>
                <button id="pg-copy" style="padding:12px 20px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:white; cursor:pointer;">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const output = win.querySelector("#pg-output");
    const lengthInput = win.querySelector("#pg-length");
    const lengthVal = win.querySelector("#pg-length-val");
    const upperCheck = win.querySelector("#pg-upper");
    const lowerCheck = win.querySelector("#pg-lower");
    const numbersCheck = win.querySelector("#pg-numbers");
    const symbolsCheck = win.querySelector("#pg-symbols");
    const generateBtn = win.querySelector("#pg-generate");
    const copyBtn = win.querySelector("#pg-copy");
    const closeBtn = win.querySelector(".pg-close");

    const charset = {
        upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lower: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };

    function generate() {
        let characters = "";
        if (upperCheck.checked) characters += charset.upper;
        if (lowerCheck.checked) characters += charset.lower;
        if (numbersCheck.checked) characters += charset.numbers;
        if (symbolsCheck.checked) characters += charset.symbols;

        if (characters === "") {
            output.innerText = "(Select Options)";
            return;
        }

        let password = "";
        const length = parseInt(lengthInput.value);
        for (let i = 0; i < length; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        output.innerText = password;
    }

    lengthInput.oninput = () => {
        lengthVal.innerText = lengthInput.value;
    };

    generateBtn.onclick = generate;

    copyBtn.onclick = () => {
        const text = output.innerText;
        if (text === "********" || text === "(Select Options)") return;
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color:#2ecc71;"></i>';
            setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
        });
    };

    closeBtn.onclick = () => win.remove();

    generate();
}
