let nodes = [];

function setup() {
  createCanvas(800, 400);

  for (let i = 0; i < 400; i++) {
    nodes.push({
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-1, 1), random(-1, 1)),
    });
  }
}

function draw() {
  background(15);
  stroke(240, 200, 30, 80);

  // 모든 노드 업데이트
  for (let n of nodes) {
    // 시간 기반 흔들림
    n.pos.x += n.vel.x + sin(frameCount * 0.01 + n.pos.y) * 0.4;
    n.pos.y += n.vel.y + cos(frameCount * 0.01 + n.pos.x) * 0.4;

    // 마우스 반발력
    let d = dist(mouseX, mouseY, n.pos.x, n.pos.y);
    if (d < 150) {
      let repel = p5.Vector.sub(n.pos, createVector(mouseX, mouseY));
      repel.setMag(0.5);
      n.pos.add(repel);
    }

    // 노드 그리기
    fill(240, 200, 30);
    noStroke();
    circle(n.pos.x, n.pos.y, 6);
  }

  // 노드 간 연결
  stroke(120, 90);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let d = dist(
        nodes[i].pos.x,
        nodes[i].pos.y,
        nodes[j].pos.x,
        nodes[j].pos.y
      );
      if (d < 100) {
        line(nodes[i].pos.x, nodes[i].pos.y, nodes[j].pos.x, nodes[j].pos.y);
      }
    }
  }
}
