let angle1 = Math.PI / 2;
let angle2 = Math.PI / 2;
let angleV1 = 0;
let angleV2 = 0;
let angleA1 = 0;
let angleA2 = 0;

let r1 = 125; // 첫 번째 막대 길이
let r2 = 145; // 두 번째 막대 길이
let m1 = 20;  // 첫 번째 질량
let m2 = 30;  // 두 번째 질량
let g = 1;    // 중력

let cx, cy;
let trail = [];

function setup() {
  createCanvas(800, 600);
  cx = width / 2;
  cy = 150;
}

function draw() {
  background(0, 20); // 잔상 효과

  // 더블 펜듈럼 운동 방정식 (복잡한 카오스 시스템)
  let num1 = -g * (2 * m1 + m2) * sin(angle1);
  let num2 = -m2 * g * sin(angle1 - 2 * angle2);
  let num3 = -2 * sin(angle1 - angle2) * m2;
  let num4 =
    angleV2 * angleV2 * r2 + angleV1 * angleV1 * r1 * cos(angle1 - angle2);
  let den = r1 * (2 * m1 + m2 - m2 * cos(2 * angle1 - 2 * angle2));
  angleA1 = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * sin(angle1 - angle2);
  num2 = angleV1 * angleV1 * r1 * (m1 + m2);
  num3 = g * (m1 + m2) * cos(angle1);
  num4 = angleV2 * angleV2 * r2 * m2 * cos(angle1 - angle2);
  den = r2 * (2 * m1 + m2 - m2 * cos(2 * angle1 - 2 * angle2));
  angleA2 = (num1 * (num2 + num3 + num4)) / den;

  angleV1 += angleA1;
  angleV2 += angleA2;
  angle1 += angleV1;
  angle2 += angleV2;

  // 감쇠 (에너지 손실)
  angleV1 *= 0.999;
  angleV2 *= 0.999;

  // 좌표 계산
  let x1 = r1 * sin(angle1) + cx;
  let y1 = r1 * cos(angle1) + cy;

  let x2 = x1 + r2 * sin(angle2);
  let y2 = y1 + r2 * cos(angle2);

  // 궤적 저장
  trail.push(createVector(x2, y2));
  if (trail.length > 500) {
    trail.shift();
  }

  // 궤적 그리기
  stroke(30, 210, 180, 100);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let v of trail) {
    vertex(v.x, v.y);
  }
  endShape();

  // 펜듈럼 그리기
  stroke(255);
  strokeWeight(2);
  line(cx, cy, x1, y1);
  line(x1, y1, x2, y2);

  fill(255);
  circle(cx, cy, 8);

  noStroke();
  fill(255);
  circle(x1, y1, m1);

  noStroke();
  fill(255);
  circle(x2, y2, m2);

  // 정보 표시
  fill(255);
  noStroke();
  textAlign(CENTER);
  text("클릭하면 초기 조건을 리셋합니다", width/2, height-20);
}

function mousePressed() {
  // 초기 조건을 약간 다르게 리셋
  angle1 = PI / 2 + random(-0.1, 0.1);
  angle2 = PI / 2 + random(-0.1, 0.1);
  angleV1 = 0;
  angleV2 = 0;
  trail = [];
}
