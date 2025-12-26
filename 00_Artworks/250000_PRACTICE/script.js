// 비틀림 효과를 추가한 Spirograph 클래스
class Spirograph {
  constructor(R, r, d, color, speed, wobbleSpeed, wobbleRadius) {
    // R: 바깥쪽 고정 원의 반지름
    this.R = R;
    // r: 안쪽 움직이는 원의 반지름
    this.r = r;
    // d: 펜이 안쪽 원의 중심으로부터 떨어진 거리
    this.d = d;
    this.color = color;
    this.speed = speed;

    // 비틀림(Wobble)을 위한 새로운 변수들
    // p5.js의 전역 함수인 random과 TWO_PI를 사용합니다.
    this.wobbleAngle = random(TWO_PI);
    this.wobbleSpeed = wobbleSpeed;
    this.wobbleRadius = wobbleRadius;

    // 그림을 그리기 위한 변수들
    this.angle = 0;
    this.points = [];

    // 바깥쪽 원의 중심 (setup에서 width/height가 결정된 후 사용 가능)
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  // 현재 각도에 따라 펜의 x, y 좌표를 계산하는 함수 (비틀림 적용)
  getPoint(angle) {
    // 1. 기본 스파이로그래프 점 계산
    // (R - r) * cos(t)
    let x = (this.R - this.r) * cos(angle);
    let y = (this.R - this.r) * sin(angle);

    // 2. 비틀림을 위한 작은 원의 중심 계산
    let wobbleX = this.wobbleRadius * cos(this.wobbleAngle);
    let wobbleY = this.wobbleRadius * sin(this.wobbleAngle);

    // 3. 펜의 최종 위치 계산
    // R/r 비율에 따라 펜이 돌아가는 각도: ((this.R - this.r) / this.r) * angle
    let penAngle = (this.R / this.r - 1) * angle;

    let penX = x + this.d * cos(penAngle);
    let penY = y - this.d * sin(penAngle);

    // 최종 좌표는 비틀린 중심을 기준으로 합니다.
    // createVector도 p5.js 전역 함수입니다.
    return createVector(
      this.centerX + penX + wobbleX,
      this.centerY + penY + wobbleY
    );
  }

  // 한 프레임 동안 스파이로그래프를 그리는 함수
  draw() {
    // 각도를 설정된 속도만큼 증가시킴
    this.angle += this.speed;
    // 비틀림 각도도 독립적으로 증가시킴
    this.wobbleAngle += this.wobbleSpeed;

    // 현재 각도에 해당하는 점을 계산하여 배열에 추가
    const p = this.getPoint(this.angle);
    this.points.push(p);

    // 점들을 순서대로 선으로 연결하여 그리기
    stroke(this.color);
    strokeWeight(1);
    noFill();
    beginShape();
    for (let p of this.points) {
      vertex(p.x, p.y);
    }
    endShape();
  }
}

// 스파이로그래프 객체들을 저장할 배열
let spirographs = [];

function setup() {
  createCanvas(800, 800);
  background(20, 10, 40); // 시작할 때 배경을 한번만 칠합니다.

  // 최초 실행 시 바로 새 스파이로그래프 하나를 추가합니다.
  addNewSpirograph();
  frameRate(240);
}

function draw() {
  // 매 프레임마다 배경을 약간 덮어서 잔상 효과(드립)를 만듭니다.
  // 잔상 효과를 원치 않으면 이 두 줄을 주석 처리하세요.
  fill(20, 10, 40); // 배경색과 투명도 조절
  noStroke();
  rect(0, 0, width, height);

  // 모든 스파이로그래프 그리기
  for (let spiro of spirographs) {
    spiro.draw();
  }

  // 스파이로그래프 개수 제한 로직
  // 50개 이상이 되면 가장 오래된 것을 제거하여 메모리를 관리하고 성능 저하를 방지합니다.
  if (spirographs.length > 50) {
    spirographs.shift(); // 배열의 첫 번째 요소 (가장 오래된 것) 제거
  }
}

// 스파이로그래프를 추가하는 함수
function addNewSpirograph() {
  // ArtBlocks 작품에서 영감을 받은 색상과 형태
  const colors = [
    color(120, 70, 200, 180),
    color(80, 120, 220, 150),
    color(180, 100, 150, 160),
    color(100, 180, 200, 140),
    color(220, 150, 100, 170),
    color(150, 220, 100, 150),
  ];

  // 무작위로 매개변수를 선택하여 새로운 스파이로그래프 생성
  const R = random(150, 300);
  const r = random(30, 80);
  const d = random(r * 0.5, r * 1.5);
  
  const colorIndex = floor(random(colors.length));
  const selectedColor = colors[colorIndex];

  const speed = random(0.005, 0.02);
  const wobbleSpeed = random(-0.05, 0.05);
  const wobbleRadius = random(5, 20);

  spirographs.push(
    new Spirograph(R, r, d, selectedColor, speed, wobbleSpeed, wobbleRadius)
  );
}

// 1초에 한 번씩 새로운 스파이로그래프를 추가 (setInterval은 p5.js 밖에서 작동)
setInterval(addNewSpirograph, 1000);

// 마우스를 클릭할 때마다 새로운 스파이로그래프 추가
function mousePressed() {
  addNewSpirograph();
}
