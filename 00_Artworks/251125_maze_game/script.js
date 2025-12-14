// p5.js 전용 스크립트 (자바스크립트만)
// 미로 영역 고정: 1080 x 1080, 점수는 좌우, 트레일은 칸 중앙의 작은 원

const GRID_SIZE = 16;
const MAZE_PIXEL = 1200; // 미로 영역을 1080x1080으로 고정
const CELL_SIZE = MAZE_PIXEL / GRID_SIZE;
const WALL_THICKNESS = 6;

const SCORE_WIDTH = 150;
const CANVAS_WIDTH = SCORE_WIDTH * 2 + MAZE_PIXEL;
const CANVAS_HEIGHT = MAZE_PIXEL;

const TIMER_CENTER_X = Math.floor(GRID_SIZE / 2);
const TIMER_CENTER_Y = Math.floor(GRID_SIZE / 2);

let wallsH, wallsV;
let player1, player2;
let trailsP1 = new Set();
let trailsP2 = new Set();
let scoreP1 = 0,
  scoreP2 = 0;

let timeLeft = 60;
let gameActive = false;
let gameStarted = false;
let gameOver = false;
let timerId = null;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  textFont("Helvetica");
  resetGame();
}

function resetGame() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  timeLeft = 45;
  scoreP1 = 0;
  scoreP2 = 0;
  trailsP1.clear();
  trailsP2.clear();
  gameActive = true;
  gameOver = false;

  generateMaze();

  player1 = { x: 0, y: 0, color: color(255, 0, 0, 150) };
  player2 = {
    x: GRID_SIZE - 1,
    y: GRID_SIZE - 1,
    color: color(0, 255, 0, 150),
  };

  trailsP1.add(`${player1.x},${player1.y}`);
  trailsP2.add(`${player2.x},${player2.y}`);
}

function generateMaze() {
  // wallsH: horizontal walls. size (GRID_SIZE+1) x GRID_SIZE
  wallsH = Array.from({ length: GRID_SIZE + 1 }, () =>
    Array.from({ length: GRID_SIZE }, () => true)
  );
  // wallsV: vertical walls. size GRID_SIZE x (GRID_SIZE+1)
  wallsV = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE + 1 }, () => true)
  );

  // ensure outer borders true (already true, but keep explicit)
  for (let x = 0; x < GRID_SIZE; x++) {
    wallsH[0][x] = true;
    wallsH[GRID_SIZE][x] = true;
  }
  for (let y = 0; y < GRID_SIZE; y++) {
    wallsV[y][0] = true;
    wallsV[y][GRID_SIZE] = true;
  }

  // Prim-like random maze generation
  const visited = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => false)
  );
  const walls = [];

  function addWalls(cx, cy) {
    if (cy > 0 && !visited[cy - 1][cx]) walls.push([cx, cy - 1, "S"]);
    if (cy < GRID_SIZE - 1 && !visited[cy + 1][cx])
      walls.push([cx, cy + 1, "N"]);
    if (cx > 0 && !visited[cy][cx - 1]) walls.push([cx - 1, cy, "E"]);
    if (cx < GRID_SIZE - 1 && !visited[cy][cx + 1])
      walls.push([cx + 1, cy, "W"]);
  }

  visited[0][0] = true;
  addWalls(0, 0);

  while (walls.length > 0) {
    const idx = floor(random(walls.length));
    const [wx, wy, dir] = walls.splice(idx, 1)[0];
    if (visited[wy][wx]) continue;
    visited[wy][wx] = true;

    if (dir === "N") {
      // remove wall between (wx,wy) and (wx,wy-1)
      wallsH[wy][wx] = false;
    } else if (dir === "S") {
      wallsH[wy + 1][wx] = false;
    } else if (dir === "W") {
      wallsV[wy][wx] = false;
    } else if (dir === "E") {
      wallsV[wy][wx + 1] = false;
    }

    addWalls(wx, wy);
  }

  // 중앙 타이머 영역 주변(4x4) 벽 제거 — 범위 체크 철저히
  for (let yy = TIMER_CENTER_Y - 1; yy <= TIMER_CENTER_Y + 2; yy++) {
    for (let xx = TIMER_CENTER_X - 1; xx <= TIMER_CENTER_X + 2; xx++) {
      if (yy >= 0 && yy <= GRID_SIZE && xx >= 0 && xx < GRID_SIZE) {
        wallsH[yy][xx] = false;
      }
      if (yy >= 0 && yy < GRID_SIZE && xx >= 0 && xx <= GRID_SIZE) {
        wallsV[yy][xx] = false;
      }
    }
  }
}

