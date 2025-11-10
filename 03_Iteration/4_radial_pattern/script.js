function setup() {
  createCanvas(800, 400);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(0, 0, 10);
  translate(width / 2, height / 2);

  let layers = 8;
  let petals = 16;

  for (let j = 0; j < layers; j++) {
    let radius = map(j, 0, layers, 40, 200);
    for (let i = 0; i < petals; i++) {
      push();
      rotate((TWO_PI * i) / petals);
      let hue = map(j, 0, layers, 150, 200);
      fill(hue, 80, 100, 80);
      noStroke();
      ellipse(radius, 0, 12, 12);
      pop();
    }
  }
}
