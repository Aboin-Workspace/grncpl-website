import { useCallback, useRef, type ReactNode } from 'react'
import { m, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MARQUEE } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useLenisScroll } from '@/hooks/useLenisScroll'

interface Props {
  children: ReactNode
  className?: string
  ariaLabel?: string
}

/**
 * Infinite loop marquee. Pauses on hover; its speed follows scroll velocity.
 * Static (no autoplay) under reduced motion.
 */
export function Marquee({ children, className = '', ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const tween = useRef<gsap.core.Tween | null>(null)
  const target = useRef(1)
  const hovering = useRef(false)
  // Velocity skew: the whole strip leans with fast scrolling and springs back.
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const skewX = useSpring(useTransform(velocity, [-3000, 0, 3000], [MARQUEE.maxSkewDeg, 0, -MARQUEE.maxSkewDeg]), { stiffness: 200, damping: 30 })

  useGSAP(
    () => {
      if (reduced || !track.current) return
      tween.current = gsap.to(track.current, { xPercent: -50, duration: MARQUEE.loopSeconds, ease: 'none', repeat: -1 })
      const tick = () => {
        const t = tween.current
        if (!t) return
        const goal = hovering.current ? 0 : target.current
        t.timeScale(gsap.utils.interpolate(t.timeScale(), goal, MARQUEE.lerp))
        target.current = gsap.utils.interpolate(target.current, 1, 0.05)
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: ref, dependencies: [reduced] },
  )

  useLenisScroll(
    useCallback((e) => {
      target.current = Math.min(MARQUEE.maxTimeScale, 1 + Math.abs(e.velocity) * MARQUEE.velocityFactor)
    }, []),
  )

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      aria-label={ariaLabel}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <m.div style={reduced ? undefined : { skewX }}>
      <div ref={track} className={`flex w-max ${reduced ? 'flex-wrap' : ''}`}>
        <div className="flex shrink-0">{children}</div>
        {!reduced && (
          <div className="flex shrink-0" aria-hidden="true">
            {children}
          </div>
        )}
      </div>
      </m.div>
    </div>
  )
}
