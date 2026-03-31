import { setupWindow } from "../window-manager.js";
import { showModal } from "../ui-utils.js";

export function openUrlShortener() {
    if (document.getElementById("urlShortenerWindow")) return;

    const win = document.createElement("div");
    win.id = "urlShortenerWindow";
    win.className = "app-window";
    win.style.width = "450px";
    win.style.height = "350px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-link"></i>
                <span>URL Shortener</span>
            </div>
            <button class="u-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding: 24px; color: white; display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 0.9rem; opacity: 0.8;">Enter Long URL</label>
                <input id="u-input" type="url" placeholder="https://example.com/very-long-link" 
                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white; outline: none;">
            </div>
            <button id="u-shorten" style="padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                Shorten URL
            </button>
            <div id="u-result-container" style="display: none; flex-direction: column; gap: 8px; animation: fadeIn 0.3s ease;">
                <label style="font-size: 0.9rem; opacity: 0.8;">Shortened URL</label>
                <div style="display: flex; gap: 8px;">
                    <input id="u-result" readonly style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff;">
                    <button id="u-copy" style="padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; cursor: pointer;">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const input = win.querySelector("#u-input");
    const shortenBtn = win.querySelector("#u-shorten");
    const resultContainer = win.querySelector("#u-result-container");
    const resultInput = win.querySelector("#u-result");
    const copyBtn = win.querySelector("#u-copy");
    const closeBtn = win.querySelector(".u-close");

    shortenBtn.onclick = async () => {
        const url = input.value.trim();
        if (!url) return;

        shortenBtn.disabled = true;
        shortenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        try {
            // Using is.gd API via proxy or clean JSONP if possible, but for easy static we'll use a fetch to a clean API
            const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.shorturl) {
                resultInput.value = data.shorturl;
                resultContainer.style.display = "flex";
            } else {
                throw new Error(data.errormessage || "Failed to shorten URL");
            }
        } catch (e) {
            showModal("Error", e.message || "Failed to shorten. Check your URL.", true);
        } finally {
            shortenBtn.disabled = false;
            shortenBtn.innerText = "Shorten URL";
        }
    };

    copyBtn.onclick = () => {
        resultInput.select();
        document.execCommand("copy");
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #2ecc71;"></i>';
        setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
    };

    closeBtn.onclick = () => win.remove();
}
