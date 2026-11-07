#version 300 es
precision highp float;
uniform vec3 uSun;
uniform vec3 uFog;
uniform float uFogDensity;
uniform vec3 uCam;
uniform vec3 uColor;
uniform float uAmbient;
in vec3 vWorld;
out vec4 fragColor;
void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  float diff = max(dot(n, normalize(uSun)), 0.0);
  float hemi = 0.5 + 0.5 * n.y;
  vec3 col = uColor * (uAmbient * (0.6 + 0.4 * hemi) + diff * 0.9);
  float dist = length(vWorld - uCam);
  float fog = 1.0 - exp(-dist * dist * uFogDensity);
  fragColor = vec4(mix(col, uFog, clamp(fog, 0.0, 0.92)), 1.0);
}
