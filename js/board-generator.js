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

// // TODO(다음 단계 작업): 지금은 "공개된 힌트만으로 각 칸의 색을 하나로
// // 좁힐 수 있는가"를 반복적으로 확인하는 간이 버전이다. 실제로는
// // 색 후보를 인접 힌트와 대조해 모순을 제거하는 완전한 제약전파(constraint
// // propagation) 로직이 필요하다 — 지금은 정답 색만 후보로 인정하는
// // 자리표시자(isConsistentGuess)로 되어 있어 "유일해 보장"까지는 못 미친다.
// function isSolvableByLogic(board, clueMask, gridSize, colors) {
//   const resolved = clueMask.map((row) => row.slice());
//   let changed = true;
//   let rounds = 0;

//   while (changed && rounds < gridSize * gridSize) {
//     changed = false;
//     rounds += 1;
//     for (let r = 0; r < gridSize; r++) {
//       for (let c = 0; c < gridSize; c++) {
//         if (resolved[r][c]) continue;
//         const candidates = colors.filter((color) =>
//           isConsistentGuess(board, r, c, color)
//         );
//         if (candidates.length === 1) {
//           resolved[r][c] = true;
//           changed = true;
//         }
//       }
//     }
//   }

//   return resolved.every((row) => row.every(Boolean));
// }

// function isConsistentGuess(board, row, col, colorGuess) {
//   // 스캐폴딩 단계 자리표시자. 실제 CSP 검사로 교체 필요.
//   return colorGuess === board[row][col];
// }

// function generateBoard(config) {
//   const { gridSize, colors, clueDensity } = config;
//   const board = generateFullBoard(gridSize, colors);
//   let clueMask = buildClueMask(gridSize, clueDensity);

//   let attempts = 0;
//   while (
//     !isSolvableByLogic(board, clueMask, gridSize, colors) &&
//     attempts < 20
//   ) {
//     const nextDensity = Math.min(1, clueDensity + attempts * 0.05);
//     clueMask = buildClueMask(gridSize, nextDensity);
//     attempts += 1;
//   }

//   const hints = computeAllHints(board, gridSize);
//   const margins = computeMarginSums(board, gridSize, colors);
//   return { board, clueMask, hints, margins };
// }
/**
 * 공개된 힌트 칸과 마진 정보만으로 퍼즐이 유일하게 풀리는지 검증합니다.
 */
