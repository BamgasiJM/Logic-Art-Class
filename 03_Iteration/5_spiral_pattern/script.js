function setup() {
  createCanvas(800, 400);
  angleMode(DEGREES);
  noLoop();
}

function draw() {
  background(25);
  translate(width / 2, height / 2);

  let n = 200;
  let baseRadius = 2;
  let angleStep = 10;

  for (let i = 0; i < n; i++) {
    let angle = i * angleStep;
    let radius = baseRadius + i * 1.8;
    let x = radius * cos(angle);
    let y = radius * sin(angle);

    // 색상: i 값에 따라 변화
    let brightness = map(i, 0, n, 50, 255);
    fill(brightness, 120, 200, 180);

    noStroke();
    ellipse(x, y, 15, 15);
  }
}
