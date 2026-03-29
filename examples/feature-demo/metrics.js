const coreSourceFiles = [
  "../../core/src/index.js",
  "../../core/src/RouterCore.js",
  "../../core/src/ShellState.js",
  "../../core/src/DialogService.js",
  "../../core/src/ModalController.js",
  "../../core/src/DialogDragController.js",
  "../../core/src/DialogAnchor.js",
  "../../core/src/RouteHotkeys.js"
];

const coreCssFiles = [
  "../../core/css/base.css",
  "../../core/css/shell.css",
  "../../core/css/preset-classic.css",
  "../../core/css/preset-modern.css"
];

export async function refreshCoreMetrics() {
  const jsFilesNode = document.querySelector('[data-metric="js-files"]');
  const cssFilesNode = document.querySelector('[data-metric="css-files"]');
  const jsLinesNode = document.querySelector('[data-metric="js-lines"]');
  const cssLinesNode = document.querySelector('[data-metric="css-lines"]');

  if (!jsFilesNode || !cssFilesNode || !jsLinesNode || !cssLinesNode) return;

  jsFilesNode.textContent = String(coreSourceFiles.length);
  cssFilesNode.textContent = String(coreCssFiles.length);
  jsLinesNode.textContent = "...";
  cssLinesNode.textContent = "...";

  try {
    const [jsLines, cssLines] = await Promise.all([
      readTotalNonEmptyLines(coreSourceFiles),
      readTotalNonEmptyLines(coreCssFiles)
    ]);

    jsLinesNode.textContent = String(jsLines);
    cssLinesNode.textContent = String(cssLines);
  } catch (error) {
    jsLinesNode.textContent = "n/a";
    cssLinesNode.textContent = "n/a";
    console.error("Failed to recalculate core metrics", error);
  }
}

async function readTotalNonEmptyLines(paths) {
  const counts = await Promise.all(paths.map(readNonEmptyLineCount));
  return counts.reduce((sum, count) => sum + count, 0);
}

async function readNonEmptyLineCount(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);

  const text = await response.text();
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}
