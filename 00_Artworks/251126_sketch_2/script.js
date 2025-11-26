let colors = ["#226699", "#dd2e44", "#ffcc4d", "#FFFFFF"];
let mySeed;
let nonStop = true;
let ringCache = {};

function setup() {
	// createCanvas(1000, 1000);
	createCanvas(windowWidth,windowWidth);

	rectMode(CENTER);
	ellipseMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	mySeed = floor(random(1, 1000000));
}

function draw() {
	randomSeed(mySeed);
	fill(30);
	square(width / 2, height / 2, width);

	let mySize = width * 0.45;

	if (!nonStop) {
		noLoop();
	}
	let xx = width / 2;
	let yy = height / 2;
	
	{
		push();
		translate(xx, yy);
		fill(90);
	   circle(0,0,mySize*1.75);
		noFill();
		strokeWeight(10);
		ring(0,0,mySize/2,mySize/3.4)
		let signo = random([-1, 1]);
		rotate(signo * 0.01 * frameCount)
		for (i = 2; i < 4.5; i += 0.50) {
			drawCircles(-mySize/1.72, 0, mySize / i, random(0.02, 0.01));
			drawCircles(mySize/1.72, 0, mySize / i, random(0.02, 0.01));
			drawCircles(0,-mySize/1.72, mySize / i, random(0.02, 0.01));
			drawCircles(0,mySize/1.72, mySize / i, random(0.02, 0.01));
			drawCircles(0, 0, mySize / i, random(0.02, 0.015));
		}
		noFill();
		pop();
	}

}

function drawCircles(x, y, mySize, freq) {
	noStroke();
	let dir = random([-1, 1]);
	let rphase = random(0, 2 * PI);
	let col1 = color(generateColor());
	fill(col1);
	let temp;
	let d = 1;
	if (d < 10) {
		temp = frameCount;
	} else {
		temp = 1;
	}
	let xx = x + mySize / 2 * cos(dir * freq * temp + rphase);
	let yy = y + mySize / 2 * sin(dir * freq * temp + rphase);
	stroke(0);
	strokeWeight(1);
	line(x, y, xx, yy);
	ring(x, y, mySize / 6, mySize / 12);
   ring(xx, yy, mySize / 12, mySize / 24);
	ring(xx, yy, mySize / 24, mySize / 75)
}

function addBlur() {
	drawingContext.shadowOffsetX = -2;
	drawingContext.shadowOffsetY = -2;
	drawingContext.shadowBlur = 5;
	drawingContext.shadowColor = 'black';
}

function generateColor() {
	let myColor = color(random(colors));
	//myColor.setAlpha(random(0,100));
	return myColor;
}

function mousePressed() {
	// toggle
	nonStop = !nonStop;
	if (!nonStop) {
		noLoop();
	} else {
		loop();
	}
}

function ring(x, y, rOuter, rInner, detail = 60) {

	let col = generateColor();

	let key = `${rOuter}-${rInner}-${detail}-${col}`;

	if (!ringCache[key]) {
		let size = rOuter * 2 + 4; // un poco de margen
		let pg = createGraphics(size, size);

		pg.fill(col);
		pg.translate(size / 2, size / 2);

		pg.circle(0, 0, rInner / 2);

		pg.beginShape();
		for (let i = 0; i < detail; i++) {
			let a = (TWO_PI * i) / detail;
			pg.vertex(rOuter * cos(a), rOuter * sin(a));
		}

		pg.beginContour();
		for (let i = detail; i >= 0; i--) {
			let a = (TWO_PI * i) / detail;
			pg.vertex(rInner * cos(a), rInner * sin(a));
		}
		pg.endContour();
		pg.endShape(CLOSE);

		ringCache[key] = pg; 
	}

	push();
	imageMode(CENTER);
	image(ringCache[key], x, y);
	pop();
}

