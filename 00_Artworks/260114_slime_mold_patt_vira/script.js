// Patt Vira's Slime Mold Simulation
// https://www.youtube.com/watch?v=VyXxSNcgDtg

let molds = [];             // Mold 객체를 저장할 배열
let num = 4000;             // 생성할 Mold 객체의 개수
let d;                      // pixelDensity() 값을 저장할 변수

function setup() {
  createCanvas(400, 400);   // 400x400 픽셀 캔버스 생성
  angleMode(DEGREES);       // 각도를 도(degree)로 설정
  d = pixelDensity();       // 디스플레이의 픽셀 밀도를 저장

  // num 개수만큼 Mold 객체 생성
  for (let i = 0; i < num; i++) {
    molds[i] = new Mold();
  }
}

function draw() {
  background(0, 5);          // 반투명 검은색 배경 (알파값 5)
  loadPixels();              // 픽셀 배열을 메모리에 로드 (pixel[] 배열 사용 가능)

  // 모든 Mold 객체 업데이트 및 표시
  for (let i = 0; i < num; i++) {
    if (key == "s") {
      molds[i].stop = true;  // "s" 키를 누르면 Mold 객체가 멈춤
      updatePixels();        // 픽셀 배열을 화면에 업데이트
      noLoop();              // draw() 루프 중지
    } else {
      molds[i].stop = false; // "s" 키를 떼면 다시 움직임
    }

    molds[i].update();       // Mold 객체 상태 업데이트
    molds[i].display();      // Mold 객체 화면에 표시
  }
}

/*
1. Mold 객체
- 각 Mold는 캔버스 내 랜덤한 위치에서 생성됩니다.
- heading은 이동 방향을 나타내며, vx와 vy는 해당 방향의 x, y 성분입니다.
- stop 변수는 "s" 키를 누르면 true가 되어 이동을 멈춥니다.

2. 센서 시스템
- Mold는 앞쪽, 왼쪽, 오른쪽 센서를 가지고 있으며, 센서는 현재 방향을 기준으로 ±45도 위치에 있습니다.
- 센서는 주변 픽셀의 색상 값을 읽어, 주변 환경에 따라 이동 방향을 결정합니다.

3. 방향 전환 로직
- 앞쪽 센서 값이 가장 크면 직진합니다.
- 앞쪽 센서 값이 가장 작으면 랜덤하게 왼쪽 또는 오른쪽으로 회전합니다.
- 왼쪽 센서 값이 더 크면 오른쪽으로, 오른쪽 센서 값이 더 크면 왼쪽으로 회전합니다.

4. 캔버스 경계 처리
- Mold가 캔버스 경계를 넘어가면 반대편에서 등장하도록 % 연산자를 사용합니다.
*/