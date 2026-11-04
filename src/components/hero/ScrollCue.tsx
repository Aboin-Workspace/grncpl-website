import { HERO } from '@/config/motion'

/** "Scroll" label on the right edge with a thin line and a looping pulse travelling down it. */
export function ScrollCue() {
  return (
    <div data-scroll-cue className="pointer-events-none absolute right-gutter top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex" aria-hidden="true">
      <span className="font-body text-[11px] uppercase text-bone/60 hud-mono [writing-mode:vertical-rl]">Scroll</span>
      <span className="relative block w-px overflow-hidden bg-bone/20" style={{ height: HERO.scrollCue.lineHeightPx }}>
        <span className="cue-pulse absolute inset-x-0 top-0 h-1/3 bg-amber" style={{ ['--cue-duration' as string]: `${HERO.scrollCue.pulseDuration}s` }} />
      </span>
    </div>
  )
}
