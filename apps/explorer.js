import {
  collection, doc, getDocs, addDoc,
  query, where, serverTimestamp, orderBy, deleteDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { db } from "../firebase.js";
import { openEditor } from "./editor.js"; // We will create this next

import { setupWindow, showInputModal } from "../window-manager.js";
import { showConfirm } from "../ui-utils.js";


export function openExplorer(uid, initialFolderId = "root") {

  // SINGLE INSTANCE
  if (document.getElementById("explorerWindow")) {
    // If already open, just navigate (advanced) or just return (simple)
    // Ideally we should navigate to the requested folder if provided different than current
    // For now, let's keep it simple: just focus it. 
    // User asked: "if folder open it". If window is open, we should probably load that folder.
    // Let's implement that quick fix:
    const win = document.getElementById("explorerWindow");
    // We can't easily access internal loadFolder from here without exposing it.
    // Let's just close and reopen for simplicity, OR attach a custom event.
    // Simpler: Just allow multiple windows? No, ID conflict.
    // Correct approach: Return and let user navigate manually? No, bad UX.
    // Let's remove old window and re-open to force navigation.
    win.remove();
  }

  // CURRENT STATE
  let currentFolderId = initialFolderId;
  let historyStack = []; // For "Back" button

  // WINDOW SETUP
  const win = document.createElement("div");
  win.id = "explorerWindow";
  win.className = "app-window";

  win.innerHTML = `
    <div class="window-header">
      <span>File Explorer</span>
      <button id="expClose"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="explorer-toolbar">
      <button id="expBack" style="display:none;"><i class="fa-solid fa-arrow-left"></i> Back</button>
      <button id="newFolder"><i class="fa-solid fa-folder-plus"></i> New Folder</button>
      <button id="newFile"><i class="fa-solid fa-file-circle-plus"></i> New File</button>
      <span id="currentPath" style="margin-left:auto; font-size:12px; opacity:0.7; padding-top:6px;">/</span>
    </div>

    <div id="explorerContent" class="explorer-content">
      <!-- Items go here -->
    </div>
  `;

  document.body.appendChild(win);
  setupWindow(win);

  // REFERENCES
  const contentArea = win.querySelector("#explorerContent");
  const backBtn = win.querySelector("#expBack");
  const pathLabel = win.querySelector("#currentPath");

  // CLOSE
  win.querySelector("#expClose").onclick = () => win.remove();

  // LOAD CONTENT
  async function loadFolder(folderId) {
    currentFolderId = folderId;
    contentArea.innerHTML = "<div style='padding:20px; text-align:center; width:100%; opacity:0.5'>Loading...</div>";

    // Update UI
    backBtn.style.display = historyStack.length > 0 ? "block" : "none";
    pathLabel.innerText = folderId === "root" ? "/" : `/ ${folderId}`; // Very basic placeholder for path

    // Firestore Query
    const fsRef = collection(db, "users", uid, "fs");
    // Removed orderBy to avoid Need Index error for simple testing
    const q = query(
      fsRef,
      where("parent", "==", folderId)
    );

    let snap;
    try {
      snap = await getDocs(q);
    } catch (e) {
      console.error(e);
      contentArea.innerHTML = `<div style="color:red">Error loading files. ${e.message}</div>`;
      return;
    }

    contentArea.innerHTML = "";

    if (snap.empty) {
      contentArea.innerHTML = "<div style='grid-column:1/-1; text-align:center; opacity:0.3; padding-top:50px;'>Empty Folder</div>";
      return;
    }

    // Convert to array and sort client-side
    const docs = [];
    snap.forEach(d => {
      docs.push({ id: d.id, ...d.data() });
    });

    // Sort: Folders first, then by name
    docs.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });

    docs.forEach(data => {
      const el = document.createElement("div");
      el.className = "explorer-item";
      el.title = data.name;

      el.innerHTML = `
        <i class="fa-solid ${data.type === 'folder' ? 'fa-folder' : 'fa-file-lines'}"></i>
        <span>${data.name}</span>
      `;

      // CLICK HANDLER
      el.onclick = () => {
        if (data.type === 'folder') {
          historyStack.push(folderId);
          loadFolder(data.id);
        } else {
          // Open File in Editor
          openEditor(uid, data.id, data.name, data.content || "");
        }
      };

      // RIGHT CLICK (Context Menu - Delete)
      el.oncontextmenu = async (e) => {
        e.preventDefault();
        const confirmed = await showConfirm("Delete Item", `Are you sure you want to delete "${data.name}"?`);
        if (confirmed) {
          deleteDoc(doc(db, "users", uid, "fs", data.id)).then(() => loadFolder(currentFolderId));
        }
      }


      contentArea.appendChild(el);
    });
  }

  // BUTTONS
  backBtn.onclick = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack.pop();
    loadFolder(prev);
  };

  win.querySelector("#newFolder").onclick = async () => {
    const name = await showInputModal("Create New Folder", "Folder Name");
    if (!name) return;
    await addDoc(collection(db, "users", uid, "fs"), {
      parent: currentFolderId,
      name: name.trim(),
      type: "folder",
      createdAt: serverTimestamp()
    });
    loadFolder(currentFolderId);
  };

  win.querySelector("#newFile").onclick = async () => {
    const name = await showInputModal("Create New File", "File Name (e.g. note.txt)");
    if (!name) return;
    await addDoc(collection(db, "users", uid, "fs"), {
      parent: currentFolderId,
      name: name.trim(),
      type: "file",
      content: "",
      createdAt: serverTimestamp()
    });
    loadFolder(currentFolderId);
  };

  // INITIAL LOAD
  loadFolder(initialFolderId);
}
