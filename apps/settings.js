import { setupWindow } from "../window-manager.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "../firebase.js";
import { showModal } from "../ui-utils.js";

export async function openSettings(uid) {
    if (document.getElementById("settingsWindow")) return;

    const win = document.createElement("div");
    win.id = "settingsWindow";
    win.className = "app-window";
    win.style.width = "700px";
    win.style.height = "550px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-gear"></i>
                <span>zanX Control Center</span>
            </div>
            <button class="s-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="display:flex; height:calc(100% - 40px);">
            <!-- Sidebar -->
            <div style="width:180px; background:rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.05); padding:20px 10px; display:flex; flex-direction:column; gap:5px;">
                <div class="s-nav active" data-tab="profile"><i class="fa-solid fa-user"></i> Profile</div>
                <div class="s-nav" data-tab="personalization"><i class="fa-solid fa-palette"></i> Personalization</div>
                <div class="s-nav" data-tab="apps"><i class="fa-solid fa-table-cells-large"></i> Apps</div>
                <div class="s-nav" data-tab="system"><i class="fa-solid fa-microchip"></i> System Info</div>
                <div class="s-nav" data-tab="security"><i class="fa-solid fa-shield-halved"></i> Security</div>
            </div>
            <!-- Main Content -->
            <div id="s-content" style="flex:1; padding:30px; overflow-y:auto; color:white;">
                <!-- Content injected here -->
            </div>
        </div>
        <style>
            .s-nav {
                padding: 12px 15px;
                border-radius: 10px;
                color: rgba(255,255,255,0.6);
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .s-nav:hover { background: rgba(255,255,255,0.05); color: #fff; }
            .s-nav.active { background: var(--accent-color); color: #fff; font-weight: 600; box-shadow: 0 4px 15px var(--accent-glow); }
            
            .s-section { display: none; animation: fadeIn 0.3s ease; }
            .s-section.active { display: block; }
            
            .s-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; }
            .s-label { font-size: 0.8rem; opacity: 0.5; margin-bottom: 8px; display: block; }
            
            .color-dot { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
            .color-dot:hover { transform: scale(1.1); }
            .color-dot.selected { border-color: #fff; transform: scale(1.1); }
        </style>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const contentBox = win.querySelector("#s-content");
    const navs = win.querySelectorAll(".s-nav");

    // Fetch User Data once
    let userData = {};
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) userData = userDoc.data();
    } catch (e) { console.error(e); }

    const tabs = {
        profile: `
            <div class="s-section active">
                <h2 style="margin-bottom:20px;">Profile Settings</h2>
                <div class="s-card">
                    <span class="s-label">DISPLAY NAME</span>
                    <div style="display:flex; gap:10px;">
                        <input id="s-name" type="text" value="${userData.name || ''}" placeholder="Your Name" 
                            style="flex:1; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                        <button id="s-save-name" style="padding:10px 20px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">Update</button>
                    </div>
                </div>
                <div class="s-card" style="opacity:0.5;">
                    <span class="s-label">ACCOUNT EMAIL</span>
                    <div>${userData.email || 'N/A'}</div>
                </div>
            </div>
        `,
        system: `
            <div class="s-section active">
                <h2 style="margin-bottom:20px;">System Information</h2>
                <div class="s-card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>OS Version</span>
                        <span style="opacity:0.6;">ZenX 8.2 (Build 2026)</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>Architecture</span>
                        <span style="opacity:0.6;">64-bit WebVM</span>
                    </div>
                </div>
                <div class="s-card">
                    <span class="s-label">BROWSER ENGINE</span>
                    <div style="font-size:0.9rem; opacity:0.8; line-height:1.5;">${navigator.userAgent}</div>
                </div>
            </div>
        `,
        personalization: `
            <div class="s-section active">
                <h2 style="margin-bottom:20px;">Personalization</h2>
                <div class="s-card">
                    <span class="s-label">WALLPAPER</span>
                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:15px; margin-top:10px;">
                        <div class="wallpaper-thumb ${userData.theme === 'Bgimg/img.jpg' ? 'selected' : ''}" data-path="Bgimg/img.jpg">
                            <img src="Bgimg/img.jpg" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover; border:2px solid transparent;">
                        </div>
                        <div class="wallpaper-thumb ${userData.theme === 'Bgimg/img3.png' ? 'selected' : ''}" data-path="Bgimg/img3.png">
                            <img src="Bgimg/img3.png" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover; border:2px solid transparent;">
                        </div>
                        <div class="wallpaper-thumb ${userData.theme === 'Bgimg/img4.png' ? 'selected' : ''}" data-path="Bgimg/img4.png">
                            <img src="Bgimg/img4.png" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover; border:2px solid transparent;">
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .wallpaper-thumb { cursor: pointer; transition: 0.2s; position: relative; }
                .wallpaper-thumb img { border: 2px solid transparent; }
                .wallpaper-thumb:hover img { border-color: rgba(255,255,255,0.3); }
                .wallpaper-thumb.selected img { border-color: var(--accent-color); box-shadow: 0 0 15px var(--accent-glow); }
            </style>
        `,
        security: `
            <div class="s-section active">
                <h2 style="margin-bottom:20px;">Security</h2>
                <div class="s-card">
                    <span class="s-label">LOCK SCREEN PASSWORD</span>
                    <div style="display:flex; gap:10px;">
                        <input id="s-pass" type="password" value="${userData.lockPassword || ''}" placeholder="None"
                            style="flex:1; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                        <button id="s-save-pass" style="padding:10px 20px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">Save</button>
                    </div>
                </div>
            </div>
        `,
        apps: `
            <div class="s-section active">
                <h2 style="margin-bottom:20px;">Installed Apps</h2>
                <div id="settings-apps-list">
                    <!-- Dynamic List -->
                </div>
            </div>
        `
    };

    function renderTab(tabId) {
        contentBox.innerHTML = tabs[tabId];
        attachEvents(tabId);
    }

    function attachEvents(tabId) {
        if (tabId === 'profile') {
            const btn = contentBox.querySelector("#s-save-name");
            btn.onclick = async () => {
                const name = contentBox.querySelector("#s-name").value.trim();
                btn.innerText = "Saving...";
                await updateDoc(doc(db, "users", uid), { name });
                btn.innerText = "Done!";
                setTimeout(() => btn.innerText = "Update", 2000);
            };
        }


        if (tabId === 'personalization') {
            const thumbs = contentBox.querySelectorAll(".wallpaper-thumb");
            thumbs.forEach(thumb => {
                thumb.onclick = async () => {
                    thumbs.forEach(t => t.classList.remove("selected"));
                    thumb.classList.add("selected");
                    const path = thumb.dataset.path;

                    // Update DOM immediately
                    const wallpaperEl = document.getElementById("wallpaper");
                    if (wallpaperEl) wallpaperEl.src = path;

                    // Save to Firestore
                    try {
                        await updateDoc(doc(db, "users", uid), { theme: path });
                    } catch (e) { console.error("Error updating wallpaper:", e); }
                };
            });
        }

        if (tabId === 'security') {
            const btn = contentBox.querySelector("#s-save-pass");
            btn.onclick = async () => {
                const pass = contentBox.querySelector("#s-pass").value;
                btn.innerText = "Saving...";
                await updateDoc(doc(db, "users", uid), { lockPassword: pass });
                btn.innerText = "Saved";
                setTimeout(() => btn.innerText = "Save", 2000);
            };
        }

        if (tabId === 'apps') {
            const list = contentBox.querySelector("#settings-apps-list");
            const installed = JSON.parse(localStorage.getItem("installed_apps") || "[]");

            if (installed.length === 0) {
                list.innerHTML = `<div style="opacity:0.5; padding:20px;">No third-party apps installed.</div>`;
            } else {
                installed.forEach(id => {
                    const app = (window.APP_REGISTRY && window.APP_REGISTRY[id]) || { name: id, icon: 'fa-cube' };
                    const card = document.createElement("div");
                    card.className = "s-card";
                    card.style.display = "flex";
                    card.style.justifyContent = "space-between";
                    card.style.alignItems = "center";
                    card.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
              <i class="fa-solid ${app.icon}" style="font-size:1.5rem; width:24px; text-align:center;"></i>
              <span>${app.name}</span>
            </div>
            <button class="s-uninstall" data-app="${id}" style="padding:8px 15px; border-radius:6px; border:none; background:#ff5f56; color:#fff; cursor:pointer; font-size:0.8rem; font-weight:600;">Uninstall</button>
          `;
                    list.appendChild(card);
                });

                list.querySelectorAll(".s-uninstall").forEach(btn => {
                    btn.onclick = () => {
                        if (window.uninstallApp) window.uninstallApp(btn.dataset.app);
                    };
                });
            }
        }
    }

    navs.forEach(nav => {
        nav.onclick = () => {
            navs.forEach(n => n.classList.remove("active"));
            nav.classList.add("active");
            renderTab(nav.dataset.tab);
        };
    });

    win.querySelector(".s-close").onclick = () => win.remove();
    renderTab('profile');
}
