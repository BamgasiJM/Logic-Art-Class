// ====== 전역 변수 설정 ======
let W = 700;
let H = 700;
let radius = 200; // 기본 반지름 (형태의 크기 데이터)
let numPoints = 100; // 폴리곤을 구성할 점의 개수 (데이터 해상도)
let noiseScale = 0.01; // 노이즈의 스케일 (형태의 거칠기 제어 데이터)
let timeOffset = 0; // 시간 흐름에 따른 노이즈의 Z축 오프셋

function setup() {
  // 캔버스 생성 및 기본 설정
  createCanvas(W, H);
  background(10);

  // 외곽선과 채우기 색상 설정
  stroke(255, 100, 150); // 핑크빛 외곽선
  strokeWeight(2);
  fill(255, 100, 150, 50); // 반투명하게 채우기
}

function draw() {
  // 1. 배경을 반투명하게 덮어 잔상 효과를 만듭니다.
  background(10, 20);

  // 2. 캔버스 중앙으로 좌표계를 이동합니다.
  translate(width / 2, height / 2);

  // 3. 절차적 형태 생성 함수 호출
  drawProceduralShape();

  // 4. 시간 경과에 따라 노이즈 필드(Z축)를 이동시켜 형태를 연속적으로 변화시킵니다.
  timeOffset += 0.005;
}

/**
 * 수학적 데이터(극좌표)와 외부 데이터(노이즈)를 이용해 형태를 그립니다.
 */
function drawProceduralShape() {
  beginShape();

  // 폴리곤의 모든 점을 순회합니다.
  for (let i = 0; i < numPoints; i++) {
    // 1. 각도 데이터 생성: 0부터 360도(TWO_PI)까지 균등 분할
    let angle = map(i, 0, numPoints, 0, TWO_PI);

    // 2. 노이즈 입력 좌표 데이터 생성 (극좌표 기반)
    // 노이즈 공간을 원형으로 탐색하면서, timeOffset(Z축)을 더해 움직임을 만듭니다.
    let xoff = cos(angle) * noiseScale + timeOffset;
    let yoff = sin(angle) * noiseScale + timeOffset;

    // 3. 노이즈 값 데이터 획득: 노이즈 값(0~1)이 곧 반지름 변형의 데이터입니다.
    let noiseValue = noise(xoff, yoff);

    // 4. 반지름(r) 데이터 변형 및 정의 (절차적 모델링)
    // 노이즈 값을 -30에서 +50 픽셀 범위로 매핑하여 기본 반지름(200)에 더합니다.
    let r = radius + map(noiseValue, 0, 1, -30, 50);

    // 5. 극좌표(r, angle)를 화면 좌표인 직교좌표(x, y)로 변환
    let x = r * cos(angle);
    let y = r * sin(angle);

    // 6. 점 데이터로 형태 정의
    vertex(x, y);
  }
  endShape(CLOSE); // 폴리곤의 시작점과 끝점을 연결하여 형태를 닫습니다.
}
