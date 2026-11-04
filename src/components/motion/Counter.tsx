import { useMemo, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { COUNTER } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** 'plain' = no thousands grouping (years). */
  format?: 'grouped' | 'plain'
  className?: string
  /** Draw a thin amber underline when the roll completes. */
  underline?: boolean
  start?: string
  /** Render the suffix smaller (e.g. units after a big number). */
  smallSuffix?: boolean
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * Odometer counter. Each digit is a vertical strip of 0–9 that rolls to its
 * final value, staggered from the right. Fires once on scroll entry. The final
 * value is in the DOM for assistive tech; the rolling strips are aria-hidden.
 */
export function Counter({ value, decimals = 0, prefix = '', suffix = '', format = 'grouped', className = '', underline = true, start = COUNTER.start, smallSuffix = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const text = useMemo(() => {
    const fixed = value.toFixed(decimals)
    if (format === 'plain') return fixed
    const [int, dec] = fixed.split('.')
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? `.${dec}` : '')
  }, [value, decimals, format])

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      const strips = Array.from(el.querySelectorAll<HTMLElement>('[data-strip]'))
      const line = el.querySelector<HTMLElement>('[data-underline]')
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } })
      tl.to(strips, {
        yPercent: (_i, t) => -Number((t as HTMLElement).dataset.strip) * 10,
        duration: COUNTER.duration,
        ease: COUNTER.ease,
        stagger: { each: COUNTER.digitStagger, from: 'end' },
      })
      if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: COUNTER.underline.duration, ease: COUNTER.underline.ease, transformOrigin: '0% 50%' }, '-=0.3')
    },
    { scope: ref, dependencies: [reduced, text] },
  )

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      <span className="sr-only">{`${prefix}${text}${suffix}`}</span>
      <span aria-hidden="true" className="inline-flex items-baseline whitespace-pre leading-none">
        {prefix}
        {text.split('').map((ch, i) =>
          reduced || !/\d/.test(ch) ? (
            <span key={i}>{ch}</span>
          ) : (
            <span key={i} className="inline-block h-[1em] overflow-hidden align-baseline">
              <span data-strip={ch} className="flex flex-col leading-none will-change-transform">
                {DIGITS.map((d) => (
                  <span key={d} className="block h-[1em]">{d}</span>
                ))}
              </span>
            </span>
          ),
        )}
        {smallSuffix ? <span className="ml-[0.15em] text-[0.32em] uppercase tracking-[0.08em] text-bone/80">{suffix}</span> : suffix}
      </span>
      {underline && <span data-underline className="absolute -bottom-2 left-0 h-px w-full bg-amber" style={reduced ? undefined : { transform: 'scaleX(0)' }} />}
    </span>
  )
}
