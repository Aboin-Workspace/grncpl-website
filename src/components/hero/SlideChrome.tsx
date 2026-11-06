import { forwardRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HeroSlide } from '@/data/home'

interface Props {
  slides: HeroSlide[]
  index: number
  paused: boolean
  onSelect: (i: number) => void
  onPrev: () => void
  onNext: () => void
}

const pad = (n: number) => String(n + 1).padStart(2, '0')

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
  </svg>
)

/**
 * Layer 5 — hero chrome. HUD corner brackets + index readout, and a thumbnail
 * navigator along the bottom: every slide is a card (photo, number, title) and
 * the active card carries the autoplay progress bar (CSS var --p, tweened in
 * Hero.tsx). Prev/next are magnetic buttons at the right end.
 */
export const SlideChrome = forwardRef<HTMLDivElement, Props>(function SlideChrome({ slides, index, paused, onSelect, onPrev, onNext }, ref) {
  const count = slides.length
  const reduced = useReducedMotion()
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-20">
      {/* HUD frame */}
      <div className="hud-corners absolute inset-x-gutter bottom-5 top-24 opacity-60 md:bottom-6 md:top-28" aria-hidden="true">
        <span className="hud-c" />
      </div>
      <div className="absolute right-gutter top-24 flex items-center gap-3 font-body text-[11px] uppercase text-bone/70 hud-mono md:top-28" aria-hidden="true">
        <span className="hud-ticks h-2 w-16 opacity-60" />
        <span className="flex items-center gap-1">
          <span className="relative inline-block h-[1.2em] w-[1.6em] overflow-hidden text-amber">
            <AnimatePresence initial={false}>
              <m.span
                key={index}
                className="absolute inset-0"
                initial={reduced ? { opacity: 0 } : { y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { y: '-100%', opacity: 0 }}
                transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {pad(index)}
              </m.span>
            </AnimatePresence>
          </span>
          <span>/ {pad(count - 1)}</span>
        </span>
      </div>

      {/* Bottom navigator */}
      <div className="pointer-events-auto absolute inset-x-gutter bottom-6 flex items-end gap-4 md:bottom-8 lg:bottom-10">
        <div role="tablist" aria-label="Slides" className="flex w-full gap-2 md:max-w-[58rem] md:gap-3">
          {slides.map((s, i) => {
            const active = i === index
            return (
              <m.button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Slide ${pad(i)}: ${s.title}`}
                onClick={() => onSelect(i)}
                whileHover={reduced || active ? undefined : { y: -4 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                data-cursor-grow
                className={`group relative flex-1 overflow-hidden border text-left backdrop-blur-sm transition-[border-color,background-color] duration-base ${active ? 'border-amber/80 bg-ink/55' : 'border-bone/15 bg-ink/35 hover:border-bone/45'}`}
              >
                <span className="absolute inset-x-0 top-0 z-[2] h-0.5 bg-bone/15" aria-hidden="true">
                  <span
                    data-progress-bar={i}
                    className="absolute inset-0 origin-left bg-amber"
                    style={{ transform: 'scaleX(var(--p, 0))', ['--p' as string]: 0 }}
                    data-paused={paused ? '' : undefined}
                  />
                </span>
                <span className="hidden aspect-[16/6] overflow-hidden md:block" aria-hidden="true">
                  <img src={s.image.srcSmall} alt="" width={320} height={120} loading="lazy" decoding="async" className={`h-full w-full object-cover transition-opacity duration-slow ease-expo-out ${active ? 'thumb-live opacity-100' : 'opacity-55 group-hover:opacity-90'}`} />
                </span>
                <span className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3">
                  <span className={`font-body text-[11px] hud-mono ${active ? 'text-amber' : 'text-bone/50 group-hover:text-bone'}`}>{pad(i)}</span>
                  <span className={`hidden truncate font-display text-[1.05rem] uppercase tracking-[0.04em] transition-colors duration-fast md:block ${active ? 'text-bone' : 'text-bone/60 group-hover:text-bone'}`}>{s.title}</span>
                </span>
              </m.button>
            )
          })}
        </div>
        <div className="ml-auto hidden shrink-0 gap-2 md:flex">
          <MagneticButton onClick={onPrev} aria-label="Previous slide" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-amber hover:text-amber">
            <Chevron dir="left" />
          </MagneticButton>
          <MagneticButton onClick={onNext} aria-label="Next slide" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-amber hover:text-amber">
            <Chevron dir="right" />
          </MagneticButton>
        </div>
      </div>
    </div>
  )
})
