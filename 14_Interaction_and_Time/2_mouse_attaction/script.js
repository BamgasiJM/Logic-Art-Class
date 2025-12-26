let particles = [];

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 200; i++) {
    particles.push({
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-1, 1), random(-1, 1)),
    });
  }
}

function draw() {
  background(15);

  for (let p of particles) {
    // 마우스 방향으로 끌어당기는 힘
    let force = createVector(mouseX - p.pos.x, mouseY - p.pos.y);
    force.setMag(0.05);

    p.vel.add(force);
    p.vel.limit(3);
    p.pos.add(p.vel);

    fill(240, 200, 30);
    noStroke();
    circle(p.pos.x, p.pos.y, 6);
  }
}
