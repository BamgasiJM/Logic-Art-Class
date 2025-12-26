// ====== 전역 변수 설정 ======
let W = 800;
let H = 400;
let particles = []; // 입자 객체들을 저장할 배열 (Array of Objects)
const numParticles = 150; // 입자의 개수 (메모리 관리 고려)

function setup() {
  createCanvas(W, H);
  background(0);
  noStroke();

  // 50개의 입자 객체를 생성하여 배열에 초기화합니다.
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function draw() {
  // 1. 시간성: 배경을 반투명하게 덮어 잔상 효과 (Temporal System)
  // 이전 프레임의 흔적을 남기며, 움직임의 '시간성'을 시각화합니다.
  background(0, 30);

  // 2. 입력 데이터 계산 (Interaction Data)
  // 마우스의 위치를 기반으로 시스템의 '끌어당김' 중심점을 정의합니다.
  let targetX = mouseX;
  let targetY = mouseY;

  // 마우스 클릭 상태(불린 값)를 '힘'의 데이터로 변환합니다.
  let attractionStrength = mouseIsPressed ? 0.05 : 0.01;

  // 3. 입자 업데이트 및 그리기
  for (let p of particles) {
    // 마우스 위치(target)를 향해 입자를 이동시키는 힘을 적용합니다.
    p.attract(targetX, targetY, attractionStrength);

    // 시간 흐름에 따른 진동 및 위치 업데이트
    p.update();

    // 마우스와 입자의 거리에 따라 색상과 크기를 결정합니다.
    p.display(targetX, targetY);
  }
}

/**
 * 입자(Particle) 클래스 정의
 * - 객체 지향 프로그래밍을 사용하여 입자들의 상태와 행동을 관리합니다.
 */
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y); // 현재 위치
    this.vel = createVector(0, 0); // 속도 (0으로 초기화하여 메모리 효율성 유지)
    this.acc = createVector(0, 0); // 가속도
    this.baseSize = 10; // 기본 크기
    this.noiseOffset = random(1000); // 퍼린 노이즈를 위한 무작위 오프셋 (시간성)
  }

  /**
   * 마우스 위치(target)로 끌어당기는 힘을 계산하여 가속도에 적용합니다.
   */
  attract(targetX, targetY, strength) {
    let target = createVector(targetX, targetY);
    // 1. 방향 벡터 계산: target - pos
    let force = p5.Vector.sub(target, this.pos);
    // 2. 거리 제한: 너무 멀면 힘을 줄이고, 너무 가까우면 힘을 0으로 만듭니다.
    let dist = force.mag();
    dist = constrain(dist, 5, 200); // 최소 5, 최대 200으로 거리값 제한

    // 3. 힘의 크기 계산: (strength) * (1/dist^2)의 근사치 적용
    force.normalize(); // 방향만 남기고
    force.mult(strength * (1 / (dist * 0.01))); // 힘의 크기 적용

    this.acc.add(force); // 가속도에 힘을 더합니다.
  }

  /**
   * 속도와 위치를 업데이트하고, 시간성 진동을 추가합니다.
   */
  update() {
    // 1. 시간성: 퍼린 노이즈를 이용한 진동 추가
    // 시간이 지남에 따라(frameCount) 위치가 미세하게 진동합니다.
    let noiseValX = map(
      noise(this.noiseOffset, frameCount * 0.005),
      0,
      1,
      -0.5,
      0.5
    );
    let noiseValY = map(
      noise(this.noiseOffset + 10, frameCount * 0.005),
      0,
      1,
      -0.5,
      0.5
    );
    this.acc.add(noiseValX * 0.1, noiseValY * 0.1); // 미세한 랜덤 가속도 추가

    // 2. 물리 업데이트
    this.vel.add(this.acc);
    this.vel.mult(0.95); // 마찰력 (속도를 0.95로 줄여 안정화)
    this.pos.add(this.vel);
    this.acc.mult(0); // 가속도를 매 프레임 초기화 (매우 중요)
  }

  /**
   * 입자를 화면에 그리고, 마우스 거리에 따른 색상/크기 변화를 적용합니다.
   */
  display(targetX, targetY) {
    // 1. 인터랙션: 마우스와의 거리에 따른 색상/크기 데이터 정의
    let distToMouse = dist(this.pos.x, this.pos.y, targetX, targetY);

    // 거리에 따라 크기 변화 (가까울수록 커짐)
    let size = this.baseSize + map(distToMouse, 0, width, 10, 0);

    // 거리에 따라 색상 변화 (가까울수록 밝고 붉은색)
    let hue = map(distToMouse, 0, width, 0, 60); // 0(Red) ~ 60(Yellow)
    let brightness = map(distToMouse, 0, width, 100, 50);

    // 색상 모드를 HSB로 변경하여 색상 제어를 용이하게 합니다.
    colorMode(HSB, 360, 100, 100);
    fill(hue, 80, brightness, 80); // 반투명도를 80으로 설정

    ellipse(this.pos.x, this.pos.y, size, size);
    colorMode(RGB, 255); // 다음 드로잉을 위해 다시 RGB로 복구
  }
}