function draw() {
  background("#1a1a1a");

  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  drawScores();

  push();
  translate(SCORE_WIDTH, 0);

  // 미로 영역 배경 (선택적)
  noStroke();
  fill(24);
  rect(0, 0, MAZE_PIXEL, MAZE_PIXEL);

  drawTrails();
  drawMaze();
  drawPlayers();
  drawTimer();

  pop();
}

function drawStartScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("Press SPACE to start", width / 2, height / 2);
}

function drawScores() {
  // 왼쪽 P1
  textAlign(LEFT, TOP);
  fill(player1.color);
  textSize(36);
  text("P1", 20, 30);
  textSize(64);
  fill(player1.color);
  text(scoreP1, 20, 70);

  // 오른쪽 P2
  textAlign(RIGHT, TOP);
  fill(player2.color);
  textSize(36);
  text("P2", width - 20, 30);
  textSize(64);
  fill(player2.color);
  text(scoreP2, width - 20, 70);
}

function drawTrails() {
  noStroke();
  const r = CELL_SIZE * 0.25; // 트레일 반지름 (칸 크기에 비례)
  for (let s of trailsP1) {
    const [x, y] = s.split(",").map(Number);
    fill(255, 0, 0, 50);
    const cx = x * CELL_SIZE + CELL_SIZE / 2;
    const cy = y * CELL_SIZE + CELL_SIZE / 2;
    circle(cx, cy, r);
  }
  for (let s of trailsP2) {
    const [x, y] = s.split(",").map(Number);
    fill(0, 255, 0, 50);
    const cx = x * CELL_SIZE + CELL_SIZE / 2;
    const cy = y * CELL_SIZE + CELL_SIZE / 2;
    circle(cx, cy, r);
  }
}

function drawMaze() {
  stroke(255);
  strokeWeight(WALL_THICKNESS);
  strokeJoin(ROUND);
  noFill();

  // horizontal walls
  for (let y = 0; y <= GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (wallsH[y][x]) {
        const x1 = x * CELL_SIZE;
        const y1 = y * CELL_SIZE;
        const x2 = (x + 1) * CELL_SIZE;
        const y2 = y * CELL_SIZE;
        line(x1, y1, x2, y2);
      }
    }
  }

  // vertical walls
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x <= GRID_SIZE; x++) {
      if (wallsV[y][x]) {
        const x1 = x * CELL_SIZE;
        const y1 = y * CELL_SIZE;
        const x2 = x * CELL_SIZE;
        const y2 = (y + 1) * CELL_SIZE;
        line(x1, y1, x2, y2);
      }
    }
  }
}

function drawPlayers() {
  noStroke();
  const pad = max(6, Math.floor(CELL_SIZE * 0.12)); // 플레이어 사각형 패딩
  fill(player1.color);
  rect(
    player1.x * CELL_SIZE + pad,
    player1.y * CELL_SIZE + pad,
    CELL_SIZE - pad * 2,
    CELL_SIZE - pad * 2
  );
  fill(player2.color);
  rect(
    player2.x * CELL_SIZE + pad,
    player2.y * CELL_SIZE + pad,
    CELL_SIZE - pad * 2,
    CELL_SIZE - pad * 2
  );
}

function drawTimer() {
  noStroke();
  fill(255, 255, 255, 230);
  textAlign(CENTER, CENTER);
  textSize(72);
  text(timeLeft, MAZE_PIXEL / 2, MAZE_PIXEL / 2);
}

