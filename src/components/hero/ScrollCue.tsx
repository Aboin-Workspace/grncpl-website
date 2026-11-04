import { HERO } from '@/config/motion'

/** "Scroll" label with a thin line and a looping amber pulse travelling down it. */
export function ScrollCue() {
  return (
    <div data-scroll-cue className="pointer-events-none absolute bottom-6 left-gutter z-20 flex items-end gap-3 md:bottom-8 lg:bottom-10" aria-hidden="true">
      <span className="relative block w-px overflow-hidden bg-bone/20" style={{ height: HERO.scrollCue.lineHeightPx }}>
        <span className="cue-pulse absolute inset-x-0 top-0 h-1/3 bg-amber" style={{ ['--cue-duration' as string]: `${HERO.scrollCue.pulseDuration}s` }} />
      </span>
      <span className="font-body text-eyebrow uppercase text-bone/60">Scroll</span>
    </div>
  )
}
