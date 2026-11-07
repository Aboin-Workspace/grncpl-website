#version 300 es
precision highp float;
uniform vec3 uSun;
uniform vec3 uFog;
uniform float uFogDensity;
uniform vec3 uCam;
uniform vec3 uSurface;
uniform vec3 uBenchCol;
uniform vec3 uRock;
uniform vec3 uDeep;
uniform vec3 uRoadCol;
uniform float uAmbient;
in vec3 vWorld;
in float vDepth;
in float vRoad;
in float vBench;
out vec4 fragColor;

void main() {
  // Flat (low-poly) shading from screen-space derivatives of the world position.
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  float slope = 1.0 - clamp(n.y, 0.0, 1.0);
  // Material: flat benches are earth, batters are rock, the floor darkens toward the seam, the road is packed grey.
  vec3 earth = mix(uSurface, uBenchCol, smoothstep(0.0, 0.3, vDepth) * vBench);
  vec3 col = mix(earth, uRock, smoothstep(0.08, 0.35, slope));
  col = mix(col, uDeep, smoothstep(0.30, 0.42, vDepth) * (1.0 - vRoad) * 0.85);
  col = mix(col, uRoadCol, vRoad);
  // Lighting: sun + hemisphere ambient.
  float diff = max(dot(n, normalize(uSun)), 0.0);
  float hemi = 0.5 + 0.5 * n.y;
  col *= uAmbient * (0.6 + 0.4 * hemi) + diff * 0.9;
  // Depth fog (dust haze) by distance from the camera.
  float dist = length(vWorld - uCam);
  float fog = 1.0 - exp(-dist * dist * uFogDensity);
  col = mix(col, uFog, clamp(fog, 0.0, 0.92));
  fragColor = vec4(col, 1.0);
}
