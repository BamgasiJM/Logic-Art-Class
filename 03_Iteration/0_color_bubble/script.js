function setup() {
  createCanvas(800, 800);
  background(16);

  // ripple(width / 2, height / 3, 10, 20, color("#f8c630"));
  // ripple(width / 3, height / 7, 10, 30, color("#e54f6d"));
  // ripple(width / 6, height / 2, 10, 50, color("#ff006e"));
}
function mousePressed() {
  let steps1 = floor(random(5, 15));
  let scale1 = random(10, 20);
  let color1 = color(random(255), random(255), random(255));
  ripple(mouseX, mouseY, steps1, scale1, color1);
}
function draw() {}

function ripple(x, y, steps, scale, color) {
  for (let i = steps; i >= 1; i--) {
    let val = map(i, 10, 1, 0, 255);
    color.setAlpha(val);
    color.setAlpha(50);
    noStroke();
    fill(color);
    ellipse(x, y, i * scale);
  }
}
