export function initContextMenu(launchers) {
  const menu = document.createElement("div");
  menu.id = "custom-context-menu";
  menu.className = "context-menu hidden";
  document.body.appendChild(menu);

  let currentTarget = null;
  let currentAppId = null;

  const desktopMenu = `
        <div class="menu-item" data-action="newFolder"><i class="fa-solid fa-folder-plus"></i> Create Folder</div>
        <div class="menu-item" data-action="newFile"><i class="fa-solid fa-file-circle-plus"></i> Create File</div>
        <div class="separator"></div>
        <div class="menu-item" data-action="refresh"><i class="fa-solid fa-arrows-rotate"></i> Refresh</div>
        <div class="menu-item" data-action="settings"><i class="fa-solid fa-palette"></i> Personalization</div>
    `;

  const iconMenu = `
        <div class="menu-item" data-action="open"><i class="fa-solid fa-up-right-from-square"></i> Open App</div>
        <div class="menu-item" data-action="addToDock"><i class="fa-solid fa-thumbtack"></i> Add to Dock</div>
        <div class="separator"></div>
        <div class="menu-item" data-action="removeDesktop" style="color:#ffbd2e;"><i class="fa-solid fa-trash-can"></i> Remove from Desktop</div>
        <div class="menu-item" data-action="uninstall" style="color:#ff5f56;"><i class="fa-solid fa-circle-xmark"></i> Uninstall App</div>
    `;

  const dockMenu = `
        <div class="menu-item" data-action="open"><i class="fa-solid fa-up-right-from-square"></i> Open App</div>
        <div class="menu-item" data-action="removeFromDock" style="color:#ff5f56;"><i class="fa-solid fa-trash-can"></i> Remove from Dock</div>
    `;

  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const { clientX: mouseX, clientY: mouseY } = e;

    // Detect target
    const fileIcon = e.target.closest(".file");
    const dockIcon = e.target.closest(".dock-app");

    if (fileIcon) {
      menu.innerHTML = iconMenu;
      currentTarget = fileIcon;
      currentAppId = fileIcon.dataset.app || fileIcon.dataset.id;
    } else if (dockIcon) {
      menu.innerHTML = dockMenu;
      currentTarget = dockIcon;
      currentAppId = dockIcon.dataset.app;
    } else {
      menu.innerHTML = desktopMenu;
      currentTarget = null;
      currentAppId = null;
    }

    menu.style.top = `${mouseY}px`;
    menu.style.left = `${mouseX}px`;
    menu.classList.remove("hidden");

    attachItemListeners();
  });

  function attachItemListeners() {
    menu.querySelectorAll(".menu-item").forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        menu.classList.add("hidden");

        if (action === "refresh") window.location.reload();
        if (action === "settings") launchers.settings?.();
        if (action === "newFolder" || action === "newFile") launchers.explorer?.();
        if (action === "open") currentTarget?.click();
        if (action === "addToDock") launchers.addToDock?.(currentAppId);
        if (action === "removeDesktop") launchers.removeDesktop?.(currentAppId);
        if (action === "uninstall") launchers.uninstall?.(currentAppId);
        if (action === "removeFromDock") launchers.removeFromDock?.(currentAppId);
      };
    });
  }

  document.addEventListener("click", () => menu.classList.add("hidden"));

  // 4. SECURITY BLOCKING
  document.addEventListener("keydown", (e) => {
    // Block F12
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }

    // Block Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      e.preventDefault();
      return false;
    }

    // Block Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
      e.preventDefault();
      return false;
    }

    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.key === "u") {
      e.preventDefault();
      return false;
    }
  });
}
