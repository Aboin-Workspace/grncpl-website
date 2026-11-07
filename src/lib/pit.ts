import { TERRAIN } from '@/config/motion'

/**
 * JS twin of the pit geometry in terrain/world vertex shaders (minus the surface noise),
 * used to place trucks and the camera on the spiral haul road.
 */
const TAU = Math.PI * 2
const P = TERRAIN.pit
const R = TERRAIN.road

/** Road parameter tc ∈ [0, benches] → angle (rad), radius, height. */
export function roadPoint(tc: number): { x: number; y: number; z: number; angle: number } {
  const t = Math.max(0, Math.min(P.benches, tc))
  const angle = (t / P.benches) * R.turns * TAU
  const r = P.radius - t * P.benchWidth + 0.02
  const y = -t * P.benchDepth
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
