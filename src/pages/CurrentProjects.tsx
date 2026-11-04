import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { CURRENT_PROJECTS, CURRENT_PROJECTS_COLUMNS as COL, CURRENT_PROJECTS_TITLE } from '@/data/projects'
import { Seo } from '@/components/ui/Seo'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { Counter } from '@/components/motion/Counter'
import { TiltCard } from '@/components/motion/TiltCard'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function CurrentProjects() {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useGSAP(
    () => {
      if (reduced) return
      gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((rule) => {
        gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.out', transformOrigin: '0% 50%', scrollTrigger: { trigger: rule, start: 'top 85%', once: true } })
      })
    },
    { scope: root, dependencies: [reduced] },
  )
  return (
    <>
      <Seo path="/current-projects/" />
      <Section className="pt-40 md:pt-48">
        <Eyebrow>Works</Eyebrow>
        <SplitText as="h1" text={CURRENT_PROJECTS_TITLE} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
        <div ref={root} className="mt-16 grid gap-6 lg:grid-cols-3">
          {CURRENT_PROJECTS.map((p) => (
            <Reveal key={p.sno}>
            <TiltCard maxDeg={4} className="h-full">
            <article className="relative flex h-full min-h-[26rem] flex-col justify-between border border-transparent bg-coal p-7 transition-colors duration-base hover:border-amber/50 md:p-9">
              <span data-rule className="absolute inset-x-0 top-0 h-0.5 bg-amber" aria-hidden="true" style={reduced ? undefined : { transform: 'scaleX(0)' }} />
              <div>
                <span className="font-display text-display-sm text-amber" aria-hidden="true">0{p.sno}</span>
                <h2 className="mt-4 font-display text-display-sm uppercase leading-tight text-bone">{p.name}</h2>
              </div>
              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-steel/70 pt-6">
                <div>
                  <dt className="font-body text-[11px] uppercase tracking-[0.18em] text-bone/50">{COL.quantity}</dt>
                  <dd className="mt-2 font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-bone"><Counter value={p.quantity} decimals={2} underline={false} /></dd>
                </div>
                <div>
                  <dt className="font-body text-[11px] uppercase tracking-[0.18em] text-bone/50">{COL.startYear}</dt>
                  <dd className="mt-2 font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-amber"><Counter value={p.startYear} format="plain" underline={false} /></dd>
                </div>
              </dl>
            </article>
            </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}
