import { setupWindow } from "../window-manager.js";
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { db } from "../firebase.js";
import { showModal } from "../ui-utils.js";


import { openEditor } from "./editor.js";
import { openExplorer } from "./explorer.js";

export function openSearch(uid) {
    if (document.getElementById("searchWindow")) return;

    const win = document.createElement("div");
    win.id = "searchWindow";
    win.className = "app-window";
    win.style.width = "500px";
    win.style.height = "400px";

    win.innerHTML = `
    <div class="window-header">
      <div style="display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>File Search</span>
      </div>
      <button class="s-close"><i class="fa-solid fa-xmark"></i></button>
    </div>
    
    <div style="display:flex; flex-direction:column; height:100%; padding:20px; color:white; gap:15px;">
        <input id="s-input" type="text" placeholder="Search filename..." style="width:100%; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.3); color:white; font-size:16px;">
        
        <div id="s-results" style="flex:1; overflow-y:auto; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <div style="opacity:0.5; text-align:center; margin-top:20px;">Type to search...</div>
        </div>
    </div>
  `;

    document.body.appendChild(win);
    setupWindow(win);

    const input = win.querySelector("#s-input");
    const results = win.querySelector("#s-results");

    let timeout;

    async function performSearch(term) {
        if (!term) {
            results.innerHTML = "<div style='opacity:0.5; text-align:center; margin-top:20px;'>Type to search...</div>";
            return;
        }

        results.innerHTML = "<div style='opacity:0.5; text-align:center; margin-top:20px;'>Searching...</div>";

        try {
            // Firestore doesn't support generic substring search natively easily,
            // but we can do a prefix search (name >= term && name <= term + '\uf8ff')
            // or just client side filtering if list is small. 
            // For scalability, let's just get everything for this user and filter client side 
            // (since this is a single user OS simulation, user files won't be millions).
            // Actually, we can do exact match or simple prefix.

            // Let's fetch all fs metadata for user (lite)
            const fsRef = collection(db, "users", uid, "fs");
            const snapshot = await getDocs(fsRef);

            const matches = [];
            const lowerTerm = term.toLowerCase();

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.name.toLowerCase().includes(lowerTerm)) {
                    matches.push({ id: doc.id, ...data });
                }
            });

            if (matches.length === 0) {
                results.innerHTML = "<div style='opacity:0.5; text-align:center; margin-top:20px;'>No results found.</div>";
                return;
            }

            results.innerHTML = "";
            matches.forEach(m => {
                const el = document.createElement("div");
                el.style.cssText = "padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; display:flex; align-items:center; gap:10px;";
                el.innerHTML = `
                    <i class="fa-solid ${m.type === 'folder' ? 'fa-folder' : 'fa-file-lines'}"></i>
                    <span>${m.name}</span>
                `;
                el.onmouseover = () => el.style.background = "rgba(255,255,255,0.1)";
                el.onmouseout = () => el.style.background = "transparent";

                el.onclick = () => {
                    if (m.type === 'file') {
                        openEditor(uid, m.id, m.name, m.content || "");
                    } else {
                        // Open explorer to this folder
                        openExplorer(uid, m.id);
                    }
                };
                results.appendChild(el);
            });

        } catch (e) {
            console.error(e);
            results.innerHTML = "<div style='color:red;'>Error searching.</div>";
            showModal("Search Error", "Could not complete search: " + e.message, true);
        }

    }

    input.oninput = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            performSearch(input.value.trim());
        }, 500); // Debounce
    };

    input.focus();

    win.querySelector(".s-close").onclick = () => {
        win.remove();
    };
}
