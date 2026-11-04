import { useRef, type ReactNode } from 'react'
import { m } from 'motion/react'
import { FLEET } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: ReactNode
  /** Top-left readout, e.g. "CAT 01". */
  label?: string
  /** Top-right readout, e.g. "52 UNITS". */
  readout?: string
  caption?: string
  className?: string
  /** Animate the contents in with a clip-path iris. */
  reveal?: boolean
}

/**
 * Survey-instrument frame: amber corner brackets, a faint grid, a sweeping
 * scan line and monospaced readouts. Wraps imagery and cards on the fleet page.
 */
export function HudFrame({ children, label, readout, caption, className = '', reveal = true }: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className={`hud-corners border border-steel/70 bg-coal ${className}`} style={{ '--hud-scan': `${FLEET.scanSeconds}s` } as React.CSSProperties}>
      <span className="hud-c" aria-hidden="true" />
      {(label || readout) && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[4] flex items-center justify-between px-4 py-3 font-body text-[11px] font-semibold uppercase text-bone hud-mono" aria-hidden="true">
          <span className="rounded-sm bg-ink/70 px-2 py-1 backdrop-blur-sm">{label}</span>
          <span className="rounded-sm bg-ink/70 px-2 py-1 text-amber backdrop-blur-sm">{readout}</span>
        </div>
      )}
      <m.div
        className="relative h-full w-full overflow-hidden"
        initial={reveal && !reduced ? { clipPath: 'inset(50% 0 50% 0)' } : false}
        animate={{ clipPath: 'inset(0% 0 0% 0)' }}
        transition={{ duration: reduced ? 0 : FLEET.imageReveal.duration, ease: FLEET.imageReveal.ease }}
        onAnimationComplete={() => { if (ref.current) ref.current.style.setProperty('--hud-h', `${ref.current.clientHeight}px`) }}
      >
        {children}
        {!reduced && <span className="hud-scan" aria-hidden="true" />}
      </m.div>
      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex items-end justify-between gap-4 bg-gradient-to-t from-ink/85 to-transparent px-4 pb-3 pt-10" aria-hidden="true">
          <span className="font-body text-[11px] uppercase text-bone/80 hud-mono">{caption}</span>
          <span className="hud-ticks h-2 w-24 opacity-70" />
        </div>
      )}
    </div>
  )
}
