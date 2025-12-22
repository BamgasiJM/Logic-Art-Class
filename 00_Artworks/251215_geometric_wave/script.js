// HTML: <div id="sketch-container"></div>

const geometricWaveSketch = (p) => {
  let particles = [];
  let flowField = [];
  let fieldResolution = 20;
  let noiseOffset = 0;

  p.setup = () => {
    // const container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(800, 800);
    // canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();

    // 입자 초기화
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(8, 15),
        speed: p.random(0.5, 1),
        hue: p.random(60),
        angle: 0,
        trail: [],
      });
    }

    // 흐름장 초기화
    initFlowField();
  };

  function initFlowField() {
    flowField = [];
    for (let x = 0; x < p.width; x += fieldResolution) {
      for (let y = 0; y < p.height; y += fieldResolution) {
        let angle = p.noise(x * 0.01, y * 0.01) * p.TWO_PI * 2;
        flowField.push({
          x: x,
          y: y,
          angle: angle,
        });
      }
    }
  }

  p.draw = () => {
    // 반투명 배경으로 궤적 효과
    p.push();
    p.fill(0, 0, 0, 5);
    p.rect(0, 0, p.width, p.height);
    p.pop();

    // 흐름장 업데이트
    updateFlowField();

    // 입자 업데이트 및 그리기
    for (let particle of particles) {
      updateParticle(particle);
      drawParticle(particle);
    }

    // 간헐적으로 새로운 입자 추가
    if (p.frameCount % 60 === 0) {
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(3, 10),
        speed: p.random(0.3, 1.5),
        hue: p.random(360),
        angle: 0,
        trail: [],
      });

      // 입자 수 제한
      if (particles.length > 300) {
        particles.splice(0, 50);
      }
    }

    noiseOffset += 0.01;
  };

  function updateFlowField() {
    for (let cell of flowField) {
      // 노이즈로 각도 업데이트 (미로처럼 변화)
      let noiseVal = p.noise(cell.x * 0.005, cell.y * 0.005, noiseOffset);
      cell.angle = noiseVal * p.TWO_PI * 3;
    }
  }

  function updateParticle(particle) {
    // 가장 가까운 흐름장 셀 찾기
    let nearestCell = getNearestFlowField(particle.x, particle.y);

    // 입자 각도 업데이트
    particle.angle = p.lerp(particle.angle, nearestCell.angle, 0.1);

    // 위치 업데이트
    particle.x += p.cos(particle.angle) * particle.speed;
    particle.y += p.sin(particle.angle) * particle.speed;

    // 궤적 기록 (최근 10개만 유지)
    particle.trail.push({ x: particle.x, y: particle.y });
    if (particle.trail.length > 10) {
      particle.trail.shift();
    }

    // 화면 경계 처리
    if (particle.x < 0) particle.x = p.width;
    if (particle.x > p.width) particle.x = 0;
    if (particle.y < 0) particle.y = p.height;
    if (particle.y > p.height) particle.y = 0;
  }

  function getNearestFlowField(x, y) {
    let nearest = flowField[0];
    let minDist = p.dist(x, y, nearest.x, nearest.y);

    for (let cell of flowField) {
      let d = p.dist(x, y, cell.x, cell.y);
      if (d < minDist) {
        minDist = d;
        nearest = cell;
      }
    }

    return nearest;
  }

  function drawParticle(particle) {
    // 궤적 그리기
    p.push();
    for (let i = 0; i < particle.trail.length; i++) {
      let point = particle.trail[i];
      let alpha = p.map(i, 0, particle.trail.length, 20, 100);
      let size = p.map(
        i,
        0,
        particle.trail.length,
        particle.size * 0.5,
        particle.size
      );

      p.fill(particle.hue, 80, 90, alpha);
      p.ellipse(point.x, point.y, size, size);
    }
    p.pop();

    // 입자 본체 그리기
    p.push();
    p.translate(particle.x, particle.y);
    p.rotate(particle.angle);

    // 색상 변화
    let hueShift =
      p.sin(p.frameCount * 0.05 + particle.hue * 0.01) * 30 + particle.hue;
    p.fill(hueShift % 360, 80, 100);

    // 모양 그리기 (사각형과 원 번갈아가며)
    if (p.frameCount % 120 < 60) {
      p.rect(0, 0, particle.size * 2, particle.size * 2);
    } else {
      p.ellipse(0, 0, particle.size * 2, particle.size * 2);
    }

    p.pop();
  }

  p.mousePressed = () => {
    // 클릭 위치에 새 입자 추가
    particles.push({
      x: p.mouseX,
      y: p.mouseY,
      size: p.random(5, 15),
      speed: p.random(0.5, 2),
      hue: p.random(360),
      angle: 0,
      trail: [],
    });
  };

  p.keyPressed = () => {
    if (p.key === " ") {
      // 스페이스바로 흐름장 재생성
      initFlowField();
    } else if (p.key === "c") {
      // C 키로 화면 클리어
      p.background(0);
    }
  };
};

new p5(geometricWaveSketch);
