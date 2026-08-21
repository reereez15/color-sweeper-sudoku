// 클리어 이펙트: 폭죽 애니메이션 (움직임 줄이기 시 정적 배너로 대체)
function triggerClearEffect() {
  if (!gameState.settings.reducedMotion) {
    playFireworksAnimation();
  } else {
    showStaticBanner("클리어!");
  }
  if (!gameState.settings.muted) {
    playSound("clear");
  }
}

// 실패 이펙트: 폭탄 이미지 + 화면 흔들림 (움직임 줄이기 시 흔들림 생략)
function triggerFailEffect() {
  if (!gameState.settings.reducedMotion) {
    screenShake();
    showBombImage({ animated: true });
  } else {
    showBombImage({ animated: false });
  }
  if (!gameState.settings.muted) {
    playSound("explosion");
  }
}

// 경고 이펙트: 기회 소모 시 — 완전 실패와 시각적으로 구분되는 약한 반응
function triggerWarningEffect(row, col) {
  flashCellBorder(row, col);
  if (!gameState.settings.muted) {
    playSound("warning");
  }
}

function playFireworksAnimation() {
  const board = document.getElementById("game-board");
  board.classList.add("effect-fireworks");
  setTimeout(() => board.classList.remove("effect-fireworks"), 1200);
}

function screenShake() {
  document.body.classList.add("effect-shake");
  setTimeout(() => document.body.classList.remove("effect-shake"), 400);
}

function showBombImage({ animated }) {
  const el = document.getElementById("bomb-overlay");
  el.classList.toggle("animated", animated);
  el.classList.add("visible");
}

function hideBombImage() {
  document.getElementById("bomb-overlay").classList.remove("visible");
}

function showStaticBanner(text) {
  const el = document.getElementById("status-banner");
  el.textContent = text;
  el.classList.add("visible");
  setTimeout(() => el.classList.remove("visible"), 1500);
}

function flashCellBorder(row, col) {
  const cellEl = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`
  );
  if (cellEl) {
    cellEl.classList.add("warning-flash");
    setTimeout(() => cellEl.classList.remove("warning-flash"), 300);
  }
}

function playSound(name) {
  // TODO: 실제 오디오 파일 연결. 지금은 콘솔 로그로 대체.
  console.log(`[sound] ${name}`);
}
