import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from '@/lib/gsap'

interface Props {
  children: ReactNode
  /** Placeholder height until mounted so scroll length and pins stay stable. */
  minHeight?: string
  /** How far ahead of the viewport to mount. */
  rootMargin?: string
}

/**
 * Mounts heavy below-the-fold sections only when they approach the viewport.
 * Keeps initial DOM/JS work (and TBT) low on the home page. ScrollTrigger is
 * refreshed after mount so pinned sections measure correctly.
 */
export function Defer({ children, minHeight = '100vh', rootMargin = '150% 0px' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || on) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [on, rootMargin])
  useEffect(() => {
    if (on) requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [on])
  return on ? <>{children}</> : <div ref={ref} style={{ minHeight }} aria-hidden="true" />
}
