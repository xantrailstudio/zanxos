import { setupWindow } from "../window-manager.js";

// App Registry: Metadata for all installable apps
export const APP_REGISTRY = {
    "url-shortener": { name: "URL Shortener", icon: "fa-link", category: "Utility", desc: "Shorten long URLs instantly.", module: "./apps/url-shortener.js", launch: "openUrlShortener" },
    "weather": { name: "Weather", icon: "fa-cloud-sun", category: "Utility", desc: "Live weather updates worldwide.", module: "./apps/weather.js", launch: "openWeather" },
    "sysinfo": { name: "System Info", icon: "fa-circle-info", category: "System", desc: "Monitor OS and hardware stats.", module: "./apps/sysinfo.js", launch: "openSysInfo" },
    "news": { name: "News Reader", icon: "fa-newspaper", category: "News", desc: "Latest global headlines.", module: "./apps/news.js", launch: "openNews" },
    "quotes": { name: "Daily Quotes", icon: "fa-quote-left", category: "Inspiration", desc: "Daily dose of wisdom.", module: "./apps/quotes.js", launch: "openQuotes" },
    "currency": { name: "Currency", icon: "fa-coins", category: "Finance", desc: "Real-time exchange rates.", module: "./apps/currency.js", launch: "openCurrency" },
    "units": { name: "Unit Converter", icon: "fa-ruler-combined", category: "Utility", desc: "Length, weight, and temp converter.", module: "./apps/units.js", launch: "openUnits" },
    "stopwatch": { name: "Stopwatch", icon: "fa-stopwatch", category: "Utility", desc: "Precision timer with laps.", module: "./apps/stopwatch.js", launch: "openStopwatch" },
    "paint": { name: "Paint", icon: "fa-palette", category: "Creative", desc: "Drawing and sketching canvas.", module: "./apps/paint.js", launch: "openPaint" },
    "flashlight": { name: "Night Light", icon: "fa-lightbulb", category: "Utility", desc: "Warm screen overlay for eyes.", module: "./apps/flashlight.js", launch: "openFlashlight" },
    "pomodoro": { name: "Pomodoro", icon: "fa-clock", category: "Productivity", desc: "Focus timer for work.", module: "./apps/pomodoro.js", launch: "openPomodoro" },
    "tictactoe": { name: "Tic-Tac-Toe", icon: "fa-gamepad", category: "Game", desc: "Classic 3-in-a-row game.", module: "./apps/tictactoe.js", launch: "openTicTacToe" },
    "password": { name: "Pass Gen", icon: "fa-shield-halved", category: "Security", desc: "Secure password creator.", module: "./apps/password.js", launch: "openPassword" },
    "dictionary": { name: "Dictionary", icon: "fa-book", category: "Education", desc: "Word meanings and phonetics.", module: "./apps/dictionary.js", launch: "openDictionary" },
    "notes": { name: "Sticky Notes", icon: "fa-note-sticky", category: "Productivity", desc: "Quick persistent notes.", module: "./apps/notes.js", launch: "openNotes" },
    "tasks": { name: "Task Board", icon: "fa-list-check", category: "Productivity", desc: "Manage your daily to-dos.", module: "./apps/tasks.js", launch: "openTasks" },
    "expenses": { name: "Expenses", icon: "fa-wallet", category: "Finance", desc: "Personal budget tracker.", module: "./apps/expenses.js", launch: "openExpenses" },
    "memory": { name: "Memory Game", icon: "fa-brain", category: "Game", desc: "Card matching challenge.", module: "./apps/memory.js", launch: "openMemory" }
};

