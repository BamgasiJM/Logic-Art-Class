let movers = [];
const numMovers = 20;

function setup() {
  createCanvas(800, 400);

  for (let i = 0; i < numMovers; i++) {
    movers.push(new Mover(random(width), random(height)));
  }
}

function draw() {
  background(25, 8);

  let isMouseInside =
    mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  for (let mover of movers) {
    if (isMouseInside) {
      let mouse = createVector(mouseX, mouseY);
      let dir = p5.Vector.sub(mouse, mover.pos);
      let d = constrain(dir.mag(), 5, 25);
      dir.normalize();
      let strength = (20 * mover.mass) / (d * d);
      dir.mult(strength);
      mover.applyForce(dir);
    }

    mover.update();
    mover.edges();
    mover.display();
  }

  noStroke();
  fill(255);
  text("Move mouse to attract particles", 10, 20);
}

class Mover {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = random(5, 15);
    this.mass = this.size / 10;
  }

  applyForce(f) {
    let force = p5.Vector.div(f, this.mass);
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.mult(0.85);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  display() {
    fill(10, 180, 170);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}
