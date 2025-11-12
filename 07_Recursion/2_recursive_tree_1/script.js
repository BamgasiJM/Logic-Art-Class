function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
  noLoop();
}

function draw() {
  background(15);
  translate(width / 2, height);
  stroke(80, 150, 100);
  strokeWeight(2);
  drawBranch(140, 10);
}

function drawBranch(len, depth) {
  // base
  line(0, 0, 0, -len);
  translate(0, -len);

  if (depth <= 0) {
    // 잎
    noStroke();
    fill(200, 200, 200);
    ellipse(0, 0, 5, 5);
    stroke(20);
    return;
  }

  // 왼쪽 가지
  push();
  rotate(-20 - depth * 1.5);
  drawBranch(len * 0.7, depth - 1);
  pop();

  // 오른쪽 가지
  push();
  rotate(20 + depth * 1.5);
  drawBranch(len * 0.7, depth - 1);
  pop();

  // 중앙 가지 : 0 대신 다른 값을 넣으면 살짝 방향 전환
  push();
  rotate(map(sin(depth * 2), 0, 0, -5, 5));
  drawBranch(len * 0.66, depth - 1);
  pop();

  // 돌아오기
  translate(0, len);
}
