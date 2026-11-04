import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { PILLARS as P } from '@/config/motion'
import { PILLARS } from '@/data/home'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Reveal } from '@/components/motion/Reveal'
import { Section, Eyebrow } from '@/components/layout/Section'

/**
 * Pinned 300vh section: each pillar is a full-height panel. The giant index
 * number drifts across behind, titles mask-reveal, copy fades, the rail fills.
 * Below md (or reduced motion) it is a plain stacked list.
 */
export function Pillars() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const desktop = useIsDesktop()
  const pinned = desktop && !reduced

  useGSAP(
    () => {
      if (!pinned || !root.current) return
      // Scoped to this section: the page-transition wipe also uses [data-panel].
      const panels = Array.from(root.current.querySelectorAll<HTMLElement>('[data-panel]'))
      const indices = Array.from(root.current.querySelectorAll<HTMLElement>('[data-index]'))
      const rail = root.current.querySelector<HTMLElement>('[data-rail]')
      const n = panels.length
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${P.pinScrollPercent}%`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      })
      // One keyframed tween per element (enter → hold → exit) so nothing relies on
      // overwrite rules or refresh re-recording: the previous panel always leaves.
      const hold = (from: number, to: number) => ({ duration: Math.max(0.01, to - from) })
      panels.forEach((panel, i) => {
        const title = panel.querySelector('[data-title]')
        const body = panel.querySelectorAll('[data-body], [data-meta]')
        const at = i
        const first = i === 0
        const last = i === n - 1
        // GSAP owns the transform (an inline translateY(110%) would be read back as a px offset and stack).
        gsap.set(title, { y: 0, yPercent: first ? 0 : 110 })
        gsap.set(body, { opacity: first ? 1 : 0, y: first ? 0 : 24 })
        gsap.set(indices[i], { opacity: first ? 1 : 0 })
        tl.to(title, { overwrite: false, keyframes: [
          ...(first ? [] : [{ yPercent: 0, duration: 0.45, ease: 'power2.out' }]),
          { yPercent: 0, ...hold(first ? 0 : 0.45, 0.65) },
          ...(last ? [] : [{ yPercent: -110, duration: 0.4, ease: 'power2.in' }]),
        ] }, at)
        tl.to(body, { overwrite: false, keyframes: [
          ...(first ? [] : [{ opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }]),
          { opacity: 1, y: 0, ...hold(first ? 0.1 : 0.5, 0.65) },
          ...(last ? [] : [{ opacity: 0, y: -16, duration: 0.3, ease: 'power2.in' }]),
        ] }, at + 0.1)
        tl.to(indices[i], { overwrite: false, keyframes: [
          ...(first ? [] : [{ opacity: 1, duration: 0.3 }]),
          { opacity: 1, ...hold(first ? 0 : 0.3, 0.7) },
          ...(last ? [] : [{ opacity: 0, duration: 0.3 }]),
        ] }, at)
        tl.fromTo(indices[i], { xPercent: P.indexDrift.from }, { xPercent: P.indexDrift.to, duration: 1, overwrite: false }, at)
      })
      if (rail) tl.fromTo(rail, { scaleY: 0 }, { scaleY: 1, duration: n - 0.3, transformOrigin: '50% 0%' }, 0)
    },
    { scope: root, dependencies: [pinned] },
  )

  if (!pinned) {
    return (
      <Section as="section" aria-labelledby="pillars-heading" tone="coal">
        <Eyebrow>What drives us</Eyebrow>
        <h2 id="pillars-heading" className="sr-only">Commitment, Professionals, Technology</h2>
        <div className="mt-8 grid gap-12 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title}>
              <span className="font-display text-display-lg text-outline" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-display text-display-md uppercase text-bone">{p.title}</h3>
              <p className="mt-4 font-body text-body-lg text-bone/75">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    )
  }

  return (
    <section ref={root} className="relative h-screen overflow-hidden bg-coal" aria-labelledby="pillars-heading">
      <h2 id="pillars-heading" className="sr-only">Commitment, Professionals, Technology</h2>
      {/* Giant indices */}
      {PILLARS.map((p, i) => (
        <span
          key={p.title}
          data-index
          aria-hidden="true"
          className="pointer-events-none absolute right-[4vw] top-1/2 -translate-y-1/2 font-display text-[36vw] leading-none text-outline opacity-[0.35]"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          {String(i + 1).padStart(2, '0')}
        </span>
      ))}
      {/* Rail */}
      <div className="absolute left-gutter top-1/2 h-[40vh] w-px -translate-y-1/2 bg-steel" aria-hidden="true">
        <div data-rail className="absolute inset-0 origin-top bg-amber" style={{ transform: 'scaleY(0)' }} />
      </div>
      {/* Panels */}
      <div className="absolute inset-0 mx-auto max-w-[1440px] px-gutter">
        {PILLARS.map((p, i) => (
          <article key={p.title} data-panel className="absolute inset-y-0 left-[calc(var(--gutter)+3rem)] right-gutter flex max-w-3xl flex-col justify-center">
            <div data-meta style={{ opacity: i === 0 ? 1 : 0 }}>
              <Eyebrow>What drives us · 0{i + 1}</Eyebrow>
            </div>
            <div className="mt-4 overflow-hidden pb-2">
              <h3 data-title className="font-display text-[clamp(4rem,9vw,9rem)] uppercase leading-[0.9] text-bone">
                {p.title}
              </h3>
            </div>
            <p data-body className="mt-6 max-w-measure font-body text-body-lg text-bone/75" style={{ opacity: i === 0 ? 1 : 0 }}>
              {p.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
