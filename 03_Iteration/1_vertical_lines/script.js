function setup() {
  createCanvas(800, 400);
  background(23);
}

function draw() {

  for (let i = 20; i < width; i += 20) {
    stroke(10, 180, 170);                            
    line(i, 0, i, height);
  }
}
