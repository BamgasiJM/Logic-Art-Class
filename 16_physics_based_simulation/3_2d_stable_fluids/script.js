// === 2D Fluid — Stable Fluids Mini ===
const N = 64; // 그리드 해상도(정사각)
// 인덱싱 헬퍼
const idx = (x, y) => x + y * N;

let u, v, u0, v0; // 속도장(u,v) + 임시
let d, d0; // 염료(dye)
const diff = 0.0001; // 확산 계수
const visc = 0.0001; // 점도
const JACOBI = 15;
let prevMouse;

function setup() {
  createCanvas(600, 600);
  pixelDensity(1);
  u = new Float32Array(N * N);
  v = new Float32Array(N * N);
  u0 = new Float32Array(N * N);
  v0 = new Float32Array(N * N);
  d = new Float32Array(N * N);
  d0 = new Float32Array(N * N);
  prevMouse = createVector(mouseX, mouseY);
}

function draw() {
  background(0);
  const dt = 1 / 60;

  // 1) 마우스 힘/염료 주입
  if (mouseIsPressed) {
    let cx = floor(map(mouseX, 0, width, 1, N - 2));
    let cy = floor(map(mouseY, 0, height, 1, N - 2));
    let pm = createVector(prevMouse.x, prevMouse.y);
    let mv = createVector(mouseX, mouseY).sub(pm).mult(0.5);
    addVelocity(cx, cy, mv.x, mv.y);
    addDye(cx, cy, 50.0);
  }
  prevMouse.set(mouseX, mouseY);

  // 2) 속도 단계
  diffuse(u0, u, visc, dt);
  diffuse(v0, v, visc, dt);
  project(u0, v0, u, v); // 압력/발산 제거
  advect(u, u0, u0, v0, dt);
  advect(v, v0, u0, v0, dt);
  project(u, v, u0, v0);

  // 3) 염료 단계
  diffuse(d0, d, diff, dt);
  advect(d, d0, u, v, dt);

  // 4) 렌더
  loadPixels();
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const val = d[idx(i, j)];
      const c = constrain(val, 0, 255);
      // 업샘플링(그리드→화면)
      const x0 = floor(map(i, 0, N, 0, width));
      const y0 = floor(map(j, 0, N, 0, height));
      const x1 = floor(map(i + 1, 0, N, 0, width));
      const y1 = floor(map(j + 1, 0, N, 0, height));
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const p = 4 * (x + y * width);
          pixels[p] = c * 0.6; // R
          pixels[p + 1] = c * 0.8; // G
          pixels[p + 2] = 30; // B
          pixels[p + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

// ===== 간단 유틸 =====
function addVelocity(i, j, ax, ay) {
  const id = idx(i, j);
  u[id] += ax;
  v[id] += ay;
}
function addDye(i, j, amount) {
  const id = idx(i, j);
  d[id] += amount;
}

// 경계 조건: 벽에서 속도 반사, 염료 네움
function setBounds(x) {
  // 좌우/상하에 간단 경계
  for (let i = 1; i < N - 1; i++) {
    x[idx(i, 0)] = x[idx(i, 1)];
    x[idx(i, N - 1)] = x[idx(i, N - 2)];
    x[idx(0, i)] = x[idx(1, i)];
    x[idx(N - 1, i)] = x[idx(N - 2, i)];
  }
}

// 확산: (I - a∇²) x = b  ~ Jacobi 반복
function diffuse(x, b, diffc, dt) {
  const a = dt * diffc * (N - 2) * (N - 2);
  x.fill(0);
  for (let k = 0; k < JACOBI; k++) {
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        x[idx(i, j)] =
          (b[idx(i, j)] +
            a *
              (x[idx(i - 1, j)] +
                x[idx(i + 1, j)] +
                x[idx(i, j - 1)] +
                x[idx(i, j + 1)])) /
          (1 + 4 * a);
      }
    }
    setBounds(x);
  }
}

// 이류: 뒤로 추적(반-라그랑주), bilinear 샘플
function advect(dout, din, u, v, dt) {
  const h = 1.0 / N;
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      let x = i - dt * u[idx(i, j)] * h * (N - 2);
      let y = j - dt * v[idx(i, j)] * h * (N - 2);
      x = constrain(x, 0.5, N - 1.5);
      y = constrain(y, 0.5, N - 1.5);
      const i0 = floor(x),
        j0 = floor(y);
      const i1 = i0 + 1,
        j1 = j0 + 1;
      const sx = x - i0,
        sy = y - j0;
      const d00 = din[idx(i0, j0)];
      const d10 = din[idx(i1, j0)];
      const d01 = din[idx(i0, j1)];
      const d11 = din[idx(i1, j1)];
      dout[idx(i, j)] =
        (1 - sx) * (1 - sy) * d00 +
        sx * (1 - sy) * d10 +
        (1 - sx) * sy * d01 +
        sx * sy * d11;
    }
  }
  setBounds(dout);
}

// 발산 제거(Projection): 압력 풀고 v에서 ∇p 빼기
function project(u, v, p, div) {
  // div = ∂u/∂x + ∂v/∂y
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      div[idx(i, j)] =
        -0.5 *
        (u[idx(i + 1, j)] -
          u[idx(i - 1, j)] +
          v[idx(i, j + 1)] -
          v[idx(i, j - 1)]);
      p[idx(i, j)] = 0;
    }
  }
  setBounds(div);
  setBounds(p);

  // Poisson: ∇²p = div (Jacobi)
  for (let k = 0; k < JACOBI; k++) {
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        p[idx(i, j)] =
          (div[idx(i, j)] +
            (p[idx(i - 1, j)] +
              p[idx(i + 1, j)] +
              p[idx(i, j - 1)] +
              p[idx(i, j + 1)])) /
          4;
      }
    }
    setBounds(p);
  }

  // v ← v − ∇p
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      u[idx(i, j)] -= 0.5 * (p[idx(i + 1, j)] - p[idx(i - 1, j)]);
      v[idx(i, j)] -= 0.5 * (p[idx(i, j + 1)] - p[idx(i, j - 1)]);
    }
  }
  setBounds(u);
  setBounds(v);
}
