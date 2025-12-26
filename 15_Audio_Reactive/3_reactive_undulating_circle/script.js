let mic, fft;
let particles = [];
let audioStarted = false;

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
  colorMode(RGB, 255);

  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 64);
  fft.setInput(mic);

  for (let i = 0; i < 160; i++) {
    particles.push(new Particle());
  }

  noStroke();
}

function draw() {
  background(15, 15, 20, 10);

  if (!audioStarted) {
    displayStartMessage();
    return;
  }

  fft.analyze();
  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");

  renderUndulatingCircle(bass, mid, treble);
  updateParticles(bass, mid, treble);
}

function displayStartMessage() {
  fill(220);
  textSize(24);
  textAlign(CENTER, CENTER);
  noStroke();
  text("클릭해서 시작", width / 2, height / 2);
}

function mousePressed() {
  if (getAudioContext().state !== "running") {
    getAudioContext()
      .resume()
      .then(() => {
        mic.start();
        audioStarted = true;
      })
      .catch((err) => {
        console.error("Error starting audio context:", err);
      });
  } else if (!audioStarted) {
    mic.start();
    audioStarted = true;
  }
}

function renderUndulatingCircle(bass, mid, treble) {
  push();
  translate(width / 2, height / 2);

  // 노이즈 기반 언듈레이팅 서클
  // 수치를 올리면 변화가 더 커짐
  let baseRadius = 180;
  let noiseScale = map(mid, 0, 255, 0.01, 0.5);  // 중음에 따라 노이즈 강도 변화
  let amplitude = map(bass, 0, 255, 30, 200);    // 저음에 따라 진폭 변화

  // 색상 - 고음과 중음에 따라 더 화려하게 변화
  let hue = (frameCount * 0.5 + treble * 0.3) % 360;
  let r = map(sin(hue), -1, 1, 80, 255);
  let g = map(sin(hue + 120), -1, 1, 100, 255);
  let b = map(sin(hue + 240), -1, 1, 150, 255);

  // 중음에 따라 채도 강도 조절
  let saturation = map(mid, 0, 255, 0.3, 1);
  r = lerp(150, r, saturation);
  g = lerp(150, g, saturation);
  b = lerp(150, b, saturation);

  fill(r, g, b, 200);

  beginShape();
  for (let angle = 0; angle < 360; angle += 2) {
    let xoff = cos(angle) * noiseScale;
    let yoff = sin(angle) * noiseScale;

    // 노이즈 값 계산 - 0.01을 높이면 노이즈 빨라짐
    let n = noise(xoff + frameCount * 0.01, yoff + frameCount * 0.01);
    let offset = map(n, 0, 1, -amplitude, amplitude);

    let r = baseRadius + offset;
    let x = r * cos(angle);
    let y = r * sin(angle);

    vertex(x, y);
  }
  endShape(CLOSE);

  pop();
}

function updateParticles(bass, mid, treble) {
  for (let p of particles) {
    p.update(bass, mid, treble);
    p.show();
  }
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.pos = createVector(width / 2, height / 2);
    this.vel = p5.Vector.random2D().mult(random(0.3, 1.0));
    this.size = random(4, 8); // 크기 증가
    this.life = random(150, 250);
    this.maxLife = this.life;
  }

  update(bass, mid, treble) {
    this.life -= 1;

    let speedBoost = 0.4 + mid * 0.004;
    this.pos.add(this.vel.copy().mult(speedBoost));

    // 미세한 흔들림
    this.pos.add(p5.Vector.random2D().mult(treble * 0.002));

    if (this.life <= 0) {
      this.reset();
    }
  }

  show() {
    let alpha = map(this.life, 0, this.maxLife, 0, 220);

    // 파티클
    noStroke();
    fill(200, 220, 255, alpha);
    circle(this.pos.x, this.pos.y, this.size);

    // 글로우 효과
    fill(200, 220, 255, alpha * 0.3);
    circle(this.pos.x, this.pos.y, this.size * 1.8);
  }
}
