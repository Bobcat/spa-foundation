// View render helpers and route view definitions

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderFeatureView({ title, summary, demo, code }) {
  return `
    <section class="view feature-view">
      <div class="feature-header">
        <h1>${title}</h1>
        <p>${summary}</p>
      </div>
      <div class="feature-grid">
        <article class="panel">
          <h2>Try it</h2>
          ${demo}
        </article>
      </div>
      <article class="panel code-panel">
        <h2>Example code</h2>
        <pre class="code-block"><code>${escapeHtml(code)}</code></pre>
      </article>
    </section>
  `;
}

function renderColorPaletteView() {
  const groups = [
    {
      title: "Neutral foundation (most used in modern apps)",
      colors: [
        { name: "Text", value: "#334155" },
        { name: "Muted text", value: "#64748b" },
        { name: "Border", value: "#dbe5ee" },
        { name: "Panel", value: "#ffffff" },
        { name: "Page background", value: "#f5f7fa" }
      ]
    },
    {
      title: "Primary accent (common choice)",
      colors: [
        { name: "Blue 600", value: "#2563eb" },
        { name: "Blue 700", value: "#1d4ed8" },
        { name: "Blue 800", value: "#1e40af" }
      ]
    },
    {
      title: "Semantic colors",
      colors: [
        { name: "Success", value: "#16a34a" },
        { name: "Warning", value: "#f59e0b" },
        { name: "Error", value: "#dc2626" },
        { name: "Info", value: "#0ea5e9" }
      ]
    }
  ];

  return `
    <section class="view feature-view">
      <div class="feature-header">
        <h1>Color Palette</h1>
        <p>Quick visual reference for modern web-app color families.</p>
      </div>
      <div class="palette-groups">
        ${groups.map((group) => `
          <article class="panel palette-panel">
            <h2>${group.title}</h2>
            <div class="palette-grid">
              ${group.colors.map((color) => `
                <div class="palette-swatch">
                  <div class="swatch-chip" style="background:${color.value};"></div>
                  <strong>${color.name}</strong>
                  <code>${color.value}</code>
                </div>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

// Route views
const views = {
  introduction: `
    <section class="view feature-view">
      <div class="feature-header">
        <h1>Introduction</h1>
        <p><code>spa-foundation</code> is a plain-JS Single Page Application (SPA) foundation package that provides routing, shell state, dialog lifecycle, draggable dialog primitives and optional visual presets.</p>
      </div>
      <div class="feature-grid intro-grid">
        <article class="panel intro-wide">
          <h2>What It Does</h2>
          <ul class="stack feature-list">
            <li><span>Mounts route views into a single host container</span></li>
            <li><span>Tracks sidebar open and close state</span></li>
            <li><span>Persists selected theme, sidebar state, and corner style across page refreshes</span></li>
            <li><span>Keeps back and forward navigation inside the SPA via hash routes</span></li>
            <li><span>Allows apps to bind arbitrary keyboard shortcuts directly to routes</span></li>
            <li><span>Allows visual presets to layer on top of base and shell CSS</span></li>
            <li><span>Provides dialog open and close semantics via <code>DialogService</code> and <code>ModalController</code></span></li>
            <li><span>Provides a shared dialog layout, with optional dragging from the title bar</span></li>
          </ul>
        </article>
        <article class="panel">
          <h2>Package Scope</h2>
          <ul class="stack feature-list">
            <li><span>Core JS: <code>RouterCore.js</code>, <code>ShellState.js</code>, <code>DialogService.js</code>, <code>ModalController.js</code>, <code>DialogDragController.js</code>, <code>DialogAnchor.js</code>, <code>RouteHotkeys.js</code></span></li>
            <li><span>Core CSS: <code>base.css</code>, <code>shell.css</code>, <code>preset-classic.css</code>, <code>preset-modern.css</code></span></li>
          </ul>
        </article>
        <article class="panel">
          <h2>Current package metrics</h2>
          <p>These numbers are recalculated from the current core source files each time this introduction view mounts.</p>
          <div class="metric-grid">
            <article class="metric-card">
              <span class="metric-label">JS files</span>
              <strong class="metric-value" data-metric="js-files">...</strong>
            </article>
            <article class="metric-card">
              <span class="metric-label">CSS files</span>
              <strong class="metric-value" data-metric="css-files">...</strong>
            </article>
            <article class="metric-card">
              <span class="metric-label">JS non-empty Lines of Code</span>
              <strong class="metric-value" data-metric="js-lines">...</strong>
            </article>
            <article class="metric-card">
              <span class="metric-label">CSS non-empty Lines of Code</span>
              <strong class="metric-value" data-metric="css-lines">...</strong>
            </article>
          </div>
        </article>
      </div>
    </section>
  `,
  router: renderFeatureView({
    title: "Routing",
    summary: "Routes mount into the right panel and swap without a page reload.",
    usedApi: [
      "<code>new RouterCore(host, hooks?)</code>: mounts registered views into a single host.",
      "<code>router.register(name, { mount })</code>: registers a named route view.",
      "<code>router.startFromHash(defaultView, data, { parseHash })</code>: resolves initial route at boot.",
      "<code>router.navigate(name, data, { url })</code>: mounts a route and updates history/hash."
    ],
    demo: `
      <p>Switch between the feature items in the sidebar. Each item mounts a new view into the same host.</p>
      <div class="actions">
        <a href="#dialogs" data-route="dialogs">Go to Dialogs</a>
        <a href="#history" data-route="history">Go to Browser History</a>
      </div>
    `,
    code: `const router = new RouterCore(appRoot);

router.register("router", { mount: (host) => { host.innerHTML = "..."; } });
router.register("dialogs", { mount: (host) => { host.innerHTML = "..."; } });

router.startFromHash("router", null, { parseHash });
router.navigate("dialogs", null, { url: "#dialogs" });`
  }),
  shell: renderFeatureView({
    title: "Sidebar State",
    summary: "Sidebar open and close is managed by a small state primitive instead of ad hoc DOM toggles.",
    usedApi: [
      "<code>new ShellState({ sidebarOpen, isMobile })</code>: creates shell UI state.",
      "<code>shellState.subscribe(({ next }) =&gt; ...)</code>: reacts to sidebar state changes.",
      "<code>shellState.toggleSidebar(reason)</code>: toggles expanded/collapsed sidebar state."
    ],
    demo: `
      <p>Use the sidebar button in the shell header. This feature view also demonstrates an optional view-edge radius on the expanded sidebar.</p>
      <div class="actions">
        <button type="button" data-action="toggle-sidebar">Toggle sidebar</button>
        <button type="button" data-action="toggle-sidebar-radius">Enable rounded corners</button>
      </div>
    `,
    code: `const shellState = new ShellState({ sidebarOpen: true, isMobile: false });

shellState.subscribe(({ next }) => {
  sidebar.classList.toggle("expanded", next.sidebarOpen);
});

sidebarToggle.addEventListener("click", () => {
  shellState.toggleSidebar("featureDemo.sidebarToggle");
});

sidebar.style.setProperty("--sidebar-view-edge-radius", "18px");`
  }),
  "shell-state": renderFeatureView({
    title: "Persistence",
    summary: "Restores the selected theme, sidebar state, and corner style after a refresh.",
    demo: `
      <p>Each button applies a full shell snapshot now and also saves it for the next refresh. Click one, watch the shell change immediately, then refresh to verify boot restore.</p>
      <div class="actions">
        <button type="button" data-action="apply-modern-shell-state">Apply modern shell</button>
        <button type="button" data-action="apply-classic-shell-state">Apply classic shell</button>
        <button type="button" data-action="clear-shell-state">Clear saved shell state</button>
      </div>
      <div class="metric-grid">
        <article class="metric-card">
          <span class="metric-label">Current shell</span>
          <strong class="metric-value" data-shell-current-state>...</strong>
        </article>
        <article class="metric-card">
          <span class="metric-label">Saved for refresh</span>
          <strong class="metric-value" data-shell-saved-state>...</strong>
        </article>
      </div>
    `,
    code: `const persistence = createShellPersistence({
  storageKey: "spa-foundation.feature-demo.shell",
  shellState,
  getPreset: getActivePreset,
  getRoundedSidebar
});

function applyAndSaveShellState(next) {
  setPreset(next.preset, { persist: false });
  setRoundedSidebar(next.roundedSidebar);
  shellState.setSidebarOpen(next.sidebarOpen, "featureDemo.shellStateDemo");
  persistence.save();
}

const initial = persistence.resolve({
  preset: "modern",
  sidebarOpen: true,
  roundedSidebar: false
});`
  }),
  dialogs: renderFeatureView({
    title: "Dialogs",
    summary: "Dialogs use foundation lifecycle, shared layout classes and optional drag behavior without needing app-specific dialog infrastructure.",
    usedApi: [
      "<code>new DialogService()</code>: central open/close lifecycle for named dialogs.",
      "<code>new ModalController(element, handlers)</code>: binds backdrop and key close behavior.",
      "<code>createDialogDragController(onMove)</code>: adds draggable dialog support."
    ],
    demo: `
      <p>The button below opens the reusable modal. Outside click, Escape and Enter all close it, and the title bar can be dragged.</p>
      <div class="actions">
        <button class="primary" type="button" data-action="open-info-dialog" data-title="Dialog demo" data-body="This modal uses DialogService and ModalController for lifecycle, and the drag helper plus shared dialog classes for the draggable layout.">Open dialog</button>
      </div>
    `,
    code: `const dialogService = new DialogService();
const modalController = new ModalController(infoModal, {
  backdropEvent: "click",
  onBackdrop: () => dialogService.close("info"),
  onEscape: () => dialogService.close("info")
});

const drag = createDialogDragController((x, y) => {
  infoModalCard.style.setProperty("--drag-x", String(x) + "px");
  infoModalCard.style.setProperty("--drag-y", String(y) + "px");
});

infoModalDragHandle.addEventListener("mousedown", drag.onMouseDown);

dialogService.register("info", {
  onOpen: () => modalController.open(),
  onClose: () => modalController.close()
});

// Markup uses: .dialog-card, .dialog-topbar, .dialog-body`
  }),
  presets: renderFeatureView({
    title: "Theme Presets",
    summary: "The visual layer can switch presets by swapping one stylesheet on top of base and shell.",
    usedApi: [
      "<code>presetStylesheet.setAttribute('href', presetMap[name])</code>: swaps the active preset file.",
      "<code>presetStylesheet.dataset.preset</code>: tracks active preset for UI sync.",
      "<code>document.body.dataset.preset</code>: exposes preset state to CSS/UI behavior."
    ],
    demo: `
      <p>This demo keeps layout and behavior fixed, and only swaps the preset stylesheet.</p>
      <div class="actions">
        <button class="preset-btn" type="button" data-preset="modern">Modern</button>
        <button class="preset-btn" type="button" data-preset="classic">Classic</button>
      </div>
    `,
    code: `const presetMap = {
  classic: "../../core/css/preset-classic.css",
  modern: "../../core/css/preset-modern.css"
};

function setPreset(name) {
  presetStylesheet.setAttribute("href", presetMap[name]);
}`
  }),
  shortcuts: renderFeatureView({
    title: "Keyboard Shortcuts",
    summary: "Apps can bind freely chosen key combinations to routes without wiring key handlers into each view.",
    usedApi: [
      "<code>bindRouteHotkeys(router, bindings)</code>: binds keyboard combos to route navigation.",
      "<code>{ key, modifiers, route }</code>: defines a single hotkey binding.",
      "<code>return unbind()</code>: allows explicit cleanup of key listeners."
    ],
    demo: `
      <p>Use <code>Ctrl+Shift+H</code> for Introduction and <code>Ctrl+Shift+K</code> for Keyboard Shortcuts.</p>
    `,
    code: `bindRouteHotkeys(router, [
  { key: "h", modifiers: ["ctrl", "shift"], route: "introduction" },
  { key: "k", modifiers: ["ctrl", "shift"], route: "shortcuts" }
]);`
  }),
  "color-palette": renderColorPaletteView(),
  history: renderFeatureView({
    title: "Browser History",
    summary: "Each feature maps to a hash, so back and forward stay inside the demo instead of leaving the SPA immediately.",
    usedApi: [
      "<code>router.bindPopState({ parseHash })</code>: restores routes from browser history/hash changes.",
      "<code>parseHash({ hash })</code>: maps URL hash to a registered route payload.",
      "<code>router.navigate(name, data, { url: '#name' })</code>: keeps route and hash in sync."
    ],
    demo: `
      <p>Open another feature, then use the browser back button. You should stay inside the example and return to this feature.</p>
      <div class="actions">
        <a href="#router" data-route="router">Go to Routing</a>
        <a href="#presets" data-route="presets">Go to Theme Presets</a>
      </div>
    `,
    code: `const parseHash = ({ hash }) => {
  const view = String(hash || "").trim();
  return router.has(view) ? { view, data: null } : null;
};

router.bindPopState({ parseHash });
router.navigate("history", null, { url: "#history" });`
  })
};


export { views };
