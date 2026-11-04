import { OPERATING_AREA } from '@/data/home'
import { Section, Eyebrow } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { CtaLink } from '@/components/ui/CtaLink'

export function OperatingArea() {
  return (
    <Section tone="ochre" as="section" aria-labelledby="operating-heading" className="overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 h-[50vw] w-[50vw] rounded-full bg-amber/15 blur-[140px]" aria-hidden="true" />
      <Reveal className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Eyebrow>Operating Area</Eyebrow>
          <h2 id="operating-heading" className="mt-4 max-w-4xl font-display text-display-md uppercase leading-tight text-bone">{OPERATING_AREA.address}</h2>
        </div>
        <div className="lg:col-span-4 lg:text-right">
          <CtaLink to={OPERATING_AREA.cta.href}>{OPERATING_AREA.cta.label}</CtaLink>
        </div>
      </Reveal>
    </Section>
  )
}
