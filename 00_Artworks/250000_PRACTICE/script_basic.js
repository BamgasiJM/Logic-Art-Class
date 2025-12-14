let points = [];
const POINT_COUNT = 1200;

function setup() {
  createCanvas(800, 800);
  background(20);
  stroke(255);
  strokeWeight(1);

  for (let i = 0; i < POINT_COUNT; i++) {
    let r = random(100, width * 0.5);
    let angle = random(TWO_PI);

    points.push({
      r: r,
      angle: angle,
      angularSpeed: random(0.001, 0.003),
      drift: 0,
      noiseOffset: random(1000),
    });
  }
}

function draw() {
  translate(width / 2, height / 2);

  // 잔상(trail)
  background(20, 20);

  for (let p of points) {
    // 회전
    p.angle += p.angularSpeed;

    // 붕괴 가속
    p.drift += 0.002;

    // 노이즈 기반 붕괴
    let n = noise(p.noiseOffset + frameCount * 0.01);
    let distortion = map(n, 0, 1, -1, 1) * p.drift * 200;

    let x = cos(p.angle) * (p.r + distortion);
    let y = sin(p.angle) * (p.r + distortion);

    point(x, y);
  }
}
