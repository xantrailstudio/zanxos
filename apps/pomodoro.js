import { setupWindow } from "../window-manager.js";
import { showModal } from "../ui-utils.js";

export function openPomodoro() {
    if (document.getElementById("pomodoroWindow")) return;

    const win = document.createElement("div");
    win.id = "pomodoroWindow";
    win.className = "app-window";
    win.style.width = "350px";
    win.style.height = "450px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-clock"></i>
                <span>Pomodoro</span>
            </div>
            <button class="po-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:30px; color:white; display:flex; flex-direction:column; align-items:center; gap:25px; height:calc(100% - 40px); text-align:center;">
            <div id="po-timer" style="font-size:4rem; font-weight:200; font-family:monospace; margin-top:20px;">25:00</div>
            
            <div style="display:flex; gap:10px;">
                <button id="po-start" style="padding:12px 30px; border-radius:30px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">START</button>
                <button id="po-reset" style="padding:12px 20px; border-radius:30px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:white; font-size:0.8rem; cursor:pointer;">RESET</button>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px;">
                <button class="po-mode active" data-time="25">Work</button>
                <button class="po-mode" data-time="5">Short Break</button>
                <button class="po-mode" data-time="15">Long Break</button>
            </div>

            <style>
                .po-mode {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255,255,255,0.05);
                    color: white;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .po-mode.active {
                    background: rgba(255,255,255,0.2);
                    font-weight: 600;
                }
            </style>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const timerDisplay = win.querySelector("#po-timer");
    const startBtn = win.querySelector("#po-start");
    const resetBtn = win.querySelector("#po-reset");
    const modeButtons = win.querySelectorAll(".po-mode");
    const closeBtn = win.querySelector(".po-close");

    let timerId = null;
    let timeLeft = 25 * 60;
    let isRunning = false;

    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.innerText = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    function startTimer() {
        if (isRunning) {
            clearInterval(timerId);
            startBtn.innerText = "START";
            isRunning = false;
        } else {
            isRunning = true;
            startBtn.innerText = "STOP";
            timerId = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    isRunning = false;
                    startBtn.innerText = "START";
                    showModal("Time's Up!", "Take a break or start a new session.", false);
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timerId);
        isRunning = false;
        startBtn.innerText = "START";
        const activeMode = win.querySelector(".po-mode.active");
        timeLeft = parseInt(activeMode.dataset.time) * 60;
        updateDisplay();
    }

    startBtn.onclick = startTimer;
    resetBtn.onclick = resetTimer;

    modeButtons.forEach(btn => {
        btn.onclick = () => {
            modeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            resetTimer();
        };
    });

    closeBtn.onclick = () => {
        clearInterval(timerId);
        win.remove();
    };

    updateDisplay();
}
