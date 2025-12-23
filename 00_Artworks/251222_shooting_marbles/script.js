// 게임 설정 상수
const CONFIG = {
  PLAYER: {
    SIZE: 100,
    MAX_SPEED: 8,
    Y_RATIO: 7 / 8,
  },
  BULLET: {
    INITIAL_SIZE: 30,
    INITIAL_ALPHA: 100,
    MIN_SIZE: 2,
    MIN_ALPHA: 15,
    LERP_SPEED: 0.05,
    TARGET_X_RATIO: 0.5,
    TARGET_Y_RATIO: 0.25,
  },
  ENEMY: {
    INITIAL_SIZE_MIN: 10,
    INITIAL_SIZE_MAX: 15,
    MAX_SIZE_MIN: 30,
    MAX_SIZE_MAX: 40,
    INITIAL_ALPHA: 100,
    MAX_ALPHA: 255,
    SIZE_LERP: 0.02,
    ALPHA_LERP: 0.03,
    POSITION_LERP: 0.01,
    BOTTOM_THRESHOLD: 10,
    MIN_X: 50,
  },
  PARTICLE: {
    COUNT_MIN: 30,
    COUNT_MAX: 51,
    SIZE_MIN: 3,
    SIZE_MAX: 8,
    SPEED_MIN: 2,
    SPEED_MAX: 8,
    ALPHA_DECAY: 4,
    GRAVITY: 0.1,
  },
  COLLISION: {
    COOLDOWN: 1000,
    ENERGY_LOSS: 10,
  },
  ENERGY: {
    MAX: 100,
    BAR_WIDTH: 300,
    BAR_HEIGHT: 20,
    BAR_Y: 120,
  },
  HUE: {
    MIN: 0,
    MAX: 60,
  },
};

// 게임 상태
let gameState = {
  player: null,
  bullets: [],
  enemies: [],
  particles: [],
  playerSpeed: 0,
  targetSpeed: 0,
  score: 0,
  energy: CONFIG.ENERGY.MAX,
  gameOver: false,
  keys: {},
  lastCollisionTime: 0,
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
  colorMode(HSB, 360, 100, 100, 255);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (gameState.player) {
    gameState.player.y = height * CONFIG.PLAYER.Y_RATIO;
  }
}

function draw() {
  background(15);

  if (gameState.gameOver) {
    displayGameOver();
    return;
  }

  updateGame();
  renderGame();
  displayUI();
}

function initGame() {
  gameState = {
    player: {
      x: width / 2,
      y: height * CONFIG.PLAYER.Y_RATIO,
      size: CONFIG.PLAYER.SIZE,
      maxSpeed: CONFIG.PLAYER.MAX_SPEED,
    },
    bullets: [],
    enemies: [],
    particles: [],
    playerSpeed: 0,
    targetSpeed: 0,
    score: 0,
    energy: CONFIG.ENERGY.MAX,
    gameOver: false,
    keys: {},
    lastCollisionTime: 0,
  };
}

function updateGame() {
  handlePlayerInput();
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateParticles();
  checkPlayerEnemyCollision();
  checkEnergyGameOver();
}

function updatePlayer() {
  const { player } = gameState;
  gameState.playerSpeed = lerp(
    gameState.playerSpeed,
    gameState.targetSpeed,
    0.2
  );
  player.x += gameState.playerSpeed;
  player.x = constrain(player.x, player.size / 2, width - player.size / 2);
}

function updateBullets() {
  const targetX = width * CONFIG.BULLET.TARGET_X_RATIO;
  const targetY = height * CONFIG.BULLET.TARGET_Y_RATIO;

  for (let i = gameState.bullets.length - 1; i >= 0; i--) {
    const b = gameState.bullets[i];

    // 위치 및 속성 업데이트
    b.x = lerp(b.x, targetX, CONFIG.BULLET.LERP_SPEED);
    b.y = lerp(b.y, targetY, CONFIG.BULLET.LERP_SPEED);
    b.size = lerp(b.size, 0, CONFIG.BULLET.LERP_SPEED);
    b.alpha = lerp(b.alpha, 10, CONFIG.BULLET.LERP_SPEED);

    // 총알과 적 충돌 체크
    if (checkBulletEnemyCollision(b, i)) {
      continue; // 충돌 시 다음 총알로
    }

    // 총알 제거 및 적 생성
    if (b.size < CONFIG.BULLET.MIN_SIZE || b.alpha < CONFIG.BULLET.MIN_ALPHA) {
      spawnEnemy(b.x, b.y);
      gameState.bullets.splice(i, 1);
    }
  }
}