function isSolvableByLogic(board, clueMask, gridSize, colors) {
  const hints = computeAllHints(board, gridSize);
  const margins = computeMarginSums(board, gridSize, colors);

  // 1. 후보군 Grid 초기화 (확정 칸은 해당 색상만, 미확정 칸은 모든 색상)
  const candidateGrid = Array.from({ length: gridSize }, (_, r) =>
    Array.from({ length: gridSize }, (_, c) => {
      if (clueMask[r][c]) {
        return new Set([board[r][c]]);
      }
      return new Set(colors);
    })
  );

  let changed = true;
  let rounds = 0;
  const maxRounds = gridSize * gridSize * colors.length;

  while (changed && rounds < maxRounds) {
    changed = false;
    rounds += 1;

    // --- 제약 1: 행/열 마진(카운트) 제약 전파 ---
    for (const color of colors) {
      // 행 검사
      for (let r = 0; r < gridSize; r++) {
        const target = margins.rowColorCounts[r][color];
        let definite = 0;
        let possible = 0;
        for (let c = 0; c < gridSize; c++) {
          if (candidateGrid[r][c].size === 1 && candidateGrid[r][c].has(color)) definite++;
          if (candidateGrid[r][c].has(color)) possible++;
        }

        // [소거 규칙 1-A] 이미 확정된 색 개수가 마진에 도달했으면, 다른 칸에서 해당 색상 제거
        if (definite === target) {
          for (let c = 0; c < gridSize; c++) {
            if (candidateGrid[r][c].size > 1 && candidateGrid[r][c].has(color)) {
              candidateGrid[r][c].delete(color);
              changed = true;
            }
          }
        }

        // [소거 규칙 1-B] 후보로 가능한 칸 수 자체가 마진과 같다면, 해당 칸들은 모두 그 색으로 확정
        if (possible === target) {
          for (let c = 0; c < gridSize; c++) {
            if (candidateGrid[r][c].has(color) && candidateGrid[r][c].size > 1) {
              candidateGrid[r][c] = new Set([color]);
              changed = true;
            }
          }
        }
      }

      // 열 검사
      for (let c = 0; c < gridSize; c++) {
        const target = margins.colColorCounts[c][color];
        let definite = 0;
        let possible = 0;
        for (let r = 0; r < gridSize; r++) {
          if (candidateGrid[r][c].size === 1 && candidateGrid[r][c].has(color)) definite++;
          if (candidateGrid[r][c].has(color)) possible++;
        }

        if (definite === target) {
          for (let r = 0; r < gridSize; r++) {
            if (candidateGrid[r][c].size > 1 && candidateGrid[r][c].has(color)) {
              candidateGrid[r][c].delete(color);
              changed = true;
            }
          }
        }

        if (possible === target) {
          for (let r = 0; r < gridSize; r++) {
            if (candidateGrid[r][c].has(color) && candidateGrid[r][c].size > 1) {
              candidateGrid[r][c] = new Set([color]);
              changed = true;
            }
          }
        }
      }
    }

    // --- 제약 2: 공개된 힌트 칸의 인접 8칸 카운트 제약 전파 ---
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // 공개된 힌트 칸인 경우에만 인접 조건 적용
        if (!clueMask[r][c]) continue;

        const clueColor = board[r][c];
        const targetCount = hints[r][c];
        const neighbors = getNeighbors(r, c, gridSize);

        let definite = 0;
        let possible = 0;

        for (const [nr, nc] of neighbors) {
          if (candidateGrid[nr][nc].size === 1 && candidateGrid[nr][nc].has(clueColor)) {
            definite++;
          }
          if (candidateGrid[nr][nc].has(clueColor)) {
            possible++;
          }
        }

        // [소거 규칙 2-A] 인접한 타일 중 확정된 개수가 힌트 숫자와 일치하면 나머지 인접 칸에서 해당 색상 제거
        if (definite === targetCount) {
          for (const [nr, nc] of neighbors) {
            if (candidateGrid[nr][nc].size > 1 && candidateGrid[nr][nc].has(clueColor)) {
              candidateGrid[nr][nc].delete(clueColor);
              changed = true;
            }
          }
        }

        // [소거 규칙 2-B] 후보로 가능한 타일 수가 힌트 숫자와 정확히 같으면 해당 칸들을 모두 그 색으로 확정
        if (possible === targetCount) {
          for (const [nr, nc] of neighbors) {
            if (candidateGrid[nr][nc].has(clueColor) && candidateGrid[nr][nc].size > 1) {
              candidateGrid[nr][nc] = new Set([clueColor]);
              changed = true;
            }
          }
        }
      }
    }
  }

  // 모든 칸이 정확히 1개(단일 색)로 축약되었는지 확인
  return candidateGrid.every((row) =>
    row.every((candidates) => candidates.size === 1)
  );
}

/**
 * 난이도별 목표 힌트 개수에 맞춰 역소거 방식으로 항상 풀리는 판을 생성합니다.
 */
function generateBoard(config) {
  const { gridSize, colors, clueDensity } = config;
  const board = generateFullBoard(gridSize, colors);
  const targetClues = Math.round(gridSize * gridSize * clueDensity);

  // 1. 모든 칸을 연 상태로 시작
  let clueMask = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => true)
  );
  let currentClues = gridSize * gridSize;

  // 2. 무작위 순서로 타일 목록 섞기
  const cells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      cells.push([r, c]);
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  // 3. 타일을 하나씩 지워보며 논리적 추론 가능성 검증 (Digging Holes)
  for (const [r, c] of cells) {
    if (currentClues <= targetClues) break;

    clueMask[r][c] = false;

    // 가렸을 때 논리적으로 유일하게 복원 가능한지 확인
    if (isSolvableByLogic(board, clueMask, gridSize, colors)) {
      currentClues--;
    } else {
      // 복원 불가능(추측 필요)하면 다시 열어둠
      clueMask[r][c] = true;
    }
  }

  const hints = computeAllHints(board, gridSize);
  const margins = computeMarginSums(board, gridSize, colors);
  return { board, clueMask, hints, margins };
}
