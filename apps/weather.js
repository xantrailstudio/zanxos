import { setupWindow } from "../window-manager.js";

export function openWeather() {
    if (document.getElementById("weatherWindow")) return;

    const win = document.createElement("div");
    win.id = "weatherWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "500px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-cloud-sun"></i>
                <span>Weather</span>
            </div>
            <button class="w-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:20px; color:white; display:flex; flex-direction:column; gap:15px; height:calc(100% - 40px); overflow-y:auto;">
            <div style="display:flex; gap:10px;">
                <input id="w-input" type="text" placeholder="Enter city (e.g. London)" 
                    style="flex:1; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                <button id="w-search" style="padding:10px 15px; border-radius:8px; border:none; background:#fff; color:#000; cursor:pointer;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
            <div id="w-content" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:15px; background:rgba(255,255,255,0.03); border-radius:16px; padding:20px;">
                <div style="opacity:0.5;">Enter a city to see weather</div>
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const input = win.querySelector("#w-input");
    const searchBtn = win.querySelector("#w-search");
    const content = win.querySelector("#w-content");
    const closeBtn = win.querySelector(".w-close");

    async function fetchWeather(city) {
        content.innerHTML = '<i class="fa-solid fa-spinner fa-spin fa-2x" style="opacity:0.5;"></i>';
        try {
            // Using wttr.in with JSON output for easy CORS-friendly fetching
            const res = await fetch(`https://wttr.in/${city}?format=j1`);
            const data = await res.json();

            const current = data.current_condition[0];
            const area = data.nearest_area[0];

            content.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: 700;">${area.areaName[0].value}, ${area.country[0].value}</div>
                <div style="font-size: 4rem; font-weight: 200; margin: 10px 0;">${current.temp_C}°C</div>
                <div style="font-size: 1.1rem; opacity: 0.8;">${current.weatherDesc[0].value}</div>
                <div style="display: flex; gap: 20px; margin-top: 20px; width: 100%; justify-content: center; opacity: 0.7; font-size: 0.9rem;">
                    <div><i class="fa-solid fa-droplet"></i> ${current.humidity}%</div>
                    <div><i class="fa-solid fa-wind"></i> ${current.windspeedKmph} km/h</div>
                </div>
            `;
        } catch (e) {
            content.innerHTML = `
                <i class="fa-solid fa-cloud-circle-exclamation fa-3x" style="color:#ff5f56; margin-bottom:10px;"></i>
                <div style="color:#ff5f56;">City not found or error.</div>
            `;
        }
    }

    searchBtn.onclick = () => {
        const city = input.value.trim();
        if (city) fetchWeather(city);
    };

    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            const city = input.value.trim();
            if (city) fetchWeather(city);
        }
    };

    closeBtn.onclick = () => win.remove();
}
