document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".start-diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("start-screen").classList.add("hidden");
      document.getElementById("game-screen").classList.remove("hidden");
      resetGame(btn.dataset.difficulty);
    });
  });

  document.getElementById("back-to-start-btn").addEventListener("click", () => {
    stopTimer();
    gameState.status = "idle";
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
    renderBestTimes();
  });

  document.getElementById("clear-records-btn").addEventListener("click", () => {
    clearRecords();
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    if (gameState.difficulty) resetGame(gameState.difficulty);
  });

  document.getElementById("mute-toggle").addEventListener("change", (e) => {
    gameState.settings.muted = e.target.checked;
  });

  document
    .getElementById("reduced-motion-toggle")
    .addEventListener("change", (e) => {
      gameState.settings.reducedMotion = e.target.checked;
    });

  // 시작 화면에서 대기 — 난이도를 고르기 전까지는 게임을 시작하지 않는다.
  renderBestTimes();
});
