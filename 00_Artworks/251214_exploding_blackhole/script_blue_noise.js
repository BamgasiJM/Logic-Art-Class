let points = [];
const POINT_COUNT = 4000;

let baseColor;
let whiteColor;
let state = "normal";
let resetFrame = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  background(20);
    strokeWeight(2);

  baseColor = color(80, 140, 255); // 파랑
  whiteColor = color(255);

  let maxR = min(width, height) * 0.5;

  for (let i = 0; i < POINT_COUNT; i++) {
    let r = random(100, maxR);
    let angle = random(TWO_PI);

    points.push({
      r: r,
      r0: r,
      angle: angle,
      angularSpeed: random(0.005, 0.008),
      drift: 0,
      noiseOffset: random(1000),
      burstSpeed: 0,
    });
  }
}

function draw() {
  translate(width / 2, height / 2);
  background(20, 20);

  for (let p of points) {
    if (state === "explode") {
      // 중심에서 방사형 폭발
      p.burstSpeed *= 0.9;
      p.r += p.burstSpeed;

      if (frameCount - resetFrame > 40) {
        state = "normal";
      }
    } else {
      // 정상 붕괴 상태
      p.angle += p.angularSpeed;
      p.drift += 0.002;
    }

    // 노이즈 흔들림 유지
    let n = noise(p.noiseOffset + frameCount * 0.01);
    let distortion = map(n, 0, 1, -1, 1) * p.drift * 220;

    let x = cos(p.angle) * (p.r + distortion);
    let y = sin(p.angle) * (p.r + distortion);

    // 노이즈 강도 → 색상
    let noiseEnergy = constrain(p.drift * 0.6, 0, 1);
    let c = lerpColor(baseColor, whiteColor, noiseEnergy);

    stroke(c);
    point(x, y);
  }
}

function keyPressed() {
  if (key === " ") {
    state = "explode";
    resetFrame = frameCount;

    for (let p of points) {
      // ❗ 누적 폭발
      p.burstSpeed += random(8, 18);

      // 노이즈는 리셋
      p.drift = 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
