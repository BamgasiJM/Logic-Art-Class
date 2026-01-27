const STAR_COUNT = 2500;

let stars = [];
let spacePressed = false;

class Star {
  constructor(initialAngle) {
    this.baseR = Math.random() * 670 + 130;
    this.r = this.baseR;

    this.baseOmega = Math.random() * 0.004 + 0.002;
    this.omega = this.baseOmega;

    // 회전을 위한 벡터
    this.cosAngle = Math.cos(initialAngle);
    this.sinAngle = Math.sin(initialAngle);

    this.size = Math.random() * 3 + 2;

    this.angularMomentum = this.r * this.r * this.omega;

    this.minR = 10;

    // 애니메이션 진행도 (0.0 ~ 1.0)
    this.progress = 0.0;

    // 애니메이션 속도 
    this.animSpeed = Math.random() * 0.003 + 0.002;
  }

  // ease-in-out 함수 (smoothstep)
  easeInOut(t) {
    return t * t * (3.0 - 2.0 * t);
  }

  update() {
    // progress 업데이트
    if (spacePressed) {
      this.progress += this.animSpeed;
      if (this.progress > 1.0) this.progress = 1.0;
    } else {
      this.progress -= this.animSpeed;
      if (this.progress < 0.0) this.progress = 0.0;
    }

    // ease-in-out 적용
    const easedProgress = this.easeInOut(this.progress);

    // 반지름 보간
    this.r = this.baseR - (this.baseR - this.minR) * easedProgress;

    // 각운동량 보존
    const rSquared = this.r * this.r;
    this.omega = this.angularMomentum / rSquared;

    // 증분 회전
    const cosOmega = Math.cos(this.omega);
    const sinOmega = Math.sin(this.omega);

    const newCos = this.cosAngle * cosOmega - this.sinAngle * sinOmega;
    const newSin = this.sinAngle * cosOmega + this.cosAngle * sinOmega;

    this.cosAngle = newCos;
    this.sinAngle = newSin;
  }

  draw() {
    const x = this.cosAngle * this.r;
    const y = this.sinAngle * this.r;

    noStroke();
    fill(0);
    ellipse(x, y, this.size, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  const twoPI = 6.28;

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * twoPI;
    stars.push(new Star(angle));
  }
}

function draw() {
  background(230);
  translate(width / 2, height / 2);

  noStroke();
  fill(0);
  ellipse(0, 0, 24, 24);

  for (let i = 0; i < STAR_COUNT; i++) {
    stars[i].update();
    stars[i].draw();
  }
}

function keyPressed() {
  if (key === " ") {
    spacePressed = true;
  }
}

function keyReleased() {
  if (key === " ") {
    spacePressed = false;
  }
}
