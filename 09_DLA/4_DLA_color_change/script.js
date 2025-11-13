let particles = [];
let stuck = [];
let colors = [];

function setup() {
  createCanvas(600, 600);
  background(0);
  colorMode(HSB);
  noStroke();
  // 중심 seed
  stuck.push(createVector(width / 2, height / 2));
  colors.push(0); // generation 0
}

function draw() {
  // 일정 간격으로 입자 추가
  if (frameCount % 1 === 0) {
    let angle = random(TWO_PI);
    let r = width / 2 - 5;
    let x = width / 2 + cos(angle) * r;
    let y = height / 2 + sin(angle) * r;
    particles.push(createVector(x, y));
  }

  // 입자 이동 및 붙기 검사
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += random(-2, 2);
    p.y += random(-2, 2);

    // 화면 중앙으로 향하는 약한 힘
    let center = createVector(width / 2, height / 2);
    let dir = p5.Vector.sub(center, p).setMag(0.2);
    p.add(dir);

    for (let j = 0; j < stuck.length; j++) {
      let s = stuck[j];
      if (p.dist(s) < 3) {
        stuck.push(p);
        colors.push(colors[j] + 1);
        particles.splice(i, 1);
        break;
      }
    }

    // 화면 밖으로 나가면 제거
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      particles.splice(i, 1);
    }
  }

  // 붙은 입자 그리기
  for (let i = 0; i < stuck.length; i++) {
    let hue = map(colors[i], 0, 80, 0, 360) % 360;
    fill(hue, 255, 255);
    circle(stuck[i].x, stuck[i].y, 3);
  }

  // 모여드는 입자
  fill(30, 30 ,30);
  for (let p of particles) {
    circle(p.x, p.y, 2);
  }

  // 성장 제한 (화면이 가득 찼을 때 정지)
  if (stuck.length > 2000) {
    noLoop();
    console.log("DLA growth complete!");
  }
}
