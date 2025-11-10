let ang = [];
let num = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  for (let i = 0; i < num; i++) {
    //ang[i] = random(360);
    ang.push(random(360));
  }
}

function draw() {
  background(0, 30);

  for (let i = 0; i < num; i++) {
    push();
    translate(width / 2, height / 2);
    rotate(ang[i]);
    fill(20, 180, 170, 255);
    noStroke();
    ellipse(i * 10, 0, 7);
    pop();
    ang[i] += calVelocity(i);
  }
}
function calVelocity(i) {
  let val = map(i, 0, num, 0.7, 1.5);
  return val;
}
