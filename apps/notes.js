import { setupWindow } from "../window-manager.js";

export function openNotes() {
    if (document.getElementById("notesWindow")) return;

    const win = document.createElement("div");
    win.id = "notesWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "500px";

    const savedNotes = localStorage.getItem("zenx_notes") || "";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-note-sticky"></i>
                <span>Sticky Notes</span>
            </div>
            <button class="n-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="height:calc(100% - 40px); background:#fdf9d8; color:#333; display:flex; flex-direction:column;">
            <textarea id="n-area" style="flex:1; border:none; background:transparent; padding:20px; font-size:1.1rem; resize:none; outline:none; font-family: 'Handlee', system-ui, cursive; color:#222;" 
                placeholder="Type your notes here...">${savedNotes}</textarea>
            <div style="padding:10px; display:flex; justify-content:flex-end; font-size:0.75rem; opacity:0.5; border-top:1px solid rgba(0,0,0,0.05);">
                Auto-saved to local storage
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const area = win.querySelector("#n-area");
    const closeBtn = win.querySelector(".n-close");

    // Add Google Font for paper feel
    if (!document.getElementById("handlee-font")) {
        const link = document.createElement("link");
        link.id = "handlee-font";
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Handlee&display=swap";
        document.head.appendChild(link);
    }

    area.oninput = () => {
        localStorage.setItem("zenx_notes", area.value);
    };

    closeBtn.onclick = () => win.remove();
}
