import { forwardRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HeroSlide } from '@/data/home'

interface Props {
  slides: HeroSlide[]
  index: number
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
 * Chrome for the 3D world hero: HUD brackets, depth readout, and a slim stage
 * rail (number + title + progress line per stage) instead of photo cards, since
 * the world itself is the picture. Progress bars carry the --p var set in WorldHero.
 */
export const StageRail = forwardRef<HTMLDivElement, Props>(function StageRail({ slides, index, onSelect, onPrev, onNext }, ref) {
  const reduced = useReducedMotion()
  const n = slides.length
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-20">
      <div className="hud-corners absolute inset-x-gutter bottom-5 top-24 opacity-60 md:bottom-6 md:top-28" aria-hidden="true"><span className="hud-c" /></div>
      <div className="absolute right-gutter top-24 flex items-center gap-3 font-body text-[11px] uppercase text-bone/70 hud-mono md:top-28" aria-hidden="true">
        <span className="hud-ticks h-2 w-16 opacity-60" />
        <span className="flex items-center gap-1">
          <span className="relative inline-block h-[1.2em] w-[1.6em] overflow-hidden text-amber">
            <AnimatePresence initial={false}>
              <m.span key={index} className="absolute inset-0" initial={reduced ? { opacity: 0 } : { y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={reduced ? { opacity: 0 } : { y: '-100%', opacity: 0 }} transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}>{pad(index)}</m.span>
            </AnimatePresence>
          </span>
          <span>/ {pad(n - 1)}</span>
        </span>
      </div>

      <div className="pointer-events-auto absolute inset-x-gutter bottom-6 flex items-end gap-6 md:bottom-8 lg:bottom-10">
        <div role="tablist" aria-label="Stages" className="flex w-full max-w-[52rem] gap-5 md:gap-8">
          {slides.map((s, i) => {
            const active = i === index
            return (
              <button key={s.title} type="button" role="tab" aria-selected={active} aria-label={`Stage ${pad(i)}: ${s.title}`} onClick={() => onSelect(i)} data-cursor-grow className="group flex-1 text-left">
                <span className="relative block h-px w-full bg-bone/20" aria-hidden="true">
                  <span data-progress-bar={i} className="absolute inset-0 origin-left bg-amber shadow-[0_0_10px_rgb(var(--c-amber)/0.7)]" style={{ transform: 'scaleX(var(--p, 0))', ['--p' as string]: 0 }} />
                </span>
                <span className="mt-3 flex items-baseline gap-2">
                  <span className={`font-body text-[11px] hud-mono transition-colors duration-fast ${active ? 'text-amber' : 'text-bone/45 group-hover:text-bone/80'}`}>{pad(i)}</span>
                  <span className={`hidden truncate font-display text-[0.95rem] uppercase tracking-[0.06em] transition-colors duration-fast md:block ${active ? 'text-bone' : 'text-bone/45 group-hover:text-bone/80'}`}>{s.title}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="ml-auto hidden shrink-0 gap-2 md:flex">
          <MagneticButton onClick={onPrev} aria-label="Previous stage" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-amber hover:text-amber"><Chevron dir="left" /></MagneticButton>
          <MagneticButton onClick={onNext} aria-label="Next stage" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-amber hover:text-amber"><Chevron dir="right" /></MagneticButton>
        </div>
      </div>
    </div>
  )
})
