import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { db } from "../firebase.js";
import { setupWindow } from "../window-manager.js";
import { showModal } from "../ui-utils.js";


export function openEditor(uid, fileId, fileName, initialContent) {

  // PREVENT DUPLICATES (Simpler for now, can support multiple later)
  if (document.getElementById(`editor-${fileId}`)) return;

  const win = document.createElement("div");
  win.id = `editor-${fileId}`;
  win.className = "app-window";
  win.style.zIndex = "600"; // Higher than explorer

  win.innerHTML = `
    <div class="window-header">
      <span>${fileName} - Text Editor</span>
    </div>
    
    <textarea id="editor-area" spellcheck="false" placeholder="Write something...">${initialContent}</textarea>
    
    <div id="editor-footer">
      <span id="saveStatus" style="margin-right:10px; font-size:12px; opacity:0.6;"></span>
      <button class="ed-save"><i class="fa-solid fa-floppy-disk"></i> Save</button>
    </div>
  `;

  document.body.appendChild(win);
  setupWindow(win);

  const textarea = win.querySelector("#editor-area");
  const saveBtn = win.querySelector(".ed-save");
  const status = win.querySelector("#saveStatus");

  // CLOSE handled by setupWindow now

  // SAVE
  const handleSave = async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      const docRef = doc(db, "users", uid, "fs", fileId);
      await updateDoc(docRef, {
        content: textarea.value
      });
      status.innerText = "All changes saved";
      setTimeout(() => status.innerText = "", 3000);
    } catch (e) {
      console.error(e);
      status.innerText = "Error saving!";
      status.style.color = "#ff5f56";
      showModal("Save Error", "Could not save file: " + e.message, true);
    } finally {

      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
    }
  };

  saveBtn.onclick = handleSave;

  // KEYBOARD SHORTCUTS
  textarea.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  // Focus
  textarea.focus();
}
