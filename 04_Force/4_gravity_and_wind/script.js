let movers = [];

function setup() {
  createCanvas(800, 400);
  for (let i = 0; i < 40; i++) {
    movers.push(new Mover(random(width), random(height)));
  }
}

function draw() {
  background(25, 25, 25, 50);

  let wind = createVector(0.02, 0.02);
  let gravity = createVector(0, 0.01);

  for (let m of movers) {
    if (mouseIsPressed) m.applyForce(wind);
    m.applyForce(gravity);
    m.update();
    m.edges();
    m.display();
  }

  fill(255);
  noStroke();
  text("Click to blow the wind →", 10, 20);
}

class Mover {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = random(0.5, 2);
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.y > height - 10) {
      this.pos.y = height - 10;
      this.vel.y *= -0.8;
    }
  }

  display() {
    fill(10, 190, 180, 200);
    ellipse(this.pos.x, this.pos.y, this.mass * 16, this.mass * 16);
  }
}
