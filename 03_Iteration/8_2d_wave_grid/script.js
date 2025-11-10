function setup() {
  createCanvas(800, 400);
  // noLoop()를 제거하여 draw() 함수가 매 프레임마다 계속 호출되도록 합니다.
  // 이것이 애니메이션을 만드는 핵심입니다.
  background(25); // 배경색을 한 번만 설정하면 이전 프레임의 그림이 남아있을 수 있습니다.
  noStroke(); // 도형의 외곽선을 그리지 않습니다.
}

function draw() {
  // 매 프레임이 시작될 때마다 배경을 다시 칠해줍니다.
  // 이렇게 해야 이전 프레임에서 그렸던 원들이 지워지고 새로운 프레임이 그려집니다.
  background(25);

  // 그리드 설정
  let cols = 20; // 가로 방향 원의 개수
  let rows = 15; // 세로 방향 원의 개수
  let spacingX = width / cols; // 가로 방향 원 사이의 간격
  let spacingY = height / rows; // 세로 방향 원 사이의 간격

  // 이중 반복문을 사용하여 2차원 그리드 상의 모든 점에 대해 원을 그립니다.
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // 그리드 상의 각 점(i, j)에 대한 중심 좌표(cx, cy)를 계산합니다.
      let cx = i * spacingX + spacingX / 2;
      let cy = j * spacingY + spacingY / 2;

      // --- 핵심: 애니메이션을 위한 각도 계산 ---
      // 각 프레임마다 변하는 값인 frameCount를 사용하여 각도를 계산합니다.
      // i와 j에 각각 다른 가중치(0.6, 0.3)를 곱해 대각선 방향으로 파도가 치는 효과를 냅니다.
      let angle = i * 0.6 + j * 0.3 + frameCount * 0.05;

      // sin() 함수는 -1에서 1 사이의 값을 주기적으로 반환합니다.
      // 이 값을 이용하여 원의 반지름(r)을 주기적으로 변화시킵니다.
      // 8 * sin(angle)의 결과는 -8에서 8 사이가 되고,
      // 여기에 기본 반지름 20을 더하면 최종 반지름은 12에서 28 사이로 변합니다.
      let r = 20 + 8 * sin(angle);

      // 원의 색상을 설정합니다. (보라색)
      fill(150, 80, 220, 250);

      // 계산된 중심 좌표(cx, cy)와 변하는 반지름(r)을 이용하여 원을 그립니다.
      ellipse(cx, cy, r, r);
    }
  }
}
