import { setupWindow } from "../window-manager.js";

export function openNews() {
    if (document.getElementById("newsWindow")) return;

    const win = document.createElement("div");
    win.id = "newsWindow";
    win.className = "app-window";
    win.style.width = "450px";
    win.style.height = "600px";

    win.innerHTML = `
        <div class="window-header">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-newspaper"></i>
                <span>News Reader</span>
            </div>
            <button class="n-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="padding:20px; color:white; display:flex; flex-direction:column; gap:15px; height:calc(100% - 40px);">
            <div id="news-container" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:15px; padding-right:5px;">
                <div style="text-align:center; opacity:0.5; margin-top:100px;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>
                    Fetching latest headlines...
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(win);
    setupWindow(win);

    const newsContainer = win.querySelector("#news-container");
    const closeBtn = win.querySelector(".n-close");

    async function fetchNews() {
        try {
            // Using a public RSS to JSON proxy for easy static integration
            const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');
            const data = await res.json();

            if (data.status === 'ok') {
                newsContainer.innerHTML = '';
                data.items.slice(0, 10).forEach(item => {
                    const article = document.createElement("div");
                    article.style.cssText = "background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.03); cursor:pointer; transition:all 0.2s;";
                    article.innerHTML = `
                        <div style="font-size:0.95rem; font-weight:600; line-height:1.4; margin-bottom:8px;">${item.title}</div>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; opacity:0.6;">
                            <span>${item.author || item.pubDate.split(' ')[0]}</span>
                            <span>Read More <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                        </div>
                    `;
                    article.onclick = () => window.open(item.link, '_blank');
                    article.onmouseenter = () => article.style.background = "rgba(255,255,255,0.1)";
                    article.onmouseleave = () => article.style.background = "rgba(255,255,255,0.05)";
                    newsContainer.appendChild(article);
                });
            } else {
                throw new Error("Failed to load news");
            }
        } catch (e) {
            newsContainer.innerHTML = `
                <div style="text-align:center; opacity:0.5; margin-top:100px; color:#ff5f56;">
                    <i class="fa-solid fa-triangle-exclamation fa-2x"></i><br><br>
                    Failed to load news.
                </div>
            `;
        }
    }

    fetchNews();
    closeBtn.onclick = () => win.remove();
}
