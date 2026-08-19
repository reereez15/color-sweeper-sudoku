function generateFullBoard(gridSize, colors) {
  const board = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      row.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    board.push(row);
  }
  return board;
}

function buildClueMask(gridSize, density) {
  const mask = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      row.push(Math.random() < density);
    }
    mask.push(row);
  }
  return mask;
}

// TODO(다음 단계 작업): 지금은 "공개된 힌트만으로 각 칸의 색을 하나로
// 좁힐 수 있는가"를 반복적으로 확인하는 간이 버전이다. 실제로는
// 색 후보를 인접 힌트와 대조해 모순을 제거하는 완전한 제약전파(constraint
// propagation) 로직이 필요하다 — 지금은 정답 색만 후보로 인정하는
// 자리표시자(isConsistentGuess)로 되어 있어 "유일해 보장"까지는 못 미친다.
function isSolvableByLogic(board, clueMask, gridSize, colors) {
  const resolved = clueMask.map((row) => row.slice());
  let changed = true;
  let rounds = 0;

  while (changed && rounds < gridSize * gridSize) {
    changed = false;
    rounds += 1;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (resolved[r][c]) continue;
        const candidates = colors.filter((color) =>
          isConsistentGuess(board, r, c, color)
        );
        if (candidates.length === 1) {
          resolved[r][c] = true;
          changed = true;
        }
      }
    }
  }

  return resolved.every((row) => row.every(Boolean));
}

function isConsistentGuess(board, row, col, colorGuess) {
  // 스캐폴딩 단계 자리표시자. 실제 CSP 검사로 교체 필요.
  return colorGuess === board[row][col];
}

function generateBoard(config) {
  const { gridSize, colors, clueDensity } = config;
  const board = generateFullBoard(gridSize, colors);
  let clueMask = buildClueMask(gridSize, clueDensity);

  let attempts = 0;
  while (
    !isSolvableByLogic(board, clueMask, gridSize, colors) &&
    attempts < 20
  ) {
    const nextDensity = Math.min(1, clueDensity + attempts * 0.05);
    clueMask = buildClueMask(gridSize, nextDensity);
    attempts += 1;
  }

  const hints = computeAllHints(board, gridSize);
  const margins = computeMarginSums(board, gridSize, colors);
  return { board, clueMask, hints, margins };
}
