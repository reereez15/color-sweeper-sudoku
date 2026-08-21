function getNeighbors(row, col, gridSize) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

// 인접 8칸 중 특정 색의 개수 (지뢰찾기식 힌트)
function countColorNeighbors(board, row, col, color, gridSize) {
  return getNeighbors(row, col, gridSize).filter(
    ([r, c]) => board[r][c] === color
  ).length;
}

// 보드 전체의 인접 힌트를 미리 계산해둔다.
function computeAllHints(board, gridSize) {
  const hints = [];
  for (let r = 0; r < gridSize; r++) {
    hints.push([]);
    for (let c = 0; c < gridSize; c++) {
      const color = board[r][c];
      hints[r].push(countColorNeighbors(board, r, c, color, gridSize));
    }
  }
  return hints;
}

// 행/열별 색 총합(스도쿠식 마진 힌트). 진행 상황과 무관하게 항상 공개되는
// 구조적 제약이라, 인접 힌트만으로 막히는 지점에서 소거법을 쓸 수 있게 해준다.
function computeMarginSums(board, gridSize, colors) {
  const rowColorCounts = [];
  const colColorCounts = [];

  for (let r = 0; r < gridSize; r++) {
    const cc = {};
    colors.forEach((color) => (cc[color] = 0));
    for (let c = 0; c < gridSize; c++) {
      cc[board[r][c]] += 1;
    }
    rowColorCounts.push(cc);
  }

  for (let c = 0; c < gridSize; c++) {
    const cc = {};
    colors.forEach((color) => (cc[color] = 0));
    for (let r = 0; r < gridSize; r++) {
      cc[board[r][c]] += 1;
    }
    colColorCounts.push(cc);
  }

  return { rowColorCounts, colColorCounts };
}
