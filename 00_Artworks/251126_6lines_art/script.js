// setup=_=>createCanvas(w=800,w)
// draw=_=>{
// x=random(-w/8,w+w/8);y=random(-w/8,w+w/8)
// stroke(random(255))
// for(i=0;i<w*2;i++)point(x+=cos(5*y/w*10)+cos(3*y/w*10),y+=sin(3*x/w*10)-cos(5*x/w*10))}


let w = 800;

function setup() {
  createCanvas(w, w);
}

function draw() {
  let x = random(-w / 8, w + w / 8);
  let y = random(-w / 8, w + w / 8);

  stroke(random(255));
  strokeWeight(1);

  for (let i = 0; i < w * 2; i++) {
    x += cos(((5 * y) / w) * 10) + cos(((3 * y) / w) * 10);
    y += sin(((3 * x) / w) * 10) - cos(((5 * x) / w) * 10);

    point(x, y);
  }
}

