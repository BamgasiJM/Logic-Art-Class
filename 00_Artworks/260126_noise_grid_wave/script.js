let scale = 0.002; // 노이즈의 '줌 레벨' (작을수록 완만하게)

function setup() {
  createCanvas(800, 800);
  background(20);
  stroke(255);
}
function draw() {
  background(20, 20);
  // 그리드 격자마다 노이즈 값을 확인
  for (let x = 0; x < width; x += 30) {
    for (let y = 0; y < height; y += 30) {
      // 2차원 좌표를 노이즈 함수에 전달 (0.0 ~ 1.0 사이 값 반환)
      let n = noise(x * scale, y * scale);

      // 시간에 따라 진동하는 각도 범위
      let angle = n * (TWO_PI + sin(frameCount * 0.01) * 2 * PI);

      // 해당 각도를 가리키는 벡터 생성
      let v = p5.Vector.fromAngle(angle);
      v.setMag(30); // 선의 길이

      push();
      translate(x, y);
      line(0, 0, v.x, v.y);
      pop();
    }
  }
}
