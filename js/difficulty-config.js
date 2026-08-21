// 난이도별 상수 정의.
// 세 난이도 모두 완전히 같은 하나의 규칙(인접 8칸 힌트 + 행/열 마진 힌트)을
// 쓰고, 난이도는 격자 크기·색 수·힌트 밀도·기회 네 상수만으로 조절한다.
// 데이터 기반 튜닝을 진행할 땐 이 파일의 값만 바꾸고,
// 전/후 10회씩 기록을 비교한 뒤 최종값을 확정한다.
const DIFFICULTY_CONFIG = {
  easy: {
    label: "쉬움",
    gridSize: 6,
    colors: ["red", "blue", "green"],
    chances: 5,
    clueDensity: 0.55,
  },
  medium: {
    label: "중급",
    gridSize: 9,
    colors: ["red", "blue", "green"],
    chances: 4,
    clueDensity: 0.45,
  },
  hard: {
    label: "고급",
    gridSize: 10,
    colors: ["red", "blue", "green"],
    chances: 3,
    clueDensity: 0.35,
  },
};

// 색상 이름 -> 실제 CSS 색상값
const COLOR_HEX = {
  red: "#ff5c5c",
  green: "#5cff8f",
  blue: "#5c8fff",
};
