const STAR_COUNT = 5500;

let stars = [];
let spacePressed = false;

class Star {
  constructor(initialAngle) {
    this.baseR = Math.random() * 670 + 130;
    this.r = this.baseR;

    this.baseOmega = Math.random() * 0.004 + 0.002;
    this.omega = this.baseOmega;

    this.cosAngle = Math.cos(initialAngle);
    this.sinAngle = Math.sin(initialAngle);

    this.size = Math.random() * 3 + 2;

    this.angularMomentum = this.r * this.r * this.omega;
    this.minR = 10;

    this.progress = 0.0;
    this.animSpeed = Math.random() * 0.003 + 0.002;

    // 색상 속성
    this.hue = Math.random() * 120 + 180;
    this.sat = 80;
    this.bri = 70;
  }

  easeInOut(t) {
    return t * t * (3.0 - 2.0 * t);  }

  update() {
    if (spacePressed) {
      this.progress = Math.min(this.progress + this.animSpeed, 1.0);
    } else {
      this.progress = Math.max(this.progress - this.animSpeed, 0.0);
    }

    const eased = this.easeInOut(this.progress);

    this.r = this.baseR - (this.baseR - this.minR) * eased;
    this.omega = this.angularMomentum / (this.r * this.r);

    const cosOmega = Math.cos(this.omega);
    const sinOmega = Math.sin(this.omega);

    const newCos = this.cosAngle * cosOmega - this.sinAngle * sinOmega;
    const newSin = this.sinAngle * cosOmega + this.cosAngle * sinOmega;

    this.cosAngle = newCos;
    this.sinAngle = newSin;
  }

  draw() {
    const x = this.cosAngle * this.r;
    const y = this.sinAngle * this.r;

    const eased = this.easeInOut(this.progress);
    const currentSat = this.sat * (1.0 - eased);
    const currentBri = this.bri * (1.0 - eased);

    noStroke();
    fill(this.hue, currentSat, currentBri);
    ellipse(x, y, this.size, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star(Math.random() * TWO_PI));
  }
}

function draw() {
  background(0, 0, 90, 0.8);
  translate(width / 2, height / 2);

  noStroke();
  fill(0);
  ellipse(0, 0, 35, 35);

  for (let star of stars) {
    star.update();
    star.draw();
  }
}

function keyPressed() {
  if (key === " ") spacePressed = true;
}

function keyReleased() {
  if (key === " ") spacePressed = false;
}
