const gameState = {
  difficulty: null,
  gridSize: 0,
  board: [],
  clues: [],
  revealed: [],
  hints: [],
  margins: null,
  selectedColor: null,
  chancesLeft: 0,
  elapsedSeconds: 0,
  timerHandle: null,
  status: "idle",
  settings: {
    muted: false,
    reducedMotion: false,
  },
};

function startTimer() {
  stopTimer();
  gameState.timerHandle = setInterval(() => {
    if (gameState.status === "playing") {
      gameState.elapsedSeconds += 1;
      renderTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerHandle) {
    clearInterval(gameState.timerHandle);
    gameState.timerHandle = null;
  }
}

function pauseGame() {
  if (gameState.status === "playing") {
    gameState.status = "paused";
    renderStatus();
  }
}

function resumeGame() {
  if (gameState.status === "paused") {
    gameState.status = "playing";
    renderStatus();
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseGame();
  } else {
    resumeGame();
  }
});
window.addEventListener("blur", pauseGame);
window.addEventListener("focus", resumeGame);
