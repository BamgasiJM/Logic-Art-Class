function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(23, 23, 23); // 마지막 인자의 알파값에 숫자를 쓰면 trail 효과

  push(); // 현재의 캔버스 상태(좌표 등)를 저장합니다.
  translate(width / 2, height / 2); // 캔버스의 중심으로 좌표 이동

  // 회전 각도를 매 프레임마다 조금씩 변경
  rotate(frameCount * 0.01);

  // 12개의 사각형을 원형으로 배치
  for (let i = 0; i < 12; i++) {
    push(); // 현재 회전된 상태를 저장

    // 각 사각형을 배치할 각도를 계산
    let angle = (TWO_PI / 12) * i;
    rotate(angle);

    // 중심에서 150px 떨어진 곳에 사각형을 그립니다.
    translate(150, 0);

    fill(255, 200, 0); // 노란색
    noStroke();
    rectMode(CENTER); // 사각형의 중심을 기준으로 그리도록 설정
    rect(0, 0, 30, 30); // 30x30 크기의 사각형

    pop(); // 회전된 상태를 복원하여 다음 사각형 그리기
  }

  pop(); // 캔버스의 원래 상태(중심 이동 전)를 복원
}
