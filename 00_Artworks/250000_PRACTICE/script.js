// 전역 변수
let lines = [];
const NUM_LINES = 24;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 360, 100, 100, 1);
  // LineSegment 인스턴스 생성
  for (let i = 0; i < NUM_LINES; i++) {
    lines.push(new LineSegment(i, NUM_LINES));
  }
}

function draw() {
  // 트레일 효과
  fill(0, 0, 0, 0.02);
  noStroke();
  rect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const mx = mouseX;
  const my = mouseY;

  // 모든 선 업데이트 & 렌더
  for (let line of lines) {
    line.update(cx, cy, mx, my, frameCount);
    line.display(cx, cy);
  }

  // 마우스 피드백 (작은 고리)
  if (dist(mx, my, cx, cy) < 250) {
    noFill();
    stroke(360, 0, 100, 0.7);
    strokeWeight(1.5);
    ellipse(mx, my, 14, 14);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// LineSegment 클래스 정의
class LineSegment {
  constructor(index, total) {
    this.index = index;
    this.angle = (TWO_PI * index) / total; // 원형 배치
    this.len = 0;
    this.targetLen = random(100, 350);
    this.hue = (index * (360 / total)) % 360;
    this.baseAngle = this.angle; // 원래 각도 (마우스 영향 계산용 기준)
  }

  update(cx, cy, mx, my, frameCount) {
    const dx = mx - cx;
    const dy = my - cy;
    const mouseDist = dist(mx, my, cx, cy);
    const mouseAngle = atan2(dy, dx);
    const dMax = 250;

    // 마우스 근접도 (0~1)
    const influence = constrain(map(mouseDist, 0, dMax, 1, 0), 0, 1);

    // 이 선과 마우스 각도의 차이 → 비슷한 방향일수록 영향 ↑
    let angleDiff = abs(((this.baseAngle - mouseAngle + PI) % TWO_PI) - PI);
    const proximity = map(angleDiff, 0, PI, 1, 0);

    // 길이 목표 갱신 + 부드럽게 보간
    this.targetLen = map(influence * proximity, 0, 1, 120, 450);
    this.len = lerp(this.len, this.targetLen, 0.12);

    // 색상 계산
    this.h = (this.hue + influence * 150) % 360;
    this.s = map(influence, 0, 1, 60, 100);
    this.b = map(influence, 0, 1, 40, 95);
    this.a = map(influence * proximity, 0, 1, 0.3, 0.95);
    this.weight = map(influence * proximity, 0, 1, 1.5, 8);

    // 회전값 (sin cos 혼합)
    this.angle =
      this.baseAngle + sin(frameCount * 0.06 + this.index * 0.2) * 0.2 + cos(frameCount * 0.03) * 0.3;
  }

  display(cx, cy) {
    push();
    translate(cx, cy);
    rotate(this.angle);

    // 선
    stroke(this.h, this.s, this.b, this.a);
    strokeWeight(this.weight);
    line(0, 0, this.len, 0);

    // 끝점 강조
    fill(this.h, this.s, this.b, this.a * 0.7);
    noStroke();
    ellipse(this.len, 0, 5, 5);
    pop();
  }
}
