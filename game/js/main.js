document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", () => resetGame(btn.dataset.difficulty));
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

  renderBestTimes();
  resetGame("easy");
});
