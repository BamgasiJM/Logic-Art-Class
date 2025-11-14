let ang = [];
let num = 40;

function setup() {
  createCanvas(800, 400);
  angleMode(DEGREES);

  for (let i = 0; i < num; i++) {
    //ang[i] = random(360);
    ang.push(random(360));
  }
}

function draw() {
  background(0, 20);

  for (let i = 0; i < num; i++) {
    push();
    translate(width / 2, height / 2);
    rotate(ang[i]);
    fill(70, 190, 180, 255);
    noStroke();
    ellipse(i * 10, 0, 10);
    pop();
    ang[i] += calVelocity(i);
  }
}
function calVelocity(i) {
  let val = map(i, 0, num, 0.7, 1.5);
  return val;
}