export function openXiaApps() {
    if (document.getElementById("xiaStoreWindow")) return;

    const win = document.createElement("div");
    win.id = "xiaStoreWindow";
    win.className = "app-window";
    win.style.width = "750px";
    win.style.height = "550px";

    win.innerHTML = `
        <div class="window-header" style="background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:24px; height:24px; background:linear-gradient(135deg, #00c6ff, #0072ff); border-radius:6px; display:flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-store" style="font-size:0.8rem; color:white;"></i>
                </div>
                <span style="font-weight:700; letter-spacing:0.5px; color:white;">XiaStore</span>
            </div>
            <button class="xa-close" style="color:rgba(255,255,255,0.5);"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="display:flex; height:calc(100% - 40px); background:rgba(0,0,0,0.3); backdrop-filter:blur(20px);">
            <!-- Sidebar -->
            <div style="width:200px; background:rgba(255,255,255,0.02); border-right:1px solid rgba(255,255,255,0.05); padding:24px 12px; display:flex; flex-direction:column; gap:8px;">
                <div class="xa-nav active" data-cat="All"><i class="fa-solid fa-border-all"></i> All Apps</div>
                <div class="xa-nav" data-cat="Utility"><i class="fa-solid fa-screwdriver-wrench"></i> Utility</div>
                <div class="xa-nav" data-cat="Productivity"><i class="fa-solid fa-briefcase"></i> Productivity</div>
                <div class="xa-nav" data-cat="Finance"><i class="fa-solid fa-wallet"></i> Finance</div>
                <div class="xa-nav" data-cat="Game"><i class="fa-solid fa-ghost"></i> Games</div>
                <div class="xa-nav" data-cat="Security"><i class="fa-solid fa-user-shield"></i> Security</div>
                <div style="margin-top:auto; padding:15px; background:rgba(255,255,255,0.03); border-radius:12px; text-align:center;">
                    <div style="font-size:0.75rem; font-weight:600; color:white;">Developer Lab</div>
                    <div style="font-size:0.6rem; opacity:0.4; margin-top:4px;">XiaStore v1.2</div>
                </div>
            </div>
            <!-- Main Content -->
            <div style="flex:1; padding:32px; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:24px; align-content:start;" id="xa-grid">
                <!-- Apps will be rendered here -->
            </div>
        </div>
        <style>
            .xa-nav {
                padding: 12px 16px;
                border-radius: 12px;
                color: rgba(255,255,255,0.5);
                font-size: 0.85rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .xa-nav i { font-size: 1rem; }
            .xa-nav:hover { background: rgba(255,255,255,0.05); color: #fff; transform: translateX(5px); }
            .xa-nav.active { background: #fff; color: #000; font-weight: 700; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            
            .xa-card {
                background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 24px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                text-align: center;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                animation: staggerIn 0.5s ease backwards;
            }
            .xa-card:hover {
                background: rgba(255,255,255,0.12);
                transform: translateY(-8px) scale(1.02);
                border-color: rgba(255,255,255,0.2);
                box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            }
            .xa-icon-box {
                width: 60px;
                height: 60px;
                background: #fff;
                color: #000;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            .xa-install-btn {
                width: 100%;
                padding: 10px;
                border: none;
                border-radius: 25px;
                background: #fff;
                color: #000;
                font-size: 0.85rem;
                font-weight: 800;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.2s;
            }
            .xa-install-btn:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(255,255,255,0.2); }
            .xa-install-btn.installed {
                background: rgba(46, 204, 113, 0.2);
                color: #2ecc71;
                border: 1px solid rgba(46, 204, 113, 0.3);
                cursor: default;
            }
        </style>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const grid = win.querySelector("#xa-grid");
    const navs = win.querySelectorAll(".xa-nav");
    const closeBtn = win.querySelector(".xa-close");

    function getInstalled() {
        return JSON.parse(localStorage.getItem("installed_apps") || "[]");
    }

    function renderStore(category = "All") {
        grid.innerHTML = "";
        const installed = getInstalled();
        let delay = 0;

        Object.entries(APP_REGISTRY).forEach(([id, app]) => {
            if (category !== "All" && app.category !== category) return;

            const isInstalled = installed.includes(id);
            const card = document.createElement("div");
            card.className = "xa-card";
            card.style.animationDelay = `${delay}s`;
            delay += 0.05;

            card.innerHTML = `
                <div class="xa-icon-box">
                    <i class="fa-solid ${app.icon}"></i>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="font-size:1rem; font-weight:700; color:#fff;">${app.name}</div>
                    <div style="font-size:0.75rem; color:#fff; opacity:0.8; height:3em; overflow:hidden; line-height:1.4;">${app.desc}</div>
                </div>
                <button class="xa-install-btn ${isInstalled ? 'installed' : ''}" data-id="${id}">
                    ${isInstalled ? '<i class="fa-solid fa-check"></i> Installed' : 'Install'}
                </button>
            `;

            const btn = card.querySelector(".xa-install-btn");
            if (!isInstalled) {
                btn.onclick = () => {
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                    setTimeout(() => {
                        installApp(id);
                        renderStore(category);
                    }, 800);
                };
            }

            grid.appendChild(card);
        });
    }

    function installApp(id) {
        let installed = getInstalled();
        if (!installed.includes(id)) {
            installed.push(id);
            localStorage.setItem("installed_apps", JSON.stringify(installed));
            // Trigger OS refresh event or call it directly if exposed
            if (window.refreshDesktop) window.refreshDesktop();
        }
    }

    navs.forEach(nav => {
        nav.onclick = () => {
            navs.forEach(n => n.classList.remove("active"));
            nav.classList.add("active");
            renderStore(nav.dataset.cat);
        };
    });

    closeBtn.onclick = () => win.remove();
    renderStore();
}
