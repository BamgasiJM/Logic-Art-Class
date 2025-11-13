let cols = 800;
let rows = 800;
let maxIter = 100; // 최대 반복 횟수

function setup() {
  createCanvas(cols, rows);
  pixelDensity(1);
  colorMode(RGB, 255);
  noLoop();
}

function draw() {
  background(25);
  loadPixels();

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      // 화면 좌표 (픽셀) → 복소평면 좌표 (c = ca + i*cb)
      // 만델브로트 집합의 주요 영역을 포함하도록 매핑 범위 조정
      let ca = map(x, 0, cols, -2.5, 1);
      let cb = map(y, 0, rows, -1.5, 1.5);

      let a = 0; // z의 실수부 (z0 = 0)
      let b = 0; // z의 허수부 (z0 = 0)

      let n = 0; // 발산까지의 반복 횟수 카운터

      while (n < maxIter) {
        // z_next = z^2 + c 계산
        let aa = a * a - b * b; // z^2의 실수부
        let bb = 2 * a * b; // z^2의 허수부

        a = aa + ca; // z_next의 실수부
        b = bb + cb; // z_next의 허수부

        // 발산 조건: 복소수의 크기가 특정 임계값을 넘으면 발산으로 간주
        // (a^2 + b^2) > 16 또는 abs(a) + abs(b) > 16 등으로 최적화 가능
        if (a * a + b * b > 16) {
          break;
        }

        n++;
      }

      let rr, gg, bb; // 'b' 변수와의 충돌을 피하기 위해 'bb'로 선언

      if (n < maxIter) {
        // 발산한 경우 (집합 외곽)
        // 발산 반복 횟수 'n'에 따라 민트색의 밝기를 조절
        // n이 작을수록 어둡고, 클수록 밝게 (또는 그 반대로)
        let brightnessFactor = map(n, 0, maxIter, 0.2, 1.0); // 20% ~ 100% 밝기
        rr = 10 * brightnessFactor;
        gg = 250 * brightnessFactor;
        bb = 240 * brightnessFactor;
      } else {
        // 발산하지 않은 경우 (만델브로트 집합 내부)
        // 만델브로트 집합 내부는 어두운 배경색과 비슷하게 설정하여 '검은색'으로 보임
        rr = 25;
        gg = 25;
        bb = 25;
      }

      let pix = (x + y * cols) * 4;
      pixels[pix + 0] = rr; // Red
      pixels[pix + 1] = gg; // Green
      pixels[pix + 2] = bb; // Blue
      pixels[pix + 3] = 255; // Alpha (불투명)
    }
  }

  updatePixels();
}
