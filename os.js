import { auth, db } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { showModal, showConfirm } from "./ui-utils.js";


// ===== GLOBAL ERROR HANDLING =====
async function handleSystemError(error) {
  console.error("CRITICAL SYSTEM ERROR:", error);
  const msg = error.message || error || "Unknown Error";
  await showModal("System Error", msg, true);
}


window.onerror = (msg, url, line, col, error) => {
  handleSystemError(error || msg);
  return false;
};

window.onunhandledrejection = (event) => {
  handleSystemError(event.reason);
};

document.addEventListener("DOMContentLoaded", () => {

  // ===== ELEMENTS =====
  const logoutBtn = document.getElementById("logoutBtn");
  const centerTitle = document.getElementById("centerTitle");
  const dockApps = document.querySelectorAll(".dock-app");
  const preloader = document.getElementById("preloader");
  const lockScreen = document.getElementById("lock-screen");
  const unlockBtn = document.getElementById("unlock-btn");
  const lockUsername = document.getElementById("lock-username");
  const lockPassContainer = document.getElementById("lock-password-container");
  const lockPassInput = document.getElementById("lock-password-input");
  const unlockBtnNoPass = document.getElementById("unlock-btn-no-pass");

  // Desktop Icons (we can still keep them or remove them, let's keep them working)
  const createFileIcon = document.getElementById("createFileIcon");
  const calcIcon = document.getElementById("calcIcon");
  const googleIcon = document.getElementById("googleIcon");
  // const weatherIcon = document.getElementById("weatherIcon"); // Removed
  const todoIcon = document.getElementById("todoIcon");
  const searchIcon = document.getElementById("searchIcon");
  const settingsIcon = document.getElementById("settingsIcon");
  const sysInfoIcon = document.getElementById("sysInfoIcon");

  // XIAAPPS CORE
  const APP_REGISTRY = {
    "url-shortener": { name: "Shortener", icon: "fa-link", module: "./apps/url-shortener.js", launch: "openUrlShortener" },
    "weather": { name: "Weather", icon: "fa-cloud-sun", module: "./apps/weather.js", launch: "openWeather" },
    "sysinfo": { name: "System Info", icon: "fa-circle-info", module: "./apps/sysinfo.js", launch: "openSysInfo" },
    "news": { name: "News Reader", icon: "fa-newspaper", module: "./apps/news.js", launch: "openNews" },
    "quotes": { name: "Daily Quotes", icon: "fa-quote-left", module: "./apps/quotes.js", launch: "openQuotes" },
    "currency": { name: "Currency", icon: "fa-coins", module: "./apps/currency.js", launch: "openCurrency" },
    "units": { name: "Units", icon: "fa-ruler-combined", module: "./apps/units.js", launch: "openUnits" },
    "stopwatch": { name: "Stopwatch", icon: "fa-stopwatch", module: "./apps/stopwatch.js", launch: "openStopwatch" },
    "paint": { name: "Paint", icon: "fa-palette", module: "./apps/paint.js", launch: "openPaint" },
    "flashlight": { name: "Night Light", icon: "fa-lightbulb", module: "./apps/flashlight.js", launch: "openFlashlight" },
    "pomodoro": { name: "Pomodoro", icon: "fa-clock", module: "./apps/pomodoro.js", launch: "openPomodoro" },
    "tictactoe": { name: "Game", icon: "fa-gamepad", module: "./apps/tictactoe.js", launch: "openTicTacToe" },
    "password": { name: "Pass Gen", icon: "fa-shield-halved", module: "./apps/password.js", launch: "openPassword" },
    "dictionary": { name: "Book", icon: "fa-book", module: "./apps/dictionary.js", launch: "openDictionary" },
    "notes": { name: "Notes", icon: "fa-note-sticky", module: "./apps/notes.js", launch: "openNotes" },
    "tasks": { name: "Tasks", icon: "fa-list-check", module: "./apps/tasks.js", launch: "openTasks" },
    "expenses": { name: "Spend", icon: "fa-wallet", module: "./apps/expenses.js", launch: "openExpenses" },
    "memory": { name: "Brain", icon: "fa-brain", module: "./apps/memory.js", launch: "openMemory" }
  };
  window.APP_REGISTRY = APP_REGISTRY;

  async function launchXiaApps() {
    const mod = await import("./apps/xiastore.js");
    mod.openXiaApps();
  }

  window.refreshDesktop = function () { renderDesktop(); };

  async function addToDock(appId) {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      let dockShortcuts = userDoc.exists() ? (userDoc.data().dockShortcuts || []) : [];
      if (!dockShortcuts.includes(appId)) {
        dockShortcuts.push(appId);
        await updateDoc(userDocRef, { dockShortcuts });
        window.location.reload();
      }
    } catch (e) { console.error(e); }
  }

  async function removeDesktop(appId) {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      let hiddenDesktop = userDoc.exists() ? (userDoc.data().hiddenDesktop || []) : [];
      if (!hiddenDesktop.includes(appId)) {
        hiddenDesktop.push(appId);
        await updateDoc(userDocRef, { hiddenDesktop });
        window.userHiddenIcons = hiddenDesktop; // Update local state
        renderDesktop();
      }
    } catch (e) { console.error(e); }
  }

  async function uninstallApp(appId) {
    if (!currentUser) return;
    const confirmed = await showConfirm("Uninstall App", `Are you sure you want to uninstall ${appId}? All associated data will be removed.`);
    if (!confirmed) return;
    try {
      const userDocRef = doc(db, "users", currentUser.uid);

      // 1. Remove from localStorage
      let installed = JSON.parse(localStorage.getItem("installed_apps") || "[]");
      installed = installed.filter(id => id !== appId);
      localStorage.setItem("installed_apps", JSON.stringify(installed));

      // 2. Clean up Firestore (Dock & Hidden list)
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        let data = userDoc.data();
        let dockShortcuts = (data.dockShortcuts || []).filter(id => id !== appId);
        let hiddenDesktop = (data.hiddenDesktop || []).filter(id => id !== appId);
        await updateDoc(userDocRef, { dockShortcuts, hiddenDesktop });
      }

      window.location.reload();
    } catch (e) {
      console.error("Uninstall failed:", e);
      await showModal("Uninstall Failed", "There was an error during uninstallation. Please check the console.", true);
    }
  }
  window.uninstallApp = uninstallApp;

  async function removeFromDock(appId) {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        let dockShortcuts = userDoc.data().dockShortcuts || [];
        dockShortcuts = dockShortcuts.filter(id => id !== appId);
        await updateDoc(userDocRef, { dockShortcuts });
        window.location.reload();
      }
    } catch (e) { console.error(e); }
  }

  function renderDock(shortcuts = []) {
    const dock = document.getElementById("dock");
    if (!dock) return;
    const defaultApps = [
      { id: "explorer", icon: "fa-folder-open", action: launchExplorer },
      { id: "xiaapps", icon: "fa-store", action: launchXiaApps },
      { id: "browser", icon: "fa-globe", action: () => launchBrowser("Google", "https://www.google.com/webhp?igu=1", "fa-brands fa-google") }
    ];
    dock.innerHTML = "";
    defaultApps.forEach(app => {
      const el = document.createElement("div");
      el.className = "dock-app";
      el.dataset.app = app.id;
      el.innerHTML = `<i class="fa-solid ${app.icon}"></i><div class="dot"></div>`;
      el.onclick = app.action;
      dock.appendChild(el);
    });
    shortcuts.forEach(id => {
      const app = APP_REGISTRY[id];
      if (!app) return;
      const el = document.createElement("div");
      el.className = "dock-app";
      el.dataset.app = id;
      el.innerHTML = `<i class="fa-solid ${app.icon}"></i><div class="dot"></div>`;
      el.onclick = async () => {
        const mod = await import(app.module);
        mod[app.launch](currentUser?.uid);
      };
      dock.appendChild(el);
    });
    const sep = document.createElement("div");
    sep.className = "dock-separator";
    dock.appendChild(sep);
    const clock = document.createElement("div");
    clock.id = "dock-clock";
    clock.innerHTML = `<div id="dock-time">00:00</div><div id="dock-date">MON, JAN 01</div>`;
    dock.appendChild(clock);
    updateClock();
  }

  function renderDesktop() {
    const desktop = document.getElementById("desktop");
    if (!desktop) return;
    desktop.innerHTML = "";
    const coreApps = [
      { id: "explorer", name: "Files", icon: "fa-folder-open", action: launchExplorer },
      { id: "xiaapps", name: "XiaStore", icon: "fa-store", action: launchXiaApps, color: "#00c6ff" },
      { id: "browser", name: "Browser", icon: "fa-globe", action: () => launchBrowser("Google", "https://www.google.com/webhp?igu=1", "fa-brands fa-google") },
      { id: "settings", name: "Settings", icon: "fa-gear", action: launchSettings }
    ];
    const hideList = window.userHiddenIcons || [];
    coreApps.forEach(app => {
      if (hideList.includes(app.id)) return;
      const el = document.createElement("div");
      el.className = "file";
      el.dataset.app = app.id;
      el.title = app.name;
      el.innerHTML = `<i class="fa-solid ${app.icon} fa-3x" ${app.color ? `style="color:${app.color}"` : ''}></i><span>${app.name}</span>`;
      el.onclick = app.action;
      desktop.appendChild(el);
    });
    const installed = JSON.parse(localStorage.getItem("installed_apps") || "[]");
    installed.forEach(id => {
      if (hideList.includes(id)) return;
      const app = APP_REGISTRY[id];
      if (!app) return;
      const el = document.createElement("div");
      el.className = "file";
      el.dataset.app = id;
      el.title = app.name;
      el.innerHTML = `<i class="fa-solid ${app.icon} fa-3x"></i><span>${app.name}</span>`;
      el.onclick = async () => {
        const mod = await import(app.module);
        mod[app.launch](currentUser?.uid);
      };
      desktop.appendChild(el);
    });
  }

  let currentUser = null;
  let userLockPassword = "";

  // ===== AUTH CHECK =====
  onAuthStateChanged(auth, async user => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    currentUser = user;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.theme) {
          const wallpaperEl = document.getElementById("wallpaper");
          if (wallpaperEl) {
            let themePath = userData.theme;
            if (themePath && !themePath.startsWith("Bgimg/") && !themePath.startsWith("http")) {
              themePath = "Bgimg/" + themePath;
            }
            wallpaperEl.src = themePath;
          }
        }
        if (userData.accentColor) {
          document.documentElement.style.setProperty('--accent-color', userData.accentColor);
          document.documentElement.style.setProperty('--accent-glow', userData.accentColor + "66");
        }
        if (userData.dockPos) {
          const dock = document.getElementById("dock");
          if (dock) dock.className = "dock-" + userData.dockPos;
        }

        window.userHiddenIcons = userData.hiddenDesktop || [];
        renderDock(userData.dockShortcuts || []);
        renderDesktop();
      } else {
        renderDock([]);
        renderDesktop();
      }
    } catch (e) {
      console.error("Error syncing theme:", e);
      renderDock([]);
      renderDesktop();
    }

    loadLatestRelease();

    if (lockScreen && user) {
      lockScreen.style.display = "flex";
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          lockUsername.innerText = userData.name || user.displayName || "User";
          userLockPassword = userData.lockPassword || "";
        } else {
          lockUsername.innerText = user.displayName || "User";
        }
      } catch (e) {
        lockUsername.innerText = user.displayName || "User";
      }
    }

    if (preloader) {
      setTimeout(() => {
        preloader.classList.add("fade-out");
      }, 1000);
    }
  });

  // ===== LOCK SCREEN LOGIC =====
  if (lockScreen) {
    const showLogin = () => {
      if (!lockScreen.classList.contains("show-login")) {
        lockScreen.classList.add("show-login");
        if (userLockPassword) {
          lockPassContainer.style.display = "block";
          unlockBtnNoPass.style.display = "none";
          setTimeout(() => lockPassInput.focus(), 500);
        } else {
          lockPassContainer.style.display = "none";
          unlockBtnNoPass.style.display = "flex";
        }
      }
    };

    const attemptUnlock = () => {
      if (userLockPassword) {
        if (lockPassInput.value === userLockPassword) {
          unlockFinal();
        } else {
          // Shake effect
          lockPassContainer.classList.add("shake");
          document.getElementById("lock-error").style.opacity = "1";
          setTimeout(() => {
            lockPassContainer.classList.remove("shake");
            lockPassInput.value = "";
          }, 400);
        }
      } else {
        unlockFinal();
      }
    };

    const unlockFinal = () => {
      lockScreen.classList.add("unlocked");
      setTimeout(() => {
        lockScreen.style.display = "none";
      }, 800);
    };

    lockScreen.addEventListener("click", showLogin);
    window.addEventListener("keydown", (e) => {
      if (lockScreen.style.display !== "none") {
        if (e.key === "Enter" && lockScreen.classList.contains("show-login")) {
          attemptUnlock();
        } else {
          showLogin();
        }
      }
    });

    if (unlockBtn) {
      unlockBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        attemptUnlock();
      });
    }

    if (unlockBtnNoPass) {
      unlockBtnNoPass.addEventListener("click", (e) => {
        e.stopPropagation();
        unlockFinal();
      });
    }
  }

  function updateLockClock() {
    const now = new Date();
    const lockTimeEl = document.getElementById("lock-time");
    const lockDateEl = document.getElementById("lock-date");

    if (lockTimeEl && lockDateEl) {
      lockTimeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      lockDateEl.innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }
  setInterval(updateLockClock, 1000);
  updateLockClock();

  // ===== LOAD LATEST RELEASE =====
  async function loadLatestRelease() {
    centerTitle.textContent = "ZenX OS 8.2";
  }

  // ===== APP LAUNCHERS =====

  // 1. EXPLORER
  async function launchExplorer() {
    if (!currentUser) return;
    const mod = await import("./apps/explorer.js");
    mod.openExplorer(currentUser.uid);
    setActiveDock("explorer");
  }

  // 2. EDITOR (Launched via Explorer usually, but we can have a standalone launcher if needed)
  async function launchEditor() {
    // For now, let's just open Explorer as the entry point for files
    launchExplorer();
  }

  // 3. CALCULATOR
  async function launchCalculator() {
    const mod = await import("./apps/calculator.js");
    mod.openCalculator();
    setActiveDock("calculator");
  }

  // 4. BROWSER LAUNCHER
  async function launchBrowser(title, url, icon) {
    const mod = await import("./apps/browser.js");
    mod.openBrowser(title, url, icon);
  }

  // 5. WEATHER - REMOVED

  // 6. TODO
  async function launchTodo() {
    const mod = await import("./apps/todo.js");
    mod.openTodo();
  }

  // 7. SEARCH
  async function launchSearch() {
    if (!currentUser) return;
    const mod = await import("./apps/search.js");
    mod.openSearch(currentUser.uid);
  }

  // 8. SETTINGS
  async function launchSettings() {
    if (!currentUser) return;
    const mod = await import("./apps/settings.js");
    mod.openSettings(currentUser.uid);
  }

  // 9. URL SHORTENER
  async function launchUrlShortener() {
    const mod = await import("./apps/url-shortener.js");
    mod.openUrlShortener();
  }

  // 10. WEATHER
  async function launchWeather() {
    const mod = await import("./apps/weather.js");
    mod.openWeather();
  }

  // 11. SYS INFO
  async function launchSysInfo() {
    if (!currentUser) return;
    const mod = await import("./apps/sysinfo.js");
    mod.openSysInfo(currentUser.uid);
  }

  // 12. NEWS
  async function launchNews() {
    const mod = await import("./apps/news.js");
    mod.openNews();
  }

  // 13. QUOTES
  async function launchQuotes() {
    const mod = await import("./apps/quotes.js");
    mod.openQuotes();
  }

  // 14. CURRENCY
  async function launchCurrency() {
    const mod = await import("./apps/currency.js");
    mod.openCurrency();
  }

  // 15. UNITS
  async function launchUnits() {
    const mod = await import("./apps/units.js");
    mod.openUnits();
  }

  // 16. STOPWATCH
  async function launchStopwatch() {
    const mod = await import("./apps/stopwatch.js");
    mod.openStopwatch();
  }

  // 17. PAINT
  async function launchPaint() {
    const mod = await import("./apps/paint.js");
    mod.openPaint();
  }

  // 18. FLASHLIGHT
  async function launchFlashlight() {
    const mod = await import("./apps/flashlight.js");
    mod.openFlashlight();
  }

  // 19. POMODORO
  async function launchPomodoro() {
    const mod = await import("./apps/pomodoro.js");
    mod.openPomodoro();
  }

  // 20. TICTACTOE
  async function launchTicTacToe() {
    const mod = await import("./apps/tictactoe.js");
    mod.openTicTacToe();
  }

  // 21. PASSWORD GEN
  async function launchPasswordGen() {
    const mod = await import("./apps/password.js");
    mod.openPassword();
  }

  // 22. DICTIONARY
  async function launchDictionary() {
    const mod = await import("./apps/dictionary.js");
    mod.openDictionary();
  }

  // 23. NOTES
  async function launchNotes() {
    const mod = await import("./apps/notes.js");
    mod.openNotes();
  }

  // 24. TASKS
  async function launchTasks() {
    const mod = await import("./apps/tasks.js");
    mod.openTasks();
  }

  // 25. EXPENSES
  async function launchExpenses() {
    const mod = await import("./apps/expenses.js");
    mod.openExpenses();
  }

  // 26. MEMORY
  async function launchMemory() {
    const mod = await import("./apps/memory.js");
    mod.openMemory();
  }





  // ===== DOCK HANDLING =====
  function setActiveDock(appName) {
    dockApps.forEach(a => {
      a.classList.remove("active");
      if (a.dataset.app === appName) a.classList.add("active");
    });
    // Auto-remove active state after a bit if it's just a launcher
    setTimeout(() => {
      dockApps.forEach(a => a.classList.remove("active"));
    }, 2000);
  }

  dockApps.forEach(app => {
    app.addEventListener("click", () => {
      const appName = app.dataset.app;
      if (appName === "createFile") {
        launchExplorer();
      } else if (appName === "xiaapps") {
        launchXiaApps();
      } else if (appName === "browser") {
        launchBrowser("Google", "https://www.google.com/webhp?igu=1", "fa-brands fa-google");
      }
    });
  });

  // Re-map logout explicitly to avoid reference issues
  logoutBtn.onclick = () => {
    signOut(auth).then(() => window.location.href = "login.html");
  };



  // ===== CLOCK =====
  function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById("dock-time");
    const dateEl = document.getElementById("dock-date");

    if (timeEl && dateEl) {
      timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dateEl.innerText = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ===== CONTEXT MENU & SECURITY =====
  try {
    import("./content-menu.js").then(mod => {
      mod.initContextMenu({
        explorer: launchExplorer,
        calculator: launchCalculator,
        todo: launchTodo,
        search: launchSearch,
        settings: launchSettings,
        addToDock: addToDock,
        removeDesktop: removeDesktop,
        uninstall: uninstallApp,
        removeFromDock: removeFromDock
      });
    });
  } catch (e) {
    handleSystemError(e);
  }

});
