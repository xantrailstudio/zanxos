import { setupWindow } from "../window-manager.js";

export function openSysInfo(uid) {
    if (document.getElementById("sysInfoWindow")) return;

    const win = document.createElement("div");
    win.id = "sysInfoWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "550px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-circle-info"></i>
                <span>System Information</span>
            </div>
            <button class="si-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:25px; height:calc(100% - 40px); overflow-y:auto;">
            <!-- OS Header -->
            <div style="display:flex; align-items:center; gap:20px;">
                <div style="width:70px; height:70px; background:linear-gradient(135deg, #007acc, #00c6ff); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:900; box-shadow:0 10px 20px rgba(0,0,0,0.3);">
                    ZX
                </div>
                <div>
                    <div style="font-size:1.4rem; font-weight:700;">ZenX OS</div>
                    <div style="opacity:0.6; font-size:0.9rem;">Version 8.2.0 (Serverless)</div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div style="display:flex; flex-direction:column; gap:15px;">
                <div class="stat-card" style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem; opacity:0.8;">
                        <span>CPU Usage</span>
                        <span id="cpu-val">12%</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                        <div id="cpu-bar" style="width:12%; height:100%; background:#fff; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                    </div>
                </div>

                <div class="stat-card" style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem; opacity:0.8;">
                        <span>RAM Usage</span>
                        <span id="ram-val">1.2 GB / 8 GB</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                        <div id="ram-bar" style="width:15%; height:100%; background:#fff; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                    </div>
                </div>
            </div>

            <!-- Details -->
            <div style="display:flex; flex-direction:column; gap:10px; font-size:0.9rem;">
                <div style="display:flex; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span style="opacity:0.6;">Architecture</span>
                    <span>x64 (Web-Simulated)</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span style="opacity:0.6;">Kernel</span>
                    <span>ZenCore 8.2.0-gold</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span style="opacity:0.6;">Browser Engine</span>
                    <span style="max-width: 200px; text-align: right; font-size: 0.8rem;">${navigator.userAgent.split(' ').pop()}</span>
                </div>
            </div>
            
            <div style="margin-top:auto; text-align:center; opacity:0.4; font-size:0.8rem;">
                © 2026 ZenX Technologies
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const closeBtn = win.querySelector(".si-close");
    const cpuVal = win.querySelector("#cpu-val");
    const cpuBar = win.querySelector("#cpu-bar");
    const ramVal = win.querySelector("#ram-val");
    const ramBar = win.querySelector("#ram-bar");

    // "Animate" the stats for premium feel
    const interval = setInterval(() => {
        if (!document.getElementById("sysInfoWindow")) {
            clearInterval(interval);
            return;
        }

        const cpu = Math.floor(Math.random() * 20) + 5;
        const ramBase = 1.2;
        const ramAdd = (Math.random() * 0.4).toFixed(1);
        const ramTotal = (parseFloat(ramBase) + parseFloat(ramAdd)).toFixed(1);

        cpuVal.innerText = `${cpu}%`;
        cpuBar.style.width = `${cpu}%`;

        ramVal.innerText = `${ramTotal} GB / 8 GB`;
        ramBar.style.width = `${(ramTotal / 8 * 100).toFixed(0)}%`;
    }, 2000);

    closeBtn.onclick = () => win.remove();
}
