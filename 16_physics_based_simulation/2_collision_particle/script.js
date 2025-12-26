// === Many Disks — Position-Based Collision ===
let P = [];
const COUNT = 160;
const R = 6;
const SUBSTEPS = 1;
const ITER = 3; // 충돌 반복
const DAMP = 0.997; // 약간의 감쇠

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < COUNT; i++) {
    P.push({
      x: random(80, width - 80),
      y: random(80, height - 80),
      vx: random(-60, 60),
      vy: random(-60, 60),
      r: R + random(-2, 2),
      col: color(random(140, 220), random(140, 220), 255, 200),
    });
  }
}

function draw() {
  background(15);
  const dt = 1 / 60;

  for (let s = 0; s < SUBSTEPS; s++) {
    // 예측 이동
    for (let p of P) {
      p.vy += 400 * dt; // 중력
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    // 경계(벽) 제약
    for (let p of P) {
      if (p.x < p.r) {
        p.x = p.r;
        p.vx *= -0.6;
      }
      if (p.x > width - p.r) {
        p.x = width - p.r;
        p.vx *= -0.6;
      }
      if (p.y < p.r) {
        p.y = p.r;
        p.vy *= -0.6;
      }
      if (p.y > height - p.r) {
        p.y = height - p.r;
        p.vy *= -0.6;
      }
    }

    // 원-원 충돌 (ITER 번 반복해 수렴성↑)
    for (let it = 0; it < ITER; it++) {
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          let A = P[i],
            B = P[j];
          let dx = B.x - A.x,
            dy = B.y - A.y;
          let L2 = dx * dx + dy * dy;
          let r = A.r + B.r;
          if (L2 > 0 && L2 < r * r) {
            let L = Math.sqrt(L2);
            let pen = r - L;
            let nx = dx / L,
              ny = dy / L;
            // 반반 보정
            A.x -= nx * pen * 0.5;
            A.y -= ny * pen * 0.5;
            B.x += nx * pen * 0.5;
            B.y += ny * pen * 0.5;
            // 속도도 살짝 반사 느낌
            let relvx = B.vx - A.vx,
              relvy = B.vy - A.vy;
            let vn = relvx * nx + relvy * ny;
            if (vn < 0) {
              let imp = -0.8 * vn;
              A.vx -= imp * nx * 0.5;
              A.vy -= imp * ny * 0.5;
              B.vx += imp * nx * 0.5;
              B.vy += imp * ny * 0.5;
            }
          }
        }
      }
    }

    // 감쇠
    for (let p of P) {
      p.vx *= DAMP;
      p.vy *= DAMP;
    }
  }

  // 렌더
  noStroke();
  for (let p of P) {
    fill(p.col);
    circle(p.x, p.y, p.r * 2);
  }
}
