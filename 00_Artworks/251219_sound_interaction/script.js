let mic;
let amp;
let started = false;

function setup() {
  createCanvas(800, 800);
  background(15);

  mic = new p5.AudioIn();
  amp = new p5.Amplitude();
}

function draw() {
  background(15, 40);

  if (!started) {
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("화면을 클릭하면 마이크가 활성화됩니다", width / 2, height / 2);
    return;
  }

  let level = amp.getLevel();

  let radius = map(level, 0.002, 0.07, 30, 330);
  radius = constrain(radius, 30, 330);

  noStroke();
  fill(255, 150);
  ellipse(width / 2, height / 2, radius * 2, radius * 2);
}

function mousePressed() {
  // 오디오 컨텍스트 강제 시작
  userStartAudio();

  mic.start(() => {
    amp.setInput(mic);
    started = true;
    console.log("마이크 시작됨");
  });
}
