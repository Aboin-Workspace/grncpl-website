#version 300 es
precision highp float;
in float vAlpha;
in float vPlume;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(vPlume > 0.5 ? 0.12 : 0.3, 0.5, d)) * vAlpha;
  if (a < 0.003) discard;
  vec3 c = vPlume > 0.5 ? vec3(0.62, 0.53, 0.42) : vec3(0.30, 0.25, 0.20);
  o = vec4(c * a, a);
}
