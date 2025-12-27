/*************************************************
 * DOM – Layout
 *************************************************/
const leftPanel = document.getElementById("leftPanel");
const resizer = document.getElementById("resizer");
const canvasWrapper = document.getElementById("canvasWrapper");

const btnRun = document.getElementById("btnRun");
const btnStop = document.getElementById("btnStop");
const btnFullscreen = document.getElementById("btnFullscreen");
const btnRestart = document.getElementById("btnRestart");

/*************************************************
 * DOM – Editor
 *************************************************/
const editorLines = document.getElementById("editorLines");
const fileType = document.getElementById("fileType");

/*************************************************
 * Initial Layout
 *************************************************/
leftPanel.style.width = "60%";

/*************************************************
 * Code Storage
 *************************************************/
const codeFiles = {
  js: "",
  css: "",
};
let currentFileType = "js";

/*************************************************
 * Load Code Files (for editor)
 *************************************************/
async function loadSketchFile() {
  const res = await fetch("class.js");
  codeFiles.js = await res.text();
  displayCode("js");
}

async function loadCSSFile() {
  const res = await fetch("style.css");
  codeFiles.css = await res.text();
}

/*************************************************
 * Syntax Highlight (line-based)
 *************************************************/
function highlightCodeLine(line, type) {
  if (type === "js") {
    return line
      .replace(
        /\b(let|const|var|function|return|for|if|else|new)\b/g,
        '<span class="keyword">$1</span>'
      )
      .replace(
        /\b(setup|draw|createCanvas|background|ellipse|translate|rotate|push|pop|angleMode|random|map|fill|noStroke)\b/g,
        '<span class="function">$1</span>'
      )
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
      .replace(/\/\/.*/g, '<span class="comment">$&</span>');
  }
  return line;
}

/*************************************************
 * Render Code Editor (ONE scroll, PERFECT sync)
 *************************************************/
function displayCode(type) {
  const code = codeFiles[type];
  editorLines.innerHTML = "";

  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNo = document.createElement("div");
    lineNo.className = "editor-lineno";
    lineNo.textContent = index + 1;

    const lineCode = document.createElement("div");
    lineCode.className = "editor-code";
    lineCode.innerHTML = highlightCodeLine(line, type) || " ";

    editorLines.appendChild(lineNo);
    editorLines.appendChild(lineCode);
  });

  currentFileType = type;
  fileType.textContent = type === "js" ? "JavaScript" : "CSS";
}

/*************************************************
 * Load editor content
 *************************************************/
loadSketchFile();
loadCSSFile();

/*************************************************
 * p5 CANVAS HANDLING (global mode)
 *************************************************/
function getCanvas() {
  return document.querySelector("canvas");
}

function attachCanvas() {
  const canvas = getCanvas();
  if (!canvas) return;

  if (canvas.parentElement !== canvasWrapper) {
    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(canvas);
  }
}

// setup 이후 canvas 처리 + 초기 정지
window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    attachCanvas();

    const canvas = getCanvas();
    if (!canvas) return;

    // 처음에는 완전히 정지 + 숨김
    canvas.style.display = "none";

    if (typeof noLoop === "function") {
      noLoop();
    }
    if (typeof background === "function") {
      background(0);
    }
  });
});

/*************************************************
 * Run / Stop / Restart
 *************************************************/
btnRun.addEventListener("click", () => {
  const canvas = getCanvas();
  if (!canvas) return;

  canvas.style.display = "block";
  if (typeof loop === "function") {
    loop();
  }
});

btnStop.addEventListener("click", () => {
  if (typeof noLoop === "function") {
    noLoop();
  }
});

btnRestart.addEventListener("click", () => {
  const canvas = getCanvas();
  if (!canvas) return;

  if (typeof noLoop === "function") noLoop();
  if (typeof background === "function") background(0);
  if (typeof loop === "function") loop();

  canvas.style.display = "block";
});

/*************************************************
 * Fullscreen (aspect ratio kept by CSS)
 *************************************************/
btnFullscreen.addEventListener("click", () => {
  if (canvasWrapper.requestFullscreen) {
    canvasWrapper.requestFullscreen();
  }
});

/*************************************************
 * Resizer (wider usable range)
 *************************************************/
let isResizing = false;
const MIN_LEFT = 540;
const MIN_RIGHT = 640;

resizer.addEventListener("mousedown", () => {
  isResizing = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  const newWidth = e.clientX - 32;
  const maxWidth = window.innerWidth - MIN_RIGHT;

  if (newWidth >= MIN_LEFT && newWidth <= maxWidth) {
    leftPanel.style.width = newWidth + "px";
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.cursor = "default";
  document.body.style.userSelect = "auto";
});

/*************************************************
 * Fullscreen change safety
 *************************************************/
document.addEventListener("fullscreenchange", () => {
  requestAnimationFrame(attachCanvas);
});
