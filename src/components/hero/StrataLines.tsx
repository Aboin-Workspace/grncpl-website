import { forwardRef, useMemo } from 'react'
import { HERO } from '@/config/motion'
import { mulberry32 } from '@/lib/prng'

/**
 * Layer 2 — geological strata. `HERO.strata.count` wavy paths across the bottom
 * third of the hero. Draw-in and parallax/converge tweens are owned by Hero.tsx
 * (one ScrollTrigger timeline); this component only renders the geometry.
 */
function buildPaths() {
  const { count, viewBox, segments, amplitude, seed } = HERO.strata
  const rand = mulberry32(seed)
  const paths: string[] = []
  for (let i = 0; i < count; i++) {
    // Space the strata unevenly, denser toward the bottom like compressed layers.
    const t = (i + 1) / (count + 1)
    const baseY = viewBox.h * (0.18 + 0.78 * Math.pow(t, 0.8))
    const phase1 = rand() * Math.PI * 2
    const phase2 = rand() * Math.PI * 2
    const f1 = 1 + rand() * 1.2
    const f2 = 2.2 + rand() * 1.6
    const amp = amplitude * (0.6 + rand() * 0.8)
    const pts: [number, number][] = []
    for (let s = 0; s <= segments; s++) {
      const x = (viewBox.w / segments) * s
      const u = s / segments
      const y = baseY + Math.sin(u * Math.PI * 2 * f1 + phase1) * amp + Math.sin(u * Math.PI * 2 * f2 + phase2) * amp * 0.35 + (rand() - 0.5) * amp * 0.3
      pts.push([x, y])
    }
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let s = 1; s < pts.length; s++) {
      const [x0, y0] = pts[s - 1]
      const [x1, y1] = pts[s]
      const cx = (x0 + x1) / 2
      d += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`
    }
    paths.push(d)
  }
  return paths
}

export const StrataLines = forwardRef<SVGSVGElement>(function StrataLines(_, ref) {
  const paths = useMemo(buildPaths, [])
  const { viewBox, opacity, strokeWidth } = HERO.strata
  return (
    <svg
      ref={ref}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] w-full"
      viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className="strata-group" style={{ transformOrigin: '50% 100%' }}>
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            className="strata-path"
            fill="none"
            stroke="#2A2B30"
            strokeOpacity={opacity}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  )
})
