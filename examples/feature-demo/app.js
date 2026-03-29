import {
  RouterCore,
  ShellState,
  DialogService,
  ModalController,
  createDialogDragController,
  bindRouteHotkeys,
  bindMobileSidebarDismiss,
  createShellPersistence
} from "../../core/src/index.js";
import { views } from "./views/index.js";
import { refreshCoreMetrics } from "./metrics.js";

// === Phase 1: State + Services ===
// Build all runtime state and service objects first.
const byId = (id) => document.getElementById(id);

const appRoot = byId("appRoot");
const sidebar = byId("sidebar");
const sidebarToggle = byId("sidebarToggle");
const sidebarToggleIcon = byId("sidebarToggleIcon");
const presetStylesheet = byId("presetStylesheet");

const infoModal = byId("infoModal");
const infoModalCard = byId("infoModalCard");
const infoModalDragHandle = byId("infoModalDragHandle");
const infoTitle = byId("infoTitle");
const infoBody = byId("infoBody");
const closeInfoBtn = byId("closeInfoBtn");

// Preset and persistence boot state
const presetMap = {
  classic: "../../core/css/preset-classic.css",
  modern: "../../core/css/preset-modern.css"
};

const SHELL_STORAGE_KEY = "spa-foundation.feature-demo.shell";
const bootState = createShellPersistence({ storageKey: SHELL_STORAGE_KEY }).resolve({
  preset: "modern",
  sidebarOpen: true,
  roundedSidebar: false
});
const initialPreset = typeof bootState.preset === "string" && presetMap[bootState.preset]
  ? bootState.preset
  : "modern";
const initialSidebarOpen = !!bootState.sidebarOpen;
const initialRoundedSidebar = !!bootState.roundedSidebar;

const shellState = new ShellState({ sidebarOpen: initialSidebarOpen, isMobile: false });
const dialogService = new DialogService();
const shellPersistence = createShellPersistence({
  storageKey: SHELL_STORAGE_KEY,
  shellState,
  getPreset: getActivePreset,
  getRoundedSidebar
});

const dockLeftSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="3.5"></rect><path d="M8.5 4.9V19.1"></path></svg>';
const dockRightSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="3.5"></rect><path d="M15.5 4.9V19.1"></path></svg>';

const infoModalController = new ModalController(infoModal, {
  backdropEvent: "click",
  onBackdrop: () => dialogService.close("info"),
  onEscape: () => dialogService.close("info"),
  onEnter: () => dialogService.close("info")
});

const infoModalDrag = createDialogDragController((x, y) => {
  if (!infoModalCard) return;
  infoModalCard.style.setProperty("--drag-x", `${x}px`);
  infoModalCard.style.setProperty("--drag-y", `${y}px`);
});

const routeHotkeyBindings = [
  { key: "h", modifiers: ["ctrl", "shift"], route: "introduction", shortcutLabel: "Ctrl+Shift+H" },
  { key: "k", modifiers: ["ctrl", "shift"], route: "shortcuts", shortcutLabel: "Ctrl+Shift+K" }
];
const routeHotkeyLabels = new Map(
  routeHotkeyBindings.map((binding) => [binding.route, binding.shortcutLabel])
);

// === Phase 2: Routes ===
// Register route mount behavior before wiring interactions.
const router = new RouterCore(appRoot, {
  onRouteDidMount: ({ to }) => {
    sidebar.querySelectorAll("[data-route]").forEach((item) => {
      const active = item.dataset.route === to.view;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", active ? "page" : "false");
    });
  }
});

Object.entries(views).forEach(([name, html]) => {
  router.register(name, {
    mount(host) {
      host.innerHTML = html;
      syncPresetButtons();
      syncSidebarRadiusButton();
      syncShellStateStatus();
      if (name === "introduction") refreshCoreMetrics();
    }
  });
});

// === Phase 3: UI Events ===
// Wire dialog lifecycle, shell subscriptions, and user input handlers.
dialogService.register("info", {
  onOpen: ({ title, body } = {}) => {
    infoTitle.textContent = title || "Info";
    infoBody.textContent = body || "Geen extra details.";
    infoModalDrag.reset();
    infoModalController.open();
    closeInfoBtn.focus();
    return true;
  },
  onClose: () => { infoModalDrag.onUp(); infoModalController.close(); }
});

