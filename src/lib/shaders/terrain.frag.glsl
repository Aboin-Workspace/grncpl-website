#version 300 es
precision highp float;

uniform vec3 uLine;
uniform vec3 uLineDeep;      // colour at the pit floor (earth tone on light theme)
uniform vec3 uAmber;
uniform float uAlpha;
uniform float uTime;
uniform float uScanPeriod;
uniform float uScanWidth;
uniform float uScanIntensity;
uniform float uPitRadius;
uniform float uFogStart;
uniform float uFogEnd;
uniform float uReveal;
uniform float uIsPoint;
in float vR;
in float vDepth;
in float vFog;
in float vRoad;
out vec4 fragColor;

void main() {
  if (uIsPoint > 0.5) {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
  }
  // Survey ring expanding from the pit floor to just past the rim.
  float scanR = mod(uTime / uScanPeriod, 1.0) * (uPitRadius + 0.35);
  float ring = 1.0 - smoothstep(0.0, uScanWidth, abs(vR - scanR));
  ring *= 1.0 - smoothstep(uPitRadius + 0.1, uPitRadius + 0.35, scanR); // fades as it leaves the pit
  // Haul road and pit floor carry a faint amber signature.
  float depthGlow = smoothstep(0.0, 0.4, vDepth) * 0.35;
  float amber = clamp(ring * uScanIntensity + vRoad * 0.6 + depthGlow, 0.0, 1.0);
  vec3 base = mix(uLine, uLineDeep, smoothstep(0.0, 0.38, vDepth));
  vec3 col = mix(base, uAmber, amber);
  float fog = 1.0 - smoothstep(uFogStart, uFogEnd, vFog);
  float a = uAlpha * fog * uReveal * (0.7 + 0.3 * amber);
  // Premultiplied alpha (the renderer blends ONE, ONE_MINUS_SRC_ALPHA) so dark lines stay dark on light paper.
  fragColor = vec4(col * a, a);
}
