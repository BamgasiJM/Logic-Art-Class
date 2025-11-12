function setup() {
  createCanvas(500, 300);
  noLoop();
  background(10);
  stroke(220);
  translate(width / 2, height);
  branch(100);
}

function branch(len) {
  line(0, 0, 0, -len);
  translate(0, -len);
  if (len > 8) {
    push();
    rotate(PI / 6);
    branch(len * 0.67);
    pop();

    push();
    rotate(-PI / 4);
    branch(len * 0.67);
    pop();
  }
}
