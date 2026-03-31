import { setupWindow } from "../window-manager.js";

export function openStopwatch() {
    if (document.getElementById("stopwatchWindow")) return;

    const win = document.createElement("div");
    win.id = "stopwatchWindow";
    win.className = "app-window";
    win.style.width = "350px";
    win.style.height = "450px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-stopwatch"></i>
                <span>Stopwatch</span>
            </div>
            <button class="s-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:30px; color:white; display:flex; flex-direction:column; align-items:center; gap:30px; height:calc(100% - 40px);">
            <div id="timer-display" style="font-size:3.5rem; font-weight:200; font-family:monospace; margin-top:20px;">00:00.00</div>
            
            <div style="display:flex; gap:15px; width:100%; justify-content:center;">
                <button id="s-start" style="flex:1; padding:15px; border-radius:12px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer; transition:all 0.2s;">
                    START
                </button>
                <button id="s-lap" style="flex:1; padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:white; font-weight:700; cursor:pointer;" disabled>
                    LAP
                </button>
            </div>

            <div id="laps-container" style="width:100%; flex:1; overflow-y:auto; background:rgba(255,255,255,0.03); border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:5px;">
                <!-- Laps go here -->
            </div>
            
            <button id="s-reset" style="width:100%; padding:10px; opacity:0.5; background:transparent; border:none; color:white; cursor:pointer; font-size:0.8rem;">
                RESET
            </button>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const display = win.querySelector("#timer-display");
    const startBtn = win.querySelector("#s-start");
    const lapBtn = win.querySelector("#s-lap");
    const resetBtn = win.querySelector("#s-reset");
    const lapsContainer = win.querySelector("#laps-container");
    const closeBtn = win.querySelector(".s-close");

    let startTime;
    let elapsedTime = 0;
    let timerInterval;
    let isRunning = false;
    let laps = [];

    function timeToString(time) {
        let diffInMin = time / 60000;
        let mm = Math.floor(diffInMin);

        let diffInSec = (diffInMin - mm) * 60;
        let ss = Math.floor(diffInSec);

        let diffInMs = (diffInSec - ss) * 100;
        let ms = Math.floor(diffInMs);

        let formattedMM = mm.toString().padStart(2, "0");
        let formattedSS = ss.toString().padStart(2, "0");
        let formattedMS = ms.toString().padStart(2, "0");

        return `${formattedMM}:${formattedSS}.${formattedMS}`;
    }

    function start() {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(function printTime() {
            elapsedTime = Date.now() - startTime;
            display.innerHTML = timeToString(elapsedTime);
        }, 10);
        showButton("STOP");
        lapBtn.disabled = false;
        isRunning = true;
    }

    function stop() {
        clearInterval(timerInterval);
        showButton("START");
        isRunning = false;
    }

    function reset() {
        clearInterval(timerInterval);
        display.innerHTML = "00:00.00";
        elapsedTime = 0;
        laps = [];
        lapsContainer.innerHTML = "";
        showButton("START");
        lapBtn.disabled = true;
        isRunning = false;
    }

    function lap() {
        const lapTime = timeToString(elapsedTime);
        laps.unshift(lapTime);
        const lapEl = document.createElement("div");
        lapEl.style.cssText = "display:flex; justify-content:space-between; padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.03); font-size:0.9rem;";
        lapEl.innerHTML = `
            <span style="opacity:0.5;">Lap ${laps.length}</span>
            <span>${lapTime}</span>
        `;
        lapsContainer.prepend(lapEl);
    }

    function showButton(text) {
        startBtn.innerHTML = text;
        startBtn.style.background = text === "STOP" ? "#ff5f56" : "#fff";
        startBtn.style.color = text === "STOP" ? "#fff" : "#000";
    }

    startBtn.onclick = () => isRunning ? stop() : start();
    lapBtn.onclick = lap;
    resetBtn.onclick = reset;
    closeBtn.onclick = () => {
        clearInterval(timerInterval);
        win.remove();
    };
}
