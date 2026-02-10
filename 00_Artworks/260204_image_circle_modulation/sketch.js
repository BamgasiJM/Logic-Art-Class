let img;
let gridCols = 50;
let gridRows = 50;
let cellW, cellH;
let levels = [];
let imgReady = false;
let offsetX, offsetY;

// 점들의 원래 위치와 현재 위치/속도 저장
let points = [];

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

    offsetX = (width - img.width) / 2;
    offsetY = (height - img.height) / 2;

    cellW = img.width / gridCols;
    cellH = img.height / gridRows;

    img.loadPixels();

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

        // 점 초기화
        let cx = offsetX + x * cellW + cellW / 2;
        let cy = offsetY + y * cellH + cellH / 2;
        points.push({
          x: cx,
          y: cy,
          ox: cx, // 원래 위치
          oy: cy,
          vx: 0,
          vy: 0,
          baseSize: level,
        });
      }
    }

    imgReady = true;
  });
}

function draw() {
  background(0);

  if (!imgReady) return;

  for (let p of points) {
    // 마우스와의 거리
    let d = dist(mouseX, mouseY, p.x, p.y);

    // 기본 크기
    let size = p.baseSize;

    // 반경 n px 가우시안 효과
    if (d < 150) {
      let influence = exp(-pow(d, 2) / (2 * pow(100, 2))); // σ=100
      size = lerp(p.baseSize, 10, influence);

      // Repulsion 힘 추가
      let angle = atan2(p.y - mouseY, p.x - mouseX);
      let force = (150 - d) * 0.005; // 가까울수록 강하게 밀림
      p.vx += cos(angle) * force;
      p.vy += sin(angle) * force;
    }

    // 원래 자리로 돌아오도록 복원력
    let dx = p.ox - p.x;
    let dy = p.oy - p.y;
    p.vx += dx * 0.01; // 복원력
    p.vy += dy * 0.01;

    // 댐핑
    p.vx *= 0.9;
    p.vy *= 0.9;

    // 위치 업데이트
    p.x += p.vx;
    p.y += p.vy;

    // 점 그리기
    fill(200, 160, 255);
    ellipse(p.x, p.y, size, size);
  }
}
