// ====== 전역 변수 설정 ======
let grid; // 셀 상태를 저장할 2차원 배열
let cols;
let rows;
let resolution = 8; // 셀 하나의 크기 (픽셀)
let currentRow = 0; // 현재 패턴을 계산하고 있는 행
let rule = 90; // 사용할 1차원 CA 규칙 번호 (Rule 90)
let ruleset; // 규칙 번호에 해당하는 8비트 규칙 배열

function setup() {
  // 캔버스 생성 및 기본 설정
  createCanvas(800, 800);

  // 셀의 개수 계산
  cols = floor(width / resolution);
  rows = floor(height / resolution);

  // 초기 격자를 모두 '죽은 상태(0)'로 초기화
  grid = initializeEmptyGrid(cols, rows);

  // 초기 시드 (Seed) 설정: 가장 윗줄 중앙 셀만 '살아있는 상태(1)'로 시작
  grid[floor(cols / 2)][0] = 1;

  // 규칙 번호를 8비트 배열로 변환
  ruleset = decimalToBinaryArray(rule);

  // 배경은 검은색으로 설정
  background(0);
}

function draw() {
  // 현재 행을 그립니다.
  drawRow(currentRow);

  // 다음 행을 계산합니다.
  if (currentRow < rows - 1) {
    computeNextRow(currentRow);
    currentRow++;
  } else {
    // 모든 행을 다 채우면 멈춥니다.
    noLoop();
    console.log("패턴 생성이 완료되었습니다.");
  }
}

// ====== 유틸리티 함수 ======

/**
 * 빈 2차원 배열(모든 값 0)을 생성합니다.
 */
function initializeEmptyGrid(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows).fill(0);
  }
  return arr;
}

/**
 * 규칙 번호 (Decimal)를 8비트 배열 (Binary)로 변환합니다.
 * 예: Rule 90 -> [0, 1, 0, 1, 1, 0, 1, 0]
 */
function decimalToBinaryArray(decimal) {
  // 10진수를 8자리 2진수 문자열로 변환하고 배열로 만듭니다.
  let binaryString = decimal.toString(2).padStart(8, "0");
  // 배열을 뒤집는 이유: 1차원 CA 규칙은 보통 우측 비트(인덱스 0)부터 중요도가 낮음
  // 컨텍스트: [111, 110, 101, 100, 011, 010, 001, 000] 에 대응
  return Array.from(binaryString).reverse().map(Number);
}

/**
 * 현재 행의 셀 상태를 기반으로 다음 행의 상태를 계산합니다.
 * 규칙: 현재 셀의 상태는 바로 위 3개 이웃 (왼쪽 위, 위, 오른쪽 위)에 의해 결정됩니다.
 */
function computeNextRow(y) {
  let nextY = y + 1;
  // 각 열을 순회하며 새로운 행의 상태를 결정
  for (let x = 1; x < cols - 1; x++) {
    // 1. 위쪽 3개의 이웃 상태를 가져옵니다.
    // 경계 조건 처리를 위해 (x=0, x=cols-1) 열은 무시합니다.
    let left = grid[x - 1][y]; // 왼쪽 위
    let center = grid[x][y]; // 바로 위
    let right = grid[x + 1][y]; // 오른쪽 위

    // 2. 3비트 패턴을 10진수 인덱스로 변환합니다.
    // 예: [1, 0, 1] -> 1*2^2 + 0*2^1 + 1*2^0 = 5
    let index = left * 4 + center * 2 + right * 1;

    // 3. 규칙 배열(ruleset)에서 해당 인덱스의 값을 가져와 다음 상태로 설정합니다.
    // ruleset[index]는 0 또는 1 (다음 세대의 상태)
    grid[x][nextY] = ruleset[index];
  }
}

/**
 * 현재 행의 셀 상태를 캔버스에 그립니다.
 */
function drawRow(y) {
  for (let x = 0; x < cols; x++) {
    let cellState = grid[x][y];
    let drawX = x * resolution;
    let drawY = y * resolution;

    if (cellState == 1) {
      // 생존한 셀 (Alive): 흰색
      fill(70, 200, 180);
      noStroke();
      rect(drawX, drawY, resolution, resolution);
    }
    // 죽은 셀 (0): 그리지 않음 (배경색 유지)
  }
}
