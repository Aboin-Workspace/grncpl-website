#version 300 es
precision highp float;
uniform vec3 uSun;
uniform vec3 uFog;
uniform float uFogDensity;
uniform vec3 uCam;
uniform vec3 uColor;
uniform float uAmbient;
uniform vec3 uSunCol;
uniform sampler2D tShadow;
in vec3 vWorld;
in vec4 vShadow;
out vec4 fragColor;

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

void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  float diff = max(dot(n, normalize(uSun)), 0.0);
  float hemi = 0.5 + 0.5 * n.y;
  vec3 col = uColor * (uAmbient * (0.6 + 0.4 * hemi) + uSunCol * diff * 0.9 * sunLight(vShadow, 0.0016));
  float dist = length(vWorld - uCam);
  float fog = 1.0 - exp(-dist * dist * uFogDensity);
  fragColor = vec4(mix(col, uFog, clamp(fog, 0.0, 0.92)), 1.0);
}
