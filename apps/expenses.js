import { setupWindow } from "../window-manager.js";

export function openExpenses() {
    if (document.getElementById("expensesWindow")) return;

    const win = document.createElement("div");
    win.id = "expensesWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "550px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-wallet"></i>
                <span>Expense Tracker</span>
            </div>
            <button class="e-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; gap:20px; height:calc(100% - 40px);">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; text-align:center;">
                <div>
                    <div style="font-size:0.75rem; opacity:0.6; margin-bottom:5px;">TOTAL SPENT</div>
                    <div id="e-total" style="font-size:1.5rem; font-weight:700;">$0.00</div>
                </div>
                <div>
                    <div style="font-size:0.75rem; opacity:0.6; margin-bottom:5px;">ENTRIES</div>
                    <div id="e-count" style="font-size:1.5rem; font-weight:700;">0</div>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
                <input id="e-desc" type="text" placeholder="Description (e.g. Coffee)" 
                    style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                <div style="display:flex; gap:10px;">
                    <input id="e-amount" type="number" placeholder="Amount" 
                        style="flex:1; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:white; outline:none;">
                    <button id="e-add" style="padding:10px 20px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">ADD</button>
                </div>
            </div>

            <div id="e-list" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:5px;">
                <!-- Expenses go here -->
            </div>
            
            <button id="e-clear" style="font-size:0.75rem; opacity:0.4; background:transparent; border:none; color:white; cursor:pointer;">Clear All Data</button>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const descInput = win.querySelector("#e-desc");
    const amountInput = win.querySelector("#e-amount");
    const addBtn = win.querySelector("#e-add");
    const list = win.querySelector("#e-list");
    const totalDisplay = win.querySelector("#e-total");
    const countDisplay = win.querySelector("#e-count");
    const clearBtn = win.querySelector("#e-clear");
    const closeBtn = win.querySelector(".e-close");

    let expenses = JSON.parse(localStorage.getItem("zenx_expenses") || "[]");

    function render() {
        list.innerHTML = expenses.length === 0 ? '<div style="text-align:center; opacity:0.3; margin-top:50px;">No expenses yet</div>' : '';
        let total = 0;

        expenses.forEach((item, index) => {
            total += parseFloat(item.amount);
            const el = document.createElement("div");
            el.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(255,255,255,0.03); border-radius:8px; font-size:0.9rem;";
            el.innerHTML = `
                <div style="display:flex; flex-direction:column;">
                    <span>${item.desc}</span>
                    <span style="font-size:0.7rem; opacity:0.4;">${item.date}</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:600;">$${parseFloat(item.amount).toFixed(2)}</span>
                    <button class="e-del" style="background:transparent; border:none; color:rgba(255,95,86,0.6); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;

            el.querySelector(".e-del").onclick = () => {
                expenses.splice(index, 1);
                save();
                render();
            };

            list.appendChild(el);
        });

        totalDisplay.innerText = `$${total.toFixed(2)}`;
        countDisplay.innerText = expenses.length;
    }

    function save() {
        localStorage.setItem("zenx_expenses", JSON.stringify(expenses));
    }

    addBtn.onclick = () => {
        const desc = descInput.value.trim();
        const amount = amountInput.value.trim();
        if (desc && amount) {
            expenses.unshift({
                desc,
                amount,
                date: new Date().toLocaleDateString()
            });
            descInput.value = "";
            amountInput.value = "";
            save();
            render();
        }
    };

    clearBtn.onclick = () => {
        if (confirm("Clear all expense records?")) {
            expenses = [];
            save();
            render();
        }
    };

    closeBtn.onclick = () => win.remove();
    render();
}
