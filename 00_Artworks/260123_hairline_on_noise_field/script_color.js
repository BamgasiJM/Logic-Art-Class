// 색상 팔레트: 나중에 추가/수정이 용이하도록 별도 관리
// 민트, 핫핑크, 퍼플 색상 정의
const COLOR_PALETTE = [
  [80, 230, 200], // 민트 (Mint) - RGB: 80, 230, 200
  [255, 105, 180], // 핫핑크 (Hot Pink) - RGB: 255, 105, 180
  [147, 112, 219], // 퍼플 (Purple) - RGB: 147, 112, 219
];

// 노이즈 스케일: Perlin 노이즈의 샘플링 간격을 결정합니다.
// 값이 작을수록 더 넓고 부드러운 흐름이 생성되고, 클수록 급격한 변화가 생깁니다.
const noiseScale = 0.005;

// 생성할 곡선(파티클)의 총 개수입니다.
// 많을수록 화면이 더 밀집되고 복잡한 패턴을 만듭니다.
const numCurves = 1400;

// 모든 곡선 객체를 저장하는 배열입니다.
let curves = [];

/**
 * setup 함수: 프로그램 시작 시 한 번만 실행됩니다.
 * 캔버스를 생성하고, 노이즈 시드를 고정하며, 곡선 객체들을 초기화합니다.
 */
function setup() {
  // 1000x1000 픽셀의 캔버스를 생성합니다.
  createCanvas(1000, 1000);

  // 배경을 다홍색으로 설정합니다.
  background(255, 100, 100);

  // Perlin 노이즈의 시드를 1000으로 고정합니다.
  // 시드를 고정하면 실행할 때마다 동일한 노이즈 패턴이 생성되어 재현 가능한 결과를 얻습니다.
  noiseSeed(1000);

  // numCurves 개수만큼 곡선 객체를 생성하여 배열에 추가합니다.
  for (let i = 0; i < numCurves; i++) {
    curves.push(new FlowCurve());
  }
}

/**
 * draw 함수: 매 프레임(보통 초당 60회)마다 반복 실행됩니다.
 * 배경을 지우고(잔상 효과를 위해 투명하게), 모든 곡선을 업데이트하고 그립니다.
 */
function draw() {
  // 배경을 다홍색으로 덮되, 알파값 20을 사용하여 잔상(trail) 효과를 만듭니다.
  // 알파값이 낮을수록 이전 프레임이 천천히 사라져 부드러운 잔상이 남습니다.
  background(255, 100, 100, 20);

  // curves 배열의 모든 곡선 객체를 순회하며 업데이트와 표시를 수행합니다.
  for (let curve of curves) {
    curve.update(); // 위치와 상태를 업데이트합니다.
    curve.display(); // 화면에 그립니다.
  }
}

/**
 * FlowCurve 클래스: 각각의 흐름 곡선을 나타내는 객체입니다.
 * 위치 이력(history)을 저장하여 꼬리처럼 보이게 하고,
 * 성장→성숙→소멸의 생명주기를 가집니다.
 */
class FlowCurve {
  /**
   * 생성자: 객체가 생성될 때 초기 속성을 설정합니다.
   */
  constructor() {
    // 현재 위치를 화면 내 무작위 좌표로 설정합니다.
    // createVector는 x, y 좌표를 가진 벡터 객체를 만듭니다.
    this.pos = createVector(random(width), random(height));

    // 과거 위치들을 저장하는 배열입니다.
    // 선을 그릴 때 이전 위치들을 연결하여 꼬리 모양을 만듭니다.
    this.history = [];

    // 꼬리의 최대 길이(히스토리 배열의 최대 크기)입니다.
    // 30에서 80 사이의 무작위 정수로 설정됩니다.
    this.maxLength = floor(random(30, 80));

    // 선의 굵기입니다.
    this.strokeW = random(16, 25);

    // 이동 속도입니다. 1에서 5 사이의 무작위 값으로,
    // 노이즈 필드를 따라 이동하는 속도를 결정합니다.
    this.speed = random(1, 5);

    // 객체의 현재 나이(프레임 수)입니다.
    // 생명주기 관리에 사용됩니다.
    this.age = 0;

    // 전체 수명(프레임 수)입니다.
    // maxLength(성장/소멸 단계) + 300~500(성숙 단계)으로 계산됩니다.
    this.lifespan = this.maxLength + random(300, 500);

    // 성장 단계의 길이입니다.
    // maxLength만큼 성장하여 최대 길이에 도달합니다.
    this.growthPhase = this.maxLength;

    // 소멸 중인지 여부를 나타내는 플래그입니다.
    this.dying = false;

    // ★ 색상 선택: 팔레트에서 무작위로 하나의 색상을 선택합니다.
    // floor(random(...))를 사용하여 0, 1, 2 중 하나의 인덱스를 선택합니다.
    let colorIndex = floor(random(COLOR_PALETTE.length));
    this.color = COLOR_PALETTE[colorIndex]; // [R, G, B] 배열 형태로 저장
  }

