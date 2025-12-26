// p5.sound 라이브러리 필요
// 파티클 색/속도/크기/진동이 모두 오디오에 반응함

let mic;
let fft;
let particles = [];
let audioStarted = false;

function setup() {
  createCanvas(800, 500);
  noStroke();
}

function draw() {
  background(12, 12, 12);

  // 오디오 시작 전 안내 메시지
  if (!audioStarted) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("클릭해서 시작", width / 2, height / 2);
    return;
  }

  // ✅ 오디오 분석
  let spectrum = fft.analyze();

  let bass = fft.getEnergy("bass") * 2; // 저음 20–140Hz
  let mid = fft.getEnergy("mid") * 2; // 중음 400–2600Hz
  let treble = fft.getEnergy("treble") * 2; // 고음 6000Hz~

  // ✅ 가운데 원 — 전체 에너지 반응(확실하게 보이도록 강화)
  let level = fft.getEnergy("lowMid");
  let r = map(level, 0, 255, 30, 160);

  fill(255, 255, 255, 255);
  circle(width / 2, height / 2, r * 2);

  // ✅ 파티클 업데이트 및 렌더
  particles.forEach((p) => {
    p.update(bass, mid, treble);
    p.show();
  });
}

// 클릭 시 오디오 시작
function mousePressed() {
  if (!audioStarted) {
    // ✅ 마이크 입력 시작
    mic = new p5.AudioIn();
    mic.start();

    // ✅ FFT 초기화
    fft = new p5.FFT(0.9, 256);
    fft.setInput(mic);

    // ✅ 파티클 생성
    for (let i = 0; i < 200; i++) {
      particles.push(new Particle());
    }

    audioStarted = true;
  }
}

// ---------------------------------------------
// ✅ Particle Class
// 오디오 주파수 값에 따라 속도·색·크기·jitter 모두 반응
// ---------------------------------------------

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.size = random(3, 6);

    // 색상 초기값
    this.col = color(180, 150, 255, 200);
  }

  update(bass, mid, treble) {
    // ✅ 오디오 반응 강도 조절(확실하게 보이도록 과장)
    let bassAmp = map(bass, 0, 255, 0, 8); // 크고 강렬한 반응
    let midAmp = map(mid, 0, 255, 0, 4); // 이동 속도
    let trebleAmp = map(treble, 0, 255, 0, 3); // 색 반짝임

    // ✅ 속도 증가 — mid에 강하게 반응
    this.pos.add(this.vel.copy().mult(0.4 + midAmp * 1.3));

    // ✅ jitter — 고음 treble 기반 작은 진동
    this.pos.add(p5.Vector.random2D().mult(trebleAmp * 3.5));

    // ✅ 화면 밖으로 나가면 wrap-around
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;

    // ✅ 색상 반응 — bass/mid/treble 모두 반영
    this.col = color(
      map(bass, 0, 255, 0, 255), // 저음 → 빨강 최대치까지
      map(mid, 0, 255, 50, 255), // 중음 → 초록 강하게 반영
      map(treble, 0, 255, 100, 255), // 고음 → 파란 반짝임
      240
    );

    // ✅ 크기 — bass에 반응
    this.currentSize = this.size + bassAmp * 2.2;
  }

  show() {
    fill(this.col);
    circle(this.pos.x, this.pos.y, this.currentSize);
  }
}
