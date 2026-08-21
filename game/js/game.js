function selectColor(color) {
  gameState.selectedColor = color;
  document.querySelectorAll(".palette-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("aria-label") === color
    );
  });
  // 빈 칸에 마우스를 올렸을 때(:hover) 지금 고른 색으로 테두리가
  // 표시되도록, 게임판 루트에 선택 색을 CSS 변수로 심어둔다.
  document
    .getElementById("game-board")
    .style.setProperty("--selected-color", COLOR_HEX[color]);
}

function handleCellClick(row, col) {
  if (gameState.status !== "playing") return;
  if (gameState.clues[row][col]) return; // 이미 공개된 힌트 칸
  if (gameState.revealed[row][col]) return; // 이미 확정된 칸
  if (!gameState.selectedColor) return; // 팔레트에서 색을 먼저 골라야 함

  const correctColor = gameState.board[row][col];
  const isCorrect = correctColor === gameState.selectedColor;

  if (isCorrect) {
    gameState.revealed[row][col] = gameState.selectedColor;
    renderBoard();
    checkWinCondition();
  } else {
    gameState.chancesLeft -= 1;
    triggerWarningEffect(row, col);
    renderChances();
    if (gameState.chancesLeft <= 0) {
      endGame("fail");
    }
  }
}

function checkWinCondition() {
  const allFilled = gameState.revealed.every((row, r) =>
    row.every((cell, c) => cell !== null || gameState.clues[r][c])
  );
  if (allFilled) {
    endGame("success");
  }
}

function endGame(result) {
  gameState.status = result;
  stopTimer();
  renderStatus();

  const config = DIFFICULTY_CONFIG[gameState.difficulty];
  addRecord({
    difficulty: gameState.difficulty,
    result,
    elapsedSeconds: gameState.elapsedSeconds,
    chancesUsed: config.chances - gameState.chancesLeft,
    tunedValue: config.chances,
  });

  if (result === "success") {
    triggerClearEffect();
  } else {
    triggerFailEffect();
  }
}

// 다시 시작 — 현재 판은 완전히 초기화, 최단 기록은 storage.js가 별도로 보존한다.
function resetGame(difficultyKey) {
  const config = DIFFICULTY_CONFIG[difficultyKey];
  if (!config) return;

  hideBombImage();

  gameState.difficulty = difficultyKey;
  gameState.gridSize = config.gridSize;
  gameState.chancesLeft = config.chances;
  gameState.elapsedSeconds = 0;
  gameState.status = "playing";
  gameState.selectedColor = null;
  document.getElementById("game-board").style.removeProperty("--selected-color");

  const generated = generateBoard(config);
  gameState.board = generated.board;
  gameState.clues = generated.clueMask.map((row, r) =>
    row.map((isClue, c) => (isClue ? generated.board[r][c] : null))
  );
  gameState.revealed = generated.clueMask.map((row) => row.map(() => null));
  gameState.hints = generated.hints;
  gameState.margins = generated.margins;

  renderAll();
  startTimer();
}
