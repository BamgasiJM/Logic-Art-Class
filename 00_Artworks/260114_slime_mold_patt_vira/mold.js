class Mold {
  constructor() {
    // Mold 객체의 초기 위치: 랜덤한 캔버스 내 좌표
    this.x = random(width);
    this.y = random(height);
    this.r = 0.5; // Mold의 반지름

    // 이동 방향: 랜덤한 각도(0~359도)로 초기화
    this.heading = random(360);
    this.vx = cos(this.heading); // x축 이동 속도 (cos: 각도의 x 성분)
    this.vy = sin(this.heading); // y축 이동 속도 (sin: 각도의 y 성분)
    this.rotAngle = 45;          // 회전 각도 (방향 전환 시 사용)
    this.stop = false;           // 이동 정지 여부

    // 센서 위치 계산용 변수
    this.rSensorPos = createVector(0, 0); // 오른쪽 센서 위치
    this.lSensorPos = createVector(0, 0); // 왼쪽 센서 위치
    this.fSensorPos = createVector(0, 0); // 앞쪽 센서 위치
    this.sensorAngle = 35;                // 센서 각도 (기준 방향에서 ±45도)
    this.sensorDist = 10;                 // 센서 거리 (Mold로부터 10픽셀)
  }

  update() {
    // stop이 true이면 이동 정지
    if (this.stop) {
      this.vx = 0;
      this.vy = 0;
    } else {
      this.vx = cos(this.heading); // 현재 방향의 x 성분
      this.vy = sin(this.heading); // 현재 방향의 y 성분
    }

    // 캔버스 경계를 넘어가면 반대편에서 등장 (% 연산자 사용)
    this.x = (this.x + this.vx + width) % width;
    this.y = (this.y + this.vy + height) % height;

    // 센서 위치 계산 (현재 방향을 기준으로 왼쪽, 오른쪽, 앞쪽 센서 위치)
    this.getSensorPos(this.rSensorPos, this.heading + this.sensorAngle);
    this.getSensorPos(this.lSensorPos, this.heading - this.sensorAngle);
    this.getSensorPos(this.fSensorPos, this.heading);

    // 센서 위치의 픽셀 색상 값 가져오기
    let index, l, r, f;
    index =
      4 * (d * floor(this.rSensorPos.y)) * (d * width) +
      4 * (d * floor(this.rSensorPos.x));
    r = pixels[index]; // 오른쪽 센서 위치의 픽셀 색상 값 (빨강 성분)

    index =
      4 * (d * floor(this.lSensorPos.y)) * (d * width) +
      4 * (d * floor(this.lSensorPos.x));
    l = pixels[index]; // 왼쪽 센서 위치의 픽셀 색상 값 (빨강 성분)

    index =
      4 * (d * floor(this.fSensorPos.y)) * (d * width) +
      4 * (d * floor(this.fSensorPos.x));
    f = pixels[index]; // 앞쪽 센서 위치의 픽셀 색상 값 (빨강 성분)

    // 센서 값에 따른 방향 전환 로직
    if (f > l && f > r) {
      this.heading += 0; // 앞쪽 센서 값이 가장 크면 방향 유지
    } else if (f < l && f < r) {
      // 앞쪽 센서 값이 가장 작으면 랜덤하게 왼쪽 또는 오른쪽으로 회전
      if (random(1) < 0.5) {
        this.heading += this.rotAngle;
      } else {
        this.heading -= this.rotAngle;
      }
    } else if (l > r) {
      this.heading -= this.rotAngle; // 왼쪽 센서 값이 더 크면 오른쪽으로 회전
    } else if (r > l) {
      this.heading += this.rotAngle; // 오른쪽 센서 값이 더 크면 왼쪽으로 회전
    }
  }

  // Mold를 하얀 테두리 없는 원으로 그리기
  display() {
    noStroke(); 
    fill(255);  
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }

  // 센서 위치 계산 함수
  getSensorPos(sensor, angle) {
    sensor.x = (this.x + this.sensorDist * cos(angle) + width) % width;
    sensor.y = (this.y + this.sensorDist * sin(angle) + height) % height;
  }
}
