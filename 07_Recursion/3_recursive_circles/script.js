// ArtCode Mentor | p5.js Recursion Example 3 - Modified (Dynamic Radius Scaling)
// 목적: 재귀 깊이에 따라 반지름 축소 비율(Scaling Factor)과 투명도(Alpha)를 모두 조절
// p5.js 최신 안정화 버전 기반

const START_RADIUS = 150; // 시작 원의 반지름
const MAX_LEVEL = 5; // 최대 재귀 깊이 제한

function setup() {
  createCanvas(800, 400);
  noLoop();
  angleMode(DEGREES);
  noStroke();
}

function draw() {
  background(15);
  translate(width / 2, height / 2);

  // 재귀 함수 호출 시작 (중심점, 반지름, 현재 깊이)
  drawRecursiveCircles(0, 0, START_RADIUS, 1);
}

/**
 * 재귀적으로 원을 그리고 깊이에 따라 색상 투명도와 다음 반지름 축소 비율을 적용하는 함수
 * @param {number} x 중심 x 좌표
 * @param {number} y 중심 y 좌표
 * @param {number} radius 현재 원의 반지름
 * @param {number} level 현재 재귀 깊이 (1부터 시작)
 */
function drawRecursiveCircles(x, y, radius, level) {
  // 1. **종료 조건 (Base Case)**:
  if (radius < 2 || level > MAX_LEVEL) {
    // 최소 반지름을 4로 조정
    return;
  }

  // --- 색상 (투명도는 이전과 동일하게 깊이에 따라 적용) ---
  // 깊이가 깊을수록 투명해지도록 alpha 설정 (255 -> 50)
  let alpha = map(level, 1, MAX_LEVEL, 170, 20);
  fill(10, 190, 180, alpha); // 주황색 계열

  // 현재 원을 그립니다.
  ellipse(x, y, radius * 2);

  // --- 반지름 축소 비율 동적 계산 ---
  // 깊이(level)에 따라 다음 반지름의 축소 비율(Scaling Factor)을 결정합니다.
  // level 1: 축소 비율 0.35 (많이 줄어듦)
  // level MAX_LEVEL: 축소 비율 0.85 (상대적으로 적게 줄어듦)
  let scalingFactor = map(level, 1, MAX_LEVEL, 0.5, 0.35);

  // 다음 재귀 호출을 위한 새 반지름
  let nextRadius = radius * scalingFactor;

  // --- 재귀 호출 ---
  let angleIncrement = 60;
  let offset = radius;

  for (let angle = 0; angle < 360; angle += angleIncrement) {
    let newX = x + cos(angle) * offset;
    let newY = y + sin(angle) * offset;

    // 새로운 위치, 동적 축소된 반지름, 깊이 증가로 재귀 호출
    drawRecursiveCircles(newX, newY, nextRadius, level + 1);
  }
}
