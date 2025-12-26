let path = [];

function setup() {
  createCanvas(800, 500);
  stroke(255);
  noFill();
}

function draw() {
  background(25);

  // 사용자가 그린 경로 시각화
  beginShape();
  for (let p of path) {
    vertex(p.x, p.y);
  }
  endShape();

  // 드로잉 기반 "반응형 원"
  if (path.length > 2) {
    let last = path[path.length - 1];
    let prev = path[path.length - 2];

    let dx = last.x - prev.x;
    let dy = last.y - prev.y;
    let speed = sqrt(dx * dx + dy * dy);

    let size = map(speed, 0, 50, 10, 80);

    fill(180, 120, 255);
    noStroke();
    circle(last.x, last.y, size);
  }
}

function mouseDragged() {
  path.push(createVector(mouseX, mouseY));
}
