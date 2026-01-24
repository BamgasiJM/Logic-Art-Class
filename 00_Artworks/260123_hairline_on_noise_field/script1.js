let noiseScale = 0.01; // 더 작게 설정하여 넓은 흐름 패턴이 보이도록
let maxSegmentLength = 300;
let minSegmentLength = 200;
let numCurves = 50;

function setup() {
  createCanvas(1000, 1000);
  background(255);

  // 일관된 흐름을 위해 노이즈 시드 고정 (선택사항)
  noiseSeed(1000);

  for (let i = 0; i < numCurves; i++) {
    drawFlowCurve();
  }
}

function drawFlowCurve() {
  let numPoints = floor(random(minSegmentLength, maxSegmentLength));

  // 시작점을 화면 여백 안쪽으로 제한 (직선 생성 방지)
  let margin = 1;
  let x = random(margin, width - margin);
  let y = random(margin, height - margin);

  // 좌표 저장
  let points = [];
  points.push(createVector(x, y));

  // 노이즈 필드 좌표 (작은 증가량으로 부드러운 곡선)
  let nx = x * noiseScale;
  let ny = y * noiseScale;

  for (let i = 0; i < numPoints; i++) {
    // ★ 중요: 각도를 누적하지 않고, 현재 위치의 noise 값을 직접 각도로 사용
    // 이렇게 해야 Perlin noise의 부드러운 흐름이 곡선에 그대로 반영됨
    let angle = noise(nx, ny) * TWO_PI * 2.0 // 0~720도 범위로 매핑

    let stepSize = 10;
    x += cos(angle) * stepSize;
    y += sin(angle) * stepSize;

    // ★ 화면 밖 10픽셀 초과 나가면 즉시 종료 (직선 생성 방지)
    if (x < -10 || x > width || y < -10 || y > height) {
      break;
    }

    points.push(createVector(x, y));

    // 작은 증가량으로 부드러운 곡선 유지
    nx += 0.01;
    ny += 0.01;
  }

  // 그라디언트 곡선 그리기
  if (points.length < 2) return;

  let strokeWeightVal = map(
    points.length,
    minSegmentLength,
    maxSegmentLength,
    4,
    0.5,
  );

  for (let i = 0; i < points.length - 1; i++) {
    let t = map(i, 0, points.length - 1, 0, 1);
    let interCol = lerpColor(color(255), color(0), t);

    stroke(interCol);
    strokeWeight(strokeWeightVal);
    line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }
}
