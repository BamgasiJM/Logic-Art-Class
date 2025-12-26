class Spirograph {
  constructor(R, r, d, color, speed) {
    this.R = R;
    this.r = r;
    this.d = d;
    this.color = color;
    this.speed = speed;
    this.theta = 0;
    this.points = [];
    this.maxPoints = 5000;
  }

  update() {
    this.theta += this.speed;

    const k = (this.R - this.r) / this.r;
    const x =
      (this.R - this.r) * cos(this.theta) + this.d * cos(k * this.theta);
    const y =
      (this.R - this.r) * sin(this.theta) - this.d * sin(k * this.theta);

    this.points.push({ x, y });

    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }

  display() {
    const len = this.points.length;

    for (let i = 1; i < len; i++) {
      const ratio = i / len;
      const alpha = ratio * 255;
      const weight = map(ratio, 0, 1, 0.2, 1.5);

      stroke(red(this.color), green(this.color), blue(this.color), alpha);
      strokeWeight(weight);

      line(
        this.points[i - 1].x,
        this.points[i - 1].y,
        this.points[i].x,
        this.points[i].y
      );
    }
  }
}

let spiro;
let rotation = 0;
let scaleOsc = 0;

function setup() {
  createCanvas(800, 800);
  background(210, 200, 190);

  const colors = [color(50, 60, 100), color(40, 50, 80), color(70, 80, 120)];

  spiro = new Spirograph(
    random(180, 280),
    random(40, 90),
    random(50, 120),
    random(colors),
    random(0.008, 0.02)
  );
}

function draw() {
  background(210, 200, 190, 4);

  translate(width / 2, height / 2);

  rotation += 0.006;
  rotate(rotation);

  scaleOsc += 0.012;
  const s = 0.95 + 0.12 * sin(scaleOsc);
  scale(s);

  spiro.update();
  spiro.display();
}
