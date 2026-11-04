import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { REVEAL, DURATION } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Animate direct children with a stagger instead of the wrapper. */
  stagger?: boolean
  delay?: number
  /** ScrollTrigger start. */
  start?: string
  y?: number
}

/**
 * ScrollTrigger-driven fade/rise. Fires once. Under reduced motion it renders
 * visible with a short CSS fade on mount.
 */
export function Reveal({ children, as: Tag = 'div', className = '', stagger = false, delay = 0, start = REVEAL.start, y = REVEAL.y }: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      const targets = stagger ? Array.from(el.children) : [el]
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: REVEAL.duration,
          ease: REVEAL.ease,
          delay,
          stagger: stagger ? REVEAL.stagger : 0,
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start, once: true },
        },
      )
    },
    { scope: ref, dependencies: [reduced, stagger] },
  )

  return (
    <Tag ref={ref} className={className} style={reduced ? { animation: `reveal-fade ${DURATION.reducedFade}s ease both` } : undefined}>
      {children}
    </Tag>
  )
}
