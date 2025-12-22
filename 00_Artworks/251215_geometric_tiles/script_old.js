let tiles = [];
let tileSize = 50;
let time = 0;

function setup() {
  const canvas = createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);

  // 타일 그리드 생성
  for (let x = 0; x < width; x += tileSize) {
    for (let y = 0; y < height; y += tileSize) {
      tiles.push({
        x: x,
        y: y,
        rotation: random(270),
        rotationSpeed: random(-4, 4),
        hue: random(20),
        shapeType: floor(random(4)), // 0: 사각형, 1: 원, 2: 삼각형, 3: 십자선
        noiseOffset: random(1000),
      });
    }
  }
}

function draw() {
  background(5, 5, 5, 100); // 어두운 배경

  time += 0.2;

  // 모든 타일 그리기
  for (let tile of tiles) {
    drawTile(tile);
  }
}

function drawTile(tile) {
  let centerX = tile.x + tileSize / 2;
  let centerY = tile.y + tileSize / 2;

  // 노이즈 기반 동적 변화
  let noiseVal = noise(
    tile.x * 0.01,
    tile.y * 0.01,
    time * 0.01 + tile.noiseOffset
  );

  // 회전 업데이트
  tile.rotation += tile.rotationSpeed * noiseVal;

  // 색상 변화
  let currentHue = (tile.hue + time * 0.5 + noiseVal * 100) % 360;
  let saturation = 40 + sin(time * 6 + tile.x * 0.01) * 20;
  let brightness = 50 + cos(time * 3 + tile.y * 0.1) * 50;

  // 타일 본체 그리기
  push();
  translate(centerX, centerY);
  rotate(tile.rotation + noiseVal * 20);

  noStroke();
  fill(currentHue, saturation, brightness, 100);

  // 모양 타입에 따라 다르게 그리기
  let size = tileSize * 0.5 * (0.8 + noiseVal * 0.4);

  switch (tile.shapeType) {
    case 0: // 사각형
      rect(-size / 2, -size / 2, size, size);
      break;
    case 1: // 원
      ellipse(0, 0, size, size);
      break;
    case 2: // 삼각형
      drawTriangle(size);
      break;
    case 3: // 십자선
      drawCross(size);
      break;
  }

  // 작은 하얀 원
  fill(0, 0, 100, 100);
  let innerSize = size * 0.2;
  ellipse(10, 0, innerSize, innerSize); // 위치를 움직이면 재미있는 애니메이션

  pop();
}

function drawTriangle(size) {
  beginShape();
  for (let i = 0; i < 3; i++) {
    let angle = 120 * i - 90;
    let x = (cos(angle) * size) / 2;
    let y = (sin(angle) * size) / 2;
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawCross(size) {
  rect(-size / 2, -size / 6, size, size / 3);
  rect(-size / 6, -size / 2, size / 3, size);
}

function keyPressed() {
  if (key === " ") {
    // 스페이스바로 타일 재배치
    for (let tile of tiles) {
      tile.rotationSpeed = random(-3, 3);
      tile.hue = random(360);
      tile.shapeType = floor(random(4));
    }
  }
}
