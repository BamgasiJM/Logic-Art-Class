let angle = 0;

// 반지름
let r = 300;
let baseR = 300;

// 각속도
let omega = 0.01;
let baseOmega = 0.01;

// 각운동량 상수 (r^2 * omega)
let angularMomentum;

function setup() {
  createCanvas(800, 800);
  angularMomentum = baseR * baseR * baseOmega;
}

function draw() {
  background(20);
  translate(width / 2, height / 2);

  // 마우스 입력에 따른 반지름 변화
  if (mouseIsPressed) {
    r -= 1.5;
    r = max(r, 35); // 중심으로 완전히 떨어지지 않도록 제한
  } else {
    r += 1.5;
    r = min(r, baseR);
  }

  // 각운동량 보존: r^2 * omega = constant
  omega = angularMomentum / (r * r);

  // 각도 업데이트
  angle += omega;

  // 별 위치 계산
  let x = cos(angle) * r;
  let y = sin(angle) * r;

  // 중심 (블랙홀)
  fill(100);
  noStroke();
  ellipse(0, 0, 40, 40);

  // 별
  fill(210);
  ellipse(x, y, 15, 15);
}
