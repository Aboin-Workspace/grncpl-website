import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { PARALLAX } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  src: string
  alt: string
  className?: string
  /** Aspect classes for the frame, e.g. 'aspect-[16/9]'. */
  frameClassName?: string
  priority?: boolean
  /** Clip-path reveal from the right (amber side) on scroll entry. */
  clipReveal?: boolean
}

/** Image on a scroll parallax (yPercent) with a slow Ken Burns zoom and vignette. */
export function ParallaxImage({ src, alt, className = '', frameClassName = 'aspect-[16/10]', priority = false, clipReveal = false }: Props) {
  const frame = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !frame.current || !img.current) return
      gsap.fromTo(
        img.current,
        { yPercent: -PARALLAX.imageYPercent / 2 },
        { yPercent: PARALLAX.imageYPercent / 2, ease: 'none', scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      gsap.to(img.current, { scale: PARALLAX.zoomScale, duration: PARALLAX.zoomDuration, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      if (clipReveal) {
        gsap.fromTo(frame.current, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: frame.current, start: 'top 80%', once: true } })
      }
    },
    { scope: frame, dependencies: [reduced, clipReveal] },
  )

  return (
    <div ref={frame} className={`relative overflow-hidden bg-coal ${frameClassName} ${className}`}>
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 h-[115%] w-full -translate-y-[7%] scale-[1.02] object-cover will-change-transform"
      />
      <div className="pointer-events-none absolute inset-0 bg-vignette" aria-hidden="true" />
    </div>
  )
}
