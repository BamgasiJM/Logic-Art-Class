let cols = 50;
let rows = 50;

let baseCircleSize = 3.0;

function setup() {
  createCanvas(1400, 1400);
  pixelDensity(2);
  noStroke();
}

function draw() {
  background(0);

  // 실제 시간 (초)
  let time = millis() * 0.001;

  // 좌표계를 중앙 기준으로 이동
  translate(width / 2, height / 2);

  let gridSize = width;
  let cellW = gridSize / cols;
  let cellH = gridSize / rows;

  fill(210);

  // 마우스 위치를 중앙 좌표계로 변환
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  // 마우스와 중심 거리
  let mouseDist = dist(mx, my, 0, 0);

  let maxDist = width * 0.5;

  // 에너지 값 (0 = 가장자리 / 1 = 중심)
  let energy = 1.0 - constrain(mouseDist / maxDist, 0, 1);

  /*
    energy를 사용해 전체 시스템 파라미터를 드라이브
  */

  // 파동 전파 속도
  let waveSpeed = lerp(0.6, 4.0, energy);

  // 링 간격 (공간 주파수)
  let spatialFreq = lerp(0.005, 0.02, energy);

  // 진폭
  let amplitude = lerp(2.0, 6.0, energy);

  // 감쇠 계수 (중심 접근 시 감소)
  let decay = lerp(0.007, 0.0001, energy);

  // 전체 그리드 맥동 속도 + 범위
  let gridSpeed = lerp(0.3, 2.0, energy);
  let gridAmount = lerp(0.98, 0.9, energy);

  // 그리드 스케일 적용
  let gridPulse = map(sin(time * gridSpeed), -1, 1, gridAmount, 1.0);
  scale(gridPulse);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let px = -gridSize / 2 + x * cellW + cellW / 2;
      let py = -gridSize / 2 + y * cellH + cellH / 2;

      // 중심 기준 거리
      let d = dist(px, py, 0, 0);

      /*
        sin + exp 기반 radial wave

        spatialFreq → 링 간격
        waveSpeed → 시간 진행
        decay → 에너지 감쇠
      */
      let wave =
        sin(d * spatialFreq * 1000 - time * waveSpeed) * exp(-d * decay);

      // 파동값을 크기로 변환
      let pulse = map(wave, -1, 1, 0.1, amplitude);

      let r = baseCircleSize * pulse;

      rectMode(CENTER);
      rect(px, py, r);
    }
  }
}
