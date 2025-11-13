const MAX_PARTICLES = 300;
const STICKINESS = 5;

let particles = [];
let stuck = [];

function setup() {
  createCanvas(800, 400);
  background(15);
  colorMode(RGB, 255);

  // 바닥면 전체를 시드로 설정
  let seedSpacing = 3; // 시드 간격 (간격이 좁을수록 응집이 빠르고 부드러움)

  for (let x = 0; x <= width; x += seedSpacing) {
    // 캔버스 아랫면(y = height - 1)에 시드를 배치합니다.
    stuck.push(createVector(x, height - 1));
  }
}

function draw() {
  // 배경을 투명하게 덮어 칠하여 궤적 잔상 효과 생성
  fill(15, 15, 15, 50);
  rect(0, 0, width, height);

  // 새로운 입자 생성 (위쪽에서 떨어짐)
  if (particles.length < MAX_PARTICLES) {
    if (frameCount % 1 === 0) {
      let x = random(width);
      let y = 0; // 캔버스 상단
      particles.push(createVector(x, y));
    }
  }

  // 입자 이동 및 응집 (쌓임) 검사
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    // 입자 이동: 중력(Y)과 바람(X)
    p.x += random(-1.5, 1.5); // x축: 바람
    p.y += random(3, 7); // y축: 중력

    // 붙기(응집) 검사
    let isStuck = false;
    for (let s of stuck) {
      if (p.dist(s) < STICKINESS) {
        stuck.push(p);
        particles.splice(i, 1);
        isStuck = true;
        break;
      }
    }

    if (isStuck) continue; // 붙었으면 다음 입자로

    // 화면 밖 제거 (바닥을 지나친 입자 제거)
    if (p.y > height + 10) particles.splice(i, 1);
  }

  // 그리기
  noStroke();

  // 응집된 입자 (쌓인 눈/바닥)
  fill(255, 200);
  for (let s of stuck) circle(s.x, s.y, 10);

  // 움직이는 입자 (눈/파티클)
  fill(255, 200);
  for (let p of particles) circle(p.x, p.y, 10);
}
