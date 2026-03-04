const BG = "#050505";
const BASE_STROKE = "#1b1b1b";
const BASE_FILL = "#0d0d0d";

// cyberpunk highlight
const HIGHLIGHTS = ["#00F0FF", "#FF2BD6", "#FFD400", "#7CFF00"];

const cellCount = 15;
const innerRectSide = 880;

let cells = [];

function setup() {
  createCanvas(1000, 1000);
  angleMode(DEGREES);
  rectMode(CENTER);
  noFill();

  initGrid();
}

function draw() {
  background(BG);
  translate(width / 2, height / 2);

  for (const c of cells) {
    c.update();
    c.draw();
  }
}

function initGrid() {
  const side = innerRectSide / cellCount;
  const start = -(side * (cellCount - 1)) / 2;

  cells = [];
  for (let r = 0; r < cellCount; r++) {
    for (let c = 0; c < cellCount; c++) {
      cells.push(new Cell(start + c * side, start + r * side, side, r, c));
    }
  }
}

class Cell {
  constructor(x, y, side, r, c) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.r = r;
    this.c = c;

    this.phase = random(360);
    this.speed = random(1.5, 3);
    this.rotAmp = random(4, 10);

    this.colorNow = color(pick(HIGHLIGHTS));
    this.colorTarget = color(pick(HIGHLIGHTS));
    this.nextColorShift = frameCount + floor(random(220, 420));

    this.mode = (r + c) % 3;
  }

  update() {
    if (frameCount >= this.nextColorShift) {
      this.colorTarget = color(pick(HIGHLIGHTS));
      this.nextColorShift = frameCount + floor(random(220, 420));
    }
    this.colorNow = lerpColor(this.colorNow, this.colorTarget, 0.03);
  }

  draw() {
    const t = frameCount * this.speed + this.phase;
    const s = this.side;

    push();
    translate(this.x, this.y);

    stroke(BASE_STROKE);
    strokeWeight(1.2);
    fill(BASE_FILL);
    rect(0, 0, s, s);

    const subtleRot = sin(t) * this.rotAmp;
    const pulse = map(sin(t * 0.7), -1, 1, 0.86, 1.02);

    if (this.mode === 0) {
      push();
      rotate(subtleRot);

      noFill();
      stroke(this.colorNow);
      strokeWeight(3.2);
      const sz = s * 0.52 * pulse;
      rect(0, 0, sz, sz);

      strokeWeight(2.4);
      circle(0, 0, s * 0.16 * pulse);
      pop();
    } else if (this.mode === 1) {
      push();
      rotate(-subtleRot * 0.7);

      stroke(this.colorNow);
      strokeWeight(2);

      const len = s * 0.34 * pulse;
      line(-len, 0, len, 0);
      line(0, -len, 0, len);

      strokeWeight(4.2);
      noFill();
      rect(0, 0, s * 0.34 * pulse, s * 0.34 * pulse);
      pop();
    } else {
      push();
      rotate(subtleRot * 0.8);

      noFill();
      stroke(this.colorNow);
      strokeWeight(2);

      const tri = s * 0.5 * pulse;
      triangle(-tri * 0.5, tri * 0.45, 0, -tri * 0.55, tri * 0.5, tri * 0.45);

      strokeWeight(1.2);
      circle(0, 0, s * 0.12);
      pop();
    }

    pop();
  }
}

function pick(arr) {
  return arr[floor(random(arr.length))];
}
