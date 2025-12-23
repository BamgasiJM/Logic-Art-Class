const TRI_SIZE = 30;
const SPACING = 30;
const BRIGHT_RANGE = 600;
const ROTATION_EASING = 0.1;

const HUE_MIN = 180;
const HUE_MAX = 240;
const BRIGHTNESS_NEAR = 90;
const BRIGHTNESS_FAR = 10;

let grid;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  grid = new TriangleGrid();
}

function draw() {
  background(0);
  grid.update();
  grid.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  grid = new TriangleGrid();
}

class TriangleGrid {
  constructor() {
    this.cols = ceil(width / SPACING);
    this.rows = ceil(height / SPACING);
    this.triangles = [];
    this.initializeTriangles();
  }

  initializeTriangles() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let x = SPACING / 2 + i * SPACING;
        let y = SPACING / 2 + j * SPACING;
        this.triangles.push(new Triangle(x, y));
      }
    }
  }

  update() {
    for (let tri of this.triangles) {
      tri.update();
    }
  }

  display() {
    for (let tri of this.triangles) {
      tri.display();
    }
  }
}

class Triangle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.currentAngle = 0;
  }

  update() {
    let targetAngle = atan2(mouseY - this.y, mouseX - this.x);

    let diff = targetAngle - this.currentAngle;
    if (diff > PI) diff -= TWO_PI;
    if (diff < -PI) diff += TWO_PI;

    this.currentAngle += diff * ROTATION_EASING;
  }

  display() {
    let distance = dist(mouseX, mouseY, this.x, this.y);

    let hue = map(distance, 0, BRIGHT_RANGE, HUE_MIN, HUE_MAX, true);

    let brightness;
    if (distance < BRIGHT_RANGE) {
      let t = distance / BRIGHT_RANGE;
      let easedT = 1 - pow(1 - t, 3);
      brightness = lerp(BRIGHTNESS_NEAR, BRIGHTNESS_FAR, easedT);
    } else {
      brightness = BRIGHTNESS_FAR;
    }

    noStroke();
    fill(hue, 100, brightness);

    push();

    translate(this.x, this.y);
    rotate(this.currentAngle);
    beginShape();
    vertex(TRI_SIZE / 2, 0);
    vertex(-TRI_SIZE / 2, -TRI_SIZE / 6);
    vertex(-TRI_SIZE / 2, TRI_SIZE / 6);
    endShape(CLOSE);

    pop();
  }
}
