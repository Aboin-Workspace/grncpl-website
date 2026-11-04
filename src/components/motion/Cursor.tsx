import { useEffect, useState } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'
import { CURSOR } from '@/config/motion'
import { usePointerFine } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Custom cursor: 12px amber dot (instant) + 40px ring on a spring.
 * Ring grows over interactive elements; shows a labelled pill when the
 * hovered element (or an ancestor) carries `data-cursor="View|Drag|Open"`.
 * Only mounts for fine pointers at ≥1024px and never under reduced motion.
 */
export function Cursor() {
  const fine = usePointerFine()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, CURSOR.spring)
  const ry = useSpring(y, CURSOR.spring)
  const [visible, setVisible] = useState(false)
  const [grow, setGrow] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('has-custom-cursor')
      return
    }
    document.documentElement.classList.add('has-custom-cursor')
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      if (!visible) setVisible(true)
      const t = e.target as Element | null
      const labelled = t?.closest<HTMLElement>('[data-cursor]')
      const next = labelled?.dataset.cursor ?? null
      setLabel((prev) => (prev === next ? prev : next))
      const interactive = !!t?.closest('a, button, [role="button"], input, textarea, select, [data-cursor-grow]')
      setGrow((prev) => (prev === interactive ? prev : interactive))
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled, visible, x, y])

  if (!enabled) return null

  const ringSize = label ? CURSOR.ringActivePx + 16 : grow ? CURSOR.ringActivePx : CURSOR.ringPx

  return (
    <div className="pointer-events-none fixed inset-0 z-cursor" aria-hidden="true">
      <m.div
        className="absolute left-0 top-0 rounded-full bg-amber"
        style={{ x, y, width: CURSOR.dotPx, height: CURSOR.dotPx, translateX: '-50%', translateY: '-50%', opacity: visible && !label ? 1 : 0 }}
      />
      <m.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-amber/80 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ink"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: visible ? 1 : 0,
          backgroundColor: label ? 'rgba(141,198,63,1)' : 'rgba(141,198,63,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {label && <span className="translate-y-px">{label}</span>}
      </m.div>
    </div>
  )
}
