const STAR_COUNT = 2500;

let stars = [];

class Star {
  constructor(initialAngle) {
    // 각 별마다 다른 기본 궤도 반경
    this.baseR = random(130, 800);
    this.r = this.baseR;

    // 각 별마다 다른 초기 각속도
    this.baseOmega = random(0.002, 0.006);
    this.omega = this.baseOmega;

    // 회전 상태
    this.angle = initialAngle;

    // 시각적 크기 (질량과 분리)
    this.size = random(2, 5);

    // 각운동량 상수 (m 제거된 형태)
    this.angularMomentum = this.r * this.r * this.omega;

    // 최소 접근 반지름 (사건의 지평선 느낌)
    this.minR = 10;
  }

  update() {
    // 마우스 입력에 따른 반지름 변화
    if (mouseIsPressed) {
      this.r -= random(1.5, 2.5);
      this.r = max(this.r, this.minR);
    } else {
      this.r += random(1.5, 5.5);
      this.r = min(this.r, this.baseR);
    }

    // 각운동량 보존
    this.omega = this.angularMomentum / (this.r * this.r);

    // 각도 업데이트
    this.angle += this.omega;
  }

  draw() {
    let x = cos(this.angle) * this.r;
    let y = sin(this.angle) * this.r;

    noStroke();
    fill(0);
    ellipse(x, y, this.size, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 실행마다 다른 결과를 원할 경우 seed 고정하지 않음
  for (let i = 0; i < STAR_COUNT; i++) {
    let angle = random(TWO_PI);
    stars.push(new Star(angle));
  }
}

function draw() {
  background(230);
  translate(width / 2, height / 2);

  // 중심 블랙홀
  noStroke();
  fill(0);
  ellipse(0, 0, 24, 24);

  // 별 업데이트 및 렌더링
  for (let star of stars) {
    star.update();
    star.draw();
  }
}
