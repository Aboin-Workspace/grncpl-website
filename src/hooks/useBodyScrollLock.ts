import { useEffect } from 'react'
import { getLenis } from '@/lib/lenis'

/** Locks page scroll (Lenis + body overflow) while `locked` is true. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const lenis = getLenis()
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
    }
  }, [locked])
}
