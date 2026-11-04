import { STATS } from '@/data/home'
import { Section } from '@/components/layout/Section'
import { Counter } from '@/components/motion/Counter'
import { Reveal } from '@/components/motion/Reveal'

/** Count-ups on entry: 1983, 1800+, 400+, 1.5 lakh m³/day, 3 ISO. */
export function StatsBand() {
  return (
    <Section tone="coal" as="section" aria-label="Key numbers" className="overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/10 blur-[120px]" aria-hidden="true" />
      <Reveal stagger className="relative grid gap-10 md:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s) => (
          <div key={s.label} className="border-l border-steel/80 pl-5">
            <p className="font-display text-[clamp(3rem,6vw,6rem)] leading-none text-bone">
              <Counter value={s.value} decimals={'decimals' in s ? s.decimals : 0} suffix={'suffix' in s ? s.suffix : ''} format={'format' in s && s.format === 'year' ? 'plain' : 'grouped'} smallSuffix={'suffix' in s && s.suffix.length > 2} />
            </p>
            <p className="mt-4 font-body text-eyebrow uppercase text-bone/60">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </Section>
  )
}
