#version 300 es
precision highp float;
in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform float uTime;
uniform float uPitRadius;
uniform float uBenches;
uniform float uBenchWidth;
uniform float uBenchDepth;
uniform float uRamp;
uniform float uRoadWidth;
uniform float uRoadTurns;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uInner;
out vec3 vWorld;
out float vDepth;
out float vRoad;
out float vBench;
out float vF; // fract across a bench (0 at the crest)
out float vRoadD;
out vec3 vNormal;
out vec4 vShadow;
out float vTc;
uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix; // -1..1 across the road width

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
const float TAU = 6.28318530718;
float gTc, gT, gF, gRamp, gRoad, gSd;

// Stepped pit surface without noise. Sets the g* values for the point it was last called with.
float baseH(vec2 xz) {
  float ang = atan(xz.y, xz.x);
  float warp = 1.0 + 0.07 * sin(2.0 * ang + 0.7) + 0.045 * sin(3.0 * ang - 1.9) + 0.025 * sin(5.0 * ang + 2.3);
  float r = length(xz) / warp;
  gT = (uPitRadius - r) / uBenchWidth;
  gTc = clamp(gT, 0.0, uBenches);
  float bench = floor(gTc);
  gF = fract(gTc);
  gRamp = smoothstep(1.0 - uRamp, 1.0, gF);
  float stepped = -(bench + gRamp) * uBenchDepth;
  float smoothH = -gTc * uBenchDepth;
  float roadAng = (gTc / uBenches) * uRoadTurns * TAU;
  float d = mod(ang - roadAng + TAU * 2.0, TAU);
  d = min(d, TAU - d);
  gRoad = (1.0 - smoothstep(0.0, uRoadWidth, d)) * step(0.001, gTc) * (1.0 - step(uBenches - 0.001, gTc));
  gSd = mod(ang - roadAng + TAU * 2.5, TAU) - TAU * 0.5;
  // Safety berm along the crest: the flat of a bench ends where the next batter starts.
  float crest = 1.0 - uRamp;
  float berm = exp(-pow((gF - (crest - 0.05)) * 24.0, 2.0)) * step(0.5, gTc) * step(gT, uBenches) * 0.011;
  return mix(stepped + berm, smoothH, gRoad);
}

void main() {
  vec2 xz = position.xz;
  float e = 0.004;
  // Smooth normal from the noise-free profile, so batters shade as slopes rather than ring facets.
  float hx0 = baseH(xz - vec2(e, 0.0)), hx1 = baseH(xz + vec2(e, 0.0));
  float hz0 = baseH(xz - vec2(0.0, e)), hz1 = baseH(xz + vec2(0.0, e));
  vNormal = normalize(vec3(hx0 - hx1, 2.0 * e, hz0 - hz1));
  float h = baseH(xz);
  float r = length(xz);

  float n = snoise(vec3(xz * uNoiseFreq, 3.0)) * 0.7 + snoise(vec3(xz * uNoiseFreq * 2.1, 7.0)) * 0.3;
  float outer = smoothstep(uPitRadius - 0.02, uPitRadius + 0.6, r);
  h += n * uNoiseAmp * mix(uInner, 1.0, outer) * (1.0 - gRoad * 0.9);

  // Broken rock on the batters and scree fans at their toes.
  float wall = gRamp * (1.0 - gRamp) * 4.0;
  h += snoise(vec3(xz * 34.0, 2.0)) * 0.007 * wall * (1.0 - gRoad);
  float toeD = min(gF, 1.0 - gF);
  float toe = exp(-pow(toeD * 12.0, 2.0)) * step(0.5, gTc) * smoothstep(uBenches + 0.3, uBenches, gT);
  h += toe * (0.5 + 0.5 * snoise(vec3(xz * 18.0, 5.0))) * 0.011 * (1.0 - gRoad);

  vec3 pos = vec3(position.x, h, position.z);
  // Heat shimmer: a faint wobble over the pit floor.
  float floorZone = smoothstep(uBenches - 0.2, uBenches + 0.3, gT);
  pos.xz += vec2(sin(uTime * 3.1 + xz.y * 90.0), cos(uTime * 2.7 + xz.x * 80.0)) * 0.0011 * floorZone;

  vWorld = (modelMatrix * vec4(pos, 1.0)).xyz;
  vDepth = -h;
  vRoad = gRoad;
  vRoadD = clamp(gSd / uRoadWidth, -1.0, 1.0);
  vBench = 1.0 - gRamp;
  vF = gT >= uBenches ? 0.5 : gF;
  vTc = gTc;
  vShadow = shadowProjectionMatrix * shadowViewMatrix * vec4(vWorld, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
