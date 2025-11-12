const MAX_LEVEL = 7;

function setup() {
  createCanvas(800, 450);
  noLoop();
  stroke(255, 200, 70);
  strokeWeight(1);
}

function draw() {
  background(20);

  // 재귀 함수 호출 시작
  // x1, y1, x2, y2, level
  divideLine(50, height / 2, width - 50, height / 2, 0);
}

/**
 * 선분을 재귀적으로 나누는 함수
 * @param {number} x1 시작점 x 좌표
 * @param {number} y1 시작점 y 좌표
 * @param {number} x2 끝점 x 좌표
 * @param {number} y2 끝점 y 좌표
 * @param {number} level 현재 재귀 깊이
 */

function divideLine(x1, y1, x2, y2, level) {
  // 1. **종료 조건 (Base Case)**:
  // 재귀 깊이가 최대 레벨에 도달하면 함수를 종료합니다.
  if (level > MAX_LEVEL) {
    return;
  }

  // 현재 레벨의 선분을 그립니다.
  line(x1, y1, x2, y2);

  // 선분의 중점 (Midpoint) 계산
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;

  // 중점에서 작은 수직선을 그립니다. (시각적 구분)
  let length = dist(x1, y1, x2, y2);
  line(midX, midY - length * 0.3, midX, midY + length * 0.3);

  // 2. **재귀 호출 (Recursive Call)**:
  // 새로운 두 개의 선분에 대해 함수 자신을 다시 호출합니다.
  // 왼쪽 선분: (x1, y1) ~ (midX, midY)
  divideLine(x1, y1, midX, midY, level + 1);

  // 오른쪽 선분: (midX, midY) ~ (x2, y2)
  divideLine(midX, midY, x2, y2, level + 1);
}
