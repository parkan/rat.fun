precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_invert;

// CRT effect parameters
const float SCANLINE_INTENSITY = 0.1;
const float SCANLINE_SPEED = 0.01;
const float CHROMATIC_ABERRATION = 0.0002;
const float CHROMATIC_ABERRATION_SCALED = CHROMATIC_ABERRATION * 100.0;

// Pre-calculated sky colors
const vec3 SKY_COLOR_TOP = vec3(1.0, 0.2, 0.5);
const vec3 SKY_COLOR_BOTTOM = vec3(0.0, 0.0, 0.0);

// Pre-calculated cloud mixing factors
const float CLOUD_SCALE_1 = 1.0;
const float CLOUD_SCALE_2 = 0.7;
const float CLOUD_SCALE_3 = 0.5;

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

// Fractal noise for clouds
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

float crtScanlines(vec2 uv) {
  // Create slowly rolling horizontal scanlines
  float scanline = sin((uv.y + u_time * SCANLINE_SPEED) * u_resolution.y * 0.7) * 0.5 + 0.5;
  return 1.0 - scanline * SCANLINE_INTENSITY;
}

vec3 crtChromaticAberration(vec2 uv, vec3 color) {
  // Apply chromatic aberration by sampling different UV offsets for each color channel
  float aberration = CHROMATIC_ABERRATION_SCALED;
  
  // Calculate center offset once and reuse
  lowp vec2 centerOffset = normalize(uv - 0.5);
  lowp vec2 offsetR = centerOffset * aberration;
  lowp vec2 offsetB = centerOffset * aberration;
  
  // Use UV coordinates directly without curvature
  lowp vec2 uvR = clamp(uv + offsetR, 0.0, 1.0);
  lowp vec2 uvG = uv;
  lowp vec2 uvB = clamp(uv - offsetB, 0.0, 1.0);
  
  // Sample cloud colors at different UV positions for each channel
  vec2 cloudPos1R = uvR * 3.0 + vec2(u_time * 0.2, 0.0);
  vec2 cloudPos2R = uvR * 5.0 + vec2(u_time * 0.1, 0.0);
  vec2 cloudPos3R = uvR * 2.0 + vec2(u_time * 0.35, 0.0);
  
  vec2 cloudPos1G = uvG * 3.0 + vec2(u_time * 0.2, 0.0);
  vec2 cloudPos2G = uvG * 5.0 + vec2(u_time * 0.1, 0.0);
  vec2 cloudPos3G = uvG * 2.0 + vec2(u_time * 0.35, 0.0);
  
  vec2 cloudPos1B = uvB * 3.0 + vec2(u_time * 0.2, 0.0);
  vec2 cloudPos2B = uvB * 5.0 + vec2(u_time * 0.1, 0.0);
  vec2 cloudPos3B = uvB * 2.0 + vec2(u_time * 0.35, 0.0);
  
  float cloud1R = fractalNoise(cloudPos1R);
  float cloud2R = fractalNoise(cloudPos2R);
  float cloud3R = fractalNoise(cloudPos3R);
  float cloudsR = max(cloud1R * CLOUD_SCALE_1, max(cloud2R * CLOUD_SCALE_2, cloud3R * CLOUD_SCALE_3));
  cloudsR = smoothstep(0.4, 0.6, cloudsR);
  
  float cloud1G = fractalNoise(cloudPos1G);
  float cloud2G = fractalNoise(cloudPos2G);
  float cloud3G = fractalNoise(cloudPos3G);
  float cloudsG = max(cloud1G * CLOUD_SCALE_1, max(cloud2G * CLOUD_SCALE_2, cloud3G * CLOUD_SCALE_3));
  cloudsG = smoothstep(0.4, 0.6, cloudsG);
  
  float cloud1B = fractalNoise(cloudPos1B);
  float cloud2B = fractalNoise(cloudPos2B);
  float cloud3B = fractalNoise(cloudPos3B);
  float cloudsB = max(cloud1B * CLOUD_SCALE_1, max(cloud2B * CLOUD_SCALE_2, cloud3B * CLOUD_SCALE_3));
  cloudsB = smoothstep(0.4, 0.6, cloudsB);
  
  // Sample sky colors for each channel using pre-calculated constants
  vec3 skyColorR = mix(SKY_COLOR_TOP, SKY_COLOR_BOTTOM, uvR.y);
  vec3 skyColorG = mix(SKY_COLOR_TOP, SKY_COLOR_BOTTOM, uvG.y);
  vec3 skyColorB = mix(SKY_COLOR_TOP, SKY_COLOR_BOTTOM, uvB.y);
  
  // Mix sky and clouds for each channel
  float r = mix(skyColorR.r, 1.0, cloudsR * 0.9);
  float g = mix(skyColorG.g, 1.0, cloudsG * 0.9);
  float b = mix(skyColorB.b, 1.0, cloudsB * 0.9);
  
  
  return vec3(r, g, b);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  // Apply CRT effects with chromatic aberration (which now handles all the cloud generation)
  vec3 color = crtChromaticAberration(uv, vec3(0.0));
  
  // Apply remaining CRT effects
  color *= crtScanlines(uv);
  
  // Apply inversion if enabled
  if (u_invert) {
    color = vec3(1.0) - color;
  }
  
  gl_FragColor = vec4(color, 1.0);
} 