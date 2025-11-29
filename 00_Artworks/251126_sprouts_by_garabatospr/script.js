// "sprouts" by garabatospr

// color palette

var colors = ["#ff0000", "#feb30f", "#0aa4f7", "#000000", "#ffffff"];

// set weights for each color

// red, blue, and white dominates

var weights = [5, 5, 10, 1, 6, 3];

var weights1 = [1, 1, 1, 1, 6, 3];

var weights2 = [1, 1, 1, 1, 3, 6];

// scale of the vector field
// smaller values => bigger structures
// bigger values  ==> smaller structures

var myScale = 3;

// number of drawing agents

var nAgents = 10000;

var border = -100;

let agent = [];

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(SQUARE);

  background(100);

  for (let i = 0; i < nAgents; i++) {
    agent.push(new Agent());
  }

  randomSeed(1966);
}

function draw() {
  //if (frameCount > 500)
  //{
  //noLoop();
  //translate(width/2,height/2);
  //scale(0.9);
  //}

  push();

  translate(0, 0);

  scale(1);

  //translate(0,0);

  for (let i = 0; i < agent.length; i++) {
    agent[i].update();
  }

  pop();
}

// select random colors with weights from palette

function myRandom(colors, weights) {
  let sum = 0;

  for (let i = 0; i < colors.length; i++) {
    sum += weights[i];
  }

  let rr = random(0, sum);

  for (let j = 0; j < weights.length; j++) {
    if (weights[j] >= rr) {
      return colors[j];
    }
    rr -= weights[j];
  }
}

// paintining agent

class Agent {
  constructor() {
    //this.p     = createVector(1,height*0.50 + randomGaussian()*400);

    this.p = createVector(
      random(border, width - border),
      random(border, height - border)
    );

    this.directionX = 1;
    this.directionY = 1;

    this.pOld = createVector(this.p.x, this.p.y);

    this.step = 5;

    let temp = myRandom(colors, weights);

    this.color = color(
      hue(temp) + randomGaussian() * 10,
      saturation(temp) + randomGaussian() * 10,
      brightness(temp) - 10,
      random(80, 90)
    );

    this.strokeWidth = 5;
  }

  update() {
    this.p.x +=
      this.directionX * vector_field(this.p.x, this.p.y).x * this.step;
    this.p.y +=
      this.directionY * vector_field(this.p.x, this.p.y).y * this.step;

    strokeWeight(this.strokeWidth);
    stroke(this.color);
    line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);

    this.pOld.set(this.p);
  }
}

// vector field function
// the painting agents follow the flow defined
// by this function

function vector_field(x, y) {
  x = map(x, 0, width, 0, myScale);
  y = map(y, 0, height, 0, myScale);

  let k1 = 5;
  let k2 = 3;

  let u = sin(k1 * y) + cos(k2 * x);
  let v = sin(k2 * x) - sin(k1 * x);

  //if (v < 0)
  //{
  //   v = -v;
  //}

  return createVector(u, v);
}

// function to select

function myRandom(colors, weights) {
  let sum = 0;

  for (let i = 0; i < colors.length; i++) {
    sum += weights[i];
  }

  let rr = random(0, sum);

  for (let j = 0; j < weights.length; j++) {
    if (weights[j] >= rr) {
      return colors[j];
    }
    rr -= weights[j];
  }
}
