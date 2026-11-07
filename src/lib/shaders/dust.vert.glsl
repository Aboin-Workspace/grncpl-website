#version 300 es
precision highp float;
in vec3 position;
in float seed;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSize;
out float vFade;
void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.25 + seed * 6.28) * 0.03;
  p.x += sin(uTime * 0.17 + seed * 9.1) * 0.02;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = length(mv.xyz);
  vFade = clamp(1.0 - d / 2.6, 0.0, 1.0) * (0.5 + 0.5 * sin(uTime * 0.8 + seed * 12.0));
  gl_PointSize = uSize * (0.6 + seed) / max(d, 0.2);
  gl_Position = projectionMatrix * mv;
}
