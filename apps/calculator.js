import { setupWindow } from "../window-manager.js";

export function openCalculator() {

  // Prevent multiple instances
  if (document.getElementById("calculatorWindow")) return;

  const win = document.createElement("div");
  win.id = "calculatorWindow";
  win.className = "app-window";

  win.innerHTML = `
    <div class="window-header">
      <span>Calculator</span>
      <button id="calcClose"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <input id="calcDisplay" value="0" readonly />

    <div class="calc-grid">
      <button data-action="ac">AC</button>
      <button data-action="c">C</button>
      <button data-action="ce">CE</button>
      <button data-op="/">÷</button>

      <button>7</button><button>8</button><button>9</button>
      <button data-op="*">×</button>

      <button>4</button><button>5</button><button>6</button>
      <button data-op="-">−</button>

      <button>1</button><button>2</button><button>3</button>
      <button data-op="+">+</button>

      <button>0</button>
      <button>.</button>
      <button class="equal">=</button>
    </div>
  `;

  document.body.appendChild(win);
  setupWindow(win);

  const display = win.querySelector("#calcDisplay");
  let errorState = false;

  // ---------- HELPERS ----------
  const resetError = () => {
    if (errorState) {
      display.value = "0";
      errorState = false;
    }
  };

  const isOperator = v => /[+\-*/]/.test(v);

  // Get last number in expression (for C)
  const lastNumberIndex = () => {
    const match = display.value.match(/([+\-*/]?)(\d*\.?\d*)$/);
    return match ? match.index : 0;
  };

  // ---------- BUTTON HANDLING ----------
  win.querySelectorAll(".calc-grid button").forEach(btn => {
    btn.onclick = () => {
      const val = btn.innerText;
      const action = btn.dataset.action;
      const op = btn.dataset.op;

      resetError();

      // AC → All clear
      if (action === "ac") {
        display.value = "0";
        return;
      }

      // C → Clear last number
      if (action === "c") {
        const idx = lastNumberIndex();
        display.value = display.value.slice(0, idx) || "0";
        return;
      }

      // CE → Clear everything
      if (action === "ce") {
        display.value = "0";
        return;
      }

      // Backspace
      if (action === "back") {
        display.value =
          display.value.length > 1
            ? display.value.slice(0, -1)
            : "0";
        return;
      }

      // Equals
      if (val === "=") {
        try {
          if (isOperator(display.value.slice(-1))) return;
          const result = Function(`"use strict"; return (${display.value})`)();
          display.value = String(result);
        } catch {
          display.value = "Error";
          errorState = true;
        }
        return;
      }

      // Operators
      if (op) {
        if (isOperator(display.value.slice(-1))) return;
        display.value += op;
        return;
      }

      // Numbers / dot
      if (display.value === "0" && val !== ".") {
        display.value = val;
      } else {
        display.value += val;
      }
    };
  });

  // ---------- CLOSE & CLEANUP ----------
  win.querySelector("#calcClose").onclick = () => {
    win.remove(); // Memory freed
  };
}
