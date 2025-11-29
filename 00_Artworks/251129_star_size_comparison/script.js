// 별 데이터 (1/10으로 조정된 반지름 및 온도 기반 색상)
let stars = [
  { name: "Sun (태양)", radiusSun: 1, temp: 5778, color: "#FFFF00" },
  { name: "Sirius A", radiusSun: 1.7, temp: 9940, color: "#B0E0E6" },
  { name: "Vega", radiusSun: 2.3, temp: 9600, color: "#B0E0E6" },
  { name: "Pollux", radiusSun: 8.8, temp: 4868, color: "#FFDEAD" },
  { name: "Arcturus", radiusSun: 25.7, temp: 4286, color: "#FFA07A" },
  { name: "Aldebaran", radiusSun: 44, temp: 3900, color: "#FF8C00" },
  { name: "Rigel A", radiusSun: 78, temp: 12100, color: "#4169E1" },
  { name: "Deneb", radiusSun: 100, temp: 8525, color: "#ADD8E6" },
  { name: "VV Cephei A", radiusSun: 120, temp: 3600, color: "#B22222" },
  { name: "VY Canis Majoris", radiusSun: 130, temp: 3490, color: "#A52A2A" },
  { name: "Betelgeuse", radiusSun: 140, temp: 3500, color: "#D2691E" },
  { name: "KY Cygni", radiusSun: 150, temp: 3500, color: "#8B4513" },
  { name: "AH Scorpii", radiusSun: 155, temp: 3600, color: "#800000" },
  { name: "V354 Cephei", radiusSun: 160, temp: 3500, color: "#A52A2A" },
  { name: "UY Scuti", radiusSun: 170, temp: 3365, color: "#FFA07A" },
  { name: "LGGS J0045+4147", radiusSun: 190, temp: 3500, color: "#FF4500" },
  { name: "RSGC1-F01", radiusSun: 195, temp: 3400, color: "#E9967A" },
  { name: "VX Sagittarii", radiusSun: 205, temp: 3300, color: "#DAA520" },
  { name: "Stephenson 2-18", radiusSun: 215, temp: 3200, color: "#FF4500" },
];

let CANVAS_WIDTH;
let CANVAS_HEIGHT;

// 줌 관련 상수 및 변수
const MIN_SCALE = 0.1;
const MAX_SCALE = 50.0;
let scaleFactor = MIN_SCALE;

// 캐싱을 위한 변수 (메모리 재할당 방지)
let maxDim;

function setup() {
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // [최적화 1] 정렬을 setup으로 이동
  // 데이터가 변하지 않으므로 한 번만 정렬하면 됩니다. (큰 별 -> 작은 별 순서)
  stars.sort((a, b) => b.radiusSun - a.radiusSun);

  // 텍스트 정렬 설정 (루프 밖에서 한 번만 설정해도 되는 경우)
  textAlign(CENTER, BOTTOM);
  noStroke();
}

function draw() {
  background(0);

  // [최적화 2] 좌표계 이동
  // 매번 x + centerX를 계산하는 대신 캔버스 원점을 중앙으로 이동합니다.
  translate(width / 2, height / 2);

  // 성능을 위해 루프 밖에서 max 계산
  maxDim = (width > height ? width : height) * 4;

  // 역방향 for문 사용 (선택 사항이나, JS 엔진에 따라 미세하게 빠를 수 있음)
  // 여기서는 가독성을 위해 일반 for문을 사용하되, stars.length를 캐싱하는 것이 좋습니다.
  // 하지만 stars는 const에 가까우므로 일반 루프로 처리합니다.

  for (let i = 0; i < stars.length; i++) {
    // 직접 접근이 함수 호출보다 빠릅니다.
    const star = stars[i];
    const diameter = star.radiusSun * scaleFactor * 2;

    // [최적화 3] 그리기 제한 (Culling)
    // 1. 화면 전체를 덮을 정도로 너무 커서 배경이 된 경우 (과도한 Fill Rate 방지)
    //    단, 가장 큰 별이 배경색 역할을 해야 하므로 이 조건은 신중해야 합니다.
    //    Jai님의 원래 의도대로 4배 이상 크면 그리지 않습니다.
    if (diameter > maxDim) continue;

    // 2. 너무 작아서 1픽셀도 안 되는 경우 그리지 않음 (GPU 호출 절약)
    if (diameter < 0.5) continue;

    fill(star.color);
    circle(0, 0, diameter); // translate를 했으므로 (0,0)에 그립니다.

    // 텍스트 렌더링 (비용이 비싼 작업이므로 조건부 실행)
    if (diameter > 10) {
      fill(255);
      // 텍스트 크기 설정 등은 상태 변경 비용이 들지만, 여기서는 필요하므로 유지
      // textSize(14)를 루프 밖으로 뺄 수 있다면 좋겠지만, 아래 분기(Sun) 때문에 유지
      textSize(14);
      // 템플릿 리터럴 사용
      text(`${star.name} (${star.radiusSun} R☉)`, 0, -diameter / 2 - 5);
    } else if (star.name === "Sun (태양)" && diameter > 2) {
      // Sun은 작아도 조금 더 오래 표시 (1px -> 2px로 가시성 조정)
      fill(255);
      textSize(12);
      // textAlign을 setup에서 BOTTOM으로 했으므로 CENTER로 일시 변경 필요
      textAlign(CENTER, CENTER);
      text("Sun", 0, 0);
      textAlign(CENTER, BOTTOM); // 다시 원복
    }
  }
}

