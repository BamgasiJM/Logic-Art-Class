/*
Flow Field + Bezier 기반 생각의 흐름

1. 아래에서 "생각 particle"이 생성됨
2. 공간에는 보이지 않는 Flow Field가 존재
3. Flow Field는 Perlin Noise로 만들어짐
4. particle은 field 방향을 따라 이동
5. 이동한 위치들을 Bezier 곡선으로 연결
6. 화면 밖으로 나가면 삭제되고 새로운 생각 생성
*/

// =============================
// 조절 가능한 변수
// =============================

let thoughtCount = 200;  // 동시에 존재하는 생각 수
let speed = 10;           // particle 이동 속도
let noiseScale = 0.01;  // 노이즈 스케일 (flow field의 부드러움)
let noiseStrength = 0.05; // 곡선 흔들림 정도
let trailLength = 70;   // 생각이 남기는 흔적 길이

// 생각 라인 배열
let thoughts = [];

// =============================
function setup() {
  createCanvas(1000, 1000);
  background(0);
  // 초기 생각 생성 (화면 아래쪽에서 시작)
  for (let i = 0; i < thoughtCount; i++) {
    thoughts.push(new Thought(random(width), random(height, height + 300)));
  }
}

// =============================
function draw() {
  background(0, 40); // 배경 색 + 알파값(잔상)
  for (let i = thoughts.length - 1; i >= 0; i--) {
    let t = thoughts[i];

    t.update();
    t.display();

    // 화면 위로 나가면 제거 후 새 생각라인 생성
    if (t.pos.y < -100) {
      thoughts.splice(i, 1);
      thoughts.push(new Thought(random(width), height + 100));
    }
  }
}

// =============================
// Thought 클래스
// =============================
class Thought {
  constructor(startX, startY) {
    this.pos = createVector(startX, startY); // 현재 위치
    this.vel = createVector(0, -random(2, 6)); // 기본 이동 방향 (위쪽)
    this.history = []; // 지나온 위치 기록
  }

  update() {
    // Flow Field 각도 계산
    let angle =
      noise(this.pos.x * noiseScale, this.pos.y * noiseScale) * TWO_PI * 2;
    let flow = p5.Vector.fromAngle(angle);
    flow.mult(noiseStrength);
    this.vel.add(flow);                 // flow 영향을 속도에 추가
    this.vel.limit(speed);              // 속도 제한
    this.pos.add(this.vel);             // 위치 이동
    this.history.push(this.pos.copy()); // 위치 기록
    // trail 길이 유지
    if (this.history.length > trailLength) {
      this.history.shift();
    }
  }

  display() {
    stroke(255, 130);
    strokeWeight(0.6);
    noFill();

    if (this.history.length < 4) return;

    beginShape();
    for (let i = 0; i < this.history.length - 3; i++) {

      let p0 = this.history[i];
      let p1 = this.history[i + 1];
      let p2 = this.history[i + 2];
      let p3 = this.history[i + 3];

      if (i === 0) {
        vertex(p0.x, p0.y);
      }

      bezierVertex(
        p1.x, p1.y,
        p2.x, p2.y,
        p3.x, p3.y
      );
    }
    endShape();
  }
}
