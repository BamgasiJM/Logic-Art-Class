// const JSON_PATH = "video_i_am_ver5.json"; // ← 파일명 변경
// const JSON_PATH = "video_buzzing_ver5.json"; // ← 파일명 변경
const JSON_PATH = "video_ready_for_love_ver5.json"; // ← 파일명 변경
// const JSON_PATH = "video_cortis_ver5.json"; // ← 파일명 변경

// ── 파라미터 ────────────────────────────────────────────────

const CONNECT_DIST = 0.5; // 연결 거리 임계값 (정규화 0~1, 늘리면 더 많이 연결)
const CONNECT_WIDTH = 0.7; // 라인 두께 (px)
const POINT_SIZE = 3; // 관절 점 기본 크기 (px)

const VIS_THRESHOLD = 0.4; // visibility 최소값

const TRAIL_FRAMES = 10; // 잔상 프레임 수
const TRAIL_ALPHA = 0.1; // 잔상 페이드 속도 (0~1, 낮을수록 긴 잔상)

const SPEED_SMOOTH = 0.05; // 속도 스무딩 계수 (0~1, 낮을수록 부드럽게)

// 색상 범위 (HSB)
// 느린 관절: HUE_SLOW ~ 빠른 관절: HUE_FAST
const HUE_SLOW = 260; 
const HUE_FAST = 90; 
const SAT_BASE = 70;
const BRI_MIN = 50;
const BRI_MAX = 100;

// ── 내부 상태 ───────────────────────────────────────────────

let poseData = null;
let speeds = []; // speeds[frame][joint] : 정규화 속도 0~1
let smoothSpeeds = []; // 스무딩 적용된 현재 표시 속도
let currentFrame = 0;
let lastMs = 0;
let accumMs = 0;
let maxSpeed = 0; // 전체 최대 속도 (정규화 기준)
let isLoaded = false;

// ============================================================
// preload — JSON 로드
// ============================================================

function preload() {
  poseData = loadJSON(
    JSON_PATH,
    () => {},
    (err) => {
      console.error("JSON 로드 실패:", err);
      poseData = null;
    },
  );
}

// ============================================================
// setup
// ============================================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);
  frameRate(120);

  if (poseData && poseData.frames) {
    initData();
  }
}

// ============================================================
// 데이터 초기화 — 속도 사전 계산
// ============================================================

function initData() {
  const data = poseData;
  speeds = [];
  maxSpeed = 0;

  for (let f = 0; f < data.frames; f++) {
    const frameSpeed = [];
    for (let j = 0; j < data.joint_count; j++) {
      let s = 0;
      if (f > 0) {
        const prev = data.image[f - 1][j];
        const curr = data.image[f][j];
        const dx = curr[0] - prev[0];
        const dy = curr[1] - prev[1];
        s = sqrt(dx * dx + dy * dy);
      }
      frameSpeed.push(s);
      if (s > maxSpeed) maxSpeed = s;
    }
    speeds.push(frameSpeed);
  }

  // maxSpeed 정규화 (상위 5% 값을 기준으로 과포화 방지)
  const flat = speeds.flat().sort((a, b) => a - b);
  maxSpeed = flat[Math.floor(flat.length * 0.95)] || 0.01;

  // 스무딩 속도 초기값
  smoothSpeeds = new Array(data.joint_count).fill(0);

  isLoaded = true;
  lastMs = millis();
  console.log(
    `로드 완료 — ${data.frames}프레임, ${data.joint_count}관절, maxSpeed: ${maxSpeed.toFixed(5)}`,
  );
}

// ============================================================
// draw
// ============================================================

