let particles = [];
let perlin;
let time = 0;
let frameCount = 0;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 1.0);
  perlin = new p5.Noise();
  spawnParticles();
}

function spawnParticles() {
  particles = [];
  const center = createVector(width / 2, height / 2);

  for (let i = 0; i < 1000; i++) {
    let angle = random(TWO_PI);
    let velocity = p5.Vector.fromAngle(angle).mult(random(1, 3));

    particles.push({
      position: center.copy(),
      velocity: velocity,
      history: [],
      hue: random(1.0),
    });
  }
}

function draw() {
  time += 0.02;
  frameCount++;

  // 일정 시간(300프레임 ≈ 5초)마다 중앙에서 다시 폭발
  if (frameCount % 300 === 0) {
    spawnParticles();
  }

  // 반투명 검은 배경 (잔상 효과)
  background(0, 0, 0, 0.1);

  // 파티클 업데이트
  for (let p of particles) {
    let n = noise(
      p.position.x * 0.5,
      p.position.y * 0.5,
      time
    );

    let angleOffset = map(n, 0, 1, -0.3, 0.3);

    let currentAngle = p.velocity.heading();
    let newAngle = currentAngle + angleOffset;
    let speed = p.velocity.mag() * 1.01; // 점점 빨라짐

    p.velocity = p5.Vector.fromAngle(newAngle).mult(speed);
    p.position.add(p.velocity);

    p.history.push(p.position.copy());
    if (p.history.length > 25) {
      p.history.shift();
    }

    // 궤적 그리기
    if (p.history.length > 1) {
      stroke(p.hue, 0.9, 0.6, 0.6);
      strokeWeight(0.8);
      noFill();
      beginShape();
      for (let pt of p.history) {
        vertex(pt.x, pt.y);
      }
      endShape();
    }
  }
}

// p5.Noise 클래스 정의 (p5.js에 기본적으로 없으므로 추가)
p5.Noise = function() {
  this.octaves = 4;
  this.falloff = 0.5;
};

p5.Noise.prototype.get = function(x, y, z) {
  return noise(x, y, z);
};

let p = new p5.Noise();
noiseDetail(2, 0.5);
