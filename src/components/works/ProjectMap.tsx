import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import india from '@svg-maps/india'

interface MapLocation { id: string; name: string; path: string }
const LOCATIONS = india.locations as MapLocation[]
import { COMPLETED_PROJECTS, CURRENT_PROJECTS, STATE_NAMES, type StateId } from '@/data/projects'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  active: StateId | 'All'
  onChange: (s: StateId | 'All') => void
  className?: string
}

interface StateStat { id: StateId; name: string; completed: number; current: number; quantity: number }

/**
 * India map of GRN's project states. States with completed work fill in green
 * (deeper = more projects), states with current work carry a pulsing marker.
 * Tap or click a state to filter the table; the list beside it is the same
 * control for keyboard and screen readers. Map data: @svg-maps/india (CC BY 4.0).
 */
export function ProjectMap({ active, onChange, className = '' }: Props) {
  const reduced = useReducedMotion()
  const [hover, setHover] = useState<StateId | null>(null)

  const stats = useMemo(() => {
    const map = new Map<StateId, StateStat>()
    const get = (id: StateId) => map.get(id) ?? (map.set(id, { id, name: STATE_NAMES[id], completed: 0, current: 0, quantity: 0 }), map.get(id)!)
    COMPLETED_PROJECTS.forEach((p) => { const s = get(p.state); s.completed++; s.quantity += p.quantity })
    CURRENT_PROJECTS.forEach((p) => { get(p.state).current++ })
    return map
  }, [])
  const max = Math.max(...Array.from(stats.values()).map((s) => s.completed))
  const list = Array.from(stats.values()).sort((a, b) => b.completed - a.completed)

  // Centroid of a state's path bbox, for markers. Computed from the path's numbers (cheap, good enough).
  const centers = useMemo(() => {
    const out: Partial<Record<StateId, [number, number]>> = {}
    LOCATIONS.forEach((loc) => {
      if (!stats.has(loc.id as StateId)) return
      const nums = loc.path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
      // Paths are relative ("m … l …") so walk them to absolute points.
      let x = 0, y = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      const cmds = loc.path.match(/[mlzMLZ][^mlzMLZ]*/g) ?? []
      cmds.forEach((c) => {
        const t = c[0]
        const pts = c.slice(1).trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n))
        for (let i = 0; i + 1 < pts.length; i += 2) {
          if (t === 'm' || t === 'l') { x += pts[i]; y += pts[i + 1] } else if (t === 'M' || t === 'L') { x = pts[i]; y = pts[i + 1] }
          if (t !== 'z' && t !== 'Z') { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y) }
        }
      })
      void nums
      out[loc.id as StateId] = [(minX + maxX) / 2, (minY + maxY) / 2]
    })
    return out
  }, [stats])

  const focus = hover ?? (active === 'All' ? null : active)
  const focusStat = focus ? stats.get(focus) : null

  return (
    <div className={`grid gap-8 lg:grid-cols-12 lg:items-center ${className}`}>
      <div className="relative lg:col-span-7">
        <svg viewBox={india.viewBox} className="h-auto w-full max-h-[70vh]" role="img" aria-label="Map of India showing states with GRN projects">
          <g>
            {LOCATIONS.map((loc) => {
              const id = loc.id as StateId
              const st = stats.get(id)
              const on = !!st
              const isFocus = focus === id
              const strength = st ? 0.25 + (st.completed / max) * 0.6 : 0
              return (
                <m.path
                  key={loc.id}
                  d={loc.path}
                  role={on ? 'button' : undefined}
                  tabIndex={on ? 0 : -1}
                  aria-label={st ? `${st.name}: ${st.completed} completed, ${st.current} current` : undefined}
                  aria-pressed={on ? active === id : undefined}
                  onClick={() => on && onChange(active === id ? 'All' : id)}
                  onKeyDown={(e) => { if (on && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onChange(active === id ? 'All' : id) } }}
                  onPointerEnter={() => on && setHover(id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => on && setHover(id)}
                  onBlur={() => setHover(null)}
                  initial={false}
                  animate={{
                    fill: on ? `rgb(var(--c-amber) / ${isFocus ? 0.95 : strength})` : 'rgb(var(--c-bone) / 0.06)',
                    stroke: isFocus ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bone) / 0.35)',
                  }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                  strokeWidth={isFocus ? 1.2 : 0.6}
                  vectorEffect="non-scaling-stroke"
                  className={on ? 'cursor-pointer outline-none focus-visible:stroke-amber' : ''}
                />
              )
            })}
          </g>
          {/* current-project markers */}
          {list.filter((s) => s.current > 0 && centers[s.id]).map((s) => {
            const [cx, cy] = centers[s.id]!
            return (
              <g key={s.id} pointerEvents="none" aria-hidden="true">
                {!reduced && <circle cx={cx} cy={cy} r="6" fill="none" stroke="rgb(var(--c-amber))" strokeWidth="1" className="map-pulse" />}
                <circle cx={cx} cy={cy} r="3" fill="rgb(var(--c-ink))" stroke="rgb(var(--c-amber))" strokeWidth="1.5" />
              </g>
            )
          })}
        </svg>
        {/* readout */}
        <AnimatePresence mode="wait">
          {focusStat && (
            <m.div
              key={focusStat.id}
              className="pointer-events-none absolute left-0 top-0 border border-steel/70 bg-coal/90 px-4 py-3 backdrop-blur-sm"
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.25 }}
              aria-hidden="true"
            >
              <p className="font-display text-2xl uppercase leading-none text-bone">{focusStat.name}</p>
              <p className="mt-2 font-body text-[11px] uppercase text-bone/60 hud-mono">
                <span className="text-amber">{focusStat.completed}</span> completed · <span className="text-amber">{focusStat.current}</span> current · {focusStat.quantity.toFixed(2)} M cum
              </p>
            </m.div>
          )}
        </AnimatePresence>
        <p className="mt-2 font-body text-[10px] uppercase tracking-[0.14em] text-bone/35">Map: svg-maps/india, CC BY 4.0</p>
      </div>

      <div className="lg:col-span-5">
        <p className="font-body text-[11px] uppercase text-bone/50 hud-mono" aria-hidden="true">Project states</p>
        <ul className="mt-3 flex flex-col" aria-label="Filter projects by state">
          <li>
            <button type="button" aria-pressed={active === 'All'} onClick={() => onChange('All')} className={`flex w-full items-center justify-between border-b py-3 text-left transition-colors duration-fast ${active === 'All' ? 'border-amber text-bone' : 'border-steel/60 text-bone/60 hover:text-bone'}`}>
              <span className="font-display text-xl uppercase">All states</span>
              <span className="font-body text-[11px] hud-mono">{COMPLETED_PROJECTS.length}</span>
            </button>
          </li>
          {list.map((s) => {
            const on = active === s.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(on ? 'All' : s.id)}
                  onPointerEnter={() => setHover(s.id)}
                  onPointerLeave={() => setHover(null)}
                  className={`group flex w-full items-center justify-between gap-4 border-b py-3 text-left transition-colors duration-fast ${on ? 'border-amber text-bone' : 'border-steel/60 text-bone/60 hover:text-bone'}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${s.current ? 'bg-amber' : 'bg-bone/30'}`} aria-hidden="true" />
                    <span className="font-display text-xl uppercase">{s.name}</span>
                  </span>
                  <span className="font-body text-[11px] hud-mono">
                    {s.completed}<span className="sr-only"> completed</span>{s.current ? <span className="ml-2 text-amber">+{s.current}<span className="sr-only"> current</span></span> : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 font-body text-[11px] uppercase text-bone/45 hud-mono"><span className="inline-block h-2 w-2 rounded-full bg-amber align-middle" aria-hidden="true" /> current project in state</p>
      </div>
    </div>
  )
}
