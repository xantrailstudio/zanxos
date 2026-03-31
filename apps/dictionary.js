import { setupWindow } from "../window-manager.js";

export function openDictionary() {
    if (document.getElementById("dictionaryWindow")) return;

    const win = document.createElement("div");
    win.id = "dictionaryWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "550px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-book"></i>
                <span>Dictionary</span>
            </div>
            <button class="d-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:20px; height:calc(100% - 40px);">
            <div style="display:flex; gap:10px;">
                <input id="d-input" type="text" placeholder="Search a word..." 
                    style="flex:1; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                <button id="d-search" style="padding:12px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
            <div id="d-result" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:15px; padding-right:5px;">
                <div style="text-align:center; opacity:0.4; margin-top:50px;">Enter a word to see its definition</div>
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const input = win.querySelector("#d-input");
    const searchBtn = win.querySelector("#d-search");
    const resultBox = win.querySelector("#d-result");
    const closeBtn = win.querySelector(".d-close");

    async function search() {
        const word = input.value.trim();
        if (!word) return;

        resultBox.innerHTML = '<div style="text-align:center; opacity:0.5;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await res.json();

            if (data.title === "No Definitions Found") {
                resultBox.innerHTML = '<div style="text-align:center; opacity:0.5;">No definitions found.</div>';
                return;
            }

            const entry = data[0];
            let meaningsHtml = entry.meanings.map(m => `
                <div style="margin-bottom:10px;">
                    <div style="font-weight:700; text-transform:uppercase; font-size:0.75rem; opacity:0.6; margin-bottom:4px;">${m.partOfSpeech}</div>
                    <div style="font-size:0.95rem; line-height:1.4;">${m.definitions[0].definition}</div>
                    ${m.definitions[0].example ? `<div style="font-size:0.85rem; font-style:italic; opacity:0.5; margin-top:4px;">"${m.definitions[0].example}"</div>` : ''}
                </div>
            `).join('');

            resultBox.innerHTML = `
                <div>
                    <div style="font-size:1.8rem; font-weight:700;">${entry.word}</div>
                    <div style="font-size:0.9rem; opacity:0.5;">${entry.phonetic || ''}</div>
                </div>
                <div style="height:1px; background:rgba(255,255,255,0.1);"></div>
                <div>${meaningsHtml}</div>
            `;
        } catch (e) {
            resultBox.innerHTML = '<div style="text-align:center; opacity:0.5; color:#ff5f56;">Error connecting to API.</div>';
        }
    }

    searchBtn.onclick = search;
    input.onkeydown = (e) => { if (e.key === "Enter") search(); };
    closeBtn.onclick = () => win.remove();
}