// Shell state subscription and persistent sync
shellState.subscribe(({ next }) => {
  sidebar.classList.toggle("expanded", next.sidebarOpen);
  sidebarToggle.setAttribute("aria-expanded", String(next.sidebarOpen));
  document.body.classList.toggle("sidebar-open", next.sidebarOpen);
  syncSidebarToggleIcon();
  syncSidebarRouteHints();
  syncShellStateStatus();
  shellPersistence.save();
});

sidebarToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  shellState.toggleSidebar("featureDemo.sidebarToggle");
});

closeInfoBtn.addEventListener("click", () => dialogService.close("info"));
infoModalDragHandle?.addEventListener("mousedown", infoModalDrag.onMouseDown);

sidebar.addEventListener("click", (event) => {
  const route = event.target.closest("[data-route]")?.dataset.route;
  if (route) go(route);
});

sidebar.addEventListener("mousemove", (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target || !sidebar.contains(target)) return;

  target.style.setProperty("--tooltip-x", `${event.clientX}px`);
  target.style.setProperty("--tooltip-y", `${event.clientY}px`);
});

appRoot.addEventListener("click", (event) => {
  const actionTrigger = event.target.closest("[data-action]");
  const action = actionTrigger?.dataset.action;
  if (action === "toggle-sidebar") {
    event.stopPropagation();
    return shellState.toggleSidebar("featureDemo.featureToggle");
  }

  if (action === "toggle-sidebar-radius") {
    setRoundedSidebar(!getRoundedSidebar());
    shellPersistence.save();
    syncShellStateStatus();
    return;
  }

  if (action === "apply-modern-shell-state") {
    applyAndSaveShellState({
      preset: "modern",
      sidebarOpen: true,
      roundedSidebar: true
    });
    return;
  }

  if (action === "apply-classic-shell-state") {
    applyAndSaveShellState({
      preset: "classic",
      sidebarOpen: false,
      roundedSidebar: false
    });
    return;
  }

  if (action === "clear-shell-state") {
    clearSavedShellState();
    syncShellStateStatus();
    return;
  }

  if (action === "open-info-dialog") {
    dialogService.open("info", {
      title: actionTrigger?.dataset.title,
      body: actionTrigger?.dataset.body
    });
    return;
  }

  const route = event.target.closest("[data-route]")?.dataset.route;
  if (route) {
    event.preventDefault();
    go(route);
    return;
  }

  const preset = event.target.closest("[data-preset]")?.dataset.preset;
  if (preset) setPreset(preset);
});

// === Phase 4: App Start ===
// Apply boot state and then start route/navigation bindings.
setPreset(initialPreset, { persist: false });
setRoundedSidebar(initialRoundedSidebar);
sidebar.style.transition = "none";
sidebar.classList.toggle("expanded", initialSidebarOpen);
sidebarToggle?.setAttribute("aria-expanded", String(initialSidebarOpen));
document.body.classList.toggle("sidebar-open", initialSidebarOpen);
requestAnimationFrame(() => sidebar.style.removeProperty("transition"));
syncSidebarToggleIcon();

const parseHash = ({ hash }) => {
  const view = String(hash || "").trim();
  return router.has(view) ? { view, data: null } : null;
};

router.bindPopState({ parseHash });
router.startFromHash("introduction", null, { parseHash });
syncSidebarRouteHints();

bindRouteHotkeys(
  router,
  routeHotkeyBindings.map(({ shortcutLabel, ...binding }) => binding)
);

bindMobileSidebarDismiss(shellState, sidebar, 600);

// Navigation and shell helper functions
function go(view) {
  const name = String(view || "").trim();
  if (!router.has(name)) return;
  router.navigate(name, null, { url: `#${name}` });
}

function setPreset(name, { persist = true } = {}) {
  const preset = String(name || "").trim();
  const href = presetMap[preset];
  if (!href || !presetStylesheet) return;
  if (presetStylesheet.getAttribute("href") !== href) presetStylesheet.setAttribute("href", href);
  presetStylesheet.dataset.preset = preset;
  document.body.dataset.preset = preset;
  syncPresetButtons();
  syncSidebarToggleIcon();
  syncShellStateStatus();
  if (persist) shellPersistence.save();
}

