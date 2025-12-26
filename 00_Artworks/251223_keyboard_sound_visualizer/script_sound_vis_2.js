let audioCtx;
let masterGain;
let activeNotes = new Map();
let noteData = {};

const keyMap = {
  a: 196.0, // G3 (솔)
  s: 220.0, // A3 (라)
  d: 246.94, // B3 (시)
  f: 261.63, // C4 (도)
  g: 293.66, // D4 (레)
  h: 329.63, // E4 (미)
  j: 349.23, // F4 (파)
  k: 392.0, // G4 (솔)
  l: 440.0, // A4 (라)
  ";": 493.88, // B4 (시)
  "'": 523.25, // C5 (도)
};

const keyOrder = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"];
const maxRadius = 300;

function setup() {
  createCanvas(1920, 540);
  colorMode(HSB, 360, 100, 100, 255);
  background(0);

  const step = width / (keyOrder.length + 1);

  keyOrder.forEach((k, i) => {
    noteData[k] = {
      freq: keyMap[k],
      x: step * (i + 1),
      y: height / 2,
      hue: map(i, 0, keyOrder.length - 1, 0, 360),
      radius: 0,
      active: false,
      startTime: 0,
    };
  });
}

function draw() {
  background(0, 20);

  for (let k in noteData) {
    let n = noteData[k];

    if (n.active) {
      let held = millis() - n.startTime;
      n.radius = constrain(held * 0.15, 0, maxRadius);
    } else {
      n.radius *= 0.9;
    }

    if (n.radius > 1) {
      noFill();
      stroke(n.hue, 80, 100, 200);
      strokeWeight(2);
      circle(n.x, n.y, n.radius * 2);
    }
  }
}

function keyPressed() {
  let k = key.toLowerCase();
  if (!(k in noteData)) return;

  if (!audioCtx) {
    audioCtx = new AudioContext();

    // Master Gain 생성
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(audioCtx.destination);
  }

  if (activeNotes.has(k)) return;

  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  let now = audioCtx.currentTime;

  osc.type = "sine";
  osc.frequency.value = noteData[k].freq;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.08);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();

  activeNotes.set(k, { osc, gain });

  noteData[k].active = true;
  noteData[k].startTime = millis();

  updateMasterGain();
}

function keyReleased() {
  let k = key.toLowerCase();
  if (!activeNotes.has(k)) return;

  let { osc, gain } = activeNotes.get(k);
  let now = audioCtx.currentTime;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.25);

  osc.stop(now + 0.3);

  activeNotes.delete(k);
  noteData[k].active = false;

  updateMasterGain();
}

function updateMasterGain() {
  if (!masterGain) return;

  let noteCount = activeNotes.size;
  if (noteCount === 0) {
    masterGain.gain.setTargetAtTime(0.9, audioCtx.currentTime, 0.05);
    return;
  }

  let target = 0.9 / Math.sqrt(noteCount);
  masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.05);
}
