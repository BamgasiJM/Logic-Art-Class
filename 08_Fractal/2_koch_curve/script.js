let W = 800;
let H = 400;

// 재귀 깊이 (반복 횟수)
// 0: 단순한 선분, 1: 톱니 모양, 5-6 정도가 적절
let maxDepth = 5;

function setup() {
  // 캔버스를 생성합니다.
  createCanvas(W, H);

  // 배경을 어두운 색으로 설정합니다.
  background(20);

  // 선분의 색상과 굵기를 설정합니다.
  stroke(30, 240, 210);
  strokeWeight(1);
  noFill();

  // 코흐 곡선의 시작점과 끝점을 정의합니다.
  // 캔버스 중앙 하단에 넓게 펼쳐지도록 설정합니다.
  let p1 = createVector(50, H - 50);
  let p2 = createVector(W - 50, H - 50);

  // 재귀 함수를 호출하여 코흐 곡선을 그립니다.
  // 초기 깊이는 0입니다.
  koch(p1, p2, 0);

  // 'noLoop()'를 사용하여 draw() 함수가 반복 실행되지 않도록 합니다.
  // 정적인 결과물만 필요하므로 성능 최적화에 도움이 됩니다.
  noLoop();
}

/**
 * 코흐 곡선을 재귀적으로 생성하는 함수입니다.
 * @param {p5.Vector} startP - 현재 선분의 시작점
 * @param {p5.Vector} endP - 현재 선분의 끝점
 * @param {number} depth - 현재 재귀 깊이
 */
function koch(startP, endP, depth) {
  // 1. **재귀 탈출 조건 (Base Case)**:
  // 재귀 깊이가 'maxDepth'에 도달하면 더 이상 분할하지 않고 현재 선분만 그립니다.
  if (depth >= maxDepth) {
    line(startP.x, startP.y, endP.x, endP.y);
    return;
  }

  // 2. **선분 분할을 위한 중간점 계산**:
  // 현재 선분 (startP - endP)을 3등분하고, 정삼각형을 만들기 위한 꼭짓점을 계산합니다.

  // 선분을 벡터로 표현: V = endP - startP
  let v = p5.Vector.sub(endP, startP);

  // a: 시작점에서 전체 길이의 1/3 지점
  let a = p5.Vector.add(startP, v.copy().mult(1 / 3));

  // c: 시작점에서 전체 길이의 2/3 지점
  let c = p5.Vector.add(startP, v.copy().mult(2 / 3));

  // b: 돌출된 정삼각형의 꼭짓점 (a와 c 사이의 중간 지점을 60도 회전)
  // 1. 벡터 v를 1/2로 줄이고, startP에 더해 중간점(a와 c의 중간)을 구합니다. (필요없음)
  // 2. a에서 c로 향하는 벡터를 구합니다: acV = c - a = v/3
  // 3. acV를 60도 (PI/3 라디안) 반시계 방향으로 회전시킵니다.
  let b = p5.Vector.sub(c, a); // b는 이제 a-c 간의 벡터 (v/3)
  b.rotate(-PI / 3); // 60도 (PI/3) 회전 -> 코흐 눈꽃을 만들려면 PI/3을 사용합니다.
  b.add(a); // 시작점 a를 더해서 절대 위치를 구합니다.

  // 3. **재귀 호출 (Recursive Step)**:
  // 현재 선분을 4개의 작은 선분으로 대체하며 다음 깊이로 재귀 호출합니다.
  // [startP] -- [a] -- [b] -- [c] -- [endP] 순서입니다.
  let nextDepth = depth + 1;

  // 1. 시작점(startP) -> 첫 번째 지점(a)
  koch(startP, a, nextDepth);

  // 2. 첫 번째 지점(a) -> 돌출된 꼭짓점(b)
  koch(a, b, nextDepth);

  // 3. 돌출된 꼭짓점(b) -> 세 번째 지점(c)
  koch(b, c, nextDepth);

  // 4. 세 번째 지점(c) -> 끝점(endP)
  koch(c, endP, nextDepth);
}

// 참고: 코흐 눈꽃(Koch Snowflake)을 만들려면
// setup()에서 세 개의 koch() 호출을 사용하여 정삼각형의 세 변을 프랙탈화해야 합니다.
