#version 300 es
precision highp float;

in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
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
uniform float uNoiseDrift;
uniform float uPointSize;
uniform float uReveal;
out float vR;
out float vDepth;
out float vFog;
out float vRoad;

// Ashima simplex 3D noise (MIT)
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

void main() {
  vec2 xz = position.xz;
  float r = length(xz);
  float ang = atan(xz.y, xz.x);

  // Stepped benches from the rim inward.
  float t = (uPitRadius - r) / uBenchWidth;      // >0 inside the pit, 1 per bench
  float tc = clamp(t, 0.0, uBenches);
  float bench = floor(tc);
  float f = fract(tc);
  float ramp = smoothstep(1.0 - uRamp, 1.0, f);   // short batter at the end of each bench
  float stepped = -(bench + ramp) * uBenchDepth;
  float smoothH = -tc * uBenchDepth;

  // Spiral haul road: a continuous grade that wraps `uRoadTurns` times rim→floor.
  float roadAng = (tc / uBenches) * uRoadTurns * TAU;
  float d = mod(ang - roadAng + TAU * 2.0, TAU);
  d = min(d, TAU - d);
  float road = (1.0 - smoothstep(0.0, uRoadWidth, d)) * step(0.001, tc) * (1.0 - step(uBenches - 0.001, tc));
  float h = mix(stepped, smoothH, road);

  // Rolling terrain outside the rim, a whisper of it inside.
  float n = snoise(vec3(xz * uNoiseFreq, uTime * uNoiseDrift)) * 0.6 + snoise(vec3(xz * uNoiseFreq * 2.3, 7.0 + uTime * uNoiseDrift)) * 0.25;
  float outer = smoothstep(uPitRadius - 0.03, uPitRadius + 0.5, r);
  h += n * uNoiseAmp * mix(0.15, 1.0, outer);

  // Reveal: the pit "excavates" from flat ground on mount.
  h *= uReveal;

  vec4 mv = modelViewMatrix * vec4(position.x, h, position.z, 1.0);
  vR = r;
  vDepth = -h;
  vRoad = road;
  vFog = length(mv.xyz);
  gl_PointSize = uPointSize;
  gl_Position = projectionMatrix * mv;
}
