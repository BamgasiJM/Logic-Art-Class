let cols = 50;
let rows = 50;

let baseCircleSize = 6.0;

function setup() {
  createCanvas(1400, 1400);
  pixelDensity(2);
  noStroke();
  noiseDetail(2, 0.1);
}

function draw() {
  background(0);

  let time = millis() * 0.001;

  translate(width / 2, height / 2);

  // 그리드 전체 맥동 (시간 기반)
  let gridPulse = map(sin(time), -1, 1, 0.95, 1.0);
  scale(gridPulse);

  let gridSize = width;
  let cellW = gridSize / cols;
  let cellH = gridSize / rows;

  fill(210);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let px = -gridSize / 2 + x * cellW + cellW / 2;
      let py = -gridSize / 2 + y * cellH + cellH / 2;

      // 중심 기준 거리
      let d = dist(px, py, 0, 0);

      // sin + exp 기반 방사형 파동
      // exp : 중심에서 멀어질 수록 진폭 감소
      let wave = sin(d * 0.01 - time * 2.0) * exp(-d * 0.005);

      // 노이즈를 크기로 변환
      let pulse = map(wave, 0, 1, 0.1, 4.0);

      let r = baseCircleSize * pulse;

      rectMode(CENTER);
      ellipse(px, py, r);
    }
  }
}