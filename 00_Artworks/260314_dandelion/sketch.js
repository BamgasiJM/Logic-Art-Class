// * Dandelion Generative Art

// ===============================================
// [1. GLOBAL CONFIGURATION] 
// ===============================================
const MAX_GEN = 7; // 최대 성장 단계 (세대)
const START_BRANCH_COUNT = 10; // 초기 중심에서 뻗어 나가는 가지 수
const SUB_BRANCH_COUNT = 3; // 이후 각 마디에서 분기되는 가지 수

const MIN_LINE_LEN = 80; // 최소 가지 길이 (px)
const MAX_LINE_LEN = 90; // 최대 가지 길이 (px)

const MIN_DOT_SIZE = 2; // 중심부 노드 최소 크기
const MAX_DOT_SIZE = 5; // 말단 씨앗 최대 크기

const BG_COLOR = "#264955"; // 배경 색상 HEX
const LINE_COLOR = [255, 180]; // 선 색상 및 투명도 [R, G, B, Alpha] 또는 [Gray, Alpha]
const DOT_COLOR = [255, 220]; // 점 색상 및 투명도

// ===============================================
// [2. STATE VARIABLES]
// ===============================================
let nodes = []; // 전체 노드 저장 배열 (렌더링용)
let activeNodes = []; // 현재 분기 중인 말단 노드 배열 (연산용)
let lastBranchTime = 0; // 마지막 분기 시점 기록
const BRANCH_INTERVAL = 500; // 분기 간격 (밀리세컨드)

// ===============================================
// [3. P5.JS CORE]
// ===============================================
function setup() {
  createCanvas(1200, 1200);
  background(BG_COLOR);

  // 초기 루트 노드 설정 (캔버스 정중앙)
  const root = {
    x: width / 2,
    y: height / 2,
    parent: null,
    generation: 0,
    angle: 0,
  };

  nodes.push(root);
  activeNodes.push(root);
  lastBranchTime = millis();
}

function draw() {
  background(BG_COLOR);

  // 전체 노드 순회 및 렌더링
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];

    // 1. 라인 렌더링
    if (n.parent) {
      // 세대가 진행될수록 선이 가늘어지도록 설정
      const sw = map(n.generation, 1, MAX_GEN, 1.2, 0.2);
      stroke(LINE_COLOR);
      strokeWeight(sw);
      line(n.x, n.y, n.parent.x, n.parent.y);
    }

    // 2. 노드(점) 렌더링
    noStroke();
    fill(DOT_COLOR);
    // 세대에 따라 점 크기 결정 (말단일수록 MAX_DOT_SIZE에 수렴)
    const dotSize = map(n.generation, 0, MAX_GEN, MIN_DOT_SIZE, MAX_DOT_SIZE);
    circle(n.x, n.y, dotSize);
  }

  // 3. 분기 타이밍 체크 및 실행
  if (millis() - lastBranchTime > BRANCH_INTERVAL) {
    if (activeNodes.length > 0 && activeNodes[0].generation < MAX_GEN) {
      branchOut();
      lastBranchTime = millis();
    } else if (
      activeNodes.length > 0 &&
      activeNodes[0].generation === MAX_GEN
    ) {
      // 모든 성장이 끝났을 때 불필요한 루프 정지 (성능 최적화)
      console.log("Growth Complete. Loop stopped.");
      noLoop();
    }
  }
}

// ===============================================
// [4. LOGIC FUNCTIONS]
// ===============================================
function branchOut() {
  const nextActiveNodes = [];

  for (let i = 0; i < activeNodes.length; i++) {
    const p = activeNodes[i];

    // 캔버스 경계를 벗어나면 자식 노드를 생성하지 않음 (메모리 효율)
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;

    const currentGen = p.generation;
    const isRoot = currentGen === 0;
    const count = isRoot ? START_BRANCH_COUNT : SUB_BRANCH_COUNT;

    // 분산 각도 설정 (첫 분기는 360도, 이후는 72도 범위 내 분사)
    const spreadAngle = isRoot ? TWO_PI : PI * 0.4;

    for (let j = 0; j < count; j++) {
      let angle;
      if (isRoot) {
        angle = (TWO_PI / START_BRANCH_COUNT) * j;
      } else {
        // 부모의 각도를 중심으로 좌우 spreadAngle 만큼 분산
        angle =
          p.angle + map(j, 0, count - 1, -spreadAngle / 2, spreadAngle / 2);
      }

      const len = random(MIN_LINE_LEN, MAX_LINE_LEN);
      const newNode = {
        x: p.x + cos(angle) * len,
        y: p.y + sin(angle) * len,
        parent: p,
        generation: currentGen + 1,
        angle: angle,
      };

      nodes.push(newNode);
      nextActiveNodes.push(newNode);
    }
  }

  // 다음 연산을 위해 말단 노드 갱신
  activeNodes = nextActiveNodes;
}
