let audioCtx;
let activeNotes = new Map(); // 눌린 키 관리
let visualEvents = [];

const keyMap = {
  a: 261.63, // C4
  s: 293.66, // D4
  d: 329.63, // E4
  f: 349.23, // F4
  g: 392.0, // G4
  h: 440.0, // A4
  j: 493.88, // B4
};

function setup() {
  createCanvas(800, 800);
  background(20);
  textAlign(CENTER, CENTER);
  textSize(14);
}

function draw() {
  background(20, 40);

  // 시각 이벤트 렌더링
  for (let i = visualEvents.length - 1; i >= 0; i--) {
    let v = visualEvents[i];
    v.radius += 2;
    v.alpha -= 4;

    noFill();
    stroke(255, v.alpha);
    circle(width / 2, height / 2, v.radius);

    if (v.alpha <= 0) {
      visualEvents.splice(i, 1);
    }
  }

  fill(200);
  noStroke();
  text("A S D F G H J 키를 눌러 연주합니다", width / 2, height - 40);
}

function keyPressed() {
  let k = key.toLowerCase();
  if (!(k in keyMap)) return;

  // 오디오 컨텍스트 초기화 (사용자 입력 후)
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  if (activeNotes.has(k)) return;

  let freq = keyMap[k];
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  // 엔벨로프
  let now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.05);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  activeNotes.set(k, { osc, gain });

  // 시각 이벤트 추가
  visualEvents.push({
    radius: 10,
    alpha: 255,
  });
}

function keyReleased() {
  let k = key.toLowerCase();
  if (!activeNotes.has(k)) return;

  let { osc, gain } = activeNotes.get(k);
  let now = audioCtx.currentTime;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.2);

  osc.stop(now + 0.25);
  activeNotes.delete(k);
}
