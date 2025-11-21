/**
사각형이 원형 궤도를 따라서 프레임 단위로 생성. 흑백 컬러 교차하면서 옵아트. 
**/

let angle = 0;    // 현재 각도 변수
let radius = 400; // 원의 반지름
let speed = 0.069; // 회전 속도

function setup() {
  createCanvas(800, 800);
  background(15); // 한 번만 그리기
  rectMode(CENTER); // 사각형의 기준점을 중앙으로 설정
  noStroke(); // 외곽선 없음
}

function draw() {
  // 1. 캔버스 중심 좌표
  let centerX = width;
  let centerY = height / 2;

  // 2. 원형 경로 계산 (Polar to Cartesian)
  // x = r * cos(theta), y = r * sin(theta)
  let x = centerX + cos(angle) * radius;
  let y = centerY + sin(angle) * radius;

  // 3. 그리기 상태 저장 (push/pop 패턴 사용)
  push();

  // 위치 이동 및 회전
  translate(x, y);

  // 사각형이 진행 방향을 바라보도록 회전 (접선 각도)
  // 원의 경우 현재 각도(angle)에 90도(HALF_PI)를 더하거나 빼면 진행 방향이 됨
  rotate(angle);

  // 4. 색상 교차 로직
  if (frameCount % 2 === 0) {
    fill(60, 200, 190);
  } else {
    fill(15);
  }

  // 5. 사각형 그리기
  rect(0, 0, 600, 400);

  pop(); // 변환 상태 복구

  // 6. 각도 업데이트 (한 바퀴 2*PI 돌면 멈추거나 계속 돌거나 선택)
  angle += speed;

  // (옵션) 한 바퀴 다 돌면 멈추고 싶다면 주석 해제
  if (angle > TWO_PI) noLoop();
}
