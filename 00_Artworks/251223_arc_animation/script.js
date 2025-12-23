const num = 20;
let step, theta;

function setup() {
  createCanvas(600, 600);
  strokeWeight(5);
  step = 22;
  theta = 0;
}

function draw() {
  background(20);
  translate(width / 2, height * 0.75);

  for (let i = 0; i < num; i++) {
    stroke(200);
    noFill();
    const size = i * step;
    const offSet = (TWO_PI / num) * i;
    // sin 값을 0.001~1 범위로 매핑하여 arcEnd가 항상 PI보다 크도록 설정
    const arcEnd = map(sin(theta + offSet), -1, 1, PI + 0.001, TWO_PI);
    arc(0, 0, size, size, PI, arcEnd);
  }
  resetMatrix();
  theta += 0.03;
}
