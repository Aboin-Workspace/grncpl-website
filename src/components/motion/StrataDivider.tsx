import { useMemo, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { mulberry32 } from '@/lib/prng'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props { lines?: number; className?: string; seed?: number; amber?: boolean }

/**
 * Geological strata divider: a few wavy lines that draw in on scroll. Reuses the
 * hero's visual language between sections so the "earth" theme runs through the site.
 */
export function StrataDivider({ lines = 4, className = '', seed = 7, amber = false }: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()
  const paths = useMemo(() => {
    const rand = mulberry32(seed)
    const W = 1440, H = 120, segs = 12
    return Array.from({ length: lines }, (_, i) => {
      const base = 20 + (H - 40) * (i / Math.max(1, lines - 1))
      const amp = 6 + rand() * 10
      const p1 = rand() * 6.28, f1 = 1 + rand() * 1.4
      const pts = Array.from({ length: segs + 1 }, (_, s) => [(W / segs) * s, base + Math.sin((s / segs) * 6.28 * f1 + p1) * amp + (rand() - 0.5) * 4] as const)
      return pts.reduce((d, [x, y], s) => (s === 0 ? `M ${x} ${y.toFixed(1)}` : `${d} C ${((pts[s - 1][0] + x) / 2).toFixed(1)} ${pts[s - 1][1].toFixed(1)}, ${((pts[s - 1][0] + x) / 2).toFixed(1)} ${y.toFixed(1)}, ${x} ${y.toFixed(1)}`), '')
    })
  }, [lines, seed])

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const els = ref.current.querySelectorAll('path')
      els.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }) })
      gsap.to(els, { strokeDashoffset: 0, duration: 1.8, stagger: 0.12, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true } })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <svg ref={ref} viewBox="0 0 1440 120" preserveAspectRatio="none" className={`block h-16 w-full md:h-24 ${className}`} aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={amber && i === lines - 1 ? 'var(--amber)' : 'var(--steel)'} strokeOpacity={amber && i === lines - 1 ? 0.7 : 0.6} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}