function mouseWheel(event) {
  // [최적화 4] 줌 로직 개선 (Speed & UX)
  // 기존의 덧셈 방식 대신 곱셈 방식(Exponential scaling)을 사용하면
  // 스케일이 작을 땐 정밀하게, 클 땐 빠르게 줌인/아웃이 되어 연산과 반응성이 좋아집니다.

  let zoomSensitivity = 0.05; // 민감도 조절

  if (event.deltaY > 0) {
    scaleFactor *= 1 - zoomSensitivity; // 줌 아웃
  } else {
    scaleFactor *= 1 + zoomSensitivity; // 줌 인
  }

  scaleFactor = constrain(scaleFactor, MIN_SCALE, MAX_SCALE);

  // HTML 업데이트 (DOM 조작은 p5 루프와 독립적이므로 유지)
  const scaleDisplay = document.getElementById("scale-display");
  if (scaleDisplay) {
    // toFixed 연산은 가볍지만 필요할 때만 호출
    scaleDisplay.textContent = scaleFactor.toFixed(6);
  }

  // 기본 스크롤 동작 방지 (선택 사항)
  return false;
}

function windowResized() {
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  resizeCanvas(windowWidth, windowHeight);
}

// 상세 수정 내역 및 기술적 설명
// 배열 정렬 (stars.sort) 위치 변경:

// JavaScript의 sort는 $O(N \log N)$의 시간 복잡도를 가집니다. 데이터가 20개 정도로 적더라도, 이를 60FPS마다 매번 실행하는 것은 "메모리 할당(Allocation)"과 "가비지 컬렉션(GC)"을 유발하여 미세한 끊김(jank)의 원인이 됩니다. setup()으로 옮겨서 프로그램 시작 시 딱 한 번만 수행하도록 했습니다.

// translate(width/2, height/2) 사용:

// 기존에는 centerX, centerY 변수를 매 프레임 할당하고, 그리기 명령마다 더하기 연산을 수행했습니다.

// p5.js(WebGL/Canvas)의 행렬 변환 기능인 translate를 사용하면, 이후 모든 좌표를 (0, 0) 기준으로 생각할 수 있어 코드가 깔끔해지고 내부적으로 GPU에 최적화된 방식으로 처리됩니다.

// mouseWheel 로직 변경 (선형 -> 지수형):

// 기존 코드: scaleFactor -= event.deltaY * 0.0001

// 문제점: 스케일이 0.1일 때 0.0001을 빼는 것과, 스케일이 100일 때 0.0001을 빼는 것은 체감 속도가 완전히 다릅니다. (큰 별을 볼 때 줌이 멈춘 것처럼 느껴질 수 있음)

// 해결: 현재 스케일에 비례하여 곱하는 방식(*= 1.05)을 사용하여, 어느 구간에서든 부드러운 줌 속도를 보장합니다. 이는 UX뿐만 아니라, 불필요하게 많은 스크롤 이벤트를 발생시키지 않으므로 성능에도 이점이 있습니다.

// 텍스트 렌더링 상태 관리:

// textAlign이나 noStroke 같은 상태 변경 함수는 캔버스 컨텍스트를 갱신하므로 비용이 듭니다. 반복문 내에서 상태 변경을 최소화하고, 가능한 setup이나 루프 밖에서 공통 속성을 정의했습니다.