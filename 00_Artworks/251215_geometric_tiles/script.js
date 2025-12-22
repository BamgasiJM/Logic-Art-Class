// ============================
// Configuration
// ============================
const CANVAS_SIZE = 800;
const TILE_SIZE = 50;
const GRID_NOISE_SCALE = 0.01;
const TIME_NOISE_SCALE = 0.01;
const TIME_STEP = 0.2;

// ============================
// State
// ============================
let tiles = [];
let time = 0;

// ============================
// p5 Lifecycle
// ============================
function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);

  tiles = createTiles();
}

function draw() {
  background(5, 5, 5, 100);
  time += TIME_STEP;

  for (const tile of tiles) {
    updateTile(tile);
    renderTile(tile);
  }
}

// ============================
// Tile Creation
// ============================
function createTiles() {
  const result = [];

  for (let x = 0; x < width; x += TILE_SIZE) {
    for (let y = 0; y < height; y += TILE_SIZE) {
      result.push({
        position: createVector(x, y),
        rotation: random(270),
        rotationSpeed: random(-4, 4),
        hueBase: random(20),
        shapeType: floor(random(4)),
        noiseOffset: random(1000),
      });
    }
  }
  return result;
}

// ============================
// Tile Update
// ============================
function updateTile(tile) {
  const { x, y } = tile.position;

  tile.noiseValue = noise(
    x * GRID_NOISE_SCALE,
    y * GRID_NOISE_SCALE,
    time * TIME_NOISE_SCALE + tile.noiseOffset
  );

  tile.rotation += tile.rotationSpeed * tile.noiseValue;
}

// ============================
// Tile Rendering
// ============================
function renderTile(tile) {
  const { x, y } = tile.position;
  const centerX = x + TILE_SIZE * 0.5;
  const centerY = y + TILE_SIZE * 0.5;
  const n = tile.noiseValue;

  const hue = (tile.hueBase + time * 0.5 + n * 100) % 360;
  const saturation = 40 + sin(time * 6 + x * 0.01) * 20;
  const brightness = 50 + cos(time * 3 + y * 0.1) * 50;
  const size = TILE_SIZE * 0.5 * (0.8 + n * 0.4);

  push();
  translate(centerX, centerY);
  rotate(tile.rotation + n * 20);

  noStroke();
  fill(hue, saturation, brightness, 100);

  SHAPE_RENDERERS[tile.shapeType](size);

  drawInnerDot(size);
  pop();
}

// ============================
// Shape Renderers
// ============================
const SHAPE_RENDERERS = [drawSquare, drawCircle, drawTriangle, drawCross];

function drawSquare(size) {
  rect(-size / 2, -size / 2, size, size);
}

function drawCircle(size) {
  ellipse(0, 0, size, size);
}

function drawTriangle(size) {
  beginShape();
  for (let i = 0; i < 3; i++) {
    const angle = 120 * i - 90;
    vertex(cos(angle) * size * 0.5, sin(angle) * size * 0.5);
  }
  endShape(CLOSE);
}

function drawCross(size) {
  rect(-size / 2, -size / 6, size, size / 3);
  rect(-size / 6, -size / 2, size / 3, size);
}

function drawInnerDot(size) {
  fill(0, 0, 100, 100);
  ellipse(10, 0, size * 0.2);
}

// ============================
// Interaction
// ============================
function keyPressed() {
  if (key === " ") {
    for (const tile of tiles) {
      tile.rotationSpeed = random(-3, 3);
      tile.hueBase = random(360);
      tile.shapeType = floor(random(4));
    }
  }
}
