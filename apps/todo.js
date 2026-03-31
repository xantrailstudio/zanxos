import { setupWindow } from "../window-manager.js";

export function openTodo() {
    if (document.getElementById("todoWindow")) return;

    const win = document.createElement("div");
    win.id = "todoWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "500px";

    win.innerHTML = `
    <div class="window-header">
      <div style="display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-list-check"></i>
        <span>To-Do List</span>
      </div>
      <button class="t-close"><i class="fa-solid fa-xmark"></i></button>
    </div>
    
    <div style="display:flex; flex-direction:column; height:100%; padding:10px; color:white;">
        <div style="display:flex; gap:10px; margin-bottom:10px;">
            <input id="t-input" type="text" placeholder="Add task..." style="flex:1; padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.3); color:white;">
            <button id="t-add" style="padding:8px 14px; border-radius:6px; border:none; background:#007acc; color:white; cursor:pointer;">Add</button>
        </div>
        <div id="t-list" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
            <!-- Items -->
        </div>
    </div>
  `;

    document.body.appendChild(win);
    setupWindow(win);

    // LOGIC
    const input = win.querySelector("#t-input");
    const addBtn = win.querySelector("#t-add");
    const list = win.querySelector("#t-list");

    // Load from LocalStorage
    let tasks = JSON.parse(localStorage.getItem("zancore_todos") || "[]");

    function render() {
        list.innerHTML = "";
        tasks.forEach((t, i) => {
            const el = document.createElement("div");
            el.style.cssText = "display:flex; align-items:center; gap:10px; padding:8px; background:rgba(255,255,255,0.05); border-radius:6px;";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = t.done;
            checkbox.onchange = () => {
                tasks[i].done = checkbox.checked;
                save();
                render(); // Re-render to strike through
            };

            const text = document.createElement("span");
            text.innerText = t.text;
            text.style.flex = "1";
            if (t.done) text.style.textDecoration = "line-through";
            if (t.done) text.style.opacity = "0.5";

            const del = document.createElement("button");
            del.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            del.style.cssText = "background:none; border:none; color:#ff5f56; cursor:pointer;";
            del.onclick = () => {
                tasks.splice(i, 1);
                save();
                render();
            };

            el.appendChild(checkbox);
            el.appendChild(text);
            el.appendChild(del);
            list.appendChild(el);
        });
    }

    function save() {
        localStorage.setItem("zancore_todos", JSON.stringify(tasks));
    }

    function addItem() {
        const val = input.value.trim();
        if (!val) return;
        tasks.push({ text: val, done: false });
        input.value = "";
        save();
        render();
    }

    addBtn.onclick = addItem;
    input.onkeydown = (e) => {
        if (e.key === "Enter") addItem();
    }

    win.querySelector(".t-close").onclick = () => {
        // No heavy resources to clean, just DOM
        win.remove();
    };

    render();
    input.focus();
}
