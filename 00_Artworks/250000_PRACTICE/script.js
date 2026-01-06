// w03_example_02.js

// --- 전역 변수 설정 (Global Variables) ---

let canvasWidth = 1000; // 캔버스 폭
let canvasHeight = 400; // 캔버스 높이
let faceCount = 6; // 표시할 '얼굴'의 개수
let faceRadius; // 각 '얼굴'을 구성하는 원의 기본 반지름
let colors = []; // 감정의 분위기를 나타낼 색상 팔레트 배열

// 프로그램이 시작될 때 한 번 실행됩니다. ---
function setup() {
  // 캔버스를 1000 x 400 크기로 생성합니다.
  createCanvas(canvasWidth, canvasHeight);

  // 얼굴의 기본 크기를 캔버스 높이의 1/5로 설정합니다.
  faceRadius = canvasHeight / 5;

  // HSB 색상 모드를 설정합니다.
  colorMode(HSB, 360, 100, 100, 1);

  // '차분함/우울함'을 표현하는 색상들을 배열에 추가합니다.
  colors = [
    color(200, 80, 70), // 진한 파랑
    color(210, 60, 50), // 중간 파랑
    color(180, 40, 60), // 밝은 청록
    color(0, 0, 85), // 아주 밝은 회색
    color(0, 0, 30), // 진한 회색/검정
  ];
  noLoop();
  // draw() 함수가 한 번만 실행되도록 설정하여 애니메이션을 없앱니다.
}

// --- draw() 함수: 프로그램이 시작될 때 한 번 실행되고 종료됩니다. ---
function draw() {
  // 배경을 어두운 색으로 채웁니다.
  background(10, 5, 10);

  // 얼굴들이 배치될 위치의 간격을 계산합니다.
  let spacing = canvasWidth / (faceCount + 1);

  // '얼굴' 개수만큼 반복하며 그립니다.
  for (let i = 0; i < faceCount; i++) {
    // 1. 얼굴의 중심 x, y 좌표를 계산합니다.
    let faceX = spacing * (i + 1);
    let faceY = canvasHeight / 2;

    // 2. 색상 배열에서 단순하게 랜덤하게 색을 선택합니다.
    // floor(random(colors.length))는 0부터 colors.length-1 사이의 정수를 선택합니다.
    let randomColorIndex = floor(random(colors.length));
    let faceColor = colors[randomColorIndex];

    // 3. 각 얼굴마다 형태 변화 없이 고정된 크기를 사용합니다.
    let currentRadius = faceRadius;

    // --- 얼굴 그리기 ---
    push();

    translate(faceX, faceY);

    // 외곽선은 그리지 않고, 채우기 색상을 설정합니다.
    noStroke();
    fill(faceColor);

    // '얼굴' 원 그리기
    ellipse(0, 0, currentRadius * 2, currentRadius * 2);

    // --- '얼굴'의 특징 (눈/입) 그리기 ---

    // 내부 요소의 색상은 진한 회색으로 고정합니다.
    fill(0, 0, 10);

    // 눈 간격 및 크기를 고정합니다. (노이즈 제거)
    let eyeSpacing = currentRadius * 0.5;
    let eyeSize = currentRadius * 0.15;

    // 왼쪽 눈
    ellipse(-eyeSpacing / 2, -currentRadius / 4, eyeSize, eyeSize);
    // 오른쪽 눈
    ellipse(eyeSpacing / 2, -currentRadius / 4, eyeSize, eyeSize);

    // '입' 모양의 곡선을 그립니다. (노이즈에 의한 곡률 변화 제거)
    let mouthCurve = currentRadius * 0.05; // 입꼬리 곡률을 아주 약간 올림 (중립/약간 우울)
    let mouthWidth = currentRadius * 0.5;

    stroke(0, 0, 10);
    strokeWeight(currentRadius * 0.05);
    noFill();

    // 입 모양 곡선 (모든 얼굴이 동일한 모양)
    curve(
      -mouthWidth,
      currentRadius / 3,
      -mouthWidth / 2,
      currentRadius / 3,
      mouthWidth / 2,
      currentRadius / 3,
      mouthWidth,
      currentRadius / 3 + mouthCurve
    );

    pop();
  }
}
