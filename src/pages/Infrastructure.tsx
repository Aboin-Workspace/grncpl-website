import { INFRASTRUCTURE as I } from '@/data/operations'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'
import { Section } from '@/components/layout/Section'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { Counter } from '@/components/motion/Counter'
import { Reveal } from '@/components/motion/Reveal'

export default function Infrastructure() {
  return (
    <>
      <Seo path="/infrastructure/" />
      <EditorialPage eyebrow={I.eyebrow} title={I.title} headline={I.headline} banner={I.images[0]} paragraphs={I.paragraphs}>
        <Section>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-5">
              <p className="font-display text-[clamp(4rem,9vw,9rem)] leading-none text-bone">
                <Counter value={1.5} decimals={1} />
              </p>
              <p className="mt-4 font-body text-eyebrow uppercase text-amber">lakh cubic meters per day</p>
              <p className="mt-2 font-body text-base text-bone/60">Average earthwork execution capability</p>
            </Reveal>
            <div className="lg:col-span-7">
              <ParallaxImage src={I.images[1].src} alt={I.images[1].alt} frameClassName="aspect-[3/2]" />
            </div>
          </div>
        </Section>
      </EditorialPage>
    </>
  )
}
