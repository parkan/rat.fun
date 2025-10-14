precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// Simple hash function for noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Smooth interpolation
float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal noise
float fractalNoise(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for(int i = 0; i < 4; i++) {
    value += amplitude * smoothNoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

// Create swirl effect
vec2 swirl(vec2 p, float strength) {
  float angle = length(p) * strength;
  float c = cos(angle);
  float s = sin(angle);
  mat2 rotation = mat2(c, -s, s, c);
  return rotation * p;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  // Center the coordinates
  vec2 p = (uv - 0.5) * 2.0;
  
  // Add gentle time-based movement
  p += vec2(sin(u_time * 0.3) * 0.1, cos(u_time * 0.2) * 0.1);
  
  // Create gentle swirl effect
  p = swirl(p, 2.0 + sin(u_time * 0.1) * 0.5);
  
  // Scale for noise
  p *= 3.0;
  
  // Generate noise
  float noise = fractalNoise(p);
  
  // Create subtle variations
  noise = pow(noise, 1.5);
  
  // Dark grey color (almost black on black background)
  vec3 darkGrey = vec3(0.45, 0.35, 0.45);
  vec3 black = vec3(0.0, 0.0, 0.0);
  
  // Mix between dark grey and black based on noise
  vec3 color = mix(black, darkGrey, noise * 0.8);
  
  gl_FragColor = vec4(color, 1.0);
}
