import { useMemo, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { NATION } from '@/config/motion'
import { NATION_BUILDING } from '@/data/home'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { token } from '@/lib/theme'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { CtaLink } from '@/components/ui/CtaLink'
import { ParallaxImage } from '@/components/ui/ParallaxImage'

/** Resting word colour (≥4.5:1 on both themes) before the scrub lifts it to bone. */
const NATION_START = 'rgb(var(--c-bone) / 0.48)'

const strip = (w: string) => w.replace(/[^\w&]/g, '').toLowerCase()

/** Word-by-word highlight scrubbed to scroll: steel → bone, key domains land in amber. */
export function NationBuilding() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const N = NATION_BUILDING

  const words = useMemo(() => {
    const tokens = N.body.split(' ')
    const flags = new Array<boolean>(tokens.length).fill(false)
    for (const domain of N.keyDomains) {
      const parts = domain.split(' ').map(strip)
      for (let i = 0; i <= tokens.length - parts.length; i++) {
        if (parts.every((p, j) => strip(tokens[i + j]) === p)) parts.forEach((_, j) => (flags[i + j] = true))
      }
    }
    return tokens.map((t, i) => ({ t, key: flags[i] }))
  }, [N.body, N.keyDomains])

  useGSAP(
    () => {
      if (reduced || !root.current) return
      const spans = gsap.utils.toArray<HTMLElement>('[data-word]')
      gsap.to(spans, {
        color: (_i, el) => ((el as HTMLElement).dataset.key ? token('amber') : token('bone')),
        stagger: NATION.wordStagger,
        ease: 'none',
        scrollTrigger: { trigger: root.current.querySelector('[data-copy]'), start: NATION.start, end: NATION.end, scrub: NATION.scrub },
      })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <Section as="section" aria-labelledby="nation-heading">
      <div ref={root as React.RefObject<HTMLDivElement>} className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>Nation building</Eyebrow>
          <SplitText as="h2" by="words" text={N.title} className="mt-4 font-display text-display-lg uppercase text-bone" />
          <div id="nation-heading" className="sr-only">{N.title}</div>
          <div className="mt-10">
            <CtaLink to={N.cta.href}>{N.cta.label}</CtaLink>
          </div>
        </div>
        <div className="lg:col-span-7">
          <p data-copy className="font-body text-[clamp(1.25rem,2.1vw,2rem)] leading-[1.45]" style={reduced ? { color: 'var(--bone)' } : undefined}>
            {words.map((w, i) => (
              <span key={i} data-word data-key={w.key ? '1' : undefined} className={reduced && w.key ? 'text-amber' : undefined} style={reduced ? undefined : { color: NATION_START }}>
                {w.t}{' '}
              </span>
            ))}
          </p>
          {/* TODO(client): no video URL was exposed on the old site. Poster only until confirmed. */}
          <ParallaxImage src={N.videoPoster} alt="GRN Constructions at work" className="mt-14" frameClassName="aspect-[16/9]" />
        </div>
      </div>
    </Section>
  )
}
