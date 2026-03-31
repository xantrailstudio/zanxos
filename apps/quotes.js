import { setupWindow } from "../window-manager.js";

export function openQuotes() {
    if (document.getElementById("quotesWindow")) return;

    const win = document.createElement("div");
    win.id = "quotesWindow";
    win.className = "app-window";
    win.style.width = "400px";
    win.style.height = "300px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-quote-left"></i>
                <span>Daily Quotes</span>
            </div>
            <button class="q-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:24px; color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; height:calc(100% - 40px); text-align:center;">
            <div id="quote-text" style="font-size:1.2rem; font-weight:600; font-style:italic; line-height:1.6;">
                "Loading your inspiration..."
            </div>
            <div id="quote-author" style="font-size:0.9rem; opacity:0.6;"></div>
            <button id="new-quote" style="margin-top:10px; padding:10px 20px; border-radius:30px; border:none; background:rgba(255,255,255,0.1); color:white; font-size:0.85rem; cursor:pointer; transition:all 0.2s;">
                <i class="fa-solid fa-rotate"></i> New Quote
            </button>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const quoteText = win.querySelector("#quote-text");
    const quoteAuthor = win.querySelector("#quote-author");
    const newQuoteBtn = win.querySelector("#new-quote");
    const closeBtn = win.querySelector(".q-close");

    async function fetchQuote() {
        quoteText.style.opacity = "0.3";
        try {
            const res = await fetch('https://api.quotable.io/random');
            const data = await res.json();
            quoteText.innerText = `"${data.content}"`;
            quoteAuthor.innerText = `— ${data.author}`;
        } catch (e) {
            quoteText.innerText = "The best way to predict the future is to create it.";
            quoteAuthor.innerText = "— Peter Drucker";
        }
        quoteText.style.opacity = "1";
    }

    fetchQuote();
    newQuoteBtn.onclick = fetchQuote;
    closeBtn.onclick = () => win.remove();
}
