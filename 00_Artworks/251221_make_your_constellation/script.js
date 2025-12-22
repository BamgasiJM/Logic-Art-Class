let particles = [];
let showTitle = true;
let isFullscreen = false;
let grid = {};
let cellSize = 150;
let now = 0;
let lastTime = 0;

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 1.0);
  textAlign(CENTER, CENTER);
  frameRate(60);
  noLoop();
}

function draw() {
  let dt = millis() / 1000.0 - lastTime;
  lastTime = millis() / 1000.0;
  now = millis() / 1000.0;
  background(0);

  // 파티클 업데이트
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(dt);
    if (!particles[i].alive(now)) {
      particles.splice(i, 1);
    }
  }

  // 파티클 그리기
  for (let p of particles) {
    let lr = p.lifeRatio(now);
    if (lr <= 0) continue;
    fill(p.color[0], p.color[1], p.color[2], lr);
    noStroke();
    ellipse(p.pos.x, p.pos.y, p.size * 2);
  }

  // 파티클 연결선 그리기
  for (let cellKey in grid) {
    let indices = grid[cellKey];
    if (!indices) continue;

    for (let i of indices) {
      let a = particles[i];
      if (!a || !a.alive(now)) continue;

      let [cellX, cellY] = cellKey.split(",").map(Number);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let neighborCellKey = `${cellX + dx},${cellY + dy}`;
          let neighborIndices = grid[neighborCellKey];
          if (!neighborIndices) continue;

          for (let j of neighborIndices) {
            if (j <= i) continue;
            let b = particles[j];
            if (!b || !b.alive(now)) continue;

            let dSq = distSquared(a.pos, b.pos);
            if (dSq <= cellSize * cellSize) {
              let d = sqrt(dSq);
              let distAlpha = 1.0 - d / cellSize;
              let alpha = distAlpha * a.lifeRatio(now) * b.lifeRatio(now);

              if (alpha > 0.01) {
                stroke(
                  (a.color[0] + b.color[0]) / 2,
                  (a.color[1] + b.color[1]) / 2,
                  (a.color[2] + b.color[2]) / 2,
                  alpha
                );
                strokeWeight(0.8);
                line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
              }
            }
          }
        }
      }
    }
  }

  // 타이틀 화면
  if (showTitle) {
    fill(1.0);
    textSize(120);
    text("CONSTELLATION", width / 2, 150);

    fill(0.75, 0.75, 1.0);
    textSize(36);
    text("Create your own star constellations", width / 2, 0);

    fill(0.5);
    textSize(24);
    text(
      "CLICK TO CREATE STARS  •  F: FULLSCREEN  •  S: SCREENSHOT  •  N: NEW",
      width / 2,
      height - 150
    );
  } else {
    fill(0.5);
    textSize(18);
    text(`Particles: ${particles.length}`, 50, height - 50);
  }
}

function mousePressed() {
  if (showTitle) {
    showTitle = false;
    loop();
    return;
  }

  let count = floor(random(15, 31));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(createVector(mouseX, mouseY), now));
  }
  updateGrid();
}

function keyPressed() {
  if (key === "F" || key === "f") {
    let fs = fullscreen();
    fullscreen(!fs);
    isFullscreen = !fs;
  } else if (key === "S" || key === "s") {
    saveCanvas(`constellation_${floor(now)}`, "png");
    console.log("📸 Screenshot saved!");
  } else if (key === "N" || key === "n") {
    particles = [];
    grid = {};
    showTitle = true;
    noLoop();
    redraw();
  } else if (key === "C" || key === "c") {
    particles = particles.filter((p) => p.alive(now));
    updateGrid();
  }
}

function distSquared(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return dx * dx + dy * dy;
}

class Particle {
  constructor(origin, now) {
    this.pos = origin.copy();
    this.born = now;
    this.lifetime = random(7.0, 10.0);
    this.size = random(1.0, 5.0);

    let angle = random(TWO_PI);
    let speed = random(10.0, 80.0);
    this.vel = createVector(cos(angle) * speed, sin(angle) * speed);

    let hue = random(0.5, 0.72);
    this.color = [hue, 0.7, 0.5];
  }

  age(now) {
    return now - this.born;
  }

  lifeRatio(now) {
    return 1.0 - constrain(this.age(now) / this.lifetime, 0.0, 1.0);
  }

  alive(now) {
    return this.age(now) < this.lifetime;
  }

  update(dt) {
    this.pos.add(p5.Vector.mult(this.vel, dt));
    this.vel.mult(0.995);
  }
}

function updateGrid() {
  grid = {};
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let cellX = floor(p.pos.x / cellSize);
    let cellY = floor(p.pos.y / cellSize);
    let cellKey = `${cellX},${cellY}`;
    if (!grid[cellKey]) grid[cellKey] = [];
    grid[cellKey].push(i);
  }
}

function windowResized() {
  resizeCanvas(1080, 1080);
}
