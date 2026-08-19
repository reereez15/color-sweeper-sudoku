const STORAGE_KEY = "colorSweeperSudoku.bestTimes";
const DEFAULT_BEST_TIMES = { easy: null, medium: null, hard: null };

// 저장값이 없거나, JSON이 깨졌거나, 키가 일부 빠져 있어도
// 항상 기본 구조로 안전하게 병합해서 반환한다. (카드4 통과 기준)
function loadBestTimes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BEST_TIMES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BEST_TIMES, ...parsed };
  } catch (err) {
    console.warn("저장값을 불러오지 못해 기본값으로 대체합니다.", err);
    return { ...DEFAULT_BEST_TIMES };
  }
}

function saveBestTimes(bestTimes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bestTimes));
    return true;
  } catch (err) {
    console.warn("저장에 실패했습니다.", err);
    return false;
  }
}

// 클리어 시 현재 기록이 최단 기록보다 빠르면 갱신한다.
function saveBestTimeIfNeeded() {
  const bestTimes = loadBestTimes();
  const key = gameState.difficulty;
  const current = gameState.elapsedSeconds;
  if (bestTimes[key] === null || current < bestTimes[key]) {
    bestTimes[key] = current;
    saveBestTimes(bestTimes);
  }
  renderBestTimes();
}
