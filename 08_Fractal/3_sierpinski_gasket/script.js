let W = 800;
let H = 700;

// 재귀 깊이 (반복 횟수)
// 0: 하나의 삼각형, 6~7 정도가 적절
let maxDepth = 7;

function setup() {
  // 캔버스를 생성합니다.
  createCanvas(W, H);

  // 배경을 어두운 색으로 설정합니다.
  background(20);

  // 선 스타일 설정: 외곽선은 흰색, 채우기는 검은색 (비어있는 효과)
  stroke(30, 240, 210);
  strokeWeight(1);
  fill(20); // 배경색과 같은 색으로 채워 역삼각형이 '비어 보이게' 만듭니다.

  // 시에르핀스키 개스킷의 세 꼭짓점을 정의합니다.
  // 캔버스 중앙 상단, 왼쪽 하단, 오른쪽 하단에 정삼각형 모양으로 배치합니다.
  let p1 = createVector(W / 2, 50); // 상단 꼭짓점
  let p2 = createVector(50, H - 50); // 왼쪽 하단 꼭짓점
  let p3 = createVector(W - 50, H - 50); // 오른쪽 하단 꼭짓점

  // 재귀 함수를 호출하여 시에르핀스키 개스킷을 그립니다.
  sierpinski(p1, p2, p3, 0);

  // 정적인 결과물이므로 noLoop()를 사용합니다.
  noLoop();
}

/**
 * 시에르핀스키 개스킷을 재귀적으로 생성하는 함수입니다.
 * @param {p5.Vector} v1 - 삼각형의 첫 번째 꼭짓점
 * @param {p5.Vector} v2 - 삼각형의 두 번째 꼭짓점
 * @param {p5.Vector} v3 - 삼각형의 세 번째 꼭짓점
 * @param {number} depth - 현재 재귀 깊이
 */
function sierpinski(v1, v2, v3, depth) {
  // 1. **재귀 탈출 조건 (Base Case)**:
  // 재귀 깊이가 'maxDepth'에 도달하면 더 이상 분할하지 않고 현재 삼각형을 그립니다.
  if (depth >= maxDepth) {
    // 세 꼭짓점을 잇는 삼각형을 그립니다.
    triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
    return;
  }

  // 2. **새로운 꼭짓점 (중간점) 계산**:
  // 현재 삼각형의 각 변의 중점을 계산합니다.
  // 벡터의 합을 2로 나누면 (v1 + v2) / 2 가 되어 중점을 쉽게 구할 수 있습니다.

  // v1과 v2의 중점 (m12)
  let m12 = p5.Vector.add(v1, v2).mult(0.5);
  // v2와 v3의 중점 (m23)
  let m23 = p5.Vector.add(v2, v3).mult(0.5);
  // v3과 v1의 중점 (m31)
  let m31 = p5.Vector.add(v3, v1).mult(0.5);

  // 3. **재귀 호출 (Recursive Step)**:
  // 원래 삼각형의 세 꼭짓점과 새로 계산한 세 중점을 사용하여 3개의 작은 '부분 삼각형'에 대해 재귀 호출합니다.
  let nextDepth = depth + 1;

  // 1. 상단 작은 삼각형: (v1, m12, m31)
  sierpinski(v1, m12, m31, nextDepth);

  // 2. 왼쪽 하단 작은 삼각형: (m12, v2, m23)
  sierpinski(m12, v2, m23, nextDepth);

  // 3. 오른쪽 하단 작은 삼각형: (m31, m23, v3)
  sierpinski(m31, m23, v3, nextDepth);

  // (참고: 중앙의 역삼각형 (m12, m23, m31)은 그리지 않음으로써 '빈 공간'을 만듭니다.)
}
