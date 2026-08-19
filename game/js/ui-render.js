function renderAll() {
  renderBoard();
  renderPalette();
  renderChances();
  renderTimer();
  renderStatus();
  renderCurrentRule();
  renderBestTimes();
}

function renderBoard() {
  const boardEl = document.getElementById("game-board");
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `56px repeat(${gameState.gridSize}, 1fr)`;

  boardEl.appendChild(document.createElement("div"));

  for (let c = 0; c < gameState.gridSize; c++) {
    const marginEl = document.createElement("div");
    marginEl.className = "margin-cell margin-col";
    marginEl.appendChild(renderMarginContent(gameState.margins.colColorCounts[c]));
    boardEl.appendChild(marginEl);
  }

  for (let r = 0; r < gameState.gridSize; r++) {
    const rowMarginEl = document.createElement("div");
    rowMarginEl.className = "margin-cell margin-row";
    rowMarginEl.appendChild(renderMarginContent(gameState.margins.rowColorCounts[r]));
    boardEl.appendChild(rowMarginEl);

    for (let c = 0; c < gameState.gridSize; c++) {
      const cellEl = document.createElement("button");
      cellEl.className = "cell";
      cellEl.dataset.row = r;
      cellEl.dataset.col = c;

      const clueColor = gameState.clues[r][c];
      const revealedColor = gameState.revealed[r][c];

      if (clueColor) {
        cellEl.classList.add("clue-cell");
        cellEl.style.setProperty("--cell-color", COLOR_HEX[clueColor]);
        cellEl.textContent = gameState.hints[r][c];
        cellEl.disabled = true;
      } else if (revealedColor) {
        cellEl.classList.add("revealed-cell");
        cellEl.style.setProperty("--cell-color", COLOR_HEX[revealedColor]);
        cellEl.disabled = true;
      } else {
        cellEl.classList.add("empty-cell");
        cellEl.addEventListener("click", () => handleCellClick(r, c));
      }

      boardEl.appendChild(cellEl);
    }
  }
}

function renderMarginContent(marginValue) {
  const wrap = document.createElement("span");
  const config = DIFFICULTY_CONFIG[gameState.difficulty];
  if (!config) return wrap;

  config.colors.forEach((color) => {
    const span = document.createElement("span");
    span.textContent = marginValue[color];
    span.style.color = COLOR_HEX[color];
    span.style.marginRight = "3px";
    wrap.appendChild(span);
  });
  return wrap;
}

function renderPalette() {
  const paletteEl = document.getElementById("color-palette");
  const config = DIFFICULTY_CONFIG[gameState.difficulty];
  paletteEl.innerHTML = "";
  if (!config) return;

  config.colors.forEach((color) => {
    const btn = document.createElement("button");
    btn.className = "palette-btn";
    btn.style.setProperty("--cell-color", COLOR_HEX[color]);
    btn.setAttribute("aria-label", color);
    btn.addEventListener("click", () => selectColor(color));
    paletteEl.appendChild(btn);
  });
}

function renderChances() {
  document.getElementById("chances-display").textContent =
    "기회 " + "●".repeat(Math.max(0, gameState.chancesLeft));
}

function renderTimer() {
  const mm = String(Math.floor(gameState.elapsedSeconds / 60)).padStart(2, "0");
  const ss = String(gameState.elapsedSeconds % 60).padStart(2, "0");
  document.getElementById("timer-display").textContent = `${mm}:${ss}`;
}

function renderStatus() {
  const labels = {
    idle: "대기 중",
    playing: "진행 중",
    success: "클리어!",
    fail: "실패",
    paused: "일시정지",
  };
  document.getElementById("status-display").textContent =
    labels[gameState.status] ?? "";
}

function renderCurrentRule() {
  const config = DIFFICULTY_CONFIG[gameState.difficulty];
  if (!config) return;
  document.getElementById(
    "rule-display"
  ).textContent = `현재 난이도: ${config.label} · 색 ${config.colors.length}개 · 기회 ${config.chances}회`;
}

function renderBestTimes() {
  const bestTimes = loadBestTimes();
  document.getElementById("best-times-display").textContent =
    `최단기록 · 쉬움 ${formatTime(bestTimes.easy)} · 중급 ${formatTime(
      bestTimes.medium
    )} · 고급 ${formatTime(bestTimes.hard)}`;
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return "기록 없음";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
