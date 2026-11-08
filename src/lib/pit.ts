import { TERRAIN } from '@/config/motion'

/**
 * JS twin of the pit geometry in terrain/world vertex shaders (minus the surface noise),
 * used to place trucks and the camera on the spiral haul road.
 */
const TAU = Math.PI * 2
const P = TERRAIN.pit
const R = TERRAIN.road

/** Road parameter tc ∈ [0, benches] → angle (rad), radius, height. */
export function roadPoint(tc: number, lane = 0): { x: number; y: number; z: number; angle: number } {
  const t = Math.max(0, Math.min(P.benches, tc))
  const angle = (t / P.benches) * R.turns * TAU
  const r = P.radius - t * P.benchWidth + 0.02 + lane
  // Height of the smooth road surface at this actual radius (the +0.02/lane shift moves it outward → higher).
  const y = -(t - (0.02 + lane) / P.benchWidth) * P.benchDepth
  return { x: r * Math.cos(angle), y, z: r * Math.sin(angle), angle }
}

/** Catmull-Rom through points, u ∈ [0,1]. */
export function spline(pts: ReadonlyArray<readonly [number, number, number]>, u: number): [number, number, number] {
  const n = pts.length - 1
  const f = Math.max(0, Math.min(0.9999, u)) * n
  const i = Math.floor(f)
  const t = f - i
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[Math.min(n, i + 1)], p3 = pts[Math.min(n, i + 2)]
  const out: [number, number, number] = [0, 0, 0]
  for (let k = 0; k < 3; k++) {
    out[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)
  }
  return out
}

/** Height of the stepped pit surface (no surface noise) at a mesh-space point, matching world.vert.glsl. */
export function pitHeight(x: number, z: number, ramp = 0.55): number {
  const r = Math.hypot(x, z)
  const t = (P.radius - r) / P.benchWidth
  const tc = Math.max(0, Math.min(P.benches, t))
  const bench = Math.floor(tc)
  const f = tc - bench
  const e0 = 1 - ramp
  const k = Math.max(0, Math.min(1, (f - e0) / (1 - e0)))
  const rampS = k * k * (3 - 2 * k)
  return -(bench + rampS) * P.benchDepth
}

/** A point on the flat of bench `b` at angle `ang`, `f` ∈ (0,1) of the way across the bench. */
export function benchPoint(b: number, f: number, ang: number): { x: number; y: number; z: number } {
  const r = P.radius - (b + f) * P.benchWidth
  const x = r * Math.cos(ang), z = r * Math.sin(ang)
  return { x, y: pitHeight(x, z), z }
}
