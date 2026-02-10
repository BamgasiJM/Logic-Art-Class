let cols = 50;
let rows = 50;

let baseCircleSize = 10;

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

      // 방사형 + 시간 결합 Perlin
      let noise = noise(d * 0.1, time * 0.5);

      // 노이즈를 크기로 변환
      let pulse = map(noise, 0, 1, 0.1, 5.0);

      let r = baseCircleSize * pulse;
      rectMode(CENTER);
      rect(px, py, r);
    }
  }
}
