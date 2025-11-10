const pitch = 200;

function setup() {
  createCanvas(800, 800);
  background(23);
  // noLoop();
  frameRate(3);

}

function draw() {
  background(0, 8);
  let num = floor(random(4, 12));
  let interval = width / num;

  noFill();
  stroke(10, 180, 170);
  strokeWeight(5);

  beginShape();
  curveVertex(0, height / 2);
  for (let f = 0; f <= num; f++) {
    curveVertex(interval * f, height / 2 + random(-pitch, pitch));
  }
  curveVertex(interval * num, height / 2 - pitch);
  endShape();
}
