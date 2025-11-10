function setup() {
  createCanvas(800, 400);
  background(25);
  noFill(); 
  stroke(10, 180, 170); 
  strokeWeight(5);
}

function draw() {
  // 가로선을 그리는 반복문
  for (let y = 20; y < height - 20; y += 40) {
    // 세로선을 그리는 반복문 (가로선 안에 있음)
    for (let x = 20; x < width - 20; x += 40) {
      rect(x, y, 20, 20); // (x, y) 위치에 30x30 크기의 사각형 그리기
    }
  }
}
