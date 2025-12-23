// ======================================================
// 1. 전역 설정값 (Configuration Constants)
// ======================================================

// 삼각형 그리드 기본 설정
const TRI_SIZE = 20; // 삼각형 크기
const SPACING = 30; // 삼각형 간격
const BRIGHT_RANGE = 500; // 밝아지는 효과 범위 (픽셀)
const ROTATION_EASING = 0.1; // 회전 easing 값 (0~1, 작을수록 부드러움)

// HSB 색상 설정
const HUE_MIN = 180; // Hue 최소값 (0~360, 청록색)
const HUE_MAX = 240; // Hue 최대값 (0~360, 파란색)
const BRIGHTNESS_NEAR = 80; // 가까운 곳의 밝기 (0~100)
const BRIGHTNESS_FAR = 20; // 먼 곳의 밝기 (0~100)

// ======================================================
// 2. 전역 상태 변수 (Global State)
// ======================================================

let grid; // 삼각형 그리드 객체 (TriangleGrid 인스턴스)

// ======================================================
// 3. p5.js 라이프사이클 함수
// ======================================================

// p5.js 초기 설정 함수 (프로그램 시작 시 한 번만 실행)
function setup() {
  // 캔버스 생성 (전체 윈도우 크기)
  createCanvas(windowWidth, windowHeight);

  // 색상 모드를 HSB로 설정
  // hue: 0~360, saturation/brightness: 0~100
  colorMode(HSB, 360, 100, 100);

  // 삼각형 그리드 초기화
  grid = new TriangleGrid();
}

// p5.js 메인 루프 함수 (매 프레임마다 실행)
function draw() {
  // 배경을 검은색으로 초기화
  background(0);

  // 모든 삼각형의 상태 업데이트 (각도 계산)
  grid.update();

  // 모든 삼각형 화면에 그리기
  grid.display();
}

// 윈도우 크기 변경 시 호출되는 함수
function windowResized() {
  // 캔버스 크기 재조정
  resizeCanvas(windowWidth, windowHeight);

  // 그리드 재생성
  grid = new TriangleGrid();
}

// ======================================================
// 4. 클래스 정의 (Class Definitions)
// ======================================================

// 삼각형 그리드를 관리하는 클래스
class TriangleGrid {
  constructor() {
    // 화면에 필요한 열(column)과 행(row) 개수 계산
    this.cols = ceil(width / SPACING);
    this.rows = ceil(height / SPACING);

    // 모든 삼각형 객체를 담을 배열
    this.triangles = [];

    // 삼각형 객체들 생성 및 초기화
    this.initializeTriangles();
  }

  // 그리드 상의 모든 위치에 삼각형 객체 생성
  initializeTriangles() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        // 각 삼각형의 화면 상 좌표 계산
        let x = SPACING / 2 + i * SPACING;
        let y = SPACING / 2 + j * SPACING;

        // Triangle 인스턴스 생성 후 배열에 추가
        this.triangles.push(new Triangle(x, y));
      }
    }
  }

  // 모든 삼각형의 상태 업데이트 (각도 계산)
  update() {
    for (let tri of this.triangles) {
      tri.update();
    }
  }

  // 모든 삼각형을 화면에 그리기
  display() {
    for (let tri of this.triangles) {
      tri.display();
    }
  }
}

// 개별 삼각형을 나타내는 클래스
class Triangle {
  constructor(x, y) {
    this.x = x; // 삼각형의 X 좌표
    this.y = y; // 삼각형의 Y 좌표
    this.currentAngle = 0; // 현재 회전 각도 (라디안)
  }

  // 삼각형의 회전 각도를 마우스 방향으로 업데이트
  update() {
    // 마우스를 향하는 목표 각도 계산
    let targetAngle = atan2(mouseY - this.y, mouseX - this.x);

    // 현재 각도와 목표 각도의 차이 계산
    let diff = targetAngle - this.currentAngle;

    // 각도 차이를 -PI ~ PI 범위로 정규화
    // (최단 경로로 회전하도록 보정)
    if (diff > PI) diff -= TWO_PI;
    if (diff < -PI) diff += TWO_PI;

    // easing을 적용하여 부드럽게 회전
    this.currentAngle += diff * ROTATION_EASING;
  }

  // 삼각형을 화면에 그리기
  display() {
    // 마우스와 삼각형 사이의 거리 계산
    let distance = dist(mouseX, mouseY, this.x, this.y);

    // 거리에 따른 Hue 값 계산
    // 가까우면 HUE_MIN, 멀면 HUE_MAX
    let hue = map(distance, 0, BRIGHT_RANGE, HUE_MIN, HUE_MAX, true);

    // 거리에 따른 밝기 계산 (ease-out cubic 적용)
    let brightness;
    if (distance < BRIGHT_RANGE) {
      // 0~1 사이로 정규화
      let t = distance / BRIGHT_RANGE;

      // ease-out cubic 함수: 1 - (1-t)³
      // 가까울 때는 천천히 변화, 멀 때는 급격히 변화
      let easedT = 1 - pow(1 - t, 3);

      // 정규화된 값을 실제 밝기 값으로 변환
      brightness = lerp(BRIGHTNESS_NEAR, BRIGHTNESS_FAR, easedT);
    } else {
      // 범위를 벗어난 경우 먼 곳의 밝기 적용
      brightness = BRIGHTNESS_FAR;
    }

    // 외곽선 없이 색상만 채우기
    noStroke();
    fill(hue, 100, brightness);

    // 삼각형 그리기
    push();

    translate(this.x, this.y); // 삼각형 위치로 이동
    rotate(this.currentAngle); // 계산된 각도로 회전
    beginShape();
    vertex(TRI_SIZE / 2, 0); // 오른쪽 끝 (앞쪽)
    vertex(-TRI_SIZE / 2, -TRI_SIZE / 4); // 왼쪽 아래
    vertex(-TRI_SIZE / 2, TRI_SIZE / 4); // 왼쪽 위
    endShape(CLOSE);

    pop();
  }
}
