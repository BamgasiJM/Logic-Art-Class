let xoff = 0;

function setup() {
  createCanvas(800, 200);
  background(23);
  frameRate(60);
}

function draw() {
  let y = noise(xoff) * height;
  noStroke();
  fill(20, 190, 180, 255);
  // x 위치: frameCount % width (스크롤처럼 표시)
  ellipse((frameCount - 1) % width, y, 8, 8);
  xoff += 0.01;

  if (frameCount > width) {
    noLoop();
  }
}
