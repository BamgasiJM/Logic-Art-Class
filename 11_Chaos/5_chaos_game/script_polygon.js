let current;
let vertices = [];
let lastVertexIndex = -1; // 이전에 선택된 꼭짓점의 인덱스

function setup() {
  createCanvas(800, 800);
  background(0);

  // 꼭짓점 계산
  let numVertices = 8;
  let radius = 350;
  let center = createVector(width / 2, height / 2);

  for (let i = 0; i < numVertices; i++) {
    let angle = map(i, 0, numVertices, -HALF_PI, TWO_PI - HALF_PI);
    let x = center.x + radius * cos(angle);
    let y = center.y + radius * sin(angle);
    vertices.push(createVector(x, y));
  }

  // 임의의 시작점 (중앙 근처)
  current = createVector(
    center.x + random(-10, 10),
    center.y + random(-10, 10)
  );
}

function draw() {
  // 매 프레임마다 여러 점을 찍어 빠르게 패턴 생성
  for (let i = 0; i < 200; i++) {
    stroke(255, 165, 0); // 색상을 주황색 계열로 변경
    strokeWeight(1);
    point(current.x, current.y);

    // 1. 규칙에 따라 다음 꼭짓점 인덱스 선택
    let nextVertexIndex = selectNextVertexIndex(lastVertexIndex);
    let vertex = vertices[nextVertexIndex];

    // 2. 현재 점과 선택된 꼭짓점의 중점 이동 (황금비 근사치)
    // 비율을 0.5 대신 0.618034로 사용하면 더 정확한 프랙탈이 생성됩니다.
    let moveRatio = 0.618;
    current.x = lerp(current.x, vertex.x, moveRatio);
    current.y = lerp(current.y, vertex.y, moveRatio);

    // 3. 마지막 꼭짓점 인덱스 업데이트
    lastVertexIndex = nextVertexIndex;
  }

  // 꼭짓점 표시
  fill(255);
  noStroke();
  for (let v of vertices) {
    circle(v.x, v.y, 8);
  }
}

// 다음 꼭짓점을 선택하는 함수 (제한 규칙 적용)
function selectNextVertexIndex(lastIndex) {
  let numVertices = vertices.length;
  let availableIndices = [];

  for (let i = 0; i < numVertices; i++) {
    // 1. 이웃한 두 꼭짓점의 인덱스를 계산 (모듈러 연산으로 순환)
    let prevNeighbor = (lastIndex - 1 + numVertices) % numVertices;
    let nextNeighbor = (lastIndex + 1) % numVertices;

    // 2. 현재 선택할 꼭짓점 인덱스가 이웃이 아닌 경우만 허용
    if (i !== prevNeighbor && i !== nextNeighbor) {
      availableIndices.push(i);
    }
  }

  // 허용된 꼭짓점 중에서 무작위로 하나 선택하여 인덱스 반환
  let randomIndex = floor(random(availableIndices.length));
  return availableIndices[randomIndex];
}

// 마우스 클릭으로 재시작
function mousePressed() {
  setup();
}
