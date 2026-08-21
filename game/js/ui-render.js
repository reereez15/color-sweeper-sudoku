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
  const text = `최단기록 · 쉬움 ${formatTime(getBestTime("easy"))} · 중급 ${formatTime(
    getBestTime("medium")
  )} · 고급 ${formatTime(getBestTime("hard"))}`;

  const gameDisplay = document.getElementById("best-times-display");
  if (gameDisplay) gameDisplay.textContent = text;

  const startDisplay = document.getElementById("start-best-times");
  if (startDisplay) startDisplay.textContent = text;

  renderRecordsTable();
}

const DIFFICULTY_LABEL = { easy: "쉬움", medium: "중급", hard: "고급" };

// 데이터 기반 튜닝 근거로 쓸 최근 기록을 시작 화면 표에 그린다.
// 최신순으로 정렬하고, 화면이 너무 길어지지 않게 최근 10개만 보여준다.
function renderRecordsTable() {
  const tbody = document.getElementById("records-tbody");
  const emptyMsg = document.getElementById("records-empty");
  if (!tbody) return; // 게임 화면 등 표가 없는 곳에서 호출돼도 안전하게 무시

  const records = loadRecords().slice(-10).reverse();

  if (!records.length) {
    tbody.innerHTML = "";
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    return;
  }
  if (emptyMsg) emptyMsg.classList.add("hidden");

  tbody.innerHTML = "";
  records.forEach((r) => {
    const tr = document.createElement("tr");
    tr.className = r.result === "success" ? "record-success" : "record-fail";

    const time = new Date(r.timestamp);
    const timeLabel = `${String(time.getHours()).padStart(2, "0")}:${String(
      time.getMinutes()
    ).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;

    [
      timeLabel,
      DIFFICULTY_LABEL[r.difficulty] || r.difficulty,
      r.result === "success" ? "성공" : "실패",
      formatTime(r.elapsedSeconds),
      String(r.chancesUsed),
      String(r.tunedValue),
    ].forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return "기록 없음";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
