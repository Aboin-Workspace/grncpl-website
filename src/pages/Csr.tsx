import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, m } from 'motion/react'
import { CSR_HUB as H, CSR_PILLARS, CSR_NAV_LABELS } from '@/data/csr'
import { Seo } from '@/components/ui/Seo'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { NumberedList } from '@/components/ui/NumberedList'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { ResponsibilityPyramid } from '@/components/csr/ResponsibilityPyramid'
import { useDisplayLocation } from '@/lib/displayLocation'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`)

/**
 * CSR hub and the six pillar pages share this component so a pillar card can
 * expand in place (Framer layoutId) while the URL changes. Direct visits to a
 * pillar URL render the detail with a fade-in.
 */
export default function Csr() {
  const display = useDisplayLocation()
  const location = useLocation()
  const path = norm((display ?? location).pathname)
  const pillar = CSR_PILLARS.find((p) => p.href === path) ?? null
  const reduced = useReducedMotion()
  const spring = reduced ? { duration: 0.2 } : { type: 'spring' as const, stiffness: 220, damping: 30 }

  return (
    <LayoutGroup id="csr">
      <Seo path={pillar ? pillar.href : '/csr/'} />
      <AnimatePresence mode="popLayout" initial={false}>
        {pillar ? (
          <m.div key={pillar.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Section className="pt-32 md:pt-40">
              <Link to="/csr/" className="font-body text-eyebrow uppercase text-bone/60 hover:text-amber">← All CSR activities</Link>
              <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-6">
                  <Eyebrow>{H.eyebrow}</Eyebrow>
                  <SplitText as="h1" text={pillar.name} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
                  <p className="mt-2 font-display text-display-md uppercase text-amber">{pillar.theme}</p>
                </div>
                <m.div layoutId={reduced ? undefined : `csr-${pillar.slug}`} transition={spring} className="overflow-hidden lg:col-span-6">
                  <ParallaxImage src={pillar.image.src} alt={pillar.image.alt} priority frameClassName="aspect-[4/3]" />
                </m.div>
              </div>
            </Section>
            <Section tone="coal">
              {pillar.intro && (
                <Reveal>
                  <p className="max-w-measure font-body text-body-lg text-bone/85">{pillar.intro}</p>
                </Reveal>
              )}
              <NumberedList items={pillar.items} className="mt-8" />
              {pillar.outro && (
                <Reveal>
                  <p className="mt-10 max-w-measure font-body text-body-lg text-bone/85">{pillar.outro}</p>
                </Reveal>
              )}
            </Section>
            <Section aria-label="Other CSR pillars">
              <Eyebrow>More pillars</Eyebrow>
              <ul className="mt-6 grid gap-3 md:grid-cols-3">
                {CSR_PILLARS.filter((p) => p.slug !== pillar.slug).map((p) => (
                  <li key={p.slug}>
                    <Link to={p.href} className="block border border-steel/70 p-5 font-display text-display-sm uppercase text-bone transition-colors duration-fast hover:border-amber hover:text-amber">{CSR_NAV_LABELS[p.slug]}</Link>
                  </li>
                ))}
              </ul>
            </Section>
          </m.div>
        ) : (
          <m.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Section className="pt-40 md:pt-48">
              <Eyebrow>{H.eyebrow}</Eyebrow>
              <SplitText as="h1" text={H.title} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
            </Section>
            <Section tone="coal" aria-label="The four responsibilities" className="overflow-hidden">
              <div className="pointer-events-none absolute -left-32 top-1/2 h-[60vw] w-[60vw] -translate-y-1/2 rounded-full bg-amber/10 blur-[140px]" aria-hidden="true" />
              {/* Replaces the old stock pyramid image (CSR.jpg) with the same four tiers, drawn live. */}
              <ResponsibilityPyramid className="relative" />
            </Section>
            <Section tone="coal">
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <SplitText as="h2" by="words" text={H.headline} className="font-display text-display-lg uppercase text-bone" />
                </div>
                <Reveal className="lg:col-span-6 lg:col-start-7">
                  <p className="max-w-measure font-body text-body-lg text-bone/80">{H.body}</p>
                </Reveal>
              </div>
              <NumberedList items={H.list} className="mt-16" />
            </Section>
            <Section aria-labelledby="pillars-grid-heading">
              <Eyebrow>Six pillars</Eyebrow>
              <h2 id="pillars-grid-heading" className="mt-4 font-display text-display-lg uppercase text-bone">Where we give back</h2>
              <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {CSR_PILLARS.map((p, i) => (
                  <li key={p.slug}>
                    <m.div whileHover={reduced ? undefined : { y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="group h-full">
                      <Link to={p.href} className="block h-full border border-steel/70 bg-coal transition-colors duration-base hover:border-amber" data-cursor="Open">
                        <m.div layoutId={reduced ? undefined : `csr-${p.slug}`} transition={spring} className="relative aspect-[4/3] overflow-hidden">
                          <img src={p.image.src} alt="" loading={i < 3 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover transition-transform duration-[1.6s] ease-expo-out group-hover:scale-105" />
                          <div className="absolute inset-0 bg-amber/0 transition-colors duration-base group-hover:bg-amber/20" aria-hidden="true" />
                        </m.div>
                        <div className="p-6">
                          <span className="font-display text-display-sm text-amber" aria-hidden="true">0{i + 1}</span>
                          <h3 className="mt-2 font-display text-display-sm uppercase text-bone">{p.name}</h3>
                          <p className="font-body text-eyebrow uppercase text-bone/60">{p.theme}</p>
                        </div>
                      </Link>
                    </m.div>
                  </li>
                ))}
              </ul>
            </Section>
          </m.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
