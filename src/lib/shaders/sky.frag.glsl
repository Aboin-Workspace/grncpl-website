#version 300 es
precision highp float;
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform float uHaze;
uniform vec2 uSunScreen;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float t = smoothstep(0.35, 1.0, vUv.y);
  vec3 col = mix(uHorizon, uTop, t);
  float g = exp(-length((vUv - uSunScreen) * vec2(1.6, 1.0)) * 3.2);
  col += vec3(0.30, 0.24, 0.14) * g * uHaze;
  fragColor = vec4(col, 1.0);
}
