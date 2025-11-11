let particles = [];

function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(25);

  // 새로운 입자 생성
  particles.push(new Particle(width / 2, 100));

  // 입자 업데이트 및 렌더링
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.show();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0.05);
    this.lifetime = 255;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifetime -= 2;
  }

  show() {
    noStroke();
    fill(210, 180, 30, this.lifetime);
    ellipse(this.pos.x, this.pos.y, 8);
  }

  isDead() {
    return this.lifetime < 0;
  }
}
