// simplex_noise_basic.js
import { createNoise3D } from "https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js";

let noise3D;
let time = 0;

function setup() {
  createCanvas(800, 400);
  noise3D = createNoise3D();
  pixelDensity(1);
  noStroke();
}

function draw() {
  background(0);

  // 픽셀 간격을 띄워서 계산량 줄이기
  let step = 5;

  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      let noiseVal = noise3D(x * 0.005, y * 0.005, time);
      let brightness = map(noiseVal, -1, 1, 0, 255);

      fill(brightness);
      rect(x, y, step, step);
    }
  }

  time += 0.01;

  // fps 표시
  fill(255);
  text(floor(frameRate()), 10, 20);
}

window.setup = setup;
window.draw = draw;
