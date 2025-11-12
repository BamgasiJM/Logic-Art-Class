let branchLength = 100;

function setup() {
  createCanvas(800, 400);
  angleMode(DEGREES); // 각도 단위를 degree로 설정
  stroke(10, 180, 170, 50);
  strokeWeight(3);
}

function draw() {
  background(25);
  translate(width / 2, height); // 그림의 원점을 캔버스 하단 중앙으로 이동

  // 재귀 함수 호출 시작: 초기 길이와 깊이
  drawBranch(branchLength, 0);
}

/**
 * 가지를 재귀적으로 그리는 함수
 * @param {number} len 현재 가지의 길이
 * @param {number} level 현재 재귀 깊이 (선택 사항이지만 명시적으로 추가)
 */
function drawBranch(len, level) {
  // 1. 현재 가지(선)를 그립니다. (원점 (0,0)에서 위로)
  line(0, 0, 0, -len);

  // 이 시점에서 좌표계는 가지의 끝점 (-len)으로 이동해야 합니다.
  translate(0, -len);

  // 2. **종료 조건 (Base Case)**:
  // 가지의 길이가 너무 짧아지면 (예: 3 픽셀 미만) 재귀를 멈춥니다.
  if (len < 3) {
    // 잎사귀처럼 작은 점을 찍어 마무리
    stroke(50, 200, 50); // 녹색
    point(0, 0);
    return;
  }

  // 3. **재귀 호출 (Recursive Call)**:

  // A. 오른쪽 가지
  push(); // 현재 좌표계 상태(위치/회전) 저장
  rotate(30); // 30도 오른쪽으로 회전
  drawBranch(len * 0.8, level + 1); // 길이 80%로 줄이고 재귀 호출
  pop(); // 저장된 상태로 복원

  // B. 왼쪽 가지
  push(); // 현재 좌표계 상태 저장
  rotate(-55); // -65도 왼쪽으로 회전
  drawBranch(len * 0.6, level + 1); // 길이 60%로 줄이고 재귀 호출
  pop(); // 저장된 상태로 복원
}
