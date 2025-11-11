let particles = [];
let attractMode = true; // true면 끌림, false면 밀어냄

function setup() {
  createCanvas(800, 400);
  for (let i = 0; i < 2000; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function draw() {
  background(2, 10);
  fill(255);
  noStroke();
  text(attractMode ? "Attraction Mode" : "Repulsion Mode", 10, 20);

  for (let p of particles) {
    p.behaviors();
    p.update();
    p.show();
  }
}

function mousePressed() {
  attractMode = !attractMode;
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
  }

  behaviors() {
    let mouse = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(mouse, this.pos);
    let d = dir.mag();
    d = constrain(d, 10, 30);
    dir.normalize();

    let strength = attractMode ? 5.0 / d : -5.0 / d;
    dir.mult(strength);
    this.acc = dir;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.vel.limit(5);
  }

  show() {
    stroke(255);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
  }
}
