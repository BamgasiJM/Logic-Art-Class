// 예제 C: 파라미터 기반 절차적 다각형
let sides = 7; // 변 개수 (데이터)
let radius = 200; // 반지름
let rotationSpeed = 0.01;

function setup() {
  createCanvas(600, 600);
  angleMode(RADIANS);
}

function draw() {
  background(30);
  translate(width / 2, height / 2);

  rotate(frameCount * rotationSpeed);

  stroke(255);
  noFill();
  strokeWeight(2);

  beginShape();
  for (let i = 0; i < sides; i++) {
    let angle = TWO_PI * (i / sides);
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
}
