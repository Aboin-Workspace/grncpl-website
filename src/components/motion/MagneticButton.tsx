import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'
import { HERO } from '@/config/motion'
import { usePointerFine } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children: ReactNode
  /** Pull radius in px around the button edge. */
  radius?: number
  strength?: number
}

/**
 * Button that pulls toward the pointer within `radius`, springing back on leave.
 * Framer Motion owns the transform (pointer-state driven). Disabled for touch / reduced motion.
 */
export const MagneticButton = forwardRef<HTMLButtonElement, Props>(function MagneticButton(
  { children, radius = HERO.magnetic.radiusPx, strength = HERO.magnetic.strength, className = '', ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLButtonElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, HERO.magnetic.spring)
  const sy = useSpring(y, HERO.magnetic.spring)
  const fine = usePointerFine()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  useEffect(() => {
    if (!enabled) {
      x.set(0)
      y.set(0)
      return
    }
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = innerRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy)
        const reach = radius + Math.max(r.width, r.height) / 2
        if (dist < reach) {
          x.set(dx * strength)
          y.set(dy * strength)
        } else {
          x.set(0)
          y.set(0)
        }
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled, radius, strength, x, y])

  return (
    <m.button
      ref={(node) => {
        innerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      style={{ x: sx, y: sy }}
      whileTap={enabled ? { scale: 0.94 } : undefined}
      className={className}
      data-cursor-grow
      {...(rest as object)}
    >
      {children}
    </m.button>
  )
})
