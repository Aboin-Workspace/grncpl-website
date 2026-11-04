import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { CSR_PYRAMID, type CsrTier } from '@/data/csr'
import { PYRAMID } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const VB = { w: 640, h: 560 }
const CX = 300
const HALF = 268 // half-width at the base
const TOP = 36
const BASE = 520
const GAP = 12
const N = CSR_PYRAMID.length

/** Half-width of the pyramid at height y. */
const hw = (y: number) => ((y - TOP) / (BASE - TOP)) * HALF

interface Tier { tier: CsrTier; y0: number; y1: number; face: string; side: string; mid: number; right: number }

/**
 * The four-tier responsibility pyramid drawn as layered strata. Hover, focus or
 * tap a tier (or its label) to lift it and read its meaning; it auto-cycles
 * until the visitor takes over. Pure SVG + Motion, no bitmap.
 */
export function ResponsibilityPyramid({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  const tiers = useMemo<Tier[]>(() => {
    const apexH = 54
    const usable = BASE - TOP - apexH - GAP * N
    const h = usable / N
    return CSR_PYRAMID.map((tier, i) => {
      const y0 = TOP + apexH + GAP + i * (h + GAP)
      const y1 = y0 + h
      const l0 = CX - hw(y0), r0 = CX + hw(y0), l1 = CX - hw(y1), r1 = CX + hw(y1)
      const D = PYRAMID.depth
      return {
        tier, y0, y1, mid: (y0 + y1) / 2, right: r1,
        face: `M${l0} ${y0} L${r0} ${y0} L${r1} ${y1} L${l1} ${y1} Z`,
        side: `M${r0} ${y0} L${r0 + D.x} ${y0 + D.y} L${r1 + D.x} ${y1 + D.y} L${r1} ${y1} Z M${l1} ${y1} L${r1} ${y1} L${r1 + D.x} ${y1 + D.y} L${l1 + D.x} ${y1 + D.y} Z`,
      }
    })
  }, [])
  const apex = `M${CX} ${TOP} L${CX + hw(TOP + 54)} ${TOP + 54} L${CX - hw(TOP + 54)} ${TOP + 54} Z`

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (touched || reduced || !inView) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % N), PYRAMID.cycleMs)
    return () => window.clearInterval(id)
  }, [touched, reduced, inView])

  const pick = (i: number) => { setActive(i); setTouched(true) }
  const current = tiers[active]

  return (
    <div ref={root} className={`grid items-center gap-8 lg:grid-cols-12 ${className}`}>
      <div className="relative lg:col-span-7">
        <m.svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="h-auto w-full overflow-visible"
          aria-hidden="true"
          initial={reduced ? 'show' : 'hidden'}
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: PYRAMID.build.stagger, staggerDirection: -1 } } }}
        >
          <defs>
            <linearGradient id="pyr-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgb(var(--c-amber))" />
              <stop offset="1" stopColor="rgb(var(--c-safety))" />
            </linearGradient>
            <filter id="pyr-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
          </defs>
          {/* Ground line + survey ticks */}
          <m.line x1={CX - HALF - 40} x2={CX + HALF + 40} y1={BASE + PYRAMID.depth.y + 18} y2={BASE + PYRAMID.depth.y + 18} stroke="rgb(var(--c-bone) / 0.25)" strokeWidth="1" variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1.2 } } }} />
          {/* Apex */}
          <m.path d={apex} fill="rgb(var(--c-bone) / 0.18)" stroke="rgb(var(--c-bone) / 0.5)" strokeWidth="1" variants={{ hidden: { opacity: 0, y: PYRAMID.build.y }, show: { opacity: 1, y: 0, transition: { duration: PYRAMID.build.duration, ease: [0.16, 1, 0.3, 1] } } }} />
          {tiers.map((t, i) => {
            const on = i === active
            const tone = 1 - i / (N - 1) // 1 at top (philanthropic) → 0 at base
            const fill = `rgb(var(--c-amber) / ${(0.14 + tone * 0.5).toFixed(2)})`
            return (
              <m.g
                key={t.tier.title}
                variants={{ hidden: { opacity: 0, y: PYRAMID.build.y }, show: { opacity: 1, y: 0, transition: { duration: PYRAMID.build.duration, ease: [0.16, 1, 0.3, 1] } } }}
                style={{ cursor: 'pointer' }}
                onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
                onClick={() => pick(i)}
              >
                <m.g animate={{ y: on && !reduced ? PYRAMID.lift.y : 0, opacity: on || !touched ? 1 : 0.55 }} transition={reduced ? { duration: 0 } : PYRAMID.lift.spring}>
                  <path d={t.side} fill="rgb(var(--c-ink))" stroke="rgb(var(--c-bone) / 0.25)" strokeWidth="1" />
                  <m.path d={t.face} fill={i === 0 ? 'url(#pyr-top)' : fill} stroke={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.35)'} strokeWidth={on ? 1.5 : 1} filter={on ? 'url(#pyr-glow)' : undefined} animate={{ fillOpacity: on ? 1 : 0.85 }} />
                  {/* strata hatch inside the tier */}
                  {[0.33, 0.66].map((f) => {
                    const y = t.y0 + (t.y1 - t.y0) * f
                    return <line key={f} x1={CX - hw(y) + 10} x2={CX + hw(y) - 10} y1={y} y2={y} stroke="rgb(var(--c-ink) / 0.35)" strokeWidth="1" />
                  })}
                  <circle cx={CX} cy={t.mid} r="26" fill="rgb(var(--c-ink))" stroke={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.4)'} strokeWidth="1" />
                  <text x={CX} y={t.mid + 7} textAnchor="middle" fontSize="20" fontFamily="Bebas Neue, Impact, sans-serif" letterSpacing="1" fill={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone))'}>{t.tier.abbr}</text>
                  {/* connector to the label column on wide screens */}
                  <m.line x1={t.right + PYRAMID.depth.x + 6} x2={VB.w} y1={t.mid} y2={t.mid} stroke="rgb(var(--c-amber))" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: on ? 1 : 0, pathLength: on ? 1 : 0 }} transition={{ duration: reduced ? 0 : PYRAMID.connector.duration, ease: PYRAMID.connector.ease }} className="hidden lg:block" />
                </m.g>
              </m.g>
            )
          })}
        </m.svg>
        {/* Large reading of the active tier, overlaid on small screens' side */}
        <div className="pointer-events-none absolute left-0 top-0 hidden font-body text-[11px] uppercase text-bone/50 hud-mono lg:block" aria-hidden="true">
          {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </div>
      </div>

      <div className="lg:col-span-5">
        <ol className="flex flex-col gap-1" aria-label="Responsibility tiers">
          {tiers.map((t, i) => {
            const on = i === active
            return (
              <li key={t.tier.title}>
                <button
                  type="button"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  data-cursor-grow
                  className={`group relative flex w-full items-baseline gap-4 border-l py-4 pl-5 text-left transition-colors duration-fast ${on ? 'border-amber' : 'border-steel/60 hover:border-bone/50'}`}
                >
                  <span className={`font-body text-[11px] hud-mono ${on ? 'text-amber' : 'text-bone/40'}`} aria-hidden="true">{t.tier.abbr}</span>
                  <span>
                    <span className={`block font-display text-[1.5rem] uppercase leading-none tracking-[0.02em] transition-colors duration-fast lg:text-[2rem] ${on ? 'text-bone' : 'text-bone/55 group-hover:text-bone'}`}>{t.tier.title}</span>
                    <AnimatePresence initial={false}>
                      {on && (
                        <m.span
                          key="motto"
                          className="block overflow-hidden font-body text-body-lg text-amber"
                          initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                          exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <span className="block pt-2">{t.tier.motto}</span>
                        </m.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="sr-only" aria-live="polite">{current.tier.title}: {current.tier.motto}</p>
      </div>
    </div>
  )
}
