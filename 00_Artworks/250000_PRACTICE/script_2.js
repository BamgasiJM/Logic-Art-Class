let points = [];
const POINT_COUNT = 8000;

let baseColor, fastColor;
let state = "collapse";
let resetFrame = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  background(10);
  strokeWeight(2);

  baseColor = color(255, 80, 40); 
  fastColor = color(245, 200, 100); 

  for (let i = 0; i < POINT_COUNT; i++) {
    let r0 = random(80, width * 0.45);

    points.push({
      r0: r0,
      r: r0,
      angle: random(TWO_PI),
      angularSpeed: random(0.005, 0.01),
      collapse: random(0.0005, 0.0015),

      // 폭발용
      burstSpeed: 0,
      noiseOffset: random(1000),
    });
  }
}

function draw() {
  translate(width / 2, height / 2);
  background(10, 25);

  for (let p of points) {
    if (state === "explode") {
      // 중심에서 바깥으로 튕김
      p.burstSpeed *= 0.92; // 감쇠
      p.r += p.burstSpeed;

      // 폭발 종료 조건
      if (frameCount - resetFrame > 40) {
        state = "collapse";
      }
    } else {
      // 붕괴 상태
      p.angularSpeed *= 1.0015;
      p.r *= 1 - p.collapse;
    }

    // 회전은 항상 유지
    p.angle += p.angularSpeed;

    // 붕괴 노이즈
    let n = noise(p.noiseOffset + frameCount * 0.01);
    let distortion = map(n, 0, 1, -1, 1) * p.angularSpeed * 800;

    let x = cos(p.angle) * (p.r + distortion);
    let y = sin(p.angle) * (p.r + distortion);

    // 속도 기반 색상
    let speedEnergy = abs(p.burstSpeed) + p.angularSpeed * 20;
    let speedNorm = constrain(map(speedEnergy, 0, 2, 0, 1), 0, 1);

    let c = lerpColor(baseColor, fastColor, speedNorm);
    stroke(c);
    point(x, y);
  }
}

function keyPressed() {
  if (key === " ") {
    state = "explode";
    resetFrame = frameCount;

    for (let p of points) {
      // 중심에서 바깥 방향으로 폭발
      p.burstSpeed = random(10, 30);
      p.angularSpeed = random(0.002, 0.01);
    }
  }
}
