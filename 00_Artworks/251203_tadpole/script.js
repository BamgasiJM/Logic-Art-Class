const NUM_PARTICLES = 800;
const RADIUS = 2;
const SPEED_MIN = 1.2;
const SPEED_MAX = 2.1;
const RECOVERY_FRAMES = 90;

let particles = [];

function setup() {
  createCanvas(1000, 1000);
  background(255);

  // 서로 겹치지 않게 파티클 생성
  let attempts = 0;
  while (particles.length < NUM_PARTICLES) {
    let x = random(RADIUS, width - RADIUS);
    let y = random(RADIUS, height - RADIUS);
    let valid = true;

    for (let p of particles) {
      if (dist(x, y, p.x, p.y) < RADIUS * 2) {
        valid = false;
        break;
      }
    }

    if (valid) {
      particles.push(new Particle(x, y));
    } else {
      attempts++;
      if (attempts > 10000) {
        console.warn("초기 배치 실패");
        break;
      }
    }
  }
}

function draw() {
  background(255); // 트레일 효과

  // 충돌 체크
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      particles[i].checkCollision(particles[j]);
    }
  }

  // 업데이트 및 그리기
  for (let p of particles) {
    p.update();
    p.display();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // 랜덤 방향, 랜덤 속도
    let angle = random(TWO_PI);
    let speed = random(SPEED_MIN, SPEED_MAX);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;

    this.hit = false;
    this.hitFrame = 0;
    this.history = []; // 트레일 위치 기록
    this.noiseOffset = random(1000); // 노이즈 오프셋 (흔들림용)
  }

  checkCollision(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d < RADIUS * 2) {
      this.hit = true;
      this.hitFrame = 0;
      other.hit = true;
      other.hitFrame = 0;

      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let distSq = dx * dx + dy * dy;

      if (distSq === 0) {
        dx = random(-1, 1);
        dy = random(-1, 1);
        distSq = dx * dx + dy * dy;
      }

      let nx = dx / sqrt(distSq);
      let ny = dy / sqrt(distSq);
      let dvx = other.vx - this.vx;
      let dvy = other.vy - this.vy;
      let dvn = dvx * nx + dvy * ny;

      if (dvn > 0) return;

      let impulse = dvn;
      this.vx += impulse * nx;
      this.vy += impulse * ny;
      other.vx -= impulse * nx;
      other.vy -= impulse * ny;

      let overlap = RADIUS * 2 - sqrt(distSq);
      let push = overlap * 0.5;
      this.x -= nx * push;
      this.y -= ny * push;
      other.x += nx * push;
      other.y += ny * push;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // 트레일 위치 기록 (현재 위치 추가)
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 20) {
      this.history.shift();
    }

    // 벽 충돌
    if (this.x <= RADIUS) {
      this.x = RADIUS;
      this.vx *= -1;
    } else if (this.x >= width - RADIUS) {
      this.x = width - RADIUS;
      this.vx *= -1;
    }

    if (this.y <= RADIUS) {
      this.y = RADIUS;
      this.vy *= -1;
    } else if (this.y >= height - RADIUS) {
      this.y = height - RADIUS;
      this.vy *= -1;
    }

    if (this.hit) {
      this.hitFrame++;
      if (this.hitFrame >= RECOVERY_FRAMES) {
        this.hit = false;
      }
    }
  }

  display() {
    noStroke();

    // 흔들리는 트레일 그리기
    if (this.history.length > 1) {
      for (let i = 0; i < this.history.length - 1; i++) {
        let pos = this.history[i];
        let nextPos = this.history[i + 1];

        // 각 점마다 시간에 따라 변하는 흔들림 계산
        let shakeAmount = random(0.5, 4.5); // 흔들림 강도
        let time = frameCount * 0.1 + i * 0.5 + this.noiseOffset;
        let shakeX = noise(time) * shakeAmount - shakeAmount / 2;
        let shakeY = noise(time + 100) * shakeAmount - shakeAmount / 2;
        let nextShakeX = noise(time + 0.3) * shakeAmount - shakeAmount / 2;
        let nextShakeY = noise(time + 100.3) * shakeAmount - shakeAmount / 2;

        // 투명도와 두께
        let alpha = map(i, 0, this.history.length - 1, 0, 150);
        let weight = map(i, 0, this.history.length - 1, 0.5, 3);

        // 흔들린 위치에 선 그리기
        strokeWeight(weight);
        if (this.hit) {
          let t = this.hitFrame / RECOVERY_FRAMES;
          let gray = lerp(0, 255, t);
          stroke(gray, alpha);
        } else {
          stroke(255, alpha);
        }

        line(
          pos.x + shakeX,
          pos.y + shakeY,
          nextPos.x + nextShakeX,
          nextPos.y + nextShakeY
        );
      }
    }

    // 메인 파티클 그리기
    noStroke();
    if (this.hit) {
      let t = this.hitFrame / RECOVERY_FRAMES;
      let gray = lerp(0, 255, t);
      fill(gray);
    } else {
      fill(255);
    }
    circle(this.x, this.y, RADIUS * 2);
  }
}
