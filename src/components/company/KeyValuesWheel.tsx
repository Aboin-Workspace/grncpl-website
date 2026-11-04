import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ABOUT_US } from '@/data/company'
import { VALUES_WHEEL as W } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const KV = ABOUT_US.keyValues
const N = KV.items.length
const C = 300
const R_OUT = 270
const R_IN = 150
const R_RING = 118
const TAU = Math.PI * 2
const pt = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)] as const
const wedge = (i: number) => {
  const a0 = -Math.PI / 2 + (i / N) * TAU
  const a1 = a0 + TAU / N
  const [x0, y0] = pt(R_OUT, a0), [x1, y1] = pt(R_OUT, a1), [x2, y2] = pt(R_IN, a1), [x3, y3] = pt(R_IN, a0)
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z`
}
const arrow = (i: number) => {
  // Short chevron arc on the inner ring, one per value, pointing clockwise.
  const a0 = -Math.PI / 2 + (i / N) * TAU + 0.12
  const a1 = a0 + TAU / N - 0.3
  const [x0, y0] = pt(R_RING, a0), [x1, y1] = pt(R_RING, a1)
  const [hx, hy] = pt(R_RING, a1 + 0.1), [h0x, h0y] = pt(R_RING + 12, a1 - 0.06), [h1x, h1y] = pt(R_RING - 12, a1 - 0.06)
  return { arc: `M${x0} ${y0} A${R_RING} ${R_RING} 0 0 1 ${x1} ${y1}`, head: `M${h0x} ${h0y} L${hx} ${hy} L${h1x} ${h1y}` }
}

/**
 * GRNCPL's key-values wheel: six wedges spelling G·R·N·C·P·L around "Key Values".
 * Hover, focus or tap a wedge (or its label) to lift it; the letter ring turns
 * slowly and the wheel cycles until the visitor takes over. Pure SVG + Motion.
 */
export function KeyValuesWheel({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const [inView, setInView] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (touched || reduced || !inView) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % N), W.cycleMs)
    return () => window.clearInterval(id)
  }, [touched, reduced, inView])
  const pick = (i: number) => { setActive(i); setTouched(true) }

  return (
    <div ref={root} className={`grid items-center gap-10 lg:grid-cols-12 ${className}`}>
      <div className="relative mx-auto w-full max-w-[560px] lg:col-span-6">
        <m.svg
          viewBox="0 0 600 600"
          className="h-auto w-full overflow-visible"
          aria-hidden="true"
          initial={reduced ? 'show' : 'hidden'}
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: W.build.stagger } } }}
        >
          <defs>
            <radialGradient id="kv-core" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="rgb(var(--c-coal))" />
              <stop offset="1" stopColor="rgb(var(--c-ink))" />
            </radialGradient>
          </defs>
          {/* outer survey ring + ticks */}
          <circle cx={C} cy={C} r={R_OUT + 16} fill="none" stroke="rgb(var(--c-bone) / 0.18)" strokeWidth="1" strokeDasharray="2 10" />
          {KV.items.map((it, i) => {
            const on = i === active
            const mid = -Math.PI / 2 + ((i + 0.5) / N) * TAU
            const [lx, ly] = pt((R_OUT + R_IN) / 2, mid)
            const [ox, oy] = pt(R_OUT + 8, mid)
            return (
              <m.g
                key={it.letter}
                variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: W.build.duration, ease: [0.16, 1, 0.3, 1] } } }}
                style={{ originX: '300px', originY: '300px', cursor: 'pointer' }}
                onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
                onClick={() => pick(i)}
              >
                <m.g
                  style={{ originX: '300px', originY: '300px' }}
                  animate={{ scale: on && !reduced ? W.lift.scale : 1, opacity: on || !touched ? 1 : 0.6 }}
                  transition={reduced ? { duration: 0 } : W.lift.spring}
                >
                  <m.path d={wedge(i)} stroke={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.35)'} strokeWidth={on ? 1.5 : 1} animate={{ fill: on ? 'rgb(var(--c-amber) / 0.55)' : `rgb(var(--c-amber) / ${(0.08 + (i / N) * 0.14).toFixed(2)})` }} transition={{ duration: 0.3 }} />
                  <text x={lx} y={ly + 16} textAnchor="middle" fontSize="46" fontFamily="Bebas Neue, Impact, sans-serif" letterSpacing="1" fill={on ? 'rgb(var(--c-bone))' : 'rgb(var(--c-bone) / 0.7)'}>{it.letter}</text>
                  <circle cx={ox} cy={oy} r="3" fill={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.3)'} />
                </m.g>
              </m.g>
            )
          })}
          {/* rotating arrow ring */}
          <m.g style={{ originX: '300px', originY: '300px' }} animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: W.ringSeconds, ease: 'linear', repeat: Infinity }}>
            {KV.items.map((it, i) => {
              const a = arrow(i)
              const on = i === active
              return (
                <g key={it.letter}>
                  <path d={a.arc} fill="none" stroke={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.35)'} strokeWidth={on ? 3 : 1.5} strokeLinecap="round" />
                  <path d={a.head} fill="none" stroke={on ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.35)'} strokeWidth={on ? 3 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )
            })}
          </m.g>
          {/* core */}
          <m.g variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { duration: W.build.duration, ease: [0.16, 1, 0.3, 1] } } }} style={{ originX: '300px', originY: '300px' }}>
            <circle cx={C} cy={C} r={R_RING - 22} fill="url(#kv-core)" stroke="rgb(var(--c-amber) / 0.7)" strokeWidth="1" />
            <text x={C} y={C - 4} textAnchor="middle" fontSize="40" fontFamily="Bebas Neue, Impact, sans-serif" letterSpacing="1.5" fill="rgb(var(--c-bone))">{KV.title.split(' ')[0]}</text>
            <text x={C} y={C + 36} textAnchor="middle" fontSize="40" fontFamily="Bebas Neue, Impact, sans-serif" letterSpacing="1.5" fill="rgb(var(--c-amber))">{KV.title.split(' ').slice(1).join(' ')}</text>
          </m.g>
        </m.svg>
      </div>

      <div className="lg:col-span-6">
        <p className="font-body text-[11px] uppercase text-bone/50 hud-mono" aria-hidden="true">{KV.title} · {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</p>
        <ol className="mt-4 flex flex-col" aria-label={KV.title}>
          {KV.items.map((it, i) => {
            const on = i === active
            return (
              <li key={it.letter}>
                <button
                  type="button"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  data-cursor-grow
                  className={`group relative flex w-full items-center gap-5 border-b py-4 text-left transition-colors duration-fast ${on ? 'border-amber' : 'border-steel/60 hover:border-bone/40'}`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center border font-display text-2xl leading-none transition-colors duration-fast ${on ? 'border-amber bg-amber text-ink' : 'border-steel text-bone/60 group-hover:border-bone/60'}`} aria-hidden="true">{it.letter}</span>
                  <span className={`font-body text-base transition-colors duration-fast md:text-lg ${on ? 'text-bone' : 'text-bone/60 group-hover:text-bone'}`}>{it.value}</span>
                  <AnimatePresence>{on && <m.span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-amber" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} aria-hidden="true" />}</AnimatePresence>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
