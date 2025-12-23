let tiles = [];
let cols = 10;
let rows = 10;

function setup() {
  createCanvas(1000, 1000);
  background(10);
  frameRate(4);

  const tileWidth = width / cols;
  const tileHeight = height / cols;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pos = {
        x: x * tileWidth,
        y: y * tileHeight,
        w: tileWidth,
        h: tileHeight,
      };
      tiles.push(new Tile(pos));
    }
  }
}

function draw() {
  background(10);

  for (const tile of tiles) {
    tile.display();
  }
}

class Tile {
  constructor(position) {
    this.position = position;
  }

  display() {
    const { x, y, w, h } = this.position; // 구조분해할당

    // let r = int(random(50, 70));
    // let g = int(random(200, 230));
    // let b = int(random(200, 250));
    strokeWeight(1);
    stroke(10);
    fill(150,150,150,255);
    rect(x, y, w, h);
  }
}
