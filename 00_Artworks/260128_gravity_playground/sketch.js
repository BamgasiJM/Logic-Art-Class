/* ===============================
   Matter.js aliases
================================ */
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Vector = Matter.Vector;

/* ===============================
   Global State
================================ */
let engine, world;
let objects = [];
let obstacles = [];

let gravityPoint;
let gravityStrength = 0;

const gravityStep = 0.01;
const gravityMax = 0.5;

const maxObjects = 400;
let instructionActive = true;

let gravityUI;

/* --- instruction animation --- */
let instructionStartTime;
const instructionFadeDuration = 2000; // ms
const instructionStartSize = 72;
const instructionEndSize = 56;

/* ===============================
   Setup
================================ */
function setup() {
  createCanvas(windowWidth, windowHeight);

  engine = Engine.create();
  world = engine.world;
  world.gravity.scale = 0;

  gravityPoint = createVector(width / 2, height / 2);
  gravityUI = document.getElementById("gravityValue");

  instructionStartTime = millis();

  createObstacles();
  setInterval(spawnObject, 350);
}

/* ===============================
   Resize
================================ */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gravityPoint.set(width / 2, height / 2);
}

/* ===============================
   Obstacles
================================ */
function createObstacles() {
  obstacles.length = 0;
  const count = floor(random(4, 8));

  for (let i = 0; i < count; i++) {
    const r = random(15, 40);
    const x = random(r, width - r);
    const y = random(r, height - r);

    const pillar = Bodies.circle(x, y, r, {
      isStatic: true,
      restitution: 0.9,
    });

    obstacles.push(pillar);
    World.add(world, pillar);
  }
}

/* ===============================
   Object Spawning
================================ */
function spawnObject() {
  if (objects.length >= maxObjects) return;

  const margin = 200;
  let x, y;

  if (random() < 0.5) {
    x = random(-margin, width + margin);
    y = random() < 0.5 ? -margin : height + margin;
  } else {
    x = random() < 0.5 ? -margin : width + margin;
    y = random(-margin, height + margin);
  }

  const r = random(8, 36);

  const body = Bodies.circle(x, y, r, {
    restitution: 0.8,
    frictionAir: 0.02,
  });

  body.hue = random(160, 280);
  objects.push(body);
  World.add(world, body);
}

/* ===============================
   Draw Loop
================================ */
function draw() {
  background(0);
  Engine.update(engine);

  applyGravity();
  cleanupObjects();

  drawBlackHole();
  drawObstacles();
  drawObjects();
  drawInstruction();
  drawGravityValue();
}

/* ===============================
   Gravity
================================ */
function applyGravity() {
  if (gravityStrength <= 0) return;

  for (let body of objects) {
    const dir = Vector.sub(gravityPoint, body.position);
    const dist = max(Vector.magnitude(dir), 20);

    const forceMag = gravityStrength / (dist * 0.4);
    const force = Vector.mult(Vector.normalise(dir), forceMag);

    Body.applyForce(body, body.position, force);
  }
}

/* ===============================
   Cleanup
================================ */
function cleanupObjects() {
  const margin = 400;

  objects = objects.filter((b) => {
    const p = b.position;
    const out =
      p.x < -margin ||
      p.x > width + margin ||
      p.y < -margin ||
      p.y > height + margin;

    if (out) {
      World.remove(world, b);
      return false;
    }
    return true;
  });
}

/* ===============================
   Drawing helpers
================================ */
function drawBlackHole() {
  fill(255);
  noStroke();
  circle(gravityPoint.x, gravityPoint.y, 8);
}

function drawObstacles() {
  noStroke();
  fill(10, 15, 30);
  for (let o of obstacles) {
    circle(o.position.x, o.position.y, o.circleRadius * 2);
  }
}

function drawObjects() {
  colorMode(HSB);
  noStroke();
  for (let b of objects) {
    fill(b.hue, 70, 90);
    circle(b.position.x, b.position.y, b.circleRadius * 2);
  }
  colorMode(RGB);
}

/* ===============================
   Instruction animation
================================ */
function drawInstruction() {
  if (!instructionActive) return;

  const elapsed = millis() - instructionStartTime;
  const t = constrain(elapsed / instructionFadeDuration, 0, 1);

  // easing (부드러운 감속)
  const ease = t * (2 - t);

  const alpha = 255 * ease;
  const size = lerp(instructionStartSize, instructionEndSize, ease);

  const ctx = drawingContext;
  const gradient = ctx.createLinearGradient(
    width / 2 - 350,
    height / 2 - 120,
    width / 2 + 350,
    height / 2 + 120,
  );

  gradient.addColorStop(0, "#1ec8ff");
  gradient.addColorStop(1, "#9afcff");

  ctx.fillStyle = gradient;
  ctx.globalAlpha = alpha / 255;

  textAlign(CENTER, CENTER);
  textFont("Inter");
  textSize(size);
  textLeading(size * 1.4);

  text(
    "왼쪽 클릭으로 중력을 점점 키우면서\n원하는 위치로 블랙홀을 옮겨보세요\n\n오른쪽 클릭으로 중력을 없앨 수도 있습니다.",
    width / 2,
    height / 2,
  );

  ctx.globalAlpha = 1;
}

function drawGravityValue() {
  gravityUI.textContent = gravityStrength.toFixed(2);
}

/* ===============================
   Input
================================ */
function mousePressed() {
  if (instructionActive) {
    if (mouseButton === LEFT) {
      instructionActive = false;
    }
    return;
  }

  if (mouseButton === LEFT) {
    gravityPoint.set(mouseX, mouseY);
    gravityStrength = min(gravityStrength + gravityStep, gravityMax);
  }

  if (mouseButton === RIGHT) {
    gravityStrength = 0;
  }
}

// 우클릭 메뉴 방지
document.addEventListener("contextmenu", (e) => e.preventDefault());
