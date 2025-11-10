function setup() {
  createCanvas(800, 400);
  background(23, 23, 23);
  noStroke();
}

function draw() {
  // 매 프레마다 배경을 다시 칠하여 이전 프레임의 원을 지웁니다.
  background(23, 23, 23);

  // draw() 함수는 매 프레임(기본 1초에 60번)마다 실행됩니다.
  // frameCount라는 p5.js 내장 변수를 사용하여 시간을 기준으로 움직임을 만듭니다.

  for (let x = 0; x < width; x += 20) {
    // x 좌표와 현재 프레임 수를 이용하여 y 좌표를 계산합니다.
    // sin() 함수는 -1에서 1 사이의 값을 반환합니다.
    // map() 함수를 사용하여 -1~1의 값을 캔버스 높이(0~400) 범위로 변환합니다.
    let y = map(
      sin(x * 0.05 + frameCount * 0.05),
      -1,
      1,
      height * 0.2,
      height * 0.8
    );

    // y 좌표에 따라 원의 크기를 변화시킵니다.
    let circleSize = map(y, height * 0.2, height * 0.8, 20, 5);

    fill(100, 200, 255); // 파란색
    circle(x, y, circleSize);
  }
}
