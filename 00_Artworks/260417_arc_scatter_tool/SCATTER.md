# SCATTER — 프로젝트 문서

> Vanilla JavaScript + Canvas 2D API로 구현한 시드 기반 제너레이티브 아트

***

## 목차

1. [파일 구조](#1-파일-구조)
2. [실행 흐름](#2-실행-흐름)
3. [파일별 상세 설명](#3-파일별-상세-설명)
   * [index.html](#31-indexhtml)
   * [style.css](#32-stylecss)
   * [prng.js](#33-prngjs)
   * [palettes.js](#34-palettesjs)
   * [ball.js](#35-balljs)
   * [app.js](#36-appjs)
4. [알고리즘 상세](#4-알고리즘-상세)
   * [Park-Miller LCG](#41-park-miller-lcg)
   * [시드 파생 fork](#42-시드-파생-fork)
   * [delta 시간 계산](#43-delta-시간-계산)
   * [물리 시뮬레이션](#44-물리-시뮬레이션)
   * [벽 충돌과 분열](#45-벽-충돌과-분열)
   * [트레일 렌더링](#46-트레일-렌더링)
   * [글로우 렌더링](#47-글로우-렌더링)
5. [데이터 흐름](#5-데이터-흐름)
6. [파라미터 레퍼런스](#6-파라미터-레퍼런스)

***

# 1. 파일 구조

```
scatter/
├── index.html      진입점. DOM 구조 및 스크립트 로드 순서 정의
├── style.css       레이아웃, UI 패널, 캔버스 배치
├── prng.js         의사 난수 생성기 (PRNG 클래스)
├── palettes.js     큐레이션된 색상 팔레트 데이터 (PALETTES 상수)
├── ball.js         파티클 엔티티 (Ball 클래스)
└── app.js          애플리케이션 코어. 루프, 초기화, UI 이벤트 처리
```

스크립트 로드 순서가 의존성을 결정합니다.

```
prng.js → palettes.js → ball.js → app.js
```

`Ball`은 `PRNG`와 `PALETTES`를 사용하고,\
`app.js`는 `Ball`, `PRNG`, `PALETTES`를 모두 사용하므로\
반드시 이 순서로 로드되어야 합니다.

***

# 2. 실행 흐름

```
페이지 로드
  └─ app.js IIFE 즉시 실행
        └─ init()
              ├─ cancelAnimationFrame()  (기존 루프 있으면 중단)
              ├─ resize()               캔버스 크기 결정 + 배경 채움
              ├─ PRNG(seed)             마스터 난수기 생성
              ├─ masterRng.fork(i) × N  Ball별 독립 난수기 파생
              ├─ new Ball({ rng, palette }) × N  엔티티 생성
              └─ requestAnimationFrame(loop)

매 프레임 loop(timestamp)
  ├─ delta 계산  (timestamp 차이, max 100ms clamp)
  ├─ FPS 갱신   (0.5초 누적 평균)
  ├─ 트레일    fillRect(bgColor, trailAlpha)
  ├─ for each entity
  │     ├─ entity.update(delta)
  │     └─ entity._children 수집 → toAdd[]
  ├─ entities.filter(!_removeFlag)   제거 일괄 처리
  ├─ entities.push(...toAdd)         자식 일괄 추가
  ├─ for each entity → entity.render(ctx, scale)
  └─ entities.length === 0 → loop 종료
```

***

# 3. 파일별 상세 설명

## 3.1 index.html

DOM의 두 최상위 요소는 `<canvas>`와 `<div id="ui">`입니다.

| 요소                      | id               | 역할                      |
| ----------------------- | ---------------- | ----------------------- |
| `<canvas>`              | `canvas`         | 아트워크가 렌더링되는 영역          |
| `<div>`                 | `ui`             | 우측 컨트롤 패널 전체            |
| `<input type="number">` | `seed-input`     | 시드값 입력 (1 \~ 999999)    |
| `<input type="number">` | `count-input`    | 초기 파티클 수 입력 (10 \~ 300) |
| `<select>`              | `palette-select` | 팔레트 선택                  |
| `<input type="range">`  | `trail-input`    | 트레일 강도 (0.01 \~ 0.12)   |
| `<button>`              | `btn-run`        | 시뮬레이션 재시작               |
| `<button>`              | `btn-save`       | 현재 캔버스를 PNG로 저장         |
| `<span>`                | `fps-display`    | 현재 FPS 표시               |

***

## 3.2 style.css

캔버스를 `position: fixed` + `transform: translate(-50%, -50%)`로\
좌측 영역 중앙에 배치합니다. UI 패널은 `position: fixed; right: 0`으로\
캔버스와 겹치지 않게 우측에 고정됩니다.

```
┌────────────────────────────┬──────────┐
│                            │  SCATTER │
│                            │  SEED    │
│         <canvas>           │  COUNT   │
│       (정사각형,중앙)         │  PALETTE │
│                            │  TRAIL   │
│                            │  [RUN]   │
└────────────────────────────┴──────────┘
```

폰트는 두 종류를 사용합니다.

* `Bebas Neue` — 타이틀 표시용 디스플레이 서체
* `Share Tech Mono` — 레이블, 입력값, 버튼 등 UI 전반

CSS 변수(`--ui-bg`, `--ui-accent` 등)로 UI 색상 팔레트를 중앙 관리합니다.

***

## 3.3 prng.js

**`PRNG`** **클래스** — 시드 기반 의사 난수 생성기

#### 상수

| 상수         | 값            | 설명                            |
| ---------- | ------------ | ----------------------------- |
| `PRNG_MOD` | `2147483647` | `2³¹ − 1`, 메르센 소수. 모듈러 연산의 기준 |
| `PRNG_MUL` | `16807`      | `7⁵`. Park-Miller 알고리즘의 승수    |

#### 메서드

**`constructor(seed)`**\
seed를 `PRNG_MOD`로 나눈 나머지로 초기화합니다.\
0 이하가 되면 `PRNG_MOD - 1`을 더해 양수를 보장합니다.

**`_next()`**\
내부 상태를 한 스텝 전진시킵니다. 외부에서 직접 호출하지 않습니다.

```
seed = (seed × 16807) mod 2147483647
```

**`double()`**\
`_next()`를 호출한 뒤 `seed / PRNG_MOD`를 반환합니다.\
반환 범위는 `[0, 1)` 균등 분포입니다.

**`range(min, max)`**\
`(min, max)` 범위의 실수를 반환합니다.\
내부적으로 `double()`을 한 번 호출합니다.

**`int(min, max)`**\
`(min, max)` 범위의 정수를 반환합니다.\
`Math.floor(range(min, max + 1))`로 구현됩니다.

**`pickColor(palette)`**\
팔레트 배열에서 인덱스를 무작위로 선택해 색상 문자열을 반환합니다.\
`int(0, palette.length - 1)`을 사용합니다.

**`fork(offset)`**\
현재 seed와 offset을 XOR 혼합해 파생 seed를 만들고 새 PRNG 인스턴스를 반환합니다.

```
derived = (seed XOR (offset × 2654435761)) mod PRNG_MOD
```

`2654435761`은 Knuth 곱셈 해시 상수(골든 레이시오 기반)입니다.\
offset마다 전혀 다른 수열을 생성하므로, 같은 마스터 시드에서\
N개의 독립적인 난수 스트림을 만들 수 있습니다.

***

## 3.4 palettes.js

**`PALETTES`** **상수** — 전역 객체 (키: 팔레트 이름)

각 팔레트는 두 필드로 구성됩니다.

```js
{
  bg:     string,    // 배경색 hex
  colors: string[]   // 파티클 색상 후보 hex 배열
}
```

| 컬러 톤        | 분위기            | 배경        |
| -------- | -------------- | --------- |
| `ember`  | 주황·노랑·빨강 계열 불꽃 | `#09070a` |
| `arctic` | 청록·하늘 계열 차가운 빛 | `#050d12` |
| `neon`   | 마젠타·사이언 사이버펑크  | `#07070f` |
| `mono`   | 흰색·회색 단색       | `#080808` |
| `sakura` | 분홍 계열 벚꽃       | `#0a0608` |

모든 배경색은 거의 검정에 가까운 어두운 값으로 설정되어\
트레일 효과의 잔상이 자연스럽게 녹아들도록 합니다.

***

## 3.5 ball.js

**`Ball`** **클래스** — 파티클 엔티티

#### 생성자 `constructor(options)`

`options` 객체의 필드가 모두 선택적(optional)이며,\
값이 없으면 `rng`로 생성 시점에 결정됩니다.

| 필드                | 타입         | 기본값                              | 설명                |
| ----------------- | ---------- | -------------------------------- | ----------------- |
| `rng`             | `PRNG`     | `new PRNG(Date.now())`           | 이 Ball 전용 난수기     |
| `depth`           | `number`   | `0`                              | 분열 깊이. 0이 최초 파티클  |
| `color`           | `string`   | `rng.pickColor(palette)`         | 파티클 색상 hex        |
| `radius`          | `number`   | `rng.range(2, 5)`                | 반지름 (1000 기준 좌표계) |
| `x`               | `number`   | `rng.range(radius, 1000-radius)` | 초기 X 좌표           |
| `y`               | `number`   | `rng.range(radius, 1000-radius)` | 초기 Y 좌표           |
| `speed`           | `number`   | `rng.range(80, 280)`             | 이동 속도 (단위/초)      |
| `angle`           | `number`   | `rng.range(0, 2π)`               | 초기 이동 방향 (라디안)    |
| `angularVelocity` | `number`   | `rng.range(-1.8, 1.8)`           | 각속도 (라디안/초)       |
| `palette`         | `string[]` | `['#ffffff']`                    | 자식 분열 시 전달할 팔레트   |

내부 상태 필드:

| 필드            | 초기값     | 설명                                  |
| ------------- | ------- | ----------------------------------- |
| `alpha`       | `1.0`   | 현재 불투명도. 소멸 시 감소                    |
| `dying`       | `false` | 소멸 페이드 진행 중 여부                      |
| `dead`        | `false` | 완전 소멸 여부. `true`면 update·render 건너뜀 |
| `_children`   | `[]`    | 이번 프레임에 분열로 생성한 자식 목록               |
| `_removeFlag` | `false` | `true`이면 다음 루프에서 제거됨                |

***

#### `update(delta)`

매 프레임 호출됩니다. `delta`는 초 단위 실제 프레임 시간입니다.

```
dead === true  →  즉시 return

dying === true
  alpha  -= delta × 3.5
  radius -= delta × 4  (최솟값 0)
  alpha <= 0  →  dead = true, _removeFlag = true
  return

angle += angularVelocity × delta          // 방향 변화
speed  = min(this.speed × delta, radius × 0.9)  // 터널링 방지 clamp
x     += cos(angle) × speed
y     += sin(angle) × speed

벽 충돌 감지
  hitLeft   = x - radius <= 0
  hitRight  = x + radius >= 1000
  hitTop    = y - radius <= 0
  hitBottom = y + radius >= 1000

위치 보정 (경계 밖 이탈 방지)

(hitH || hitV) → _onWallHit(hitH, hitV)
```

***

#### `_onWallHit(hitH, hitV)`

벽 충돌 시 호출됩니다.\
`depth >= MAX_DEPTH(3)`이면 `dying = true`로 소멸 페이드를 시작합니다.\
그 외에는 자식 Ball을 생성하고 자신은 `_removeFlag = true`로 마킹합니다.

**반사각 계산:**

| 충돌 상황             | 반사각 공식      |
| ----------------- | ----------- |
| 좌·우 벽 (hitH)      | `π − angle` |
| 상·하 벽 (hitV)      | `−angle`    |
| 코너 (hitH && hitV) | `angle + π` |

**자식 수:**

```
childCount = max(2, 4 - depth)
// depth 0 → 4개, depth 1 → 3개, depth 2 → 2개
```

**산란 편차:**

자식 i번째의 각도는 반사각에 대칭 편차를 더합니다.

```
spread = (i - (childCount - 1) / 2) × 0.35
childAngle = reflectedAngle + spread
```

예: childCount = 3일 때 spread는 `-0.35, 0, +0.35`

자식의 속도와 반지름은 부모에서 감쇄됩니다.

```
child.speed  = parent.speed  × 0.82
child.radius = parent.radius × 0.78
child.angularVelocity = parent.angularVelocity × -0.7  // 회전 방향 반전
```

자식마다 `rng.fork(i)`로 독립된 난수기를 부여합니다.

***

#### `render(ctx, scale)`

`dead === true`이면 즉시 return합니다.

두 단계로 렌더링합니다.

**1단계 — 글로우:**

반지름 `radius × 2.8` 크기의 원에 radial gradient를 그립니다.\
중심은 `rgba(color, 0.25)`, 외곽은 `rgba(color, 0)`으로 설정해\
부드러운 발광 효과를 만듭니다.

**2단계 — 본체:**

반지름 `radius` 크기의 단색 원을 그립니다.\
`ctx.globalAlpha`에 현재 `alpha`를 적용해 소멸 페이드를 표현합니다.

`ctx.save()` / `ctx.restore()`로 globalAlpha 변경이 다른 엔티티에 누출되지 않게 격리합니다.

***

#### `_hexToRgba(hex, alpha)`

`#rrggbb` 형식의 hex 문자열을 `rgba(r, g, b, alpha)` 문자열로 변환합니다.\
`parseInt(hex.slice(1,3), 16)` 방식으로 각 채널을 추출합니다.

***

## 3.6 app.js

IIFE `(function() { ... })()` 로 감싸 전역 네임스페이스를 오염시키지 않습니다.

#### 모듈 수준 변수

| 변수           | 타입               | 설명                            |
| ------------ | ---------------- | ----------------------------- |
| `entities`   | `Ball[]`         | 현재 활성 파티클 배열                  |
| `scale`      | `number`         | `side / 1000`. 좌표계 → 픽셀 변환 비율 |
| `trailAlpha` | `number`         | 트레일 반투명도 (0.01 \~ 0.12)       |
| `bgColor`    | `string`         | 현재 팔레트의 배경 hex                |
| `rafId`      | `number \| null` | `requestAnimationFrame` 핸들    |
| `lastTime`   | `number \| null` | 직전 프레임의 timestamp (ms)        |
| `fpsFrames`  | `number`         | FPS 계산용 프레임 누적 카운터            |
| `fpsAccum`   | `number`         | FPS 계산용 시간 누적 (초)             |

***

#### `resize()`

```
availW = window.innerWidth - UI_WIDTH (210px)
availH = window.innerHeight
side   = min(availW, availH)

scale        = side / 1000
canvas.width = canvas.height = side
```

캔버스는 항상 정사각형으로 유지됩니다.\
`1000` 기준 좌표계를 실제 픽셀로 변환하는 `scale` 값이 여기서 결정됩니다.\
리사이즈 직후 배경색으로 즉시 채워 빈 캔버스가 노출되는 것을 방지합니다.

***

#### `init()`

GENERATE 버튼 클릭 및 페이지 최초 로드 시 호출됩니다.

1. 기존 루프가 실행 중이면 `cancelAnimationFrame`으로 중단합니다.
2. 입력값(seed, count, palette, trailAlpha)을 읽어 상태에 적용합니다.
3. `resize()`로 캔버스를 재설정합니다.
4. 배경색으로 캔버스를 가득 채웁니다.
5. `new PRNG(seed)`로 마스터 난수기를 생성합니다.
6. `masterRng.fork(i)`로 Ball별 독립 난수기를 파생시키고 `Ball`을 생성합니다.
7. `requestAnimationFrame(loop)`으로 루프를 시작합니다.

***

#### `loop(timestamp)`

매 프레임 `requestAnimationFrame`에 의해 호출됩니다.

**처리 순서:**

```
1. delta 계산
   rawDelta = (timestamp - lastTime) / 1000
   delta    = min(rawDelta, 0.1)           // 최대 100ms clamp

2. FPS 계산
   fpsAccum  += delta
   fpsFrames += 1
   fpsAccum >= 0.5 → fps = round(fpsFrames / fpsAccum) 표시 후 리셋

3. 트레일
   fillRect(전체 캔버스, bgColor, trailAlpha)

4. update 루프
   for each entity:
     entity.update(delta)
     entity._children → toAdd[] 수집 후 entity._children = []

5. 엔티티 제거
   entities = entities.filter(e => !e._removeFlag)

6. 자식 추가
   entities.push(...toAdd)

7. 렌더 루프
   for each entity:
     entity.render(ctx, scale)

8. 종료 조건
   entities.length === 0 → cancelAnimationFrame, FPS 초기화
```

update 루프와 render 루프가 분리되어 있습니다.\
update 중 발생한 자식 추가·제거가 같은 루프 안에서 배열을 변경하지 않으므로\
index 밀림 없이 안전하게 순회합니다.

***

#### `savePNG()`

`canvas.toDataURL('image/png')`로 현재 캔버스 내용을 PNG base64로 인코딩하고\
`<a>` 태그의 `download` 속성으로 파일 다운로드를 트리거합니다.

파일명 형식: `scatter_{seed}_{paletteName}.png`

***

#### `hexToRgba(hex, alpha)`

`Ball._hexToRgba`와 동일한 구현입니다.\
트레일 효과에서 `bgColor`에 `trailAlpha`를 적용할 때 사용합니다.

***

# 4. 알고리즘 상세

## 4.1 Park-Miller LCG

선형 합동 생성기(Linear Congruential Generator)의 일종입니다.

```
X(n+1) = (X(n) × a) mod m

a = 16807  (= 7^5)
m = 2147483647  (= 2^31 - 1, 메르센 소수)
```

이 파라미터 조합은 주기가 `m - 1 = 2147483646`임이 수학적으로 증명되어 있습니다.\
즉 seed 1 \~ 2147483646 사이의 모든 값이 한 주기 안에 정확히 한 번씩 등장합니다.\
같은 seed를 사용하면 항상 동일한 수열을 생성하므로 제너레이티브 아트의\
재현 가능성(reproducibility) 요건을 충족합니다.

***

## 4.2 시드 파생 fork

마스터 시드 하나에서 N개의 독립 수열을 만드는 방법입니다.

```
derived = (masterSeed XOR (i × 2654435761)) mod PRNG_MOD
```

`2654435761 = floor(2^32 / φ)` 여기서 φ는 황금 비율(1.6180339...)입니다.\
황금 비율은 무리수이므로 이 상수를 곱하면 offset별로 시드가 고르게 분산됩니다.

이 방식의 장점은 Ball 생성 순서가 바뀌어도 각 Ball의 시드가 변하지 않는다는 것입니다.\
순서에 의존하는 전역 단일 PRNG와 달리, 특정 Ball의 속성은 그 Ball의 index에만 종속됩니다.

***

## 4.3 delta 시간 계산

```
rawDelta = (currentTimestamp - lastTimestamp) / 1000  // 단위: 초
delta    = min(rawDelta, 0.1)
```

`requestAnimationFrame`의 콜백 간격은 모니터 주사율과 시스템 상태에 따라 달라집니다.\
실제 경과 시간을 delta로 측정하면 60Hz와 120Hz 환경에서 동일한 시뮬레이션 속도를 보장합니다.

상한 100ms(0.1초)를 두는 이유는 브라우저 탭이 백그라운드로 전환되었다가 복귀하면\
`requestAnimationFrame`이 오랜 시간 멈춰 있다가 재개되기 때문입니다.\
이 경우 delta가 수 초에 달할 수 있으며, 제한 없이 적용하면 파티클이\
한 프레임에 경계 밖으로 수백 픽셀 이동해 시뮬레이션이 폭발합니다.

***

## 4.4 물리 시뮬레이션

Ball은 매 프레임 `angle` 방향으로 `speed × delta` 만큼 이동합니다.

```
angle += angularVelocity × delta
speed  = min(this.speed × delta, radius × 0.9)
x     += cos(angle) × speed
y     += sin(angle) × speed
```

속도를 `radius × 0.9`로 clamp하는 이유는 터널링(tunneling)을 막기 위해서입니다.\
한 프레임에 이동 거리가 직경보다 커지면 파티클이 벽을 통과해 충돌 감지가\
실패할 수 있습니다. 이동 거리를 반지름 이하로 제한하면 이를 방지합니다.

`angularVelocity`는 생성 시 `[-1.8, 1.8]` 범위에서 결정되며 이후 변경되지 않습니다.\
이 값이 0에 가까울수록 직선에 가깝고, 절댓값이 클수록 강한 원호를 그립니다.

***

## 4.5 벽 충돌과 분열

**충돌 감지**는 파티클 중심 기준이 아니라 표면 기준입니다.

```
hitLeft   = x - radius <= 0
hitRight  = x + radius >= 1000
hitTop    = y - radius <= 0
hitBottom = y + radius >= 1000
```

**위치 보정**은 충돌 감지 직후 경계 안으로 밀어 넣는 방식으로 처리합니다.

```
hitLeft   → x = radius
hitRight  → x = 1000 - radius
hitTop    → y = radius
hitBottom → y = 1000 - radius
```

**분열 구조**는 트리(tree) 형태입니다.

```
depth 0 (초기 파티클)
  └─ 벽 충돌 → depth 1 자식 4개 생성
        └─ 벽 충돌 → depth 2 자식 3개씩 생성
              └─ 벽 충돌 → depth 3 자식 2개씩 생성
                    └─ 벽 충돌 → dying = true (소멸 시작)
```

최대 파티클 수 이론적 상한: `N × (1 + 4 + 12 + 24) = N × 41`\
실제로는 소멸이 동시에 진행되므로 항상 이보다 적습니다.

***

## 4.6 트레일 렌더링

매 프레임 캔버스를 완전히 지우는 대신, 반투명 배경색으로 덮어씌웁니다.

```
ctx.fillStyle = rgba(bgColor, trailAlpha)
ctx.fillRect(0, 0, width, height)
```

`trailAlpha = 0.03`이면 한 픽셀의 밝기가 약 3% 감소합니다.\
완전히 사라지기까지 약 33프레임(≈ 0.55초)이 걸립니다.\
값을 높이면 잔상이 짧아지고, 낮추면 길어집니다.

이 기법을 **motion blur 근사**라고도 부르며, 추가 버퍼 없이\
Canvas 2D API만으로 트레일 효과를 구현하는 표준적인 방법입니다.

***

## 4.7 글로우 렌더링

각 Ball은 두 단계로 그려집니다.

**1단계 — radial gradient 글로우**

```
createRadialGradient(cx, cy, 0, cx, cy, radius × 2.8)
  colorStop(0.0) → rgba(color, 0.25)  // 중심: 반투명
  colorStop(1.0) → rgba(color, 0.00)  // 외곽: 완전 투명
```

글로우 반지름은 본체의 2.8배입니다.\
중심 alpha를 0.25로 낮게 유지해 과도한 bloom을 방지합니다.

**2단계 — 본체 단색 원**

글로우 위에 불투명 단색 원을 겹쳐 중심에 선명한 코어를 만듭니다.\
소멸 중(`dying === true`)에는 `globalAlpha`가 `alpha`로 줄어들어\
글로우와 본체가 동시에 페이드됩니다.

***

# 5. 데이터 흐름

```
[UI 입력]
  seed, count, palette, trailAlpha
       │
       ▼
[init()]
  PRNG(seed)                         ← 마스터 난수기
       │
       ├─ fork(0) → PRNG_0 → Ball_0  ← x, y, speed, angle, angularVelocity, color 결정
       ├─ fork(1) → PRNG_1 → Ball_1
       └─ fork(N) → PRNG_N → Ball_N

[loop(timestamp)]
  ┌─────────────────────────────────────────────┐
  │ delta = (ts - lastTs) / 1000, max 0.1       │
  │                                             │
  │ fillRect(bgColor, trailAlpha)  ← 트레일     │
  │                                             │
  │ for each Ball:                              │
  │   update(delta)                             │
  │     ├─ angle  += angularVelocity × delta    │
  │     ├─ x,y   += cos/sin(angle) × speed     │
  │     └─ 벽 충돌 → _children[] 에 자식 추가  │
  │                                             │
  │ entities = filter(!_removeFlag)             │
  │ entities.push(...toAdd)                     │
  │                                             │
  │ for each Ball:                              │
  │   render(ctx, scale)                        │
  │     ├─ radialGradient (글로우)              │
  │     └─ arc (본체)                          │
  └─────────────────────────────────────────────┘
```

***

# 6. 파라미터 레퍼런스

| 파라미터                   | 위치              | 범위           | 효과                          |
| ---------------------- | --------------- | ------------ | --------------------------- |
| `seed`                 | UI / `init()`   | 1 \~ 999999  | 같은 값이면 항상 동일한 작품            |
| `count`                | UI / `init()`   | 10 \~ 300    | 초기 파티클 수                    |
| `palette`              | UI / `PALETTES` | 5종           | 배경색 및 파티클 색상 범위             |
| `trailAlpha`           | UI / `loop()`   | 0.01 \~ 0.12 | 낮을수록 긴 잔상                   |
| `Ball.speed`           | `ball.js`       | 80 \~ 280    | 이동 속도 (단위/초)                |
| `Ball.angularVelocity` | `ball.js`       | -1.8 \~ 1.8  | 궤적 곡률. 0에 가까울수록 직선          |
| `Ball.radius`          | `ball.js`       | 2 \~ 5       | 초기 반지름 (1000 좌표계)           |
| `MAX_DEPTH`            | `ball.js`       | 고정 3         | 분열 최대 깊이                    |
| `speed 감쇄`             | `ball.js`       | 고정 0.82      | 자식 속도 = 부모 × 0.82           |
| `radius 감쇄`            | `ball.js`       | 고정 0.78      | 자식 반지름 = 부모 × 0.78          |
| `angularVelocity 감쇄`   | `ball.js`       | 고정 -0.7      | 자식 회전 = 부모 × -0.7 (방향 반전)   |
| `spread`               | `ball.js`       | 고정 0.35      | 자식 각도 편차                    |
| `delta 상한`             | `app.js`        | 고정 0.1초      | 탭 전환 복귀 시 폭발 방지             |
| `UI_WIDTH`             | `app.js`        | 고정 210px     | 우측 패널 너비, style.css와 동기화 필요 |
