let points = [];
let amplitude = 100; // 파동 높이
let detail = 300; // 포인트 개수

function setup() {
  createCanvas(800, 400);
  noFill();
  stroke(255);

  // 📌 데이터 생성 단계
  for (let i = 0; i < detail; i++) {
    let x = map(i, 0, detail, 0, width);
    let y = height / 2 + sin(i * 0.05) * amplitude;
    points.push({ x, y });
  }
}

function draw() {
  background(20);

  // 📌 데이터 → 형태 시각화
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape();
}
