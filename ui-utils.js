/**
 * Shows a beautiful custom modal instead of a standard alert.
 * @param {string} title - The title of the modal.
 * @param {string} message - The message body.
 * @param {boolean} isError - Whether to show as an error (red theme).
 * @returns {Promise<void>} - Resolves when the modal is closed.
 */
export function showModal(title, message, isError = false) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.style.zIndex = "10000"; // Ensure it's above everything

        const box = document.createElement("div");
        box.className = "modal-box";
        if (isError) box.classList.add("modal-error");

        box.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    ${isError ? '<i class="fa-solid fa-triangle-exclamation" style="color:#ff5f56; margin-right:8px;"></i>' : ''}
                    ${title}
                </div>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="modal-btn confirm">OK</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const confirmBtn = box.querySelector(".confirm");

        const close = () => {
            overlay.classList.add("fade-out");
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 200);
        };

        confirmBtn.onclick = close;

        // Accessibility: Close on Escape or Enter
        const handleKeydown = (e) => {
            if (e.key === "Enter" || e.key === "Escape") {
                close();
                window.removeEventListener("keydown", handleKeydown);
            }
        };
        window.addEventListener("keydown", handleKeydown);
    });
}

/**
 * Shows a beautiful custom confirmation modal.
 * @param {string} title 
 * @param {string} message 
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise.
 */
export function showConfirm(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.style.zIndex = "10000";

        const box = document.createElement("div");
        box.className = "modal-box";

        box.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">${title}</div>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel">Cancel</button>
                <button class="modal-btn confirm">Confirm</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const confirmBtn = box.querySelector(".confirm");
        const cancelBtn = box.querySelector(".cancel");

        const close = (result) => {
            overlay.classList.add("fade-out");
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 200);
        };

        confirmBtn.onclick = () => close(true);
        cancelBtn.onclick = () => close(false);

        const handleKeydown = (e) => {
            if (e.key === "Enter") {
                close(true);
                window.removeEventListener("keydown", handleKeydown);
            }
            if (e.key === "Escape") {
                close(false);
                window.removeEventListener("keydown", handleKeydown);
            }
        };
        window.addEventListener("keydown", handleKeydown);
    });
}

