


int num = 92; // how many rows and columns
float s = 0.7; // size of the dots
float reflex = 0.7; // how fast ir reacts when clicked. Range: [0, 1[
float aperture = 10; // how much it blurs

color bg = color(42); // background
color fg1 = color(99, 215, 236);// foreground
color fg2 = color(126, 197, 232);



void setup() {
  //size(800, 800); 


  fullScreen();
  noStroke();
  frameRate(30);

  aa = new float[18];
  bb = new float[aa.length];
  reset();
}

void mouseClicked() {
  reset();
}


float t = 0; // keeps the time

float[] aa; 
float[] bb;
float transition = 0;




void reset() {
  for (int i = 0; i<bb.length; i++) {
    float v = random(1, 8);
    bb[i] = aa[i];
    aa[i] = random(2)<1?v:-v;
  }
  transition = 1;
}
void draw() {
  t+=0.0008; // enables time traveling

  background(bg);

  transition*=(1-reflex);


  for (float v = 0; v<num; v++) {
    for (float u = 0; u<num; u++) {
      float h = 42
        *sin((aa[0]*u-aa[1]*v)/num+4.2*aa[4]*t+aa[6])
        *cos((aa[2]*v+aa[3]*u )/num+aa[5]*t+aa[7]);

      float h2 = 42
        *sin((bb[0]*u-bb[1]*v)/num+4.2*bb[4]*t+bb[6])
        *cos((bb[2]*v+bb[3]*u )/num+bb[5]*t+bb[7]);
      h = lerp(h, h2, transition);

      float u1 = u/num*2-1;
      float v1 = v/num*2-1;

      float u2 = cos(t)*u1 + sin(t)*v1;
      float v2 = sin(t)*u1 - cos(t)*v1; 

      float u3 = u2/2+0.5;
      float v3 = v2/2+0.5;

      float x = u3*min(width, height);
      float y = v3*min(width, height);

      float a = x-y;
      float b = x+y;

      pushMatrix();
      translate(0, 0);
      translate(width/2, 0);
      float dist = 1.5-b/2/height-h/300;
      scale(atan(1/dist)*10);  // a little math
      translate(-width/2, -height/2.2);

      float blur = (1-dist)*aperture;
      fill(lerpColor(fg1, fg2, constrain(map(blur, -aperture/2, aperture/2, 0, 1), 0, 1)), // blend the colors
        min(s*255/max(sq(blur/2), 1), 128)); // add transparency

      translate(0, -h); // creates the waves
      ellipse(a/4+width/2, b/42+height/2, max(abs(blur), s), max(abs(blur), s));
      popMatrix();
    }
  }
}