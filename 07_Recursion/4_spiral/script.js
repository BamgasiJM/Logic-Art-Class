const NUM_SIDES = 6;         // 다각형의 꼭짓점 개수
const START_LENGTH = 400;    // 나선의 가장 바깥쪽 변의 시작 길이
const LENGTH_DECREMENT = 8;  // 매번 길이가 줄어드는 고정 값
const MIN_LENGTH = 2;        // 나선이 멈추는 최소 길이
const MIN_WEIGHT = 0.3;      // 선분의 최소 두께
const MAX_WEIGHT = 4         // 선문의 최대 두께

// 정다각형의 외각 (External Angle) = 360도 / 꼭짓점 개수
const TURN_ANGLE = 360 / NUM_SIDES;

function setup() {
  createCanvas(800, 400);
  noLoop();
  angleMode(DEGREES); // 회전을 위해 DEGREE 모드 사용

  background(5);

  // 선분의 두께 때문에 캔버스 밖으로 나가지 않도록 시작점을 두께만큼 이동
  // 선분의 시작점을 최초선분 길이만큼 이동시켜서 나선 중심이 캔버스 중심에 오도록
  // y축은 필요에 따라 식 추가
  translate(-2 * MAX_WEIGHT + START_LENGTH / 2, MAX_WEIGHT); 
  // 재귀 함수 호출 시작 (현재 길이, 현재 단계)
  drawPolygonalSpiral(START_LENGTH, 0);
}

/**
 * 다각형 나선 패턴을 재귀적으로 그리는 함수
 * @param {number} len 현재 선분의 길이
 * @param {number} step 현재 재귀 단계 (0부터 시작)
 */
function drawPolygonalSpiral(len, step) {
  // 1. **종료 조건 (Base Case)**:
  if (len <= MIN_LENGTH) {
    return;
  }

  // 2. **선 스타일 설정**:
  // 깊이에 따라 선 두께와 색상 설정
  let weight = map(len, MIN_LENGTH, START_LENGTH, MIN_WEIGHT, MAX_WEIGHT);
  strokeWeight(weight);
  stroke(60, 190, 180, 255);

  // 3. **다각형 그리기 및 변환**:

  // N각형 나선은 N개의 변을 순서대로 그리며 나아가야 합니다.
  // 사각형 나선(N=4)에서는 4개의 방향을 if/else if로 처리했지만,
  // N각형에서는 for 루프와 p5.js의 'rotate'를 활용하여 일반화합니다.

  // 현재 길이와 방향으로 하나의 변을 그립니다.
  line(0, 0, len, 0);

  // 다음 변을 그릴 위치로 원점 이동
  // (0, 0)에서 그린 선분의 끝점 (len, 0)으로 이동합니다.
  translate(len, 0);

  // 4. **회전 (Rotation)**:
  // 다음 변을 그리기 위해 좌표계를 'TURN_ANGLE'만큼 회전시킵니다.
  // 이는 N각형의 외각만큼 꺾는 효과를 줍니다.
  rotate(TURN_ANGLE);

  // 5. **길이 업데이트**:

  let nextLength = len;

  // 사각형 나선(N=4)에서는 2단계마다 길이를 줄였지만,
  // 일반적인 다각형 나선에서는 각 변을 그린 후 길이를 줄이는 것이 자연스럽습니다.
  // 그러나 원본 사각형 나선의 '두 변마다 길이 감소' 로직을 유지하여 나선 구조를 만듭니다.
  if (step % (NUM_SIDES / 2) === 0) {
    nextLength = len - LENGTH_DECREMENT;
  }

  // 6. **재귀 호출**:
  // 길이는 업데이트하되, 회전 각도는 계속 누적하여 적용합니다.
  drawPolygonalSpiral(nextLength, step + 1);
}
