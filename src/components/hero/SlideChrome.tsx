import { forwardRef } from 'react'
import { MagneticButton } from '@/components/motion/MagneticButton'

interface Props {
  count: number
  index: number
  paused: boolean
  onSelect: (i: number) => void
  onPrev: () => void
  onNext: () => void
}

const pad = (n: number) => String(n + 1).padStart(2, '0')

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
  </svg>
)

/**
 * Layer 5 — slide indicator (01–04 with a CSS-variable progress bar that Hero.tsx
 * tweens), magnetic prev/next buttons.
 */
export const SlideChrome = forwardRef<HTMLDivElement, Props>(function SlideChrome({ count, index, paused, onSelect, onPrev, onNext }, ref) {
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-20">
      {/* Indicator: vertical right on desktop, horizontal bottom on mobile */}
      <div
        className="pointer-events-auto absolute inset-x-gutter bottom-[4.5rem] flex items-end gap-3 md:bottom-[5.5rem] lg:inset-x-auto lg:bottom-auto lg:right-gutter lg:top-1/2 lg:-translate-y-1/2 lg:flex-col lg:items-end lg:gap-5"
        role="tablist"
        aria-label="Slides"
      >
        {Array.from({ length: count }).map((_, i) => {
          const active = i === index
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Slide ${pad(i)}`}
              onClick={() => onSelect(i)}
              className="group flex flex-1 items-end gap-2 py-2 lg:flex-none lg:flex-row-reverse lg:items-center lg:gap-3 lg:py-0"
            >
              <span className={`font-display text-sm tracking-[0.12em] transition-colors duration-fast ${active ? 'text-amber' : 'text-bone/50 group-hover:text-bone'}`}>{pad(i)}</span>
              <span className="relative block h-px w-full overflow-hidden bg-bone/20 lg:h-10 lg:w-px" aria-hidden="true">
                <span
                  data-progress-bar={i}
                  className="absolute inset-0 origin-left bg-amber lg:origin-top"
                  style={{ transform: 'scaleX(var(--p, 0))', ['--p' as string]: 0 }}
                  data-paused={paused ? '' : undefined}
                />
              </span>
            </button>
          )
        })}
      </div>

      {/* Prev / next */}
      <div className="pointer-events-auto absolute bottom-6 right-gutter flex gap-2 md:bottom-8 lg:bottom-10">
        <MagneticButton onClick={onPrev} aria-label="Previous slide" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-safety hover:text-safety">
          <Chevron dir="left" />
        </MagneticButton>
        <MagneticButton onClick={onNext} aria-label="Next slide" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-safety hover:text-safety">
          <Chevron dir="right" />
        </MagneticButton>
      </div>
    </div>
  )
})
