import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null
let tickerFn: ((t: number) => void) | null = null

/** Creates the singleton Lenis instance and syncs it with ScrollTrigger. */
export function createLenis(): Lenis {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  tickerFn = (t) => lenis?.raf(t * 1000)
  gsap.ticker.add(tickerFn)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function destroyLenis() {
  if (tickerFn) gsap.ticker.remove(tickerFn)
  lenis?.destroy()
  lenis = null
  tickerFn = null
}

export const getLenis = () => lenis