function movePlayer(player, trails, otherTrails) {
  const key = `${player.x},${player.y}`;
  if (!trails.has(key)) {
    if (otherTrails.has(key)) {
      trails.add(key);
      return 2; // 상대 트레일 점수
    } else {
      trails.add(key);
      return 1; // 일반 점수
    }
  }
  return 0; // 이미 방문한 곳
}

function checkCollision() {
  if (player1.x === player2.x && player1.y === player2.y) {
    scoreP1 = max(0, scoreP1 - 1);
    scoreP2 = max(0, scoreP2 - 1);
  }
}

function drawGameOver() {
  push();
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  text("GAME OVER", width / 2, height / 2 - 150);

  textSize(48);
  if (scoreP1 > scoreP2) {
    fill(255, 50, 50);
    text("Player 1 Wins!", width / 2, height / 2 - 50);
  } else if (scoreP2 > scoreP1) {
    fill(50, 255, 50);
    text("Player 2 Wins!", width / 2, height / 2 - 50);
  } else {
    fill(255);
    text("Draw!", width / 2, height / 2 - 50);
  }

  fill(255);
  textSize(36);
  text(`P1: ${scoreP1}  -  P2: ${scoreP2}`, width / 2, height / 2 + 50);

  textSize(28);
  text("Press SPACE to restart", width / 2, height / 2 + 150);
  pop();
}

function keyPressed() {
  // 스페이스로 시작/재시작
  if (key === " ") {
    if (!gameStarted || gameOver) {
      gameStarted = true;
      resetGame();

      timerId = setInterval(() => {
        if (gameActive && timeLeft > 0) timeLeft--;
        if (timeLeft === 0) {
          gameActive = false;
          gameOver = true;
          clearInterval(timerId);
          timerId = null;
        }
      }, 1000);
    }
    return false;
  }

  if (!gameStarted || !gameActive) return;

  let p1Moved = false;
  let p2Moved = false;

  const k = key.toLowerCase();

  // Player 1 (WASD)
  if (k === "w" && player1.y > 0 && !wallsH[player1.y][player1.x]) {
    player1.y--;
    p1Moved = true;
  } else if (
    k === "s" &&
    player1.y < GRID_SIZE - 1 &&
    !wallsH[player1.y + 1][player1.x]
  ) {
    player1.y++;
    p1Moved = true;
  } else if (k === "a" && player1.x > 0 && !wallsV[player1.y][player1.x]) {
    player1.x--;
    p1Moved = true;
  } else if (
    k === "d" &&
    player1.x < GRID_SIZE - 1 &&
    !wallsV[player1.y][player1.x + 1]
  ) {
    player1.x++;
    p1Moved = true;
  }

  if (p1Moved) {
    scoreP1 += movePlayer(player1, trailsP1, trailsP2);
  }

  // Player 2 (Arrow keys)
  if (keyCode === UP_ARROW && player2.y > 0 && !wallsH[player2.y][player2.x]) {
    player2.y--;
    p2Moved = true;
  } else if (
    keyCode === DOWN_ARROW &&
    player2.y < GRID_SIZE - 1 &&
    !wallsH[player2.y + 1][player2.x]
  ) {
    player2.y++;
    p2Moved = true;
  } else if (
    keyCode === LEFT_ARROW &&
    player2.x > 0 &&
    !wallsV[player2.y][player2.x]
  ) {
    player2.x--;
    p2Moved = true;
  } else if (
    keyCode === RIGHT_ARROW &&
    player2.x < GRID_SIZE - 1 &&
    !wallsV[player2.y][player2.x + 1]
  ) {
    player2.x++;
    p2Moved = true;
  }

  if (p2Moved) {
    scoreP2 += movePlayer(player2, trailsP2, trailsP1);
  }

  if (p1Moved || p2Moved) checkCollision();

  return false; // 브라우저 기본 키동작 차단
}
