precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_invert;

void main() {
    vec2 position = gl_FragCoord.xy / u_resolution;
    
    // Zoom in effect - much more pronounced with acceleration over time
    float zoomFactor = 1.0 + pow(u_time, 1.5) * 0.3; // Accelerating zoom with power curve
    vec2 center = vec2(0.5, 0.5);
    position = center + (position - center) / zoomFactor;

    float cX = position.x - 0.5;
    float cY = position.y - 0.5;

    float newX = log(sqrt(cX*cX + cY*cY));
    float newY = atan(cX, cY);
     
    float PI = 3.14159;
    // Time-based intensity multiplier that peaks at 8 seconds with exponential ramp-up
    float normalizedTime = min(u_time / 8.0, 1.0);
    float intensityMultiplier = pow(normalizedTime, 0.3); // Exponential curve for dramatic ramp-up
    
    float numHorBands = 10.0;
    float numVertBands = 10.0;
    float numDiagBands = 10.0;
    float numArms = 6.0;
    float numLines = 5.0;
    float numRings = 5.0;
    float spiralAngle = PI/3.0;
    
    float color = 0.0;
    
    //Vertical Bands
    //color += cos(numVertBands*cY + u_time * intensityMultiplier);    
    //Horizontal Bands
    color += cos(numHorBands*cX - u_time * intensityMultiplier);    
    //Diagonal Bands
    //color += cos(2.0*numDiagBands*(cX*sin(spiralAngle) + cY*cos(spiralAngle)) + u_time * intensityMultiplier);    
    //Arms
    //color += cos(numLines*newY + u_time * intensityMultiplier);
    //Rings
    color += cos(numRings*newX - u_time * intensityMultiplier);
    //Spirals
    color += cos(2.0*numArms*(newX*sin(spiralAngle) + newY*cos(spiralAngle)) + u_time * intensityMultiplier);
    //overall brightness/color
    //color *= cos(u_time/10.0);
    
    vec3 finalColor = vec3(sin(color + u_time / 3.0 * intensityMultiplier) * 0.75, color, sin(color + u_time / 3.0 * intensityMultiplier) * 0.75);
    
    if (u_invert) {
        finalColor = vec3(1.0) - finalColor;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
