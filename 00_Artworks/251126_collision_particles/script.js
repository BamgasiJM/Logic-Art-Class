// 전역 변수
let particles = [];
const PARTICLE_COUNT = 200;
const YELLOW_PERCENTAGE = 0.5; // 노란색 비율 (0~1)
const CANVAS_SIZE = 1000;
const BG_COLOR = 10;

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);

  // 파티클 초기화
  const yellowCount = Math.floor(PARTICLE_COUNT * YELLOW_PERCENTAGE);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: random(CANVAS_SIZE),
      y: random(CANVAS_SIZE),
      vx: random(-1, 1),
      vy: random(-1, 1),
      r: floor(random(5, 8)),
      isYellow: i < yellowCount,
    });
  }
}

function draw() {
  background(BG_COLOR);
  noStroke();

  // 파티클 개수 카운트
  let yellowCount = 0;
  let greenCount = 0;

  // 파티클 업데이트 및 그리기
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    // 개수 카운트
    if (p.isYellow) {
      yellowCount++;
    } else {
      greenCount++;
    }

    // 위치 업데이트
    p.x += p.vx;
    p.y += p.vy;

    // 벽 충돌 처리
    if (p.x - p.r < 0 || p.x + p.r > CANVAS_SIZE) {
      p.vx *= -1;
      p.x = constrain(p.x, p.r, CANVAS_SIZE - p.r);
    }
    if (p.y - p.r < 0 || p.y + p.r > CANVAS_SIZE) {
      p.vy *= -1;
      p.y = constrain(p.y, p.r, CANVAS_SIZE - p.r);
    }

    // 파티클 간 충돌 처리
    for (let j = i + 1; j < particles.length; j++) {
      let other = particles[j];
      let dx = other.x - p.x;
      let dy = other.y - p.y;
      let distSq = dx * dx + dy * dy;
      let minDist = p.r + other.r;

      if (distSq < minDist * minDist) {
        // 충돌 발생 - 색상 교환
        let temp = p.isYellow;
        p.isYellow = other.isYellow;
        other.isYellow = temp;

        // 반사 처리
        let dist = sqrt(distSq);
        let nx = dx / dist;
        let ny = dy / dist;

        let dvx = p.vx - other.vx;
        let dvy = p.vy - other.vy;
        let dotProduct = dvx * nx + dvy * ny;

        p.vx -= dotProduct * nx;
        p.vy -= dotProduct * ny;
        other.vx += dotProduct * nx;
        other.vy += dotProduct * ny;

        // 겹침 해소
        let overlap = minDist - dist;
        let separateX = nx * overlap * 0.5;
        let separateY = ny * overlap * 0.5;
        p.x -= separateX;
        p.y -= separateY;
        other.x += separateX;
        other.y += separateY;
      }
    }

    // 그리기
    fill(p.isYellow ? color(255, 255, 0) : color(0, 100, 0));
    circle(p.x, p.y, p.r * 2);
  }

  // 하단 정보 표시
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text(`Yellow Team : ${yellowCount}`, 20, CANVAS_SIZE - 40);
  text(`Green Team : ${greenCount}`, 20, CANVAS_SIZE - 15);
}
