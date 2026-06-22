// ============================================================
// ball.js — 파티클 엔티티
//
// 모든 속성은 생성자에서 한 번만 결정되므로 update()는
// 순수한 물리 시뮬레이션만 수행함.
// angularVelocity를 생성 시 고정해 곡선 궤적을 만들고,
// 벽 충돌 시 반사각 기반으로 자식을 분열 생성함.
// depth가 MAX_DEPTH에 도달하면 alpha·radius를 줄이며 소멸.
// ============================================================

class Ball {
  // ── 생성자: 모든 속성을 생성 시점에 결정 ───────────────
  constructor(options = {}) {
    const rng = options.rng || new PRNG(Date.now());

    this.rng      = rng;
    this.depth    = options.depth    ?? 0;
    this.color    = options.color    ?? rng.pickColor(options.palette || ['#ffffff']);
    this.radius   = options.radius   ?? rng.range(2, 5);

    // 좌표는 radius 안쪽에서 생성 (즉시 벽 충돌 방지)
    this.x = options.x ?? rng.range(this.radius, 1000 - this.radius);
    this.y = options.y ?? rng.range(this.radius, 1000 - this.radius);

    // 이동 속도와 방향
    this.speed = options.speed ?? rng.range(80, 280);
    this.angle = options.angle ?? rng.range(0, Math.PI * 2);

    // 고정 각속도: 직선이 아닌 곡선 궤적을 만듦
    this.angularVelocity = rng.range(-1.8, 1.8);

    // 팔레트 참조 (자식 분열 시 사용)
    this.palette = options.palette || ['#ffffff'];

    // 소멸 상태
    this.alpha   = 1.0;
    this.dying   = false;
    this.dead    = false;

    // 앱에 등록할 자식 목록 (분열 결과)
    this._children = [];
    this._removeFlag = false;
  }

  // ── 매 프레임 업데이트 ──────────────────────────────────
  update(delta) {
    if (this.dead) return;

    // 소멸 페이드 아웃
    if (this.dying) {
      this.alpha -= delta * 3.5;
      this.radius = Math.max(0, this.radius - delta * 4);
      if (this.alpha <= 0) {
        this.dead = true;
        this._removeFlag = true;
      }
      return;
    }

    // 고정 각속도로 방향을 점진적으로 변화시켜 곡선 궤적 생성
    this.angle += this.angularVelocity * delta;

    // 속도가 radius를 초과하지 않도록 clamp (터널링 방지)
    const speed = Math.min(this.speed * delta, this.radius * 0.9);

    this.x += Math.cos(this.angle) * speed;
    this.y += Math.sin(this.angle) * speed;

    // ── 벽 충돌 감지 ─────────────────────────────────────
    const hitLeft   = this.x - this.radius <= 0;
    const hitRight  = this.x + this.radius >= 1000;
    const hitTop    = this.y - this.radius <= 0;
    const hitBottom = this.y + this.radius >= 1000;

    const hitH = hitLeft || hitRight;
    const hitV = hitTop  || hitBottom;

    // 위치 보정 (경계 밖으로 벗어나지 않도록)
    if (hitLeft)   this.x = this.radius;
    if (hitRight)  this.x = 1000 - this.radius;
    if (hitTop)    this.y = this.radius;
    if (hitBottom) this.y = 1000 - this.radius;

    if (hitH || hitV) {
      this._onWallHit(hitH, hitV);
    }
  }

  // ── 벽 충돌 처리: 분열 or 소멸 ────────────────────────
  _onWallHit(hitH, hitV) {
    const MAX_DEPTH = 3;

    if (this.depth >= MAX_DEPTH) {
      // 최대 깊이에서는 소멸 페이드
      this.dying = true;
      return;
    }

    // 반사각 계산
    let reflectedAngle = this.angle;
    if (hitH && hitV) {
      // 코너: 완전 반전
      reflectedAngle = this.angle + Math.PI;
    } else if (hitH) {
      reflectedAngle = Math.PI - this.angle;
    } else {
      reflectedAngle = -this.angle;
    }

    // 자식 수: depth가 깊을수록 줄어듦 (2→2, 1→3, 0→4)
    const childCount = Math.max(2, 4 - this.depth);

    for (let i = 0; i < childCount; i++) {
      // 자식마다 반사각에 대칭 편차를 부여해 자연스러운 산란 구현
      // 고정 공식이므로 rng 호출 없이 재현성 유지
      const spread = (i - (childCount - 1) / 2) * 0.35;

      this._children.push(new Ball({
        rng:    this.rng.fork(i),
        x:      this.x,
        y:      this.y,
        color:  this.color,
        speed:  this.speed * 0.82,
        angle:  reflectedAngle + spread,
        radius: this.radius * 0.78,
        depth:  this.depth + 1,
        palette: this.palette,
        angularVelocity: this.angularVelocity * -0.7,
      }));
    }

    this._removeFlag = true;
  }

  // ── Canvas 2D 렌더링 ────────────────────────────────────
  render(ctx, scale) {
    if (this.dead) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);

    // 글로우 효과: 큰 반투명 원을 먼저 그림
    const glow = this.radius * 2.8;
    const gradient = ctx.createRadialGradient(
      this.x * scale, this.y * scale, 0,
      this.x * scale, this.y * scale, glow * scale,
    );
    gradient.addColorStop(0,   this._hexToRgba(this.color, 0.25));
    gradient.addColorStop(1,   this._hexToRgba(this.color, 0));

    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, glow * scale, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 본체
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }

  // ── 유틸: hex 색상을 rgba로 변환 ───────────────────────
  _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
