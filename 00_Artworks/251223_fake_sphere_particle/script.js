// ==========================================
// [설정 영역] 전역 상수 및 변수
// ==========================================

const PARTICLE_COUNT = 8000; 
const ATTRACTION = 0.01; 
const DAMPING = 0.9; 
const REPEL_STRENGTH = 28; 

const CANVAS_WIDTH = 800; 
const CANVAS_HEIGHT = 800; 
const SPHERE_RADIUS = 350; 
const REPEL_RADIUS = 120; 

let angle = 0; 
let points = []; 

// ==========================================
// [p5.js 라이프사이클]
// ==========================================

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  pixelDensity(1);

  stroke(255);
  strokeWeight(2);

  // 파티클 초기화
  initializeParticles();

  // 초기 위치 설정
  angle = 0;
  updateParticleTargets();

  // 속도 초기화
  for (let p of points) {
    p.vel.set(0, 0);
  }
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  // 마우스 위치 (캔버스 중심 기준)
  const mousePos = createVector(mouseX - width / 2, mouseY - height / 2);

  // 모든 파티클 업데이트 및 렌더링
  updateAndRenderParticles(mousePos);

  // 구체 회전
  angle += 0.01;
}

// ==========================================
// [초기화 함수]
// ==========================================

function initializeParticles() {
  points = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    points.push({
      index: i,
      pos: createVector(0, 0),
      vel: createVector(0, 0),
    });
  }
}

// 파티클의 초기 "홈" 위치 설정
function updateParticleTargets() {
  for (let p of points) {
    const i = p.index;
    const x = sin(i + angle) * sin(i * i) * SPHERE_RADIUS;
    const y = cos(i * i) * SPHERE_RADIUS;
    p.pos.set(x, y);
  }
}

// ==========================================
// [파티클 물리 시뮬레이션]
// ==========================================

function updateAndRenderParticles(mousePos) {
  for (let p of points) {
    const i = p.index;

    // 1. 회전하는 "홈" 위치 계산
    const homeX = sin(i + angle) * sin(i * i) * SPHERE_RADIUS;
    const homeY = cos(i * i) * SPHERE_RADIUS;
    const home = createVector(homeX, homeY);

    // 2. 스프링 힘 (홈으로 끌어당김)
    const toHome = p5.Vector.sub(home, p.pos);
    const springForce = toHome.mult(ATTRACTION);
    p.vel.add(springForce);

    // 3. 마우스 반발력
    applyMouseRepulsion(p, mousePos);

    // 4. 감속 및 위치 업데이트
    p.vel.mult(DAMPING);
    p.pos.add(p.vel);

    // 5. 파티클 렌더링
    point(p.pos.x, p.pos.y);
  }
}

function applyMouseRepulsion(particle, mousePos) {
  const awayFromMouse = p5.Vector.sub(particle.pos, mousePos);
  const distSq = awayFromMouse.magSq();

  // 마우스가 충분히 가까울 때만 반발력 적용
  if (distSq > 0.1 && distSq < REPEL_RADIUS * REPEL_RADIUS) {
    const distance = sqrt(distSq);
    awayFromMouse.normalize();

    // 거리에 따른 자연스러운 감쇠
    const repelForce = REPEL_STRENGTH * (1 - distance / REPEL_RADIUS);
    awayFromMouse.mult(repelForce);

    particle.vel.add(awayFromMouse);
  }
}