  /**
   * update 메서드: 매 프레임마다 객체의 상태를 업데이트합니다.
   * 성장, 성숙, 소멸 단계를 관리하고 화면 밖으로 나가면 재생성합니다.
   */
  update() {
    // 나이를 1 증가시킵니다.
    this.age++;

    // 1단계: 성장 단계
    // 나이가 growthPhase보다 작을 때는 꼬리가 점점 길어집니다.
    if (this.age < this.growthPhase) {
      this.updatePosition();
    }
    // 2단계: 성숙 단계
    // 최대 길이를 유지하며 이동합니다.
    // 수명이 lifespan - maxLength에 도달할 때까지 지속됩니다.
    else if (this.age < this.lifespan - this.maxLength) {
      this.updatePosition();
    }
    // 3단계: 소멸 단계
    // 꼬리가 머리부터 점점 짧아집니다(shift로 앞부분 제거).
    else {
      this.dying = true;
      if (this.history.length > 0) {
        // 배열의 첫 번째 요소(가장 오래된 위치)를 제거합니다.
        this.history.shift();
      }
    }

    // 완전히 소멸하면(히스토리가 비면) 새로운 위치에서 재생성합니다.
    if (this.dying && this.history.length === 0) {
      this.reset();
    }

    // 화면 밖으로 나가면(여백 20픽셀) 즉시 재생성합니다.
    if (
      this.pos.x < -20 ||
      this.pos.x > width + 20 ||
      this.pos.y < -20 ||
      this.pos.y > height + 20
    ) {
      this.reset();
    }
  }

  /**
   * reset 메서드: 객체를 초기 상태로 리셋하여 새로운 생명주기를 시작합니다.
   */
  reset() {
    // 위치를 화면 내 무작위로 재설정합니다.
    this.pos.set(random(width), random(height));
    // 히스토리를 비웁니다.
    this.history = [];
    // 나이를 0으로 초기화합니다.
    this.age = 0;
    // 새로운 수명을 설정합니다.
    this.lifespan = this.maxLength + random(300, 500);
    // 소멸 상태를 해제합니다.
    this.dying = false;

    // ★ 재생성 시 새로운 색상을 무작위로 선택합니다.
    let colorIndex = floor(random(COLOR_PALETTE.length));
    this.color = COLOR_PALETTE[colorIndex];
  }

  /**
   * updatePosition 메서드: Perlin 노이즈를 사용하여 다음 위치를 계산하고 이동합니다.
   */
  updatePosition() {
    // 현재 위치에 Perlin 노이즈를 적용하여 각도를 계산합니다.
    // noiseScale을 곱하여 샘플링 위치를 조정하고, TWO_PI * 2(720도) 범위로 매핑합니다.
    let angle =
      noise(this.pos.x * noiseScale, this.pos.y * noiseScale) * TWO_PI * 2;

    // 삼각함수를 사용하여 x, y 방향으로 이동량을 계산합니다.
    this.pos.x += cos(angle) * this.speed;
    this.pos.y += sin(angle) * this.speed;

    // 현재 위치를 히스토리 배열에 추가합니다(복사본을 저장).
    this.history.push(this.pos.copy());

    // 히스토리가 maxLength를 초과하면 가장 오래된 위치를 제거합니다.
    if (this.history.length > this.maxLength) {
      this.history.shift();
    }
  }

  /**
   * display 메서드: 히스토리 배열의 점들을 선으로 연결하여 화면에 그립니다.
   * 그라데이션 효과를 위해 선분마다 투명도를 다르게 적용합니다.
   * 선택된 팔레트 색상을 사용합니다.
   */
  display() {
    // 히스토리 길이를 저장합니다.
    const len = this.history.length;
    // 점이 2개 미만이면 선을 그릴 수 없으므로 종료합니다.
    if (len < 2) return;

    // 채우기 없이 선만 그립니다.
    noFill();

    // 히스토리의 각 점을 순회하며 선분을 그립니다.
    for (let i = 0; i < len - 1; i++) {
      // 현재 인덱스를 0~1 범위로 정규화합니다.
      // t=0은 꼬리(오래된 부분), t=1은 머리(새로운 부분)입니다.
      let t = i / (len - 1);

      // 투명도를 계산합니다.
      // t가 0(꼬리)일 때 alpha=255(불투명),
      // t가 1(머리)에 가까울수록 alpha가 0에 가까워집니다.
      // 그러나 여기서는 (1-t)를 사용하여 꼬리가 흐릿하게, 머리가 선명하게 만듭니다.
      let alpha = (1 - t) * 255;

      // ★ 선택된 색상(RGB 배열)에 투명도를 적용하여 선 색상을 설정합니다.
      // this.color는 [R, G, B] 형태의 배열입니다.
      stroke(this.color[0], this.color[1], this.color[2], alpha);

      // 선 굵기도 t에 따라 변화시킵니다.
      // 머리(t=1)쪽으로 갈수록 가늘어집니다(0.5배).
      strokeWeight(this.strokeW * (1 - t * 0.5));

      // 현재 점과 다음 점을 연결하는 선을 그립니다.
      let p1 = this.history[i];
      let p2 = this.history[i + 1];
      line(p1.x, p1.y, p2.x, p2.y);
    }
  }
}
