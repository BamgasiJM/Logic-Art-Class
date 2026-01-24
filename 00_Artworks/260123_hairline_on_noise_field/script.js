const noiseScale = 0.0005;
const numCurves = 1000;
let curves = [];

function setup() {
  createCanvas(1000, 1000);
  background(0);
  noiseSeed(1000);

  for (let i = 0; i < numCurves; i++) {
    curves.push(new FlowCurve());
  }
}

function draw() {
  background(0, 20);

  for (let curve of curves) {
    curve.update();
    curve.display();
  }
}

class FlowCurve {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.history = [];
    this.maxLength = floor(random(30, 80));
    this.strokeW = random(0.1, 0.3);
    this.speed = random(1, 5);
    this.age = 0;
    this.lifespan = this.maxLength + random(300, 500);
    this.growthPhase = this.maxLength;
    this.dying = false;
  }

  update() {
    this.age++;

    // 성장 단계: 점진적으로 길어짐
    if (this.age < this.growthPhase) {
      this.updatePosition();
    }
    // 성숙 단계: 최대 길이 유지
    else if (this.age < this.lifespan - this.maxLength) {
      this.updatePosition();
    }
    // 소멸 단계: 꼬리부터 사라짐
    else {
      this.dying = true;
      if (this.history.length > 0) {
        this.history.shift();
      }
    }

    // 완전히 소멸하면 재생성
    if (this.dying && this.history.length === 0) {
      this.pos.set(random(width), random(height));
      this.history = [];
      this.age = 0;
      this.lifespan = this.maxLength + random(300, 500);
      this.dying = false;
    }

    // 화면 밖으로 나가면 재생성
    if (
      this.pos.x < -10 ||
      this.pos.x > width + 10 ||
      this.pos.y < -10 ||
      this.pos.y > height + 10
    ) {
      this.pos.set(random(width), random(height));
      this.history = [];
      this.age = 0;
      this.lifespan = this.maxLength + random(300, 500);
      this.dying = false;
    }
  }

  updatePosition() {
    let angle =
      noise(this.pos.x * noiseScale, this.pos.y * noiseScale) * TWO_PI * 2;
    this.pos.x += cos(angle) * this.speed;
    this.pos.y += sin(angle) * this.speed;

    this.history.push(this.pos.copy());
    if (this.history.length > this.maxLength) {
      this.history.shift();
    }
  }

  display() {
    const len = this.history.length;
    if (len < 2) return;

    noFill();

    for (let i = 0; i < len - 1; i++) {
      let t = i / (len - 1);
      let alpha = (1 - t) * 255;

      stroke(255, alpha);
      strokeWeight(this.strokeW * (1 - t * 0.5));

      let p1 = this.history[i];
      let p2 = this.history[i + 1];
      line(p1.x, p1.y, p2.x, p2.y);
    }
  }
}
