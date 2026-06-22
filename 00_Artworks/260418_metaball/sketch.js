const CANVAS_SIZE = 1000;
const CIRCLE_COUNT = 8;
const MIN_RADIUS = 40;
const MAX_RADIUS = 130;
const MAX_SPEED = 1.5;
const THRESHOLD = 1.0;

const circles = [];

let metaballShader;

const vertSrc = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vUv;

void main() {
    vUv = aTexCoord;
    gl_Position = vec4(aPosition, 1.0);
}
`;

const fragSrc = `
precision highp float;

uniform vec2 uResolution;

uniform vec2 uPositions[${CIRCLE_COUNT}];
uniform float uRadii[${CIRCLE_COUNT}];

uniform float uThreshold;

varying vec2 vUv;

void main() {
    vec2 uv = vUv * uResolution;
    float field = 0.0;
    for (int i = 0; i < ${CIRCLE_COUNT}; i++) {
        vec2 diff = uv - uPositions[i];
        float d2 = dot(diff, diff);
        d2 = max(d2, 0.0001);
        float r = uRadii[i];
        field += (r * r) / d2;
    }

    float metaball = smoothstep(uThreshold - 0.08, uThreshold + 0.08, field);
    float glow = smoothstep(uThreshold - 0.35, uThreshold, field);
    vec3 color = vec3(metaball) + vec3(glow * 0.2);

    gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {
  pixelDensity(1);

  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE, WEBGL);
  canvas.parent("canvas-container");
  noStroke();

  metaballShader = createShader(vertSrc, fragSrc);

  for (let i = 0; i < CIRCLE_COUNT; i++) {
    const r = random(MIN_RADIUS, MAX_RADIUS);

    circles.push({
      x: random(r, width - r),
      y: random(r, height - r),
      vx: random(-MAX_SPEED, MAX_SPEED),
      vy: random(-MAX_SPEED, MAX_SPEED),
      r: r,
    });
  }
}

function draw() {
  background(0);

  updateCircles();

  const positions = [];
  const radii = [];

  for (const c of circles) {
    positions.push(c.x, height - c.y);
    radii.push(c.r);
  }

  shader(metaballShader);

  metaballShader.setUniform("uResolution", [width, height]);
  metaballShader.setUniform("uPositions", positions);
  metaballShader.setUniform("uRadii", radii);
  metaballShader.setUniform("uThreshold", THRESHOLD);

  drawFullscreenQuad();
}

function updateCircles() {
  for (const c of circles) {
    c.x += c.vx;
    c.y += c.vy;

    if (c.x - c.r < 0) {
      c.x = c.r;
      c.vx *= -1.0;
    }

    if (c.x + c.r > width) {
      c.x = width - c.r;
      c.vx *= -1.0;
    }

    if (c.y - c.r < 0) {
      c.y = c.r;
      c.vy *= -1.0;
    }

    if (c.y + c.r > height) {
      c.y = height - c.r;
      c.vy *= -1.0;
    }
  }
}

function drawFullscreenQuad() {
  beginShape();

  vertex(-1, -1, 0, 0, 0);
  vertex(1, -1, 0, 1, 0);
  vertex(1, 1, 0, 1, 1);
  vertex(-1, 1, 0, 0, 1);

  endShape(CLOSE);
}
