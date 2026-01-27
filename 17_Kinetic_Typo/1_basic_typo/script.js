let font;
let points = [];

let txt = "SMU";
let fontSize = 320;

function preload() {
  font = loadFont("NotoSans-Black.ttf");
}

function setup() {
  createCanvas(800, 800);

  let bounds = font.textBounds(txt, 0, 0, fontSize);

  // 시각적 중심 기준 정확한 중앙 정렬
  let x = width / 2 - (bounds.x + bounds.w / 2);
  let y = height / 2 - (bounds.y + bounds.h / 2);

  points = font.textToPoints(txt, x, y, fontSize, {
    sampleFactor: 0.08,
  });
}

function draw() {
  background(10);
  noStroke();
  fill(255, 0, 100);

  for (let p of points) {
    let n = noise(p.x * 0.01, p.y * 0.01, frameCount * 0.05);
    let offset = map(n, 0, 1, -6, 6);
    circle(p.x + offset, p.y + offset, 5);
  }
}
