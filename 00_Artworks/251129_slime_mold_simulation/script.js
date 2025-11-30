// Slime Mold Simulation
let xMotion = 0;
let yMotion = 0;

const agents = [];
let trailMap;

const numX = 500;
const numY = 8;

function setup() {
  createCanvas(800, 800);

  colorMode(HSB, 360, 255, 255);
  background(0);
  noiseDetail(7, 0.7);

  // Use Float32Array for memory efficiency
  trailMap = new Float32Array(width * height).fill(0);

  // Initialize Agents
  for (let nx = 0; nx < numX; nx++) {
    let nmx = nx / numX;
    for (let ny = 0; ny < numY; ny++) {
      let nmy = ny / numY;

      const noiseVal = noise(nmx * nmy);

      const startX = width / 2 + sin(nmx * PI * 2) * (width / 3.5);
      const startY = height / 2 + cos(nmx * PI * 2) * (height / 3.5);
      const angle = nmx * PI * 2;

      agents.push(new Agent(startX, startY, angle, noiseVal));
    }
  }

  ellipseMode(CENTER);
  rectMode(CENTER);
  noStroke();
}

function draw() {
  // 1. Process Agents
  for (let agent of agents) {
    agent.sense(trailMap);
    agent.move();
    agent.deposit(trailMap); // Deposit logic usually happens after move
    agent.display();
  }

  // 2. Decay Trail
  // TypedArray optimized loop
  for (let i = 0; i < trailMap.length; i++) {
    trailMap[i] -= 0.1;
    if (trailMap[i] < 0) trailMap[i] = 0;
  }

  // 3. Global Motion
  xMotion += 0.05;
  yMotion += 0.0002;
}

// --- Agent Class (Strict Original Math) ---
class Agent {
  constructor(x, y, angle, noiseVal) {
    this.x = x; // Using simple x, y instead of p5.Vector for raw control
    this.y = y;
    this.angle = angle;
    this.vel = 1;
    this.depositVal = 1;
    this.noiseOffset = noiseVal;

    this.sensorOffset = 5;
    this.sensorAngle = 45; // degrees
  }

  sense(mapData) {
    const sensorRad = radians(this.sensorAngle);

    // round(sin(...))을 먼저 수행하여 오프셋을 정수로 만든 뒤 위치에 더함
    const getSensorIndex = (angleOffset) => {
      const angle = this.angle + angleOffset;

      // 1. Calculate Integer Offset first (Crucial for symmetry)
      const offX = Math.round(Math.sin(angle) * this.sensorOffset);
      const offY = Math.round(Math.cos(angle) * this.sensorOffset);

      // 2. Add to position and truncate using parseInt
      let sx = parseInt(this.x + offX);
      let sy = parseInt(this.y + offY);

      // 3. Boundary Wrap (Manual implementation to match original)
      if (sx < 0) sx += width;
      if (sy < 0) sy += height;
      sx %= width;
      sy %= height;

      return sx + sy * width;
    };

    const idxL = getSensorIndex(-sensorRad); // Left
    const idxF = getSensorIndex(0); // Forward
    const idxR = getSensorIndex(sensorRad); // Right

    const sL = mapData[idxL];
    const sF = mapData[idxF];
    const sR = mapData[idxR];

    // Behavior Logic
    if (sF < sL && sF < sR) {
      // Stay same (Random turn was commented out in original)
    } else if (sL < sR) {
      this.angle -= PI / 8; // Turn Left
    } else if (sR < sL) {
      this.angle += PI / 8; // Turn Right
    }
  }

  move() {
    this.x += this.vel * Math.sin(this.angle);
    this.y += this.vel * Math.cos(this.angle);
  }

  deposit(mapData) {
    // Boundary check (Original used 'continue', effectively skipping)
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) return;

    // [중요] Diffusion 위치 계산 시 parseInt 사용
    const ix = parseInt(this.x);
    const iy = parseInt(this.y);
    const index = ix + iy * width;

    // Diffusion (3x3 Blur)
    const b = mapData[index] / 2;

    // Neighbor indices with manual wrapping
    // 원본의 (lx - 1), (lx + 1) 로직을 그대로 구현
    const prevX = ix - 1 < 0 ? width - 1 : ix - 1;
    const nextX = (ix + 1) % width;
    const prevY = iy - 1 < 0 ? height - 1 : iy - 1;
    const nextY = (iy + 1) % height;

    mapData[prevX + iy * width] = b;
    mapData[nextX + iy * width] = b;
    mapData[prevX + prevY * width] = b;
    mapData[prevX + nextY * width] = b;
    mapData[nextX + prevY * width] = b;
    mapData[nextX + nextY * width] = b;
    mapData[ix + prevY * width] = b;
    mapData[ix + nextY * width] = b;

    // Deposit current
    mapData[index] = this.depositVal;
  }

  display() {
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) return;

    const ll = 400;
    // Magic visual formula strictly preserved
    // noise(this.noiseOffset...) -> ensures agents in the same ring flicker together
    const t =
      noise(this.noiseOffset + xMotion * 4) *
      2 *
      pow(
        1 - min(ll, frameCount) / ll,
        5.5 * (0.5 + (1 - this.y / height) / 2)
      );

    const sph = 1 - abs((0.5 - this.x / width) * 2);
    const colVal = 224 + noise(this.noiseOffset + xMotion * 2) * 32 * sph;

    fill(0, 0, colVal, t / 3);
    // Draw 1x1 rectangle at float position (p5 handles sub-pixel rendering, but logic is integer based)
    rect(this.x, this.y, 1, 1);
  }
}
