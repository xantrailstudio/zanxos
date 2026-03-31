import { setupWindow } from "../window-manager.js";

export function openBrowser(title, url, iconClass = "fa-globe") {
    // Unique ID based on title to allow multiple windows or single instance?
    // Let's allow multiple browser windows, or single per app type.
    // User asked for "Google" and "Opera" apps.
    // Let's use a timestamp for ID to allow multiple, or title for singleton.
    // Simple approach: Singleton per "App" (Google / Opera) for now to avoid clutter,
    // or just random ID. Let's go with Random ID to allow multiple instances.
    const id = "browser-" + Date.now();

    const win = document.createElement("div");
    win.id = id;
    win.className = "app-window";
    win.style.width = "800px";
    win.style.height = "600px";

    // Header styling handled by setupWindow structure, but we provide initial HTML
    win.innerHTML = `
    <div class="window-header">
      <div style="display:flex; align-items:center; gap:8px;">
        <i class="${iconClass}"></i>
        <span>${title}</span>
      </div>
    </div>
    <div style="flex:1; background:white; position:relative;">
        <iframe src="${url}" style="width:100%; height:100%; border:none;"></iframe>
        <!-- Overlay for drag protection (iframe eats mouse events) -->
        <div class="iframe-overlay" style="display:none; position:absolute; inset:0; z-index:1;"></div>
    </div>
  `;

    document.body.appendChild(win);
    setupWindow(win);

    // Fix dragging over iframe:
    // When dragging starts (handled in window-manager), we might lose mouse events to iframe.
    // We need to ensure pointer-events are handled. 
    // Simple fix: window-manager handles dragging via header.
    // If mouse moves FAST over iframe, it might be lost. 
    // Ideally, put a transparent overlay over iframe during drag.
    // Let's add that logic loosely here or in window-manager.
    // For now, let's just create it.
}
