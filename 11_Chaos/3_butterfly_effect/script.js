let particles = [];
let maxDistance = 0;

function setup() {
  createCanvas(800, 600);
  colorMode(RGB);

  // 0.5를 피한 비대칭적인 초기 상태
  let baseStateX = 0.3;
  let baseStateY = 0.9;
  let epsilon = 0.000001; // 매우 작은 초기 차이

  // 세 개의 입자 생성 - 각각 미세하게 다른 초기 상태
  particles.push(new ChaosParticle(baseStateX, baseStateY, color(255, 0, 0)));
  particles.push(
    new ChaosParticle(baseStateX + epsilon, baseStateY, color(0, 255, 0))
  );
  particles.push(
    new ChaosParticle(baseStateX, baseStateY + epsilon, color(0, 0, 255))
  );
}

function draw() {
  // 반투명 배경 (잔상 효과)
  background(0, 25);

  // 입자 업데이트 및 표시
  for (let p of particles) {
    p.update();
    p.show();
  }

  // 입자들 간의 최대 거리 계산
  maxDistance = 0;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let d = dist(
        particles[i].x,
        particles[i].y,
        particles[j].x,
        particles[j].y
      );
      maxDistance = max(maxDistance, d);
    }
  }

  // 정보 표시
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT);
  text("초기 상태 차이: 1.0e-6", 20, 30);
  text("경과 시간: " + nf(frameCount / 60, 0, 1) + "초", 20, 50);
  text("입자 간 최대 거리: " + nf(maxDistance, 0, 1) + "px", 20, 70);

  // 리아푸노프 지수 계산
  if (frameCount > 0 && maxDistance > 0) {
    let lyapunov = Math.log(maxDistance / 0.000001) / frameCount;
    text("리아푸노프 지수: " + nf(lyapunov, 0, 4), 20, 90);
  }

  // 설명
  textSize(12);
  fill(200);
  text("빨강, 초록, 파랑: 10⁻⁶ 차이로 시작한 세 입자", 20, height - 40);
  text("로지스틱 맵 (r=3.99) 사용 - 완전한 카오스 영역", 20, height - 20);
}

// 로지스틱 맵 함수
function logisticMap(x, r) {
  return r * x * (1 - x);
}

class ChaosParticle {
  constructor(stateX, stateY, col) {
    // 로지스틱 맵의 내부 상태 (0~1 사이)
    this.stateX = stateX;
    this.stateY = stateY;

    // 화면 위치
    this.x = width / 2;
    this.y = height / 2;

    this.col = col;
    this.trail = [];

    // 카오스 파라미터
    this.r = 3.99; // 완전한 카오스 영역
  }

  update() {
    // 로지스틱 맵을 각 차원에 독립적으로 적용
    this.stateX = logisticMap(this.stateX, this.r);
    this.stateY = logisticMap(this.stateY, this.r);

    // 상태를 속도로 변환 (-1 ~ 1 범위를 -4 ~ 4로 확대)
    let vx = (this.stateX - 0.5) * 8;
    let vy = (this.stateY - 0.5) * 8;

    // 위치 업데이트
    this.x += vx;
    this.y += vy;

    // 화면 경계 처리 (토러스 형태)
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // 궤적 저장
    this.trail.push(createVector(this.x, this.y));
    if (this.trail.length > 100) {
      this.trail.shift();
    }
  }

  show() {
    // 궤적 그리기
    if (this.trail.length > 1) {
      stroke(red(this.col), green(this.col), blue(this.col), 64);
      strokeWeight(1);
      noFill();
      beginShape();
      for (let v of this.trail) {
        vertex(v.x, v.y);
      }
      endShape();
    }

    // 현재 위치
    fill(this.col);
    noStroke();
    circle(this.x, this.y, 6);
  }
}

// 마우스 클릭으로 재시작
function mousePressed() {
  setup();
}
