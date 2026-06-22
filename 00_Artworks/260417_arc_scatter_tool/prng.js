// ============================================================
// prng.js — Park-Miller LCG (선형 합동 생성기)
//
// Multiplier 16807(7^5), Modulus 2^31-1(메르센 소수) 조합은
// full-period를 보장하며 동일 seed에서 항상 같은 수열을 생성.
// fork()로 파생 시드를 만들면 각 Ball이 독립적인 수열을 가져
// 서로의 상태에 영향을 주지 않음.
// ============================================================

const PRNG_MOD  = 2147483647; // 2^31 - 1 (메르센 소수)
const PRNG_MUL  = 16807;      // 7^5, full-period multiplier

class PRNG {
  constructor(seed) {
    this.seed = seed % PRNG_MOD;
    if (this.seed <= 0) this.seed += PRNG_MOD - 1;
  }

  // 내부 상태를 한 스텝 전진
  _next() {
    this.seed = (this.seed * PRNG_MUL) % PRNG_MOD;
  }

  // (0, 1) 균등 분포
  double() {
    this._next();
    return this.seed / PRNG_MOD;
  }

  // (min, max) 균등 분포
  range(min, max) {
    return min + this.double() * (max - min);
  }

  // 정수 (min, max)
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // 팔레트 배열에서 색상 하나 선택
  pickColor(palette) {
    return palette[this.int(0, palette.length - 1)];
  }

  // 현재 seed와 offset을 XOR 혼합해 파생 seed를 만들고 새 PRNG 반환.
  // 2654435761은 Knuth 곱셈 해시 상수 (골든 레이시오 기반).
  fork(offset = 0) {
    const derived = ((this.seed ^ (offset * 2654435761)) >>> 0) % PRNG_MOD || 1;
    return new PRNG(derived);
  }
}