function updateEnemies() {
  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const e = gameState.enemies[i];

    // 위치 및 속성 업데이트
    e.x = lerp(e.x, e.targetX, CONFIG.ENEMY.POSITION_LERP);
    e.y = lerp(e.y, height, CONFIG.ENEMY.POSITION_LERP);
    e.size = lerp(e.size, e.maxSize, CONFIG.ENEMY.SIZE_LERP);
    e.alpha = lerp(e.alpha, CONFIG.ENEMY.MAX_ALPHA, CONFIG.ENEMY.ALPHA_LERP);

    // 바닥 충돌 체크 - 게임오버
    if (e.y >= height - CONFIG.ENEMY.BOTTOM_THRESHOLD) {
      gameState.gameOver = true;
      return;
    }
  }
}

function updateParticles() {
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += CONFIG.PARTICLE.GRAVITY;
    p.alpha -= CONFIG.PARTICLE.ALPHA_DECAY;

    if (p.alpha <= 0) {
      gameState.particles.splice(i, 1);
    }
  }
}

function checkBulletEnemyCollision(bullet, bulletIndex) {
  for (let j = gameState.enemies.length - 1; j >= 0; j--) {
    const e = gameState.enemies[j];
    const distance = dist(bullet.x, bullet.y, e.x, e.y);

    if (distance < bullet.size / 2 + e.size / 2) {
      createParticles(bullet.x, bullet.y, e.hue);
      gameState.score++;
      gameState.bullets.splice(bulletIndex, 1);
      gameState.enemies.splice(j, 1);
      return true;
    }
  }
  return false;
}

function checkPlayerEnemyCollision() {
  const { player } = gameState;
  const currentTime = millis();

  // 무적시간 체크
  if (currentTime - gameState.lastCollisionTime < CONFIG.COLLISION.COOLDOWN) {
    return;
  }

  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const e = gameState.enemies[i];
    const distance = dist(player.x, player.y, e.x, e.y);

    if (distance < player.size / 2 + e.size / 2) {
      gameState.energy -= CONFIG.COLLISION.ENERGY_LOSS;
      gameState.lastCollisionTime = currentTime;
      createParticles(player.x, player.y, e.hue);
      gameState.enemies.splice(i, 1);

      // 충돌 피드백
      background(255, 50, 50, 50);
    }
  }
}

function checkEnergyGameOver() {
  if (gameState.energy <= 0) {
    gameState.gameOver = true;
  }
}

function renderGame() {
  renderPlayer();
  renderBullets();
  renderEnemies();
  renderParticles();
  renderInvincibilityEffect();
}

function renderPlayer() {
  const { player } = gameState;
  colorMode(RGB);
  fill(255);
  noStroke();
  circle(player.x, player.y, player.size);
}

function renderBullets() {
  colorMode(RGB);
  gameState.bullets.forEach((b) => {
    fill(255, b.alpha);
    circle(b.x, b.y, b.size);
  });
}

function renderEnemies() {
  colorMode(HSB);
  gameState.enemies.forEach((e) => {
    fill(e.hue, 100, 100, e.alpha);
    circle(e.x, e.y, e.size);
  });
}

function renderParticles() {
  gameState.particles.forEach((p) => {
    if (p.type === "white") {
      colorMode(RGB);
      fill(255, p.alpha);
    } else {
      colorMode(HSB);
      fill(p.hue, 100, 100, p.alpha);
    }
    circle(p.x, p.y, p.size);
  });
}

function renderInvincibilityEffect() {
  const { player } = gameState;
  const timeSinceCollision = millis() - gameState.lastCollisionTime;

  if (timeSinceCollision < CONFIG.COLLISION.COOLDOWN) {
    const pulse = sin(timeSinceCollision * 0.02) * 0.5 + 0.5;

    colorMode(RGB);
    noFill();
    stroke(255, 0, 0, 100 * pulse);
    strokeWeight(5);
    circle(player.x, player.y, player.size + 10);

    // 깜빡임 효과
    const blink = floor(timeSinceCollision / 100) % 2;
    if (blink === 0) {
      fill(255, 150);
      noStroke();
      circle(player.x, player.y, player.size);
    }
  }
}

function displayUI() {
  displayScore();
  displayEnergy();
}

function displayScore() {
  colorMode(RGB);
  fill(255);
  textSize(32);
  textAlign(CENTER);
  text(`Score: ${gameState.score}`, width / 2, 50);
}

