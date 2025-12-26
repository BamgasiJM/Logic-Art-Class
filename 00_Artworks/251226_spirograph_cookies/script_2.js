class Spirograph {
  constructor(R, r, d, hue, saturation, brightness, speed, offset) {
    this.R = R;
    this.r = r;
    this.d = d;
    this.hue = hue;
    this.saturation = saturation;
    this.brightness = brightness;
    this.speed = speed;
    this.theta = offset;
    this.points = [];
    this.maxPoints = 3000;
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

    noFill();
    beginShape();
    for (let i = 0; i < len; i++) {
      const ratio = i / len;
      const alpha = map(ratio, 0, 1, 0, 80);
      const weight = map(ratio, 0, 1, 0.3, 0.8);

      stroke(this.hue, this.saturation, this.brightness, alpha);
      strokeWeight(weight);

      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
  }
}

let spiros = [];
let rotation = 0;
let scaleOsc = 0;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 100);
  background(20, 15, 95);

  // 여러 개의 스파이로그래프를 다른 파라미터로 생성
  const numSpiros = 7;

  for (let i = 0; i < numSpiros; i++) {
    const angle = (TWO_PI * i) / numSpiros;

    spiros.push(
      new Spirograph(
        random(120, 200),
        random(30, 70),
        random(40, 100),
        random(0, 20), // 주황-빨강 계열
        random(70, 90), // 채도
        random(85, 95), // 밝기
        random(0.01, 0.025),
        angle
      )
    );
  }
}

function draw() {
  background(20, 15, 95, 3);

  translate(width / 2, height / 2);

  rotation += 0.002;
  rotate(rotation);

  scaleOsc += 0.008;
  const s = 0.9 + 0.15 * sin(scaleOsc);
  scale(s);

  // 모든 스파이로그래프 업데이트 및 표시
  for (let spiro of spiros) {
    spiro.update();
    spiro.display();
  }
}
