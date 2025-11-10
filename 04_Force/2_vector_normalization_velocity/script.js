let pos, vel;

function setup() {
  createCanvas(800, 200);
  pos = createVector(100, 200);
  vel = createVector(2, -1);
}

function draw() {
  background(25);
  pos.add(vel);

  // 화면 밖으로 나가면 반전
  if (pos.x > width || pos.x < 0) vel.x *= -1;
  if (pos.y > height || pos.y < 0) vel.y *= -1;

  fill(10, 190, 180, 255);
  ellipse(pos.x, pos.y, 20, 20);

  // 속도 벡터 그리기
  stroke(10, 190, 180, 255);
  strokeWeight(3);
  line(pos.x, pos.y, pos.x + vel.x * 10, pos.y + vel.y * 10);
}
