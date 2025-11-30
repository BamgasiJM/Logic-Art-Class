let x = 0.01;
let y = 0;
let z = 0;

let a = 10;    // 시그마
let b = 28;    // 로
let c = 8 / 3; // 베타

let points = [];
let dt = 0.01;

function setup() {
  createCanvas(800, 600, WEBGL);
  colorMode(HSB);
}

function draw() {
  background(0);

  // 로렌츠 방정식
  let dx = a * (y - x) * dt;
  let dy = (x * (b - z) - y) * dt;
  let dz = (x * y - c * z) * dt;

  x += dx;
  y += dy;
  z += dz;

  points.push(createVector(x, y, z));

  // 최대 점 개수 제한
  if (points.length > 3000) {
    points.shift();
  }

  // 카메라 회전
  rotateY(frameCount * 0.003);
  rotateX(-0.5);

  // 점들을 선으로 연결
  strokeWeight(1.5);
  noFill();

  beginShape();
  for (let i = 0; i < points.length; i++) {
    let v = points[i];
    let hue = map(i, 0, points.length, 0, 255);
    stroke(hue, 255, 255, 200);
    vertex(v.x * 5, v.y * 5, v.z * 5);
  }
  endShape();

  // 현재 위치 강조
  push();
  noStroke();
  fill(255);
  translate(x * 5, y * 5, z * 5);
  sphere(3);
  pop();
}
