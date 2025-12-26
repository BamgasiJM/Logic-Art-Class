let numPoints = 300;

function setup() {
  createCanvas(800, 400);
  noFill();
  stroke(240, 200, 30);
}

function draw() {
  background(15);

  beginShape();
  for (let i = 0; i < numPoints; i++) {
    let x = map(i, 0, numPoints, 0, width);

    // 시간 기반 진동
    let t = frameCount * 0.02;
    let y = height / 2 + sin(i * 0.05 + t) * 120;

    vertex(x, y);
  }
  endShape();
}
