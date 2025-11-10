let center, mouse;

function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(25);
  center = createVector(width / 2, height / 2);
  mouse = createVector(mouseX, mouseY);
  let dir = p5.Vector.sub(mouse, center);

  // 벡터 그리기
  stroke(10, 180, 170);
  fill(0);
  translate(center.x, center.y);
  line(0, 0, dir.x, dir.y);

  // 끝에 화살표
  push();
  translate(dir.x, dir.y);
  rotate(dir.heading());
  let arrowSize = 20;
  translate(-arrowSize, 0);
  triangle(0, 2, 0, -2, arrowSize, 0);
  pop();

  noStroke();
  fill(255, 255, 255);
  text("벡터 길이: " + nf(dir.mag(), 1, 2), -50, -20);
}
