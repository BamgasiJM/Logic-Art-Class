let rad = 0;
let cols, rows;
let interval = 50;

function setup() {
  createCanvas(800, 400);
  cols = width / 10;
  rows = height / 10;
}

function draw() {
  background(0, 10);
  frameRate(10);

  noStroke();
  fill(20, 180, 170);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let centerx = x * interval;
      let centery = y * interval;

      push();
      translate(centerx, centery);
      rotate(rad);
      rad += PI / 360;

      rectMode(CENTER);
      rect(0, 0, 50, 5);
      pop();
    }
  }
}
