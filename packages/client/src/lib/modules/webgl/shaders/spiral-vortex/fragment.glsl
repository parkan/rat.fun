precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_invert;

// Color palette function for trippy colors
vec3 palette(float t){
  vec3 a=vec3(.5,.5,.5);
  vec3 b=vec3(.5,.5,.5);
  vec3 c=vec3(1.,1.,1.);
  vec3 d=vec3(.263,.416,.557);
  
  return a+b*cos(6.28318*(c*t+d));
}

void main(){
  // Use UV coordinates directly to avoid seams
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=(uv-.5)*2.;
  
  // Fix aspect ratio to ensure circular vortex
  p.x*=u_resolution.x/u_resolution.y;
  
  float r=length(p);
  float a=atan(p.y,p.x);
  
  // Spiral vortex parameters
  float t=u_time;
  float k=2.;// Spiral tightness
  float spin=.3;// Rotation speed (reduced from 1.0)
  float arms=4.;// Number of spiral arms
  
  // Create spiral effect: rotate angle based on radius and time
  // Use a smoother function to avoid extreme values
  a+=k*log(r+.2)-t*spin;
  
  // Create the spiral pattern using fractional angle
  float pattern=fract(a*arms);
  
  // Generate trippy colors using the palette
  vec3 col=palette(pattern);
  
  // Add some variation based on radius
  col*=.5+.5*sin(r*15.-t*2.);
  
  // Optional inversion
  if(u_invert){
    col=vec3(1.)-col;
  }
  
  gl_FragColor=vec4(col,1.);
}
