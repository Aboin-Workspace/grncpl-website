import { m, useScroll, useSpring } from 'motion/react'

/** Thin amber reading-progress bar. Driven by Motion's useScroll (native ScrollTimeline where supported). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.4 })
  return <m.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-amber" style={{ scaleX }} />
}
