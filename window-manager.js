
let zIndexCounter = 500;

export function setupWindow(win) {
    const header = win.querySelector(".window-header");
    let isMaximized = false;
    let preMaxStyle = { top: "", left: "", width: "", height: "", transform: "" };

    // Capture initial size as minimum
    const initialRect = win.getBoundingClientRect();
    const minW = initialRect.width || 300;
    const minH = initialRect.height || 250;

    // 0. RESTRUCTURE HEADER FOR macOS STYLE
    const originalCloseBtn = header.querySelector("button") || header.querySelector("#expClose") || header.querySelector("#calcClose");
    const titleSpan = header.querySelector("span");

    if (titleSpan) titleSpan.className = "window-title";

    // Create container
    const controls = document.createElement("div");
    controls.className = "window-controls";

    // Close Button
    const closeBtn = document.createElement("button");
    closeBtn.className = "mac-btn close";
    closeBtn.title = "Close";
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    // Wire up Close Button
    if (originalCloseBtn) {
        // Proxy click to the original button
        closeBtn.onclick = () => {
            originalCloseBtn.click();
        };
        // Hide original
        originalCloseBtn.style.display = "none";
    } else {
        // Default close
        closeBtn.onclick = () => win.remove();
    }

    // Maximize Button
    const maxBtn = document.createElement("button");
    maxBtn.className = "mac-btn maximize";
    maxBtn.title = "Maximize";
    maxBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';

    controls.appendChild(closeBtn);
    controls.appendChild(maxBtn);
    header.prepend(controls);

    // Bring to front on click
    win.addEventListener("mousedown", () => {
        win.style.zIndex = ++zIndexCounter;
    });

    // ============================
    // 1. DRAG & DROP (Mouse & Touch)
    // ============================
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const startDrag = (e) => {
        const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

        if (e.target.tagName === "BUTTON") return;
        if (isMaximized) return;

        isDragging = true;
        document.querySelectorAll("iframe").forEach(f => f.style.pointerEvents = "none");

        const rect = win.getBoundingClientRect();
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;

        const computedStyle = window.getComputedStyle(win);
        if (computedStyle.transform !== "none") {
            win.style.left = rect.left + "px";
            win.style.top = rect.top + "px";
            win.style.transform = "none";
            win.style.margin = "0";
        }

        if (e.type === "mousedown") {
            document.addEventListener("mousemove", onDrag);
            document.addEventListener("mouseup", stopDrag);
        } else {
            document.addEventListener("touchmove", onDrag, { passive: false });
            document.addEventListener("touchend", stopDrag);
        }
    };

    header.addEventListener("mousedown", startDrag);
    header.addEventListener("touchstart", startDrag, { passive: false });

    function onDrag(e) {
        if (!isDragging) return;
        const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

        if (e.type === "touchmove") e.preventDefault();

        let newLeft = clientX - dragOffsetX;
        let newTop = clientY - dragOffsetY;

        // Constraints
        const rect = win.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + rect.width > vw) newLeft = vw - rect.width;
        if (newTop + rect.height > vh) newTop = vh - rect.height;

        win.style.left = newLeft + "px";
        win.style.top = newTop + "px";
    }

    function stopDrag() {
        isDragging = false;
        document.querySelectorAll("iframe").forEach(f => f.style.pointerEvents = "auto");
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", onDrag);
        document.removeEventListener("touchend", stopDrag);
    }

    const closeWindow = () => {
        win.classList.add("closing");
        setTimeout(() => win.remove(), 200);
    };

    closeBtn.onclick = () => {
        if (originalCloseBtn) {
            originalCloseBtn.click();
            // We still need to animate the removal of 'win' if originalCloseBtn doesn't do it
            if (document.body.contains(win)) closeWindow();
        } else {
            closeWindow();
        }
    };

    // ============================
    // 2. MINIMIZE / MAXIMIZE ACTIONS
    // ============================
    maxBtn.onclick = () => {
        if (isMaximized) {
            win.style.top = preMaxStyle.top;
            win.style.left = preMaxStyle.left;
            win.style.width = preMaxStyle.width;
            win.style.height = preMaxStyle.height;
            win.style.transform = preMaxStyle.transform;
            win.classList.remove("maximized");
            isMaximized = false;
        } else {
            preMaxStyle = {
                top: win.style.top,
                left: win.style.left,
                width: win.style.width,
                height: win.style.height,
                transform: win.style.transform
            };

            win.style.top = "0";
            win.style.left = "0";
            win.classList.add("maximized");
            win.style.transform = "none";
            isMaximized = true;
        }
    };

    // ============================
    // 3. RESIZE (Mouse & Touch)
    // ============================
    if (!win.querySelector(".resize-handle")) {
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        win.appendChild(resizeHandle);

        let isResizing = false;

        const startResize = (e) => {
            e.preventDefault();
            isResizing = true;
            if (e.type === "mousedown") {
                document.addEventListener("mousemove", onResize);
                document.addEventListener("mouseup", stopResize);
            } else {
                document.addEventListener("touchmove", onResize, { passive: false });
                document.addEventListener("touchend", stopResize);
            }
        };

        resizeHandle.addEventListener("mousedown", startResize);
        resizeHandle.addEventListener("touchstart", startResize, { passive: false });

        function onResize(e) {
            if (!isResizing) return;
            const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

            if (e.type === "touchmove") e.preventDefault();

            const rect = win.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let newWidth = clientX - rect.left;
            let newHeight = clientY - rect.top;

            // Dynamic Constraints based on initial spawn size
            if (newWidth < minW) newWidth = minW;
            if (newHeight < minH) newHeight = minH;
            if (rect.left + newWidth > vw) newWidth = vw - rect.left;
            if (rect.top + newHeight > vh) newHeight = vh - rect.top;

            win.style.width = newWidth + "px";
            win.style.height = newHeight + "px";
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener("mousemove", onResize);
            document.removeEventListener("mouseup", stopResize);
            document.removeEventListener("touchmove", onResize);
            document.removeEventListener("touchend", stopResize);
        }
    }
}

// ============================
// 4. CUSTOM MODALS
// ============================
export function showInputModal(title, placeholder = "") {
    return new Promise((resolve) => {
        // Overlay
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.style.zIndex = "10000";

        // Box
        const box = document.createElement("div");
        box.className = "modal-box";

        box.innerHTML = `
          <div class="modal-header-simple">
            <div class="modal-title">${title}</div>
          </div>
          <input type="text" class="modal-input" placeholder="${placeholder}" />
          <div class="modal-footer">
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn create">Create</button>
          </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const input = box.querySelector("input");
        const cancelBtn = box.querySelector(".cancel");
        const createBtn = box.querySelector(".create");

        // Focus input
        setTimeout(() => input.focus(), 50);

        function close(value) {
            overlay.classList.add("fade-out");
            setTimeout(() => {
                overlay.remove();
                resolve(value);
            }, 200);
        }

        cancelBtn.onclick = () => close(null);
        createBtn.onclick = () => close(input.value);

        input.onkeydown = (e) => {
            if (e.key === "Enter") close(input.value);
            if (e.key === "Escape") close(null);
        };
    });
}

