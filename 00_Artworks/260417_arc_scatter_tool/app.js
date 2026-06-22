// ============================================================
// app.js — 애플리케이션 코어
//
// IIFE로 전역 네임스페이스 오염을 방지.
// rAF timestamp 기반 delta로 프레임 시간을 측정하고,
// 최대 100ms로 clamp해 탭 전환 복귀 시 시뮬레이션 폭발을 막음.
// update 루프와 렌더 루프를 분리해 자식 Ball 추가·엔티티 제거를
// 루프 종료 후 일괄 처리함.
// ============================================================

(function () {

  // ── DOM 참조 ─────────────────────────────────────────────
  const canvas        = document.getElementById('canvas');
  const ctx           = canvas.getContext('2d');
  const seedInput     = document.getElementById('seed-input');
  const countInput    = document.getElementById('count-input');
  const paletteSelect = document.getElementById('palette-select');
  const trailInput    = document.getElementById('trail-input');
  const btnRun        = document.getElementById('btn-run');
  const btnSave       = document.getElementById('btn-save');
  const fpsDisplay    = document.getElementById('fps-display');

  const UI_WIDTH = 210; // 우측 패널 너비 (style.css와 동기화)

  // ── 상태 ─────────────────────────────────────────────────
  let entities    = [];
  let scale       = 1;
  let trailAlpha  = 0.03;
  let bgColor     = '#09070a';
  let rafId       = null;
  let lastTime    = null;

  // FPS 계산용
  let fpsFrames   = 0;
  let fpsAccum    = 0;

  // ── 캔버스 리사이즈 ──────────────────────────────────────
  function resize() {
    const availW = window.innerWidth  - UI_WIDTH;
    const availH = window.innerHeight;
    const side   = Math.min(availW, availH);

    scale          = side / 1000;
    canvas.width   = side;
    canvas.height  = side;

    // 리사이즈 후 배경 즉시 채움 (빈 캔버스 노출 방지)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);

  // ── 시뮬레이션 초기화 ────────────────────────────────────
  function init() {
    // 기존 루프 중단
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    const seed    = parseInt(seedInput.value,  10) || 42;
    const count   = parseInt(countInput.value, 10) || 80;
    const palKey  = paletteSelect.value;
    const palette = PALETTES[palKey] || PALETTES.ember;

    trailAlpha = parseFloat(trailInput.value);
    bgColor    = palette.bg;

    resize();

    // 배경 초기화
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 엔티티 초기화: 마스터 PRNG에서 Ball별 서브 시드 파생
    const masterRng = new PRNG(seed);
    entities = [];

    for (let i = 0; i < count; i++) {
      const ballRng = masterRng.fork(i);
      entities.push(new Ball({
        rng:     ballRng,
        palette: palette.colors,
      }));
    }

    lastTime  = null;
    fpsFrames = 0;
    fpsAccum  = 0;

    rafId = requestAnimationFrame(loop);
  }

  // ── 메인 루프 ─────────────────────────────────────────────
  function loop(timestamp) {
    rafId = requestAnimationFrame(loop);

    // ── delta 계산 ───────────────────────────────────────
    // 탭 전환 복귀 등 큰 시간 차이는 100ms로 clamp해 폭발 방지
    if (lastTime === null) lastTime = timestamp;
    const rawDelta = (timestamp - lastTime) / 1000;
    const delta    = Math.min(rawDelta, 0.1);
    lastTime       = timestamp;

    // ── FPS 계산 ─────────────────────────────────────────
    fpsAccum += delta;
    fpsFrames++;
    if (fpsAccum >= 0.5) {
      fpsDisplay.textContent = Math.round(fpsFrames / fpsAccum) + ' FPS';
      fpsAccum  = 0;
      fpsFrames = 0;
    }

    // ── 트레일: 반투명 배경으로 덮어 잔상 생성 ────────────
    ctx.fillStyle = hexToRgba(bgColor, trailAlpha);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── update → 자식 수집 → 렌더 ────────────────────────
    const toAdd = [];

    for (let i = 0; i < entities.length; i++) {
      entities[i].update(delta);

      // 분열로 생성된 자식을 별도 배열에 모아 루프 후 일괄 추가
      if (entities[i]._children.length > 0) {
        toAdd.push(...entities[i]._children);
        entities[i]._children = [];
      }
    }

    // ── 제거 마킹된 엔티티 일괄 제거 ─────────────────────
    // 루프 중 배열을 직접 변경하면 index가 밀리므로 루프 밖에서 처리
    entities = entities.filter(e => !e._removeFlag);

    // ── 자식 추가 ─────────────────────────────────────────
    entities.push(...toAdd);

    // ── 렌더링 ───────────────────────────────────────────
    for (let i = 0; i < entities.length; i++) {
      entities[i].render(ctx, scale);
    }

    // 전체 소멸 시 루프 종료 (불필요한 RAF 방지)
    if (entities.length === 0) {
      cancelAnimationFrame(rafId);
      rafId = null;
      fpsDisplay.textContent = '— FPS';
    }
  }

  // ── PNG 저장 ──────────────────────────────────────────────
  function savePNG() {
    const link    = document.createElement('a');
    link.download = `scatter_${seedInput.value}_${paletteSelect.value}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  }

  // ── 유틸 ──────────────────────────────────────────────────
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── 이벤트 바인딩 ─────────────────────────────────────────
  btnRun.addEventListener('click', init);
  btnSave.addEventListener('click', savePNG);

  // 초기 실행
  init();

})();
