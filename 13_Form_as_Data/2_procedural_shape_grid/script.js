// 예제 B: 데이터 그리드 → 기하 구조 생성
let cols = 20;
let rows = 20;
let grid = [];

function setup() {
  createCanvas(600, 600);
  noStroke();

  // 📌 데이터 생성 단계
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = noise(i * 0.2, j * 0.2); // 0 ~ 1 값
    }
  }
}

function draw() {
  background(10);

  // 📌 데이터 → 형태 시각화
  let cellW = width / cols;
  let cellH = height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let val = grid[i][j];

      // 데이터에 따른 색/크기 변화
      let size = cellW * val;

      fill(val * 255, 150, 255);
      ellipse(i * cellW + cellW / 2, j * cellH + cellH / 2, size, size);
    }
  }
}
