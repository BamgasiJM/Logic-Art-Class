// === Jelly Blob — Spring-Mass Ring ===
let pts = [];
let springs = [];
const N = 64; // 질점 개수(원을 이루는 점)
const R = 180; // 초기 반지름
const k = 180; // 스프링 상수
const c = 1.6; // 감쇠 계수
const rest = (2 * Math.PI * R) / N; // 이웃점 간 자연길이(대략)
const mass = 1;
const gravity = 300; // 아래로 당기는 힘 (시각화용 과장)
let dragging = -1;

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < N; i++) {
    let a = (i / N) * TWO_PI;
    pts.push({
      x: width / 2 + R * Math.cos(a),
      y: height / 2 + R * Math.sin(a),
      vx: 0,
      vy: 0,
    });
    springs.push([i, (i + 1) % N]); // 이웃 연결(원)
  }
  noFill();
}

function mousePressed() {
  // 가장 가까운 점 잡아끌기
  let best = -1,
    bestD = 9999;
  for (let i = 0; i < N; i++) {
    let d = dist(mouseX, mouseY, pts[i].x, pts[i].y);
    if (d < bestD && d < 30) {
      bestD = d;
      best = i;
    }
  }
  dragging = best;
}
function mouseReleased() {
  dragging = -1;
}

function draw() {
  background(15);
  const dt = 1 / 60;

  // 외력 + 스프링 힘
  for (let i = 0; i < N; i++) {
    let p = pts[i];
    let fx = 0,
      fy = gravity * mass; // 중력
    // 이웃 스프링
    for (let s = 0; s < springs.length; s++) {
      const [a, b] = springs[s];
      if (a !== i && b !== i) continue;
      const j = a === i ? b : a;
      const q = pts[j];
      const dx = q.x - p.x,
        dy = q.y - p.y;
      const L = Math.hypot(dx, dy) || 1e-6;
      const nux = dx / L,
        nuy = dy / L; // 단위벡터
      const stretch = L - rest; // 변형량
      fx += k * stretch * nux;
      fy += k * stretch * nuy;
    }
    // 점성 감쇠(속도 비례 저항)
    fx += -c * p.vx;
    fy += -c * p.vy;

    // 마우스로 끌기(가상 스프링)
    if (i === dragging) {
      const kDrag = 600;
      fx += kDrag * (mouseX - p.x);
      fy += kDrag * (mouseY - p.y);
    }

    // 적분 (semi-implicit Euler)
    p.vx += (fx / mass) * dt;
    p.vy += (fy / mass) * dt;
  }
  for (let i = 0; i < N; i++) {
    pts[i].x += pts[i].vx * dt;
    pts[i].y += pts[i].vy * dt;
  }

  // 경계 간단 처리(벽에 부딪히면 반사 + 감쇠)
  for (let p of pts) {
    if (p.x < 20) {
      p.x = 20;
      p.vx *= -0.4;
    }
    if (p.x > width - 20) {
      p.x = width - 20;
      p.vx *= -0.4;
    }
    if (p.y < 20) {
      p.y = 20;
      p.vy *= -0.4;
    }
    if (p.y > height - 20) {
      p.y = height - 20;
      p.vy *= -0.4;
    }
  }

  // 렌더(블랍 메쉬 + 외곽선)
  fill(90, 150, 255, 150);
  stroke(200, 200, 255);
  strokeWeight(2);
  beginShape();
  for (let p of pts) vertex(p.x, p.y);
  endShape(CLOSE);

  // 점 표시
  noStroke();
  for (let p of pts) {
    fill(250, 120, 155);
    circle(p.x, p.y, 6);
  }
}