function draw() {
  if (!isLoaded) {
    // 로드 전 대기 화면
    background(0);
    noStroke();
    fill(0, 0, 60, 80);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("데이터 로드 중...", width / 2, height / 2);
    if (poseData && poseData.frames) initData();
    return;
  }

  // ── 잔상: 반투명 검정으로 이전 프레임 흐리기 ──────────────
  blendMode(BLEND);
  noStroke();
  fill(0, 0, 0, TRAIL_ALPHA * 100);
  rect(0, 0, width, height);

  // ── 가산 혼합 모드로 밝게 ───────────────────────
  blendMode(ADD);

  // ── 타이밍: FPS 기반 프레임 진행 ─────────────────────────
  const now = millis();
  const delta = now - lastMs;
  lastMs = now;
  accumMs += delta;

  const msPerFrame = 1000 / poseData.fps;
  while (accumMs >= msPerFrame) {
    accumMs -= msPerFrame;
    currentFrame = (currentFrame + 1) % poseData.frames;
  }

  // ── 현재 프레임 데이터 ────────────────────────────────────
  const frame = poseData.image[currentFrame];
  const rawSpeeds = speeds[currentFrame];

  // 스무딩 속도 업데이트
  for (let j = 0; j < poseData.joint_count; j++) {
    const norm = constrain(rawSpeeds[j] / maxSpeed, 0, 1);
    smoothSpeeds[j] += (norm - smoothSpeeds[j]) * SPEED_SMOOTH;
  }

  // ── 유효 관절 목록 ────────────────────────────────────────
  // 화면 좌표로 변환: image 좌표는 0~1 정규화, 정사각형 기준
  // 캔버스를 짧은 쪽에 맞춰 중앙 정렬
  const shortSide = min(width, height);
  const offX = (width - shortSide) / 2;
  const offY = (height - shortSide) / 2;

  const pts = []; // { x, y, speed, vis, jointIdx }

  for (let j = 0; j < poseData.joint_count; j++) {
    const lm = frame[j];
    if (lm[3] < VIS_THRESHOLD) continue;

    pts.push({
      x: offX + lm[0] * shortSide,
      y: offY + lm[1] * shortSide,
      speed: smoothSpeeds[j],
      vis: lm[3],
      jointIdx: j,
    });
  }

  // ── 연결 라인: 거리 기반 투명도 ──────────────────────────
  strokeWeight(CONNECT_WIDTH);

  for (let a = 0; a < pts.length; a++) {
    for (let b = a + 1; b < pts.length; b++) {
      const pa = pts[a];
      const pb = pts[b];

      // 정규화 거리로 임계값 판정
      const lmA = frame[pa.jointIdx];
      const lmB = frame[pb.jointIdx];
      const normDx = lmA[0] - lmB[0];
      const normDy = lmA[1] - lmB[1];
      const normD = sqrt(normDx * normDx + normDy * normDy);

      if (normD > CONNECT_DIST) continue;

      // 거리 비율 (0 = 가장 가까움, 1 = 임계값 끝)
      const t = normD / CONNECT_DIST;

      // 두 점 속도의 평균으로 색 결정
      const avgSpeed = (pa.speed + pb.speed) * 0.5;
      const hue = lerp(HUE_SLOW, HUE_FAST, avgSpeed);
      const sat = SAT_BASE + avgSpeed * (100 - SAT_BASE);
      const bri = lerp(BRI_MIN, BRI_MAX, avgSpeed);

      // 투명도: 거리 멀수록 페이드, 속도 낮으면 전체 어둡게
      const lineAlpha = (1 - t) * (1 - t) * lerp(20, 80, avgSpeed);

      stroke(hue, sat, bri, lineAlpha);
      line(pa.x, pa.y, pb.x, pb.y);
    }
  }

  // ── 관절 점 ───────────────────────────────────────────────
  noStroke();

  for (const pt of pts) {
    const s = pt.speed;
    const hue = lerp(HUE_SLOW, HUE_FAST, s);
    const sat = SAT_BASE + s * (100 - SAT_BASE);
    const bri = lerp(BRI_MIN, BRI_MAX, s);
    const sz = POINT_SIZE + s * POINT_SIZE * 2.5;

    // 글로우: 반투명 바깥 원
    fill(hue, sat, bri, lerp(8, 30, s));
    circle(pt.x, pt.y, sz * 4.5);

    // 코어: 안쪽  원
    fill(hue, sat * 0.5, bri, lerp(50, 100, s));
    circle(pt.x, pt.y, sz);
  }

  // blendMode 복원
  blendMode(BLEND);
}

// ============================================================
// 유틸
// ============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

// 스페이스바: 리셋
function keyPressed() {
  if (key === " ") {
    background(0);
    currentFrame = 0;
    accumMs = 0;
    lastMs = millis();
  }
}
