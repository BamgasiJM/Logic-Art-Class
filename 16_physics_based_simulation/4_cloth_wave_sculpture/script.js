let clothW = 80;
let clothH = 80;
let spacing = 9.5;

let points = [];
let constraints = [];
let gravity = 0.1;
let windStrength = 2.0;
let ITER = 10; // constraint 반복 횟수

function setup() {
  createCanvas(800, 800);
  initCloth();
}

function draw() {
  background(15);

  applyPhysics();
  satisfyConstraints();
  renderCloth();
}

// ----------------------------------------------------
// 1. Cloth 생성
// ----------------------------------------------------
function initCloth() {
  points = [];
  constraints = [];

  for (let y = 0; y < clothH; y++) {
    for (let x = 0; x < clothW; x++) {
      let px = 20 + x * spacing;
      let py = 20 + y * spacing;
      points.push(new Point(px, py, y === 0)); // 맨 윗줄은 고정 가능
    }
  }

  // 이웃 연결
  for (let y = 0; y < clothH; y++) {
    for (let x = 0; x < clothW; x++) {
      if (x < clothW - 1)
        constraints.push(new Constraint(idx(x, y), idx(x + 1, y)));
      if (y < clothH - 1)
        constraints.push(new Constraint(idx(x, y), idx(x, y + 1)));
    }
  }
}

function idx(x, y) {
  return x + y * clothW;
}

// ----------------------------------------------------
// 2. Point 클래스 (Verlet Integration)
// ----------------------------------------------------
class Point {
  constructor(x, y, pin = false) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.pin = pin;
  }

  applyForce(fx, fy) {
    if (this.pin) return;
    this.x += fx;
    this.y += fy;
  }

  update() {
    if (this.pin) return;

    let vx = this.x - this.px;
    let vy = this.y - this.py;

    this.px = this.x;
    this.py = this.y;

    this.x += vx;
    this.y += vy + gravity;
  }
}

// ----------------------------------------------------
// 3. Constraint 클래스 (거리 제약)
// ----------------------------------------------------
class Constraint {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.restLength = spacing;
  }

  satisfy() {
    let pA = points[this.a];
    let pB = points[this.b];

    let dx = pB.x - pA.x;
    let dy = pB.y - pA.y;
    let dist = sqrt(dx * dx + dy * dy);
    let diff = (this.restLength - dist) / dist;

    let moveX = dx * diff * 0.5;
    let moveY = dy * diff * 0.5;

    if (!pA.pin) {
      pA.x -= moveX;
      pA.y -= moveY;
    }
    if (!pB.pin) {
      pB.x += moveX;
      pB.y += moveY;
    }
  }
}

// ----------------------------------------------------
// 4. 전체 물리 적용
// ----------------------------------------------------
function applyPhysics() {
  // 바람 (Simplex noise 기반)
  let t = frameCount * 0.02;

  for (let i = 0; i < points.length; i++) {
    let p = points[i];

    // 바람 (x방향 힘)
    let wind = windStrength * (noise(i * 0.1, t) - 0.5);

    p.applyForce(wind, 0);
    p.update();
  }
}

// ----------------------------------------------------
// 5. 제약 만족 반복(천 형태 유지)
// ----------------------------------------------------
function satisfyConstraints() {
  for (let k = 0; k < ITER; k++) {
    for (let c of constraints) {
      c.satisfy();
    }
  }
}

// ----------------------------------------------------
// 6. 렌더링
// ----------------------------------------------------
function renderCloth() {
  noStroke();

  for (let y = 0; y < clothH - 1; y++) {
    for (let x = 0; x < clothW - 1; x++) {
      let p = points[idx(x, y)];
      let pR = points[idx(x + 1, y)];
      let pD = points[idx(x, y + 1)];
      let pDR = points[idx(x + 1, y + 1)];

      // 높이에 따라 색상 그라데이션
      let c = map(p.y, 0, height, 80, 180);
      fill(c, 120, 255 - c, 180);

      beginShape();
      vertex(p.x, p.y);
      vertex(pR.x, pR.y);
      vertex(pDR.x, pDR.y);
      vertex(pD.x, pD.y);
      endShape(CLOSE);
    }
  }

  // point 디버그용(끄고 싶으면 주석처리)
  /*
  fill(255);
  for (let p of points) circle(p.x, p.y, 3);
  */
}

// ----------------------------------------------------
// 추가: 마우스로 천 당기기
// ----------------------------------------------------
function mouseDragged() {
  let closest = -1;
  let best = 9999;

  for (let i = 0; i < points.length; i++) {
    let d = dist(mouseX, mouseY, points[i].x, points[i].y);
    if (d < best && d < 30) {
      best = d;
      closest = i;
    }
  }

  if (closest !== -1) {
    let p = points[closest];
    p.x = mouseX;
    p.y = mouseY;
  }
}
