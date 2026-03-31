import { setupWindow } from "../window-manager.js";

export function openTasks() {
    if (document.getElementById("tasksWindow")) return;

    const win = document.createElement("div");
    win.id = "tasksWindow";
    win.className = "app-window";
    win.style.width = "450px";
    win.style.height = "500px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-list-check"></i>
                <span>Task Board</span>
            </div>
            <button class="t-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:20px; height:calc(100% - 40px);">
            <div style="display:flex; gap:10px;">
                <input id="t-input" type="text" placeholder="Add a new task..." 
                    style="flex:1; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                <button id="t-add" style="padding:12px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            
            <div id="t-list" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px;">
                <!-- Tasks go here -->
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const input = win.querySelector("#t-input");
    const addBtn = win.querySelector("#t-add");
    const list = win.querySelector("#t-list");
    const closeBtn = win.querySelector(".t-close");

    let tasks = JSON.parse(localStorage.getItem("zenx_tasks") || "[]");

    function render() {
        list.innerHTML = tasks.length === 0 ? '<div style="text-align:center; opacity:0.3; margin-top:50px;">No tasks yet</div>' : '';
        tasks.forEach((task, index) => {
            const item = document.createElement("div");
            item.style.cssText = "background:rgba(255,255,255,0.05); padding:12px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.03); display:flex; align-items:center; gap:12px; transition:all 0.2s;";
            item.innerHTML = `
                <input type="checkbox" ${task.done ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                <span style="flex:1; ${task.done ? 'text-decoration:line-through; opacity:0.5;' : ''}">${task.text}</span>
                <button class="t-del" style="background:transparent; border:none; color:rgba(255,95,86,0.6); cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button>
            `;

            const check = item.querySelector("input");
            check.onchange = () => {
                tasks[index].done = check.checked;
                save();
                render();
            };

            const del = item.querySelector(".t-del");
            del.onclick = () => {
                tasks.splice(index, 1);
                save();
                render();
            };

            list.appendChild(item);
        });
    }

    function save() {
        localStorage.setItem("zenx_tasks", JSON.stringify(tasks));
    }

    addBtn.onclick = () => {
        const text = input.value.trim();
        if (text) {
            tasks.unshift({ text, done: false });
            input.value = "";
            save();
            render();
        }
    };

    input.onkeydown = (e) => { if (e.key === "Enter") addBtn.click(); };
    closeBtn.onclick = () => win.remove();

    render();
}
