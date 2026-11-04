#version 300 es
precision highp float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec2 uRes;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform float uTime;
uniform float uProgress;     // 0 = slide A, 1 = slide B
uniform float uSeed;         // per-transition noise seed
uniform float uSoft;         // wipe softness in noise units
uniform float uEdgePx;       // amber edge width in px
uniform float uChroma;       // chromatic offset in uv units
uniform vec2 uPointer;       // 0..1, y up
uniform float uPointerStrength;
uniform float uPointerRadius;
uniform float uZoom;
uniform float uFlow;         // haze amplitude
uniform float uDarken;       // 0..1 extra darkening (scroll exit)
uniform float uVignette;
uniform vec3 uAmber;
uniform float uContrast;
uniform float uSaturation;
uniform float uWarmth;
uniform float uLift;
uniform vec2 uTilt;          // smoothed pointer offset, -1..1
uniform float uDepth;        // parallax amount
in vec2 vUv;
out vec4 fragColor;

// Ashima simplex 3D noise (MIT) -------------------------------------------
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
// -------------------------------------------------------------------------

vec2 coverUv(vec2 uv, vec2 res, vec2 size) {
  float rs = res.x / res.y;
  float is = size.x / size.y;
  vec2 s = rs > is ? vec2(1.0, is / rs) : vec2(rs / is, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);

  // Slow zoom about the centre (idle drift + scroll exit).
  uv = (uv - 0.5) / uZoom + 0.5;

  // Pseudo-depth parallax: the foreground (bottom of frame) shifts more than the horizon.
  float depth = (1.0 - vUv.y) * (1.0 - vUv.y);
  uv += uTilt * uDepth * (depth - 0.33);

  // Heat haze / settling dust: two octaves of slowly flowing noise.
  float n1 = snoise(vec3(uv * 3.0, uTime * 0.12));
  float n2 = snoise(vec3(uv * 6.0 + 7.3, uTime * 0.07 + 3.1));
  uv += vec2(n1, n2) * uFlow * 0.02;

  // Pointer bulge: push pixels away from the pointer, swirl a little with noise.
  vec2 d = (uv - uPointer) * aspect;
  float dist = length(d) + 1e-4;
  float f = exp(-(dist * dist) / (uPointerRadius * uPointerRadius));
  vec2 dir = d / dist;
  float swirl = snoise(vec3(uv * 8.0, uTime * 0.5)) * 0.35;
  uv -= (dir / aspect) * f * uPointerStrength * 0.09;
  uv += vec2(-dir.y, dir.x) / aspect * f * uPointerStrength * swirl * 0.05;

  // Liquid wipe threshold: two octaves of low-frequency noise, remapped so the
  // field spans the full 0..1 range (raw simplex rarely leaves ±0.6), then biased
  // slightly bottom→top so the wipe reads like dust rising off the pit floor.
  float wn = snoise(vec3(uv * 1.6 + uSeed, uTime * 0.04)) * 0.7 + snoise(vec3(uv * 3.8 - uSeed, uTime * 0.06)) * 0.3;
  float w = clamp((wn + 0.62) / 1.24, 0.0, 1.0);
  w = mix(w, 1.0 - vUv.y, 0.3);
  float p = mix(-uSoft, 1.0 + uSoft, uProgress);
  float mask = 1.0 - smoothstep(p - uSoft, p + uSoft, w);

  vec2 uvA = coverUv(uv, uRes, uSizeA);
  vec2 uvB = coverUv(uv, uRes, uSizeB);
  vec3 colA = texture(uTexA, uvA).rgb;
  vec3 colB = texture(uTexB, uvB).rgb;

  // Amber chromatic edge along the threshold line (width in px via fwidth).
  float edgeW = fwidth(w) * uEdgePx;
  float edge = (1.0 - smoothstep(0.0, edgeW, abs(w - p))) * step(0.001, uProgress) * step(uProgress, 0.999);
  vec2 off = dir * uChroma * edge;
  colB.r = texture(uTexB, uvB + off).r;
  colB.b = texture(uTexB, uvB - off).b;

  vec3 col = mix(colA, colB, mask);
  col = mix(col, uAmber, edge * 0.85);

  // Colour grade: contrast about mid-grey, saturation, warm tint, slight shadow lift.
  col = (col - 0.5) * uContrast + 0.5;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, uSaturation);
  col += vec3(uWarmth, uWarmth * 0.45, -uWarmth * 0.6) * (0.4 + 0.6 * luma);
  col = col * (1.0 - uLift) + uLift;

  // Vignette + exit darkening.
  float v = smoothstep(0.35, 1.0, length((vUv - 0.5) * vec2(1.15, 1.0)) * 1.35);
  col *= 1.0 - v * uVignette;
  col *= 1.0 - uDarken;

  fragColor = vec4(col, 1.0);
}
