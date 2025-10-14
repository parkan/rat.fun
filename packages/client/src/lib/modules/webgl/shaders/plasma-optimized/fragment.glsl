precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_invert;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (uv - 0.5) * 1.0;
  
  float r = length(p);
  float a = atan(p.y, p.x);
  
  // Pre-calculate time values and combine all sin() calls into one
  float combined = r * 30.0 + a * 8.0 + u_time * 3.5;
  float plasma = sin(combined) * 0.5 + 0.5;
  
  vec3 color = vec3(plasma * 1.0, plasma * 0.0, plasma * 0.0);
  
  if (u_invert) {
    color = vec3(1.0) - color;
  }
  
  gl_FragColor = vec4(color, 1.0);
} 