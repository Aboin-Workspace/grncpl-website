import { useEffect, useState } from 'react'
import { Hero } from '@/components/hero/Hero'
import { Cursor } from '@/components/motion/Cursor'
import { Grain } from '@/components/motion/Grain'
import { HERO_SLIDES, HERO_SUBTEXT } from '@/data/home'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Review harness for the hero. Query params:
 *   ?fallback=1  force the non-WebGL fallback layer
 *   ?rm=1        force reduced motion (sets <html data-reduced-motion="1">)
 *   ?nostart=1   keep the headline gated (simulates the preloader not finished)
 */
// Apply the reduced-motion override before the first render so hooks read it synchronously.
if (new URLSearchParams(window.location.search).get('rm') === '1') document.documentElement.dataset.reducedMotion = '1'

export default function HeroDev() {
  const params = new URLSearchParams(window.location.search)
  const fallback = params.get('fallback') === '1'
  const rm = params.get('rm') === '1'
  const [started, setStarted] = useState(params.get('nostart') !== '1')
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (!rm) delete document.documentElement.dataset.reducedMotion
    ScrollTrigger.refresh()
    // Review hooks: slow the clock from devtools with __gsap.globalTimeline.timeScale(0.1)
    Object.assign(window as unknown as Record<string, unknown>, { __gsap: gsap, __ST: ScrollTrigger })
    let frames = 0
    let last = performance.now()
    let raf = 0
    const tick = (t: number) => {
      frames++
      if (t - last >= 1000) {
        setFps(frames)
        frames = 0
        last = t
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [rm])

  const set = (key: string, on: boolean) => {
    const p = new URLSearchParams(window.location.search)
    if (on) p.set(key, '1')
    else p.delete(key)
    window.location.search = p.toString()
  }

  return (
    <>
      <Grain />
      <Cursor />
      <main className="theme-dark">
        <Hero slides={HERO_SLIDES} subtext={HERO_SUBTEXT} started={started} forceFallback={fallback} />
        {/* Stand-in for the Pillars section so the exit scrub reads against a next section. */}
        <section className="relative z-10 bg-coal px-gutter py-section-y">
          <p className="font-body text-eyebrow uppercase text-amber">Next section</p>
          <h2 className="mt-4 font-display text-display-lg uppercase text-bone">Commitment</h2>
          <p className="mt-6 max-w-measure text-body-lg text-bone/70">Placeholder so the hero's exit scrub has a section to converge into. Replaced by the Pillars section in the next step.</p>
          <div className="h-[120vh]" />
        </section>
      </main>

      <div className="fixed top-2 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-steel bg-coal/90 px-3 py-1.5 font-body text-[11px] text-bone/80 backdrop-blur" data-lenis-prevent>
        <span className="tabular-nums">{fps} fps</span>
        <button type="button" onClick={() => set('fallback', !fallback)} className={`rounded px-2 py-0.5 ${fallback ? 'bg-amber text-ink' : 'bg-steel'}`}>fallback</button>
        <button type="button" onClick={() => set('rm', !rm)} className={`rounded px-2 py-0.5 ${rm ? 'bg-amber text-ink' : 'bg-steel'}`}>reduced motion</button>
        {!started && (
          <button type="button" onClick={() => setStarted(true)} className="rounded bg-safety px-2 py-0.5 text-ink">start</button>
        )}
      </div>
    </>
  )
}
