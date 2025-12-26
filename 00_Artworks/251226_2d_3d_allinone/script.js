/* -------------------- 2D Artwork -------------------- */
const sketch2D = (p) => {
  p.setup = () => {
    let canvas = p.createCanvas(400, 400);
    canvas.parent("container-2d");
    p.colorMode(p.HSL, 360, 100, 100);
    p.noStroke();
    p.frameRate(60); 
  };

  p.draw = () => {
    p.background(5, 5, 5); 

    const time = p.millis() * 0.0003;
    const w = p.width;
    const h = p.height;

    for (let i = 0; i < 1600; i++) {
      const t = i / 80;
      const x = (t * w) % w;

      const n = p.noise(t + time * 0.3);
      const y = h / 2 + n * p.sin(t + time) * 120;
      const r = 1 + n * 4;

      p.fill(210 + n * 50, 80, 60);
      p.circle(x, y, r * 2);
    }
  };
};

/* -------------------- 3D Artwork (WebGL 2) -------------------- */
const sketch3D = (p) => {
  const GRID = 16; 
  const WAVE_FREQ = 2.5;
  const WAVE_AMP = 0.35;
  const WAVE_SPEED = 1.0;
  const SCALE = 160;

  p.setup = () => {
    let canvas = p.createCanvas(400, 400, p.WEBGL);
    canvas.parent("container-3d");

    p.setAttributes("antialias", true);
  };

  p.draw = () => {
    p.background(5, 5, 5);
    p.orbitControl(2, 2, 1);

    p.stroke(100, 255, 218); 
    p.strokeWeight(1.2);
    p.noFill();

    const time = p.millis() * 0.001 * WAVE_SPEED;

    p.rotateY(p.frameCount * 0.005);
    p.rotateX(p.PI / 6); 

    for (let i = 0; i < GRID - 1; i++) {
      p.beginShape(p.TRIANGLE_STRIP);
      for (let j = 0; j < GRID; j++) {
        drawVertex(i, j, time);
        drawVertex(i + 1, j, time);
      }
      p.endShape();
    }
  };

  function drawVertex(i, j, time) {
    const xNorm = (i / (GRID - 1)) * 2 - 1;
    const zNorm = (j / (GRID - 1)) * 2 - 1;

    const dist = p.sqrt(xNorm * xNorm + zNorm * zNorm);
    const damp = p.constrain(1.5 - dist, 0, 1);

    const y =
      p.sin(xNorm * WAVE_FREQ + time) *
      p.cos(zNorm * WAVE_FREQ + time) *
      WAVE_AMP *
      damp;

    p.vertex(xNorm * SCALE, -y * SCALE, zNorm * SCALE);
  }
};

new p5(sketch2D);
new p5(sketch3D);
