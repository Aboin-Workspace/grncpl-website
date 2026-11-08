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
in float vRoadD;
in float vF;
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  // Flat (low-poly) shading from screen-space derivatives of the world position.
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  float slope = 1.0 - clamp(n.y, 0.0, 1.0);
  // Material: flat benches are earth, batters are rock, the floor darkens toward the seam, the road is packed grey.
  vec3 earth = mix(uSurface, uBenchCol, smoothstep(0.0, 0.3, vDepth) * vBench);
  vec3 col = mix(earth, uRock, smoothstep(0.08, 0.35, slope));
  col = mix(col, uDeep, smoothstep(0.30, 0.42, vDepth) * (1.0 - vRoad) * 0.85);
  // Geological strata: thin light/dark bands on the rock faces by height.
  float band = sin(vWorld.y * 260.0 + vnoise(vWorld.xz * 14.0) * 2.5);
  float strata = smoothstep(0.08, 0.35, slope) * (0.55 + 0.45 * band);
  col = mix(col, col * (0.78 + 0.34 * strata), smoothstep(0.08, 0.35, slope));
  // Coal seam: a dark band exposed on the batters at one depth, plus thin dark partings.
  float seam = smoothstep(0.235, 0.25, vDepth) * (1.0 - smoothstep(0.29, 0.305, vDepth));
  col = mix(col, vec3(0.08, 0.08, 0.09), seam * smoothstep(0.08, 0.3, slope) * 0.9);
  // Contact-shadow at the toe of each batter (cheap AO).
  float ao = 1.0 - 0.28 * (1.0 - smoothstep(0.0, 0.18, vF)) * step(0.001, vDepth) * (1.0 - vRoad);
  col *= ao;
  // Surface mottling: broken ground, loose spoil, tonal variety.
  float m = vnoise(vWorld.xz * 38.0) * 0.6 + vnoise(vWorld.xz * 140.0) * 0.4;
  col *= 0.86 + 0.28 * m;
  // Haul road: packed grey with two darker tyre tracks and a dusty crown.
  vec3 roadCol = uRoadCol * (0.92 + 0.16 * vnoise(vWorld.xz * 90.0));
  float tracks = exp(-pow((abs(vRoadD) - 0.42) * 9.0, 2.0));
  roadCol *= 1.0 - 0.22 * tracks;
  col = mix(col, roadCol, vRoad);
  // Sump: standing water at the lowest point of the floor.
  float floorR = length(vWorld.xz);
  float pond = (1.0 - smoothstep(0.10, 0.13, floorR)) * step(0.41, vDepth);
  col = mix(col, vec3(0.16, 0.22, 0.24) + 0.08 * vnoise(vWorld.xz * 60.0), pond);
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
