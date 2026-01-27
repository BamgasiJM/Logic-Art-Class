let playX;
let tracks = [];
let synths = [];
let started = false;

const trackCount = 7;
const trackH = 250;
const speed = 1.2;
const connectDist = 180;

function setup() {
  createCanvas(1200, trackCount * trackH);
  playX = width / 2;

  // ───────── 사운드 ─────────
  synths = [
    new p5.Oscillator("sine"),
    new p5.Oscillator("triangle"),
    new p5.Oscillator("sawtooth"),
    new p5.Oscillator("square"),
  ];

  synths.forEach((s) => {
    s.start();
    s.amp(0);
  });

  // ───────── 노트 생성 ─────────
  for (let t = 0; t < trackCount; t++) {
    let row = [];
    let count = t === 3 ? 20 : 12;

    for (let i = 0; i < count; i++) {
      row.push(makeNote(t));
    }
    tracks.push(row);
  }
}

function makeNote(track) {
  let dir = track % 2 === 0 ? -1 : 1;
  return {
    track,
    dir,
    x: dir === -1 ? random(width, width * 2) : random(-width, 0),
    y: track * trackH + random(35, trackH - 35),
    r: random(3, 12),
    played: false,
  };
}

function draw() {
  background(10);

  drawRows();
  drawPlayhead();

  // ── 모든 점을 하나로 합침
  let allNotes = tracks.flat();

  // ── 전체 점 기반 연결선
  drawConnections(allNotes);

  // ── 트랙별 업데이트 & 렌더
  for (let t = 0; t < trackCount; t++) {
    updateAndDrawTrack(tracks[t], t);
  }
}

function drawRows() {
  stroke(60);
  strokeWeight(1);
  for (let i = 1; i < trackCount; i++) {
    line(0, i * trackH, width, i * trackH);
  }
}

function drawPlayhead() {
  stroke(255);
  strokeWeight(2);
  line(playX, 0, playX, height);
}

function updateAndDrawTrack(arr, track) {
  fill(255);
  noStroke();

  for (let n of arr) {
    n.x += speed * n.dir;
    ellipse(n.x, n.y, n.r * 2);

    if (!n.played && abs(n.x - playX) < 1) {
      playSound(n);
      n.played = true;
    }

    if ((n.dir === -1 && n.x < -60) || (n.dir === 1 && n.x > width + 60)) {
      Object.assign(n, makeNote(track));
    }
  }
}

function drawConnections(arr) {
  strokeWeight(1.5);

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      let a = arr[i];
      let b = arr[j];

      let d = dist(a.x, a.y, b.x, b.y);
      if (d < connectDist) {
        let alpha = map(d, 0, connectDist, 120, 0);
        stroke(255, alpha);
        line(a.x, a.y, b.x, b.y);
      }
    }
  }
}

function playSound(n) {
  if (!started) return;

  let s = synths[n.track];

  if (n.track === 0) {
    let freq = map(n.y, 0, trackH, 900, 300);
    s.freq(freq, 0.05);
    s.amp(0.25, 0.02);
    s.amp(0, 0.25);
  }

  if (n.track === 1) {
    let freq = map(n.y, trackH, trackH * 2, 120, 60);
    s.freq(freq);
    s.amp(0.3, 0.02);
    s.amp(0, 0.6);
  }

  if (n.track === 2) {
    let freq = map(n.y, trackH * 2, trackH * 3, 500, 200);
    s.freq(freq);
    s.amp(0.2, 0.01);
    s.amp(0, 0.2);
  }

  if (n.track === 3) {
    let freq = map(n.y, trackH * 3, height, 1600, 600);
    s.freq(freq);
    s.amp(0.15, 0.001);
    s.amp(0, 0.08);
  }
}

function mousePressed() {
  userStartAudio();
  started = true;
}