function syncPresetButtons() {
  const activePreset = getActivePreset();
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    const isActive = btn.dataset.preset === activePreset;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function syncSidebarToggleIcon() {
  const isOpen = shellState.getSnapshot().sidebarOpen;
  const toggleLabel = isOpen ? "Collapse menu" : "Expand menu";

  sidebarToggle?.setAttribute("aria-label", toggleLabel);
  sidebarToggle?.setAttribute("data-tooltip", toggleLabel);

  if (!sidebarToggleIcon) return;

  const activePreset = getActivePreset();
  const useDockIcons = activePreset === "modern";
  renderToggleIcon(sidebarToggleIcon, useDockIcons, isOpen);
  sidebarToggleIcon.dataset.ready = "true";
}

function renderToggleIcon(target, useDockIcons, isOpen) {
  if (!target) return;

  if (useDockIcons) {
    target.classList.remove("material-symbols-outlined");
    target.innerHTML = isOpen ? dockLeftSvg : dockRightSvg;
    return;
  }

  target.classList.add("material-symbols-outlined");
  target.textContent = "menu";
}

function getActivePreset() {
  const presetHref = String(presetStylesheet?.getAttribute("href") || "");
  return presetStylesheet?.dataset.preset
    || (presetHref.includes("preset-modern.css") ? "modern" : "classic");
}

function getRoundedSidebar() { return Boolean(sidebar.style.getPropertyValue("--sidebar-view-edge-radius").trim()); }

function setRoundedSidebar(enabled) {
  if (enabled) sidebar.style.setProperty("--sidebar-view-edge-radius", "18px");
  else sidebar.style.removeProperty("--sidebar-view-edge-radius");
  syncSidebarRadiusButton();
  syncShellStateStatus();
}

function syncSidebarRouteHints() {
  const isExpanded = shellState.getSnapshot().sidebarOpen;

  sidebar.querySelectorAll("[data-route]").forEach((item) => {
    const route = String(item.dataset.route || "").trim();
    const label = item.querySelector(".link-text")?.textContent?.trim() || route;
    const hotkey = routeHotkeyLabels.get(route);
    const tooltip = isExpanded
      ? (hotkey || "")
      : (hotkey ? `${label} (${hotkey})` : label);
    const ariaLabel = hotkey ? `${label} (${hotkey})` : label;

    item.removeAttribute("title");
    item.setAttribute("aria-label", ariaLabel);

    if (tooltip) item.setAttribute("data-tooltip", tooltip);
    else item.removeAttribute("data-tooltip");
  });
}

function syncSidebarRadiusButton() {
  const button = document.querySelector('[data-action="toggle-sidebar-radius"]');
  if (!button) return;

  const enabled = getRoundedSidebar();
  button.textContent = enabled ? "Disable rounded corners" : "Enable rounded corners";
  button.setAttribute("aria-pressed", String(enabled));
}

function clearSavedShellState() {
  try {
    window.localStorage.removeItem(SHELL_STORAGE_KEY);
  } catch {}
}

function getCurrentShellState() {
  return {
    preset: getActivePreset(),
    sidebarOpen: !!shellState.getSnapshot().sidebarOpen,
    roundedSidebar: getRoundedSidebar()
  };
}

function applyAndSaveShellState(next) {
  setPreset(next.preset, { persist: false });
  setRoundedSidebar(next.roundedSidebar);
  shellState.setSidebarOpen(next.sidebarOpen, "featureDemo.shellStateDemo");
  shellPersistence.save();
  syncShellStateStatus();
}

function readSavedShellState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SHELL_STORAGE_KEY) || "null");
    return saved && typeof saved === "object" ? saved : null;
  } catch {
    return null;
  }
}

function formatShellState(state) {
  if (!state) return "None";

  const preset = state.preset === "classic" ? "Classic" : "Modern";
  const sidebarOpen = state.sidebarOpen ? "Expanded" : "Collapsed";
  const rounded = state.roundedSidebar ? "Rounded" : "Square";
  return `${preset} / ${sidebarOpen} / ${rounded}`;
}

function syncShellStateStatus() {
  const currentNode = document.querySelector("[data-shell-current-state]");
  const savedNode = document.querySelector("[data-shell-saved-state]");
  if (!currentNode && !savedNode) return;

  const current = getCurrentShellState();
  const saved = readSavedShellState();

  if (currentNode) currentNode.textContent = formatShellState(current);
  if (savedNode) savedNode.textContent = formatShellState(saved);
}
