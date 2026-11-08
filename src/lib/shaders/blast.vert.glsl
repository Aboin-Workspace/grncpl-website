#version 300 es
precision highp float;
in vec3 position;   // launch velocity
in vec2 seed;       // x: random 0..1, y: 0 debris / 1 plume
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 uOrigin;
uniform float uT;
uniform float uSize;
out float vAlpha;
out float vPlume;
void main() {
  float t = max(uT - seed.x * 0.25, 0.0);
  vec3 p;
  float size;
  if (seed.y < 0.5) {
    // Debris: ballistic arc, stops at launch height so it does not pass through the ground.
    p = uOrigin + position * t + vec3(0.0, -0.42 * t * t, 0.0);
    p.y = max(p.y, uOrigin.y);
    vAlpha = 1.0 - smoothstep(1.4, 2.2, t);
    size = 0.14 + seed.x * 0.2;
  } else {
    // Plume: billows up and out, slows, thins.
    float g = 1.0 - exp(-t * 0.9);
    p = uOrigin + position * g * 1.5;
    vAlpha = smoothstep(0.0, 0.35, t) * (1.0 - smoothstep(3.0, 8.0, t)) * 0.5;
    size = (5.0 + seed.x * 7.0) * (0.45 + g);
  }
  vPlume = seed.y;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * size / max(length(mv.xyz), 0.15);
  gl_Position = projectionMatrix * mv;
}
