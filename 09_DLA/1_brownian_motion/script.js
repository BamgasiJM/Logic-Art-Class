let walkers = [];

function setup() {
  createCanvas(800, 400);
  for (let i = 0; i < 400; i++) {
    walkers.push(createVector(width / 2, height / 2));
  }
  background(15);
  stroke(30, 240, 210, 20);
}

function draw() {
  for (let w of walkers) {
    point(w.x, w.y);
    w.x += random(-2, 2);
    w.y += random(-2, 2);

    // 경계 처리: 캔버스 안에 가두기 (Constrain)
    w.x = constrain(w.x, 0, width);
    w.y = constrain(w.y, 0, height);
  }
}
