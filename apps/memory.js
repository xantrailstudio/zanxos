import { setupWindow } from "../window-manager.js";
import { showModal } from "../ui-utils.js";

export function openMemory() {
    if (document.getElementById("memoryWindow")) return;

    const win = document.createElement("div");
    win.id = "memoryWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "520px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-brain"></i>
                <span>Memory Challenge</span>
            </div>
            <button class="m-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; align-items:center; gap:20px; height:calc(100% - 40px);">
            <div style="display:flex; justify-content:space-between; width:100%; font-size:0.9rem; opacity:0.7;">
                <span>Moves: <span id="m-moves">0</span></span>
                <span>Time: <span id="m-time">0s</span></span>
            </div>
            <div id="m-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; width:100%; aspect-ratio:1/1;">
                <!-- Cards go here -->
            </div>
            <button id="m-reset" style="padding:10px 20px; border-radius:8px; border:none; background:#fff; color:#000; font-weight:700; cursor:pointer;">Restart Game</button>
        </div>
        <style>
            .m-card {
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                transition: transform 0.3s, background 0.3s;
                transform-style: preserve-3d;
            }
            .m-card.flipped {
                transform: rotateY(180deg);
                background: rgba(255,255,255,0.15);
            }
            .m-card.matched {
                background: rgba(46, 204, 113, 0.2);
                cursor: default;
            }
            .m-card i {
                opacity: 0;
                transition: opacity 0.3s;
            }
            .m-card.flipped i, .m-card.matched i {
                opacity: 1;
            }
        </style>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const grid = win.querySelector("#m-grid");
    const movesDisplay = win.querySelector("#m-moves");
    const timeDisplay = win.querySelector("#m-time");
    const resetBtn = win.querySelector("#m-reset");
    const closeBtn = win.querySelector(".m-close");

    const icons = [
        'fa-anchor', 'fa-ghost', 'fa-leaf', 'fa-bomb',
        'fa-crow', 'fa-dragon', 'fa-gem', 'fa-puzzle-piece'
    ];
    let cards = [...icons, ...icons];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let startTime = null;
    let timerId = null;

    function shuffle() {
        cards.sort(() => Math.random() - 0.5);
    }

    function initGame() {
        shuffle();
        grid.innerHTML = "";
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        movesDisplay.innerText = "0";
        timeDisplay.innerText = "0s";
        clearInterval(timerId);
        startTime = null;

        cards.forEach((icon, index) => {
            const card = document.createElement("div");
            card.className = "m-card";
            card.dataset.icon = icon;
            card.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            card.onclick = () => flipCard(card);
            grid.appendChild(card);
        });
    }

    function flipCard(card) {
        if (flippedCards.length === 2 || card.classList.contains("flipped") || card.classList.contains("matched")) return;

        if (!startTime) {
            startTime = Date.now();
            timerId = setInterval(() => {
                timeDisplay.innerText = Math.floor((Date.now() - startTime) / 1000) + "s";
            }, 1000);
        }

        card.classList.add("flipped");
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.innerText = moves;
            checkMatch();
        }
    }

    function checkMatch() {
        const [c1, c2] = flippedCards;
        if (c1.dataset.icon === c2.dataset.icon) {
            c1.classList.add("matched");
            c2.classList.add("matched");
            matchedPairs++;
            flippedCards = [];
            if (matchedPairs === icons.length) {
                clearInterval(timerId);
                setTimeout(async () => {
                    await showModal("Victory!", `Congratulations! You finished in ${moves} moves and ${timeDisplay.innerText}.`);
                }, 500);
            }
        } else {
            setTimeout(() => {
                c1.classList.remove("flipped");
                c2.classList.remove("flipped");
                flippedCards = [];
            }, 800);
        }
    }

    resetBtn.onclick = initGame;
    closeBtn.onclick = () => {
        clearInterval(timerId);
        win.remove();
    };

    initGame();
}
