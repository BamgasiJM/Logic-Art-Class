let mic, fft;
let audioStarted = false;

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
}

function draw() {
  background(5);
  translate(width / 2, height / 2);

  // 오디오 시작 전 안내 메시지
  if (!audioStarted) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("클릭해서 시작", 0, 0);
    return;
  }

  let spectrum = fft.analyze();
  let rotateSpeed = map(fft.getEnergy("bass"), 0, 255, 0, 9);

  rotate(frameCount * -0.5 + rotateSpeed);

  noStroke();

  for (let i = 0; i < spectrum.length; i++) {
    let r = map(i, 0, spectrum.length, 40, 250);
    let angle = i * 6;

    let amp = spectrum[i];

    let x = r * cos(angle);
    let y = r * sin(angle);

    fill(
      map(amp, 0, 255, 100, 255),
      map(i, 0, spectrum.length, 50, 200),
      255,
      200
    );
    circle(x, y, map(amp, 0, 255, 2, 72));
  }
}

// 클릭 시 오디오 시작
function mousePressed() {
  if (!audioStarted) {
    mic = new p5.AudioIn();
    mic.start();

    fft = new p5.FFT(0.8, 512);
    fft.setInput(mic);

    audioStarted = true;
  }
}
