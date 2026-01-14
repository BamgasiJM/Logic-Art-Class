// p5.js 코드
// 프로젝트 폴더에 CSV 파일들을 업로드해야 합니다.

let tables = {};
let planets = [
  { name: "Sun", file: "Sun_data.csv", color: "#FFD700" }, // 노랑
  { name: "Jupiter", file: "Jupiter_data.csv", color: "#D2691E" }, // 갈색
  { name: "Neptune", file: "Neptune_data.csv", color: "#4169E1" }, // 파랑
  { name: "Earth", file: "Earth_data.csv", color: "#32CD32" }, // 초록
  { name: "Mars", file: "Mars_data.csv", color: "#FF4500" }, // 주황
  { name: "Moon", file: "Moon_data.csv", color: "#C0C0C0" }, // 회색
];

let maxTime = 0;
let maxPos = 0;
let dataPoints = []; // 파싱된 데이터를 저장할 배열
let currentIndex = 0; // 애니메이션 프레임 인덱스

function preload() {
  // 모든 CSV 파일 로드
  for (let p of planets) {
    tables[p.name] = loadTable(p.file, "csv", "header");
  }
}

function setup() {
  createCanvas(1000, 600);
  frameRate(60);

  // 데이터 파싱 및 최대값 찾기 (스케일링용)
  for (let p of planets) {
    let table = tables[p.name];
    let rows = table.getRows();
    let pData = [];

    for (let r of rows) {
      let t = r.getNum("Time (s)");
      let y = r.getNum("Position (m)");

      pData.push({ t: t, y: y });

      if (t > maxTime) maxTime = t;
      if (y > maxPos) maxPos = y;
    }
    dataPoints.push({ meta: p, data: pData });
  }

  // 여백을 위해 최대값 약간 증가
  maxPos *= 1.1;

  textSize(14);
}

function draw() {
  background(30);

  // 축 그리기
  stroke(255);
  line(50, height - 50, width - 50, height - 50); // X축
  line(50, height - 50, 50, 50); // Y축

  // 범례 및 텍스트 표시
  noStroke();
  fill(255);
  text(`Max Height: ${maxPos.toFixed(1)}m`, 60, 40);
  text(`Max Duration: ${maxTime.toFixed(1)}s`, width - 150, height - 30);

  // 각 행성별 궤적 그리기
  for (let i = 0; i < dataPoints.length; i++) {
    let planet = dataPoints[i];
    let path = planet.data;

    stroke(planet.meta.color);
    strokeWeight(2);
    noFill();

    // 현재 프레임까지만 경로 그리기 (애니메이션 효과)
    beginShape();
    let drawLimit = min(currentIndex, path.length - 1);

    for (let j = 0; j <= drawLimit; j++) {
      // 화면 좌표로 매핑
      // x: 시간 (0 ~ maxTime) -> 화면 너비 (50 ~ width-50)
      // y: 높이 (0 ~ maxPos) -> 화면 높이 (height-50 ~ 50)
      let sx = map(path[j].t, 0, maxTime, 50, width - 50);
      let sy = map(path[j].y, 0, maxPos, height - 50, 50);
      vertex(sx, sy);

      // 현재 위치에 원 그리기 (헤드)
      if (j === drawLimit) {
        push();
        fill(planet.meta.color);
        noStroke();
        ellipse(sx, sy, 8, 8);

        // 행성 이름 라벨
        text(planet.meta.name, sx + 10, sy);
        pop();
      }
    }
    endShape();
  }

  // 애니메이션 진행 (속도 조절 가능)
  // 데이터가 많으므로 한 번에 여러 스텝씩 점프하여 속도감 있게 재생
  currentIndex += 5;

  // 루프 종료 조건 (가장 긴 데이터 기준)
  let longestData = 0;
  for (let p of dataPoints) longestData = max(longestData, p.data.length);

  if (currentIndex > longestData + 100) {
    noLoop(); // 애니메이션 끝
  }
}
