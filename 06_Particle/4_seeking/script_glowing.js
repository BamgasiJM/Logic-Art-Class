let particles = [];
const numParticles = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function draw() {
  // 어두운 배경 with trail effect
  background(15, 15, 25, 30);

  let target = createVector(mouseX, mouseY);

  for (let particle of particles) {
    particle.seek(target);
    particle.update();
    particle.display();
  }

  drawTarget(target);
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 8;
    this.maxForce = 0.4;
    this.size = random(3, 8);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let distance = desired.mag();

    if (distance < 100) {
      let speed = map(distance, 0, 100, 0, this.maxSpeed);
      desired.setMag(speed);
    } else {
      desired.setMag(this.maxSpeed);
    }

    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // 화면 가장자리 순환
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  display() {
    push();

    // Glow 효과 (Canvas API의 shadowBlur 사용)
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(100, 200, 255).toString();

    // 밝은 파티클
    fill(150, 220, 255);
    noStroke();
    circle(this.pos.x, this.pos.y, this.size);

    // 코어
    fill(255);
    circle(this.pos.x, this.pos.y, this.size * 0.3);

    pop();
  }
}

function drawTarget(target) {
  push();
  noFill();

  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = color(255, 100, 150).toString();

  stroke(255, 150, 200);
  strokeWeight(2);
  circle(target.x, target.y, 30);

  strokeWeight(1);
  circle(target.x, target.y, 40);

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
