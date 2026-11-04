import { useEffect } from 'react'
import { getLenis } from '@/lib/lenis'

export interface LenisScrollEvent { scroll: number; velocity: number; direction: 1 | -1 | 0 }

/** Subscribe to Lenis scroll events (scroll position, velocity, direction). */
export function useLenisScroll(handler: (e: LenisScrollEvent) => void) {
  useEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    const fn = (l: { scroll: number; velocity: number; direction: 1 | -1 | 0 }) => handler({ scroll: l.scroll, velocity: l.velocity, direction: l.direction })
    lenis.on('scroll', fn)
    return () => lenis.off('scroll', fn)
  }, [handler])
}
