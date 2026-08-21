// 저장소를 하나로 통일한다. "최단 기록"(보존 대상)과 "10판 기록"
// (튜닝 근거)을 따로 관리하지 않고, 판이 끝날 때마다 쌓이는 기록
// 하나에서 최단 기록을 계산해서 뽑아 쓴다.
const RECORDS_KEY = "colorSweeperSudoku.records";
const RECORDS_MAX = 300;

// 저장값이 없거나, JSON이 깨졌거나, 배열이 아니어도
// 항상 빈 배열로 안전하게 대체한다.
function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("기록을 불러오지 못해 빈 기록으로 대체합니다.", err);
    return [];
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch (err) {
    console.warn("기록 저장에 실패했습니다.", err);
    return false;
  }
}

// 판이 끝날 때(성공/실패 모두)마다 호출 — 손으로 받아 적을 필요 없이
// 10판씩 플레이만 하면 기록이 쌓인다. 이 기록 하나가 튜닝 근거와
// 재접속해도 보존할 최단 기록을 동시에 뒷받침한다.
function addRecord({ difficulty, result, elapsedSeconds, chancesUsed, tunedValue }) {
  const records = loadRecords();
  records.push({
    timestamp: new Date().toISOString(),
    difficulty,
    result, // "success" | "fail"
    elapsedSeconds,
    chancesUsed,
    tunedValue, // 기록 당시 적용돼있던 기회 값 — 튜닝 전/후 구분에 사용
  });

  const trimmed =
    records.length > RECORDS_MAX ? records.slice(records.length - RECORDS_MAX) : records;

  saveRecords(trimmed);
  renderBestTimes();
}

// 난이도별 최단 클리어 시간 — 저장된 기록 중 "성공"만 걸러서 계산한다.
// (새 판은 초기화되지만, 이 값은 기록이 남아있는 한 항상 다시 계산되어 보존된다)
function getBestTime(difficulty) {
  const successTimes = loadRecords()
    .filter((r) => r.difficulty === difficulty && r.result === "success")
    .map((r) => r.elapsedSeconds);
  return successTimes.length ? Math.min(...successTimes) : null;
}

// 브라우저 콘솔에서 exportRecords() 실행 시 CSV로 출력.
// 표로 복사해서 "변경 전/후 10회 기록" 증빙에 그대로 붙여넣을 수 있다.
function exportRecords() {
  const records = loadRecords();
  if (!records.length) {
    console.log("기록이 없습니다. 먼저 게임을 플레이해보세요.");
    return "";
  }

  const header = "timestamp,difficulty,result,elapsedSeconds,chancesUsed,tunedValue";
  const rows = records.map(
    (e) =>
      `${e.timestamp},${e.difficulty},${e.result},${e.elapsedSeconds},${e.chancesUsed},${e.tunedValue}`
  );
  const csv = [header, ...rows].join("\n");
  console.log(csv);
  console.table(records);
  return csv;
}

// 튜닝 테스트를 새로 시작할 때(예: 기회 3회 테스트 끝, 4회 테스트 시작 전)
// 기록을 초기화한다. 주의: 최단 기록도 이 기록에서 계산되므로 같이 사라진다.
function clearRecords() {
  localStorage.removeItem(RECORDS_KEY);
  console.log("기록을 초기화했습니다.");
  renderBestTimes();
}
