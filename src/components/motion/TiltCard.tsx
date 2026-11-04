import { useRef, type ReactNode, type PointerEvent } from 'react'
import { m, useMotionValue, useSpring, useTransform } from 'motion/react'
import { TILT } from '@/config/motion'
import { usePointerFine } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: ReactNode
  className?: string
  maxDeg?: number
  cursorLabel?: string
}

/** Pointer-following 3D tilt (Framer motion values). Off for touch / reduced motion. */
export function TiltCard({ children, className = '', maxDeg = TILT.maxDeg, cursorLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = usePointerFine()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [maxDeg, -maxDeg]), TILT.spring)
  const ry = useSpring(useTransform(px, [0, 1], [-maxDeg, maxDeg]), TILT.spring)

  const onMove = (e: PointerEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <m.div
      ref={ref}
      className={className}
      style={enabled ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 1000 } : undefined}
      whileHover={enabled ? { scale: TILT.scale } : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor={cursorLabel}
    >
      {children}
    </m.div>
  )
}
