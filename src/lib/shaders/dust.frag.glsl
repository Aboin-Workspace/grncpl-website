#version 300 es
precision highp float;
uniform float uAlpha;
in float vFade;
out vec4 fragColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = (1.0 - smoothstep(0.2, 0.5, length(c))) * uAlpha * vFade;
  fragColor = vec4(vec3(0.95, 0.90, 0.80) * a, a);
}
