let shapes = [];
const shapesNum = 5000;
let maxRadius;

function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(800, 800);

  maxRadius = min(width, height) * 0.3;

  for (let i = 0; i < shapesNum; i++) {
    shapes.push(new Shape(i));
  }

  background("#232323");
}

function draw() {
  // 잔상을 위해 매 프레임마다 배경 그림
  background("#2323231A");  // 뒤에서 두 자리는 알파값

  noStroke();
  fill(0);

  for (let i = 0; i < shapes.length; i++) {
    shapes[i].move();
    shapes[i].display();
  }
}

class Shape {
  constructor(i) {
    // 각 도형의 고유한 시간/위상 값으로 사용됨
    this.i = i * 0.01;

    // 반지름 배율
    this.radiusMultiplier = 0;

    // 각도
    this.angle = 0;

    // currentRadius
    this.currentRadius = i % maxRadius;
  }

  move() {
    // 현재 반지름을 점점 키움
    this.currentRadius += 1;
    // 최대 반지름에 도달하면 다시 0으로 리셋
    if (this.currentRadius > maxRadius) {
      this.currentRadius = 0;
    }
  }

  display() {
    // 고유한 i 값을 이용해 복잡한 반지름 배율 계산
    this.radiusMultiplier = (cos(this.i * 3) - cos(this.i * 6) + 9) * 0.45;

    // 고유한 i 값을 이용해 각도 계산
    this.angle = this.i / 2 + (sin(this.i * 3) - sin(this.i * 6)) / 3;

    // 각도와 시간(frameCount)에 따라 색상이 변하게 함
    fill(200 * sin(this.angle * 10 + frameCount * 0.1), 120, 100);

    // 극좌표계를 이용해 원의 위치 계산 및 그리기
    circle(
      this.currentRadius * this.radiusMultiplier * cos(this.angle) + width / 2,
      this.currentRadius * this.radiusMultiplier * sin(this.angle) + height / 2,
      // 원의 크기도 현재 반지름과 고유 값에 따라 변하게 함
      this.currentRadius * 0.2 * sin(this.i * 11)
    );
  }
}