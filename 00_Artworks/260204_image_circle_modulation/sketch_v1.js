let img;
let gridCols = 50;
let gridRows = 50;
let cellW, cellH;
let levels = [];
let imgReady = false;
let offsetX, offsetY; // 이미지 위치 보정

function setup() {
  createCanvas(1000, 1000);
  background(0);
  noStroke();

  loadImage("../../assets/sticker_lara_026.png", (loadedImg) => {
    img = loadedImg;

    // 비율 유지: 긴 쪽을 1000으로 맞추기
    if (img.width > img.height) {
      img.resize(1000, 0);
    } else {
      img.resize(0, 1000);
    }

    // 중앙 배치 오프셋 계산
    offsetX = (width - img.width) / 2;
    offsetY = (height - img.height) / 2;

    cellW = img.width / gridCols;
    cellH = img.height / gridRows;

    img.loadPixels();

    // 각 그리드의 밝기 레벨 계산
    for (let y = 0; y < gridRows; y++) {
      levels[y] = [];
      for (let x = 0; x < gridCols; x++) {
        let px = int(x * cellW);
        let py = int(y * cellH);
        let idx = (py * img.width + px) * 4;
        let r = img.pixels[idx];
        let g = img.pixels[idx + 1];
        let b = img.pixels[idx + 2];
        let brightness = (r + g + b) / 3;
        let level = map(brightness, 0, 255, 2, 5);
        levels[y][x] = level;
      }
    }

    imgReady = true;
  });
}

function draw() {
  background(0);

  if (!imgReady) return;

  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      let cx = offsetX + x * cellW + cellW / 2;
      let cy = offsetY + y * cellH + cellH / 2;
      let baseSize = levels[y][x];

      // 마우스 호버 반경 100px 가우시안 효과
      let d = dist(mouseX, mouseY, cx, cy);
      let size = baseSize;
      if (d < 100) {
        let influence = exp(-pow(d, 2) / (2 * pow(30, 2))); // σ=30
        size = lerp(baseSize, 5, influence);
      }

      fill(255);
      ellipse(cx, cy, size, size);
    }
  }
}
