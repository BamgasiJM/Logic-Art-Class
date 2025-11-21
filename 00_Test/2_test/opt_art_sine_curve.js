/**
 * 위에서 아래로 내려오며 사인파(Sine Wave)를 그림
 */

let yPos = 0; // Y축 시작 위치
let angle = 0; // 사인파 계산을 위한 각도
let amplitude = 100; // 진폭 (좌우로 흔들리는 폭)
let frequency = 0.06; // 진동수 (곡선의 촘촘함)

function setup() {
  createCanvas(800, 800);
  background(25); // 어두운 회색
  rectMode(CENTER);
  noStroke();
}

function draw() {
  // 캔버스 세로길이 + alpha 너머로 벗어나면 멈춤
  if (yPos > height + 400) {
    noLoop();
    return;
  }

  // 1. 좌표 계산
  // X좌표는 사인값에 따라 좌우로 진동
  let x = width / 2 + sin(angle) * amplitude;
  let y = yPos;

  push();
  translate(x, y);

  // 2. 회전 계산 (미분 개념 활용)
  // 사인 곡선의 접선 각도를 구하기 위해 코사인 값을 사용하거나,
  // 이전 좌표와의 차이를 이용할 수 있습니다. 여기서는 간단히 코사인으로 근사합니다.
  // sin(x)의 미분은 cos(x)이므로, 이를 이용해 기울기를 구합니다.
  let rotationAngle = cos(angle) * 0.5; // 0.5은 회전 강도 조절 계수
  rotate(rotationAngle);

  // 3. 색상 교차
  if (frameCount % 2 === 0) {
    fill(60, 200, 190);
  } else {
    fill(25);
  }

  // 4. 사각형 그리기
  rect(0, 0, 200, 200);
  pop();

  // 5. 변수 업데이트
  yPos += 2;          // 아래로 내려가는 속도
  angle += frequency; // 곡선의 흐름 속도
}
