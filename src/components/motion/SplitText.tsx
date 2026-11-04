import { useLayoutEffect, useRef, type ElementType } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { splitText, type SplitResult } from '@/lib/split'
import { REVEAL } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  text: string
  as?: ElementType
  className?: string
  /** 'chars' for display headlines, 'words' for longer lines. */
  by?: 'chars' | 'words'
  accentWords?: string[]
  /** Start the reveal immediately on mount instead of on scroll. */
  immediate?: boolean
  delay?: number
  start?: string
}

/**
 * Masked text reveal: lines are overflow-hidden rows and chars/words rise in
 * with a stagger when the element scrolls into view. Screen readers get the
 * intact sentence (see lib/split.ts).
 */
export function SplitText({ text, as: Tag = 'h2', className = '', by = 'chars', accentWords, immediate = false, delay = 0, start = REVEAL.start }: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let split: SplitResult | null = null
    let tween: gsap.core.Tween | null = null
    let cancelled = false
    const M = REVEAL.mask
    document.fonts.ready.then(() => {
      if (cancelled) return
      split = splitText(el, { accentWords, accentClass: 'text-amber' })
      const targets = by === 'chars' ? split.chars : split.words
      tween = gsap.fromTo(
        targets,
        { yPercent: M.yPercent },
        {
          yPercent: 0,
          duration: M.duration,
          stagger: by === 'chars' ? M.stagger : M.stagger * 3,
          ease: M.ease,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
        },
      )
      ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
      tween?.scrollTrigger?.kill()
      tween?.kill()
      split?.revert()
    }
  }, [text, by, accentWords, immediate, delay, start, reduced])

  if (reduced) {
    return (
      <Tag ref={ref} className={className}>
        {accentWords?.length
          ? text.split(' ').map((w, i, arr) => (
              <span key={i} className={accentWords.includes(w) ? 'text-amber' : undefined}>
                {w}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))
          : text}
      </Tag>
    )
  }
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
