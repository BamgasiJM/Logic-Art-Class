function setup() {
  createCanvas(800, 400);
  colorMode(HSB, 360, 100, 100, 100);    // HSB로 변경
  background(10);
  noLoop();
  noStroke();

  translate(width / 2, height / 2);

  for (let layer = 0; layer < 5; layer++) {
    let sd = 30 + layer * 20;           // 퍼짐 정도
    let alpha = 100 - layer * 10;       // 투명도
    let hue = (200 + layer * 25) % 360; // 레이어마다 색상 다르게 (360도로 순환)

    fill(hue, 80, 100, alpha);          // HSB 값 사용

    for (let i = 0; i < 1500; i++) {
      let x = randomGaussian(0, sd);
      let y = randomGaussian(0, sd);
      ellipse(x, y, 6, 6);
    }
  }
}
