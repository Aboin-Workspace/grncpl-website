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
uniform vec3 uSunCol;
uniform sampler2D tShadow;
uniform float uTime;
uniform float uFlash;
uniform vec3 uFlashPos;
uniform float uCartTc;
in vec3 vWorld;
in float vDepth;
in float vRoad;
in float vBench;
in float vRoadD;
in float vF;
in vec3 vNormal;
in vec4 vShadow;
in float vTc;
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}


// Sun shadow: 3x3 PCF over the RGBA-packed light depth map.
float unpackRGBA(vec4 v) { return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0)); }
float sunLight(vec4 sc, float bias) {
  vec3 p = sc.xyz / sc.w * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  vec2 texel = 1.0 / vec2(textureSize(tShadow, 0));
  float lit = 0.0;
  for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++)
    lit += p.z - bias > unpackRGBA(texture(tShadow, p.xy + vec2(x, y) * texel)) ? 0.0 : 1.0;
  return lit / 9.0;
}

float rockNoise(vec3 p) {
  return vnoise(p.xz * 70.0 + p.y * 55.0) * 0.55 + vnoise(p.xz * 210.0 - p.y * 160.0) * 0.3 + vnoise(p.xz * 520.0) * 0.15;
}

void main() {
  // Flat (low-poly) shading from screen-space derivatives of the world position.
  vec3 flatN = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  // Inside the pit use the smooth profile normal; the rolling plateau keeps its derivative normal.
  vec3 n = normalize(mix(vNormal, flatN, smoothstep(1.0, 1.25, length(vWorld.xz))));
  float slope = 1.0 - clamp(n.y, 0.0, 1.0);
  // Material: flat benches are earth, batters are rock, the floor darkens toward the seam, the road is packed grey.
  vec3 earth = mix(uSurface, uBenchCol, smoothstep(0.0, 0.3, vDepth) * vBench);
  vec3 col = mix(earth, uRock, smoothstep(0.08, 0.35, slope));
  col = mix(col, uDeep, smoothstep(0.30, 0.42, vDepth) * (1.0 - vRoad) * 0.85);
  // Geological strata: thin light/dark bands on the rock faces by height.
  float bandN = vnoise(vWorld.xz * 9.0) * 7.0;
  float band = sin(vWorld.y * 150.0 + bandN) * 0.6 + sin(vWorld.y * 410.0 + bandN * 1.7) * 0.4;
  float strata = smoothstep(0.08, 0.35, slope) * (0.55 + 0.45 * band);
  col = mix(col, col * (0.88 + 0.18 * strata), smoothstep(0.08, 0.35, slope));
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
  // Water cart: the road stays dark and wet behind it, drying over distance.
  float behind = uCartTc - vTc;
  col *= 1.0 - 0.38 * vRoad * step(0.0, behind) * smoothstep(1.2, 0.0, behind);
  // Wind-blown dust streaks on the plateau.
  float plateau = smoothstep(1.05, 1.45, length(vWorld.xz));
  float streak = vnoise(vec2(vWorld.x * 6.0 - uTime * 0.25, vWorld.z * 42.0));
  col = mix(col, col * 1.16, plateau * smoothstep(0.55, 0.82, streak));

  // Fine rock relief: bump-map the shading normal with screen-space derivatives.
  float bumpH = rockNoise(vWorld);
  vec3 dpx = dFdx(vWorld), dpy = dFdy(vWorld);
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dFdx(bumpH) * r1 + dFdy(bumpH) * r2);
  float bumpAmt = mix(0.002, 0.0038, smoothstep(0.08, 0.35, slope));
  n = normalize(abs(det) * n - bumpAmt * grad);

  // Lighting: sun + hemisphere ambient.
  float diff = max(dot(n, normalize(uSun)), 0.0);
  float hemi = 0.5 + 0.5 * n.y;
  float bias = 0.0009 + 0.0022 * (1.0 - clamp(dot(vNormal, normalize(uSun)), 0.0, 1.0));
  // The gentle plateau relief should not self-shadow; only the pit and machines cast.
  float lit = mix(sunLight(vShadow, bias), 1.0, smoothstep(1.0, 1.12, length(vWorld.xz)));
  col *= uAmbient * (0.6 + 0.4 * hemi) + uSunCol * diff * 0.9 * lit;
  // Blast flash lights the nearby walls.
  float fd = length(vWorld - uFlashPos);
  col += vec3(1.0, 0.72, 0.42) * uFlash * exp(-fd * fd * 18.0) * 1.4;
  // Depth fog (dust haze) by distance from the camera.
  float dist = length(vWorld - uCam);
  float fog = 1.0 - exp(-dist * dist * uFogDensity);
  col = mix(col, uFog, clamp(fog, 0.0, 0.92));
  fragColor = vec4(col, 1.0);
}
