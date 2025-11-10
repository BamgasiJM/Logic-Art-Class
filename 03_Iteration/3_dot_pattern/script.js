function setup() {
  createCanvas(800, 400);
  noLoop();
  noStroke();
}

function draw() {
  background(25);
  let step = 20;
  // x += 1 : 1 픽셀씩 이동하면서 그림
  // x += step : step으로 설정된 수만큼 이동하면서 그림
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      let r = int(random(0, 20));
      let g = int(random(130, 180));
      let b = int(random(120, 150));

      fill(r, g, b);
      ellipse(x + step / 2, y + step / 2, step - 2);
    }
  }
}