function displayEnergy() {
  const { energy } = gameState;
  colorMode(RGB);
  fill(255);
  textSize(32);
  textAlign(CENTER);
  text(`Energy: ${energy}`, width / 2, 90);

  // 에너지 바
  const barX = width / 2 - CONFIG.ENERGY.BAR_WIDTH / 2;
  const energyPercent = energy / CONFIG.ENERGY.MAX;

  // 배경
  fill(50);
  rect(
    barX,
    CONFIG.ENERGY.BAR_Y,
    CONFIG.ENERGY.BAR_WIDTH,
    CONFIG.ENERGY.BAR_HEIGHT,
    5
  );

  // 에너지 바 색상
  let energyColor;
  if (energyPercent > 0.7) {
    energyColor = color(0, 255, 0);
  } else if (energyPercent > 0.3) {
    energyColor = color(255, 255, 0);
  } else {
    energyColor = color(255, 0, 0);
  }

  fill(energyColor);
  rect(
    barX,
    CONFIG.ENERGY.BAR_Y,
    CONFIG.ENERGY.BAR_WIDTH * energyPercent,
    CONFIG.ENERGY.BAR_HEIGHT,
    5
  );
}

function displayGameOver() {
  colorMode(RGB);
  fill(30, 30, 200, 100);
  rect(0, 0, width, height);

  fill(255);
  textSize(64);
  textAlign(CENTER);
  text("GAME OVER", width / 2, height / 2 - 50);

  textSize(32);
  text(`Final Score: ${gameState.score}`, width / 2, height / 2 + 20);

  textSize(24);
  fill(200);
  text("Press R to restart", width / 2, height / 2 + 80);
}

function handlePlayerInput() {
  const { keys } = gameState;
  gameState.targetSpeed = 0;

  if (keys[LEFT_ARROW] || keys[65]) {
    gameState.targetSpeed = -gameState.player.maxSpeed;
  }
  if (keys[RIGHT_ARROW] || keys[68]) {
    gameState.targetSpeed = gameState.player.maxSpeed;
  }

  // 양방향 동시 입력 시 취소
  if ((keys[LEFT_ARROW] || keys[65]) && (keys[RIGHT_ARROW] || keys[68])) {
    gameState.targetSpeed = 0;
  }
}

function keyPressed() {
  if (gameState.gameOver && (key === "r" || key === "R")) {
    initGame();
    return;
  }

  if (gameState.gameOver) return;

  gameState.keys[keyCode] = true;

  if (key === "a" || key === "A") gameState.keys[65] = true;
  if (key === "d" || key === "D") gameState.keys[68] = true;

  if (key === " ") {
    shootBullet();
  }
}

function keyReleased() {
  gameState.keys[keyCode] = false;

  if (key === "a" || key === "A") gameState.keys[65] = false;
  if (key === "d" || key === "D") gameState.keys[68] = false;
}

function shootBullet() {
  const { player } = gameState;
  gameState.bullets.push({
    x: player.x,
    y: player.y,
    size: CONFIG.BULLET.INITIAL_SIZE,
    alpha: CONFIG.BULLET.INITIAL_ALPHA,
  });
}

function spawnEnemy(x, y) {
  const startX = width * CONFIG.BULLET.TARGET_X_RATIO;
  const startY = height * CONFIG.BULLET.TARGET_Y_RATIO;
  const targetX = random(CONFIG.ENEMY.MIN_X, width - CONFIG.ENEMY.MIN_X);
  const hueValue = random(CONFIG.HUE.MIN, CONFIG.HUE.MAX);
  const initialSize = random(
    CONFIG.ENEMY.INITIAL_SIZE_MIN,
    CONFIG.ENEMY.INITIAL_SIZE_MAX
  );
  const maxSize = random(CONFIG.ENEMY.MAX_SIZE_MIN, CONFIG.ENEMY.MAX_SIZE_MAX);

  gameState.enemies.push({
    x: startX,
    y: startY,
    size: initialSize,
    maxSize: maxSize,
    alpha: CONFIG.ENEMY.INITIAL_ALPHA,
    hue: hueValue,
    targetX: targetX,
  });
}

function createParticles(x, y, hue = null) {
  const particleCount = floor(
    random(CONFIG.PARTICLE.COUNT_MIN, CONFIG.PARTICLE.COUNT_MAX)
  );

  for (let i = 0; i < particleCount; i++) {
    const angle = random(TWO_PI);
    const speed = random(CONFIG.PARTICLE.SPEED_MIN, CONFIG.PARTICLE.SPEED_MAX);

    gameState.particles.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(CONFIG.PARTICLE.SIZE_MIN, CONFIG.PARTICLE.SIZE_MAX),
      alpha: 100,
      hue: hue,
      type: hue !== null ? "enemy" : "white",
    });
  }
}
