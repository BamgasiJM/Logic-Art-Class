let agents = [];
let trailMap;
let newTrail;

const w = 600;
const h = 600;
const renderScale = 1; // 렌더링 해상도 축소 비율
const diffuseInterval = 10; // 확산 수행 프레임 간격

// 설정
const config = {
  numAgents: 1000,
  sensorAngle: 0.5,
  sensorDistance: 10,
  turnSpeed: 0.5,
  moveSpeed: 2,
  trailWeight: 10,
  decayRate: 0.95,
};

function setup() {
  createCanvas(w, h);
  pixelDensity(1);

  // trail map 초기화
  trailMap = new Float32Array(w * h);
  newTrail = new Float32Array(w * h);

  // 에이전트 초기화 (중앙 원형 배치)
  for (let i = 0; i < config.numAgents; i++) {
    let a = random(TWO_PI);
    let r = 70;
    agents.push({
      x: w / 2 + cos(a) * r,
      y: h / 2 + sin(a) * r,
      angle: random(TWO_PI),
    });
  }

  background(0);
}

function draw() {
  // 에이전트 업데이트
  for (let agent of agents) {
    updateAgent(agent);
  }

  // 확산 (프레임 간격 적용)
  if (frameCount % diffuseInterval === 0) {
    diffuseTrail();
  }

  // 렌더링
  renderTrail();
}

// ──────────────────────────────
// Agent 로직
// ──────────────────────────────

function updateAgent(agent) {
  let forward = sense(agent, 0);
  let left = sense(agent, config.sensorAngle);
  let right = sense(agent, -config.sensorAngle);

  let steer = (random() - 0.5) * 2 * config.turnSpeed;

  if (forward > left && forward > right) {
    // 유지
  } else if (left > right) {
    agent.angle += steer;
  } else if (right > left) {
    agent.angle -= steer;
  } else {
    agent.angle += random() < 0.5 ? steer : -steer;
  }

  agent.x += cos(agent.angle) * config.moveSpeed;
  agent.y += sin(agent.angle) * config.moveSpeed;

  // 경계 반사
  if (agent.x < 0 || agent.x >= w) {
    agent.x = constrain(agent.x, 0, w - 1);
    agent.angle = PI - agent.angle;
  }
  if (agent.y < 0 || agent.y >= h) {
    agent.y = constrain(agent.y, 0, h - 1);
    agent.angle = -agent.angle;
  }

  // trail 기록
  let x = agent.x | 0;
  let y = agent.y | 0;
  trailMap[x + y * w] += config.trailWeight;
}

function sense(agent, offset) {
  let a = agent.angle + offset;
  let x = (agent.x + cos(a) * config.sensorDistance) | 0;
  let y = (agent.y + sin(a) * config.sensorDistance) | 0;

  if (x < 0 || x >= w || y < 0 || y >= h) return 0;
  return trailMap[x + y * w];
}

// ──────────────────────────────
// Diffusion (5-point kernel)
// ──────────────────────────────

function diffuseTrail() {
  for (let y = 1; y < h - 1; y++) {
    let yw = y * w;
    for (let x = 1; x < w - 1; x++) {
      let i = x + yw;
      newTrail[i] =
        (trailMap[i] +
          trailMap[i - 1] +
          trailMap[i + 1] +
          trailMap[i - w] +
          trailMap[i + w]) *
        0.2;
    }
  }

  for (let i = 0; i < trailMap.length; i++) {
    trailMap[i] = newTrail[i] * config.decayRate;
  }
}

// ──────────────────────────────
// Rendering (downsample)
// ──────────────────────────────

function renderTrail() {
  loadPixels();

  for (let y = 0; y < h; y += renderScale) {
    for (let x = 0; x < w; x += renderScale) {
      let i = x + y * w;
      let v = min(255, trailMap[i] * 12);

      for (let dy = 0; dy < renderScale; dy++) {
        for (let dx = 0; dx < renderScale; dx++) {
          let px = x + dx;
          let py = y + dy;
          if (px >= w || py >= h) continue;

          let idx = (px + py * w) * 4;
          pixels[idx + 0] = v;     // R
          pixels[idx + 1] = v;     // G
          pixels[idx + 2] = v;     // B
          pixels[idx + 3] = 255;   // A
        }
      }
    }
  }

  updatePixels();
}
