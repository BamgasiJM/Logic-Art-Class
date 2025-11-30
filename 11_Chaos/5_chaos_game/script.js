let points = [];
let current;
let vertices = [];

function setup() {
  createCanvas(800, 600);
  background(0);

  // 정삼각형의 세 꼭짓점
  vertices.push(createVector(width / 2, 50));
  vertices.push(createVector(50, height - 50));
  vertices.push(createVector(width - 50, height - 50));

  // 임의의 시작점
  current = createVector(random(width), random(height));
}

function draw() {
  // 매 프레임마다 여러 점을 찍어 빠르게 패턴 생성
  for (let i = 0; i < 100; i++) {
    stroke(0, 255, 200);
    strokeWeight(1);
    point(current.x, current.y);

    // 무작위로 꼭짓점 하나 선택
    let vertex = random(vertices);

    // 현재 점과 선택된 꼭짓점의 중점으로 이동
    current.x = lerp(current.x, vertex.x, 0.5);
    current.y = lerp(current.y, vertex.y, 0.5);
  }

  // 꼭짓점 표시
  fill(255);
  noStroke();
  for (let v of vertices) {
    circle(v.x, v.y, 10);
  }
}