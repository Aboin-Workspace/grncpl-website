import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import { useAnimate } from 'motion/react'
import { ScrollTrigger } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { PAGE_TRANSITION, DURATION } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { DisplayLocationContext } from '@/lib/displayLocation'

const EXPO_INOUT: [number, number, number, number] = [0.87, 0, 0.13, 1]

/** Routes that share one page tree and morph in place rather than wipe (CSR hub + pillars). */
const GROUPS: string[][] = [['/csr/', '/svastha-health/', '/vidyadhanam-education/', '/jal-jeevan-drinking-water/', '/annadhana-food-donation/', '/paryavarana-environment/', '/aadhaar-community-development/']]
const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`)
const sameGroup = (a: string, b: string) => GROUPS.some((g) => g.includes(norm(a)) && g.includes(norm(b)))


interface Props {
  children: (location: Location) => ReactNode
}

/**
 * Two-panel amber wipe between routes: cover → swap route + scroll to top +
 * ScrollTrigger.refresh → uncover. The wipe is skipped inside a route group
 * (CSR hub ↔ pillar) so Framer shared-layout morphs can run instead.
 */
export function PageTransition({ children }: Props) {
  const location = useLocation()
  const [display, setDisplay] = useState(location)
  const [scope, animate] = useAnimate()
  const reduced = useReducedMotion()
  const busy = useRef(false)
  const pending = useRef<Location | null>(null)

  useEffect(() => {
    if (location.key === display.key) return
    if (location.pathname === display.pathname) {
      setDisplay(location)
      return
    }
    if (sameGroup(location.pathname, display.pathname)) {
      setDisplay(location)
      requestAnimationFrame(() => ScrollTrigger.refresh())
      return
    }
    if (busy.current) {
      pending.current = location
      return
    }
    const run = async (target: Location) => {
      busy.current = true
      const D = reduced ? DURATION.reducedFade : PAGE_TRANSITION.duration
      const ease = reduced ? 'easeInOut' : EXPO_INOUT
      const panels = Array.from((scope.current as HTMLElement).querySelectorAll('[data-panel]')) as HTMLElement[]
      panels.forEach((p) => (p.style.transformOrigin = '50% 100%'))
      await Promise.all([
        animate(panels[0], { scaleY: [0, 1] }, { duration: D, ease }),
        animate(panels[1], { scaleY: [0, 1] }, { duration: D, ease, delay: reduced ? 0 : 0.08 }),
      ])
      setDisplay(target)
      getLenis()?.scrollTo(0, { immediate: true })
      window.scrollTo(0, 0)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      ScrollTrigger.refresh()
      panels.forEach((p) => (p.style.transformOrigin = '50% 0%'))
      await Promise.all([
        animate(panels[1], { scaleY: [1, 0] }, { duration: D, ease }),
        animate(panels[0], { scaleY: [1, 0] }, { duration: D, ease, delay: reduced ? 0 : 0.08 }),
      ])
      busy.current = false
      const next = pending.current
      pending.current = null
      if (next && next.pathname !== target.pathname) run(next)
      else if (next) setDisplay(next)
    }
    run(location)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return (
    <DisplayLocationContext.Provider value={display}>
      <div ref={scope} className="pointer-events-none fixed inset-0 z-transition" aria-hidden="true">
        <div data-panel className="absolute inset-0 bg-amber" style={{ transform: 'scaleY(0)' }} />
        <div data-panel className="absolute inset-0 bg-ink" style={{ transform: 'scaleY(0)' }} />
      </div>
      {children(display)}
    </DisplayLocationContext.Provider>
  )
}
