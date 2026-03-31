import { setupWindow } from "../window-manager.js";

export function openTicTacToe() {
    if (document.getElementById("tictactoeWindow")) return;

    const win = document.createElement("div");
    win.id = "tictactoeWindow";
    win.className = "app-window";
    win.style.width = "350px";
    win.style.height = "450px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-gamepad"></i>
                <span>Tic-Tac-Toe</span>
            </div>
            <button class="t-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; align-items:center; gap:20px; height:calc(100% - 40px);">
            <div id="t-status" style="font-size:1.1rem; font-weight:600;">Player X's Turn</div>
            
            <div id="t-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; width:240px; height:240px;">
                <div class="t-cell" data-index="0"></div>
                <div class="t-cell" data-index="1"></div>
                <div class="t-cell" data-index="2"></div>
                <div class="t-cell" data-index="3"></div>
                <div class="t-cell" data-index="4"></div>
                <div class="t-cell" data-index="5"></div>
                <div class="t-cell" data-index="6"></div>
                <div class="t-cell" data-index="7"></div>
                <div class="t-cell" data-index="8"></div>
            </div>

            <button id="t-reset" style="padding:10px 20px; border-radius:8px; border:none; background:rgba(255,255,255,0.1); color:white; cursor:pointer;">Restart Game</button>
            
            <style>
                .t-cell {
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .t-cell:hover {
                    background: rgba(255,255,255,0.1);
                }
            </style>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const cells = win.querySelectorAll(".t-cell");
    const status = win.querySelector("#t-status");
    const resetBtn = win.querySelector("#t-reset");
    const closeBtn = win.querySelector(".t-close");

    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function handleCellClick(e) {
        const index = e.target.dataset.index;
        if (gameState[index] !== "" || !gameActive) return;

        gameState[index] = currentPlayer;
        e.target.innerText = currentPlayer;

        checkResult();
    }

    function checkResult() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            status.innerText = `Player ${currentPlayer} Wins!`;
            gameActive = false;
            return;
        }

        if (!gameState.includes("")) {
            status.innerText = "It's a Draw!";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        status.innerText = `Player ${currentPlayer}'s Turn`;
    }

    function resetGame() {
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        gameActive = true;
        status.innerText = "Player X's Turn";
        cells.forEach(cell => cell.innerText = "");
    }

    cells.forEach(cell => cell.onclick = handleCellClick);
    resetBtn.onclick = resetGame;
    closeBtn.onclick = () => win.remove();
}
