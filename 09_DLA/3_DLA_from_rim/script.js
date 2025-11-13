const MAX_PARTICLES = 1000;
let particles = [];
let stuck = [];

function setup() {
  createCanvas(800, 600);
  background(15);
  // 중심 seed
  stuck.push(createVector(width / 2, height / 2));
}

function draw() {
  fill(15, 15, 15, 30);
  rect(0, 0, width, height);

  // 새로운 입자 생성 (무작위 가장자리)
  if (frameCount % 1 === 0) {     // 매 프레임마다 입자 생성
    let angle = random(TWO_PI);
    let r = width / 2 - 10;
    let x = width / 2 + cos(angle) * r;
    let y = height / 2 + sin(angle) * r;
    particles.push(createVector(x, y));
  }
  
  // MAX_PARTICLES 개수보다 적을 때만 새로운 입자를 생성합니다.
  if (particles.length < MAX_PARTICLES) {
    if (frameCount % 2 === 0) {
      let angle = random(TWO_PI);
      let r = width / 2 - 10;
      let x = width / 2 + cos(angle) * r;
      let y = height / 2 + sin(angle) * r;
      particles.push(createVector(x, y));
    }
  }
  
  // 입자 이동
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += random(-3, 3);
    p.y += random(-3, 3);

    // 중심 쪽으로 이동
    let center = createVector(width / 2, height / 2);
    let dir = p5.Vector.sub(center, p).setMag(0.5);
    p.add(dir);

    // 붙기 검사
    for (let s of stuck) {
      if (p.dist(s) < 3) {
        stuck.push(p);
        particles.splice(i, 1);
        break;
      }
    }

    // 화면 밖 제거
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      particles.splice(i, 1);
    }
  }

  // 그리기
  noStroke();
  fill(255);
  for (let s of stuck) circle(s.x, s.y, 3);
  fill(30, 190, 180);
  for (let p of particles) circle(p.x, p.y, 2);
}
