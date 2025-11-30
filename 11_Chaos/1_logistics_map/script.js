let r = 2.8; // 성장률 파라미터
let x = 0.5; // 초기값
let points = [];
const BURN_IN = 50; // 초기값 50회 계산 건너뛰기
let counter = 0; // 반복 횟수 카운터

function setup() {
  createCanvas(800, 400);
  background(0);
  frameRate(60); // 계산 속도를 좀 늦춰서 시각화에 도움을 줍니다.
}

function draw() {
  // 1. 잔상없이 매 프레임 갱신
  background(0);

  // 2. 마우스로 r 값 조정
  r = map(mouseX, 0, width, 0.0, 4.0);

  // 3. 로지스틱 방정식 계산
  // 3-1. 초기값 계산 건너뛰기 (BURN-IN):
  // x의 궤적이 안정점에 충분히 도달하도록 합니다.
  if (counter < BURN_IN) {
    x = r * x * (1 - x);
    counter++;
    // 이 단계에서는 점을 그리지 않습니다.
  } else {
    // 3-2. 로지스틱 맵 반복
    x = r * x * (1 - x);

    // 4. 그래프에 점 추가
    points.push(x);
    if (points.length > width) {
      points.shift();
    }
  }

  // 5. 그리기
  stroke(30, 190, 180);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < points.length; i++) {
    let px = i;
    // Y축 매핑을 좀 더 보기 쉽게 조정
    let py = map(points[i], 0, 1, height, 0);
    vertex(px, py);
  }
  endShape();

  // 6. 정보 표시 (생략 없이 원래 코드 유지)
  fill(255);
  noStroke();
  textAlign(LEFT);
  text("r = " + nf(r, 1, 3), 10, 20);
  text("x = " + nf(x, 1, 5), 10, 40);

  textAlign(CENTER);
  text("마우스를 좌우로 움직여 r 값을 변경하세요", width / 2, height - 10);

  // 7. r 값에 따른 상태 설명
  fill(200, 200, 30);
  textAlign(RIGHT);
  if (r < 1) {
    text("멸종", width - 10, 20);
  } else if (r < 3) {
    text("안정", width - 10, 20);
  } else if (r < 3.57) {
    text("진동", width - 10, 20);
  } else {
    text("카오스!", width - 10, 20);
  }
}

// 마우스를 떼면 x를 초기화하여 BURN-IN 과정을 다시 시작
function mouseReleased() {
  x = 0.5;
  points = [];
  counter = 0;
}
