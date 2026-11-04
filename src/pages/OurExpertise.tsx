import { OUR_EXPERTISE as E } from '@/data/company'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { SplitText } from '@/components/motion/SplitText'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { TiltCard } from '@/components/motion/TiltCard'

export default function OurExpertise() {
  return (
    <>
      <Seo path="/our-expertise/" />
      <EditorialPage eyebrow={E.eyebrow} title={E.title} headline={E.headline} banner={E.images[0]} paragraphs={E.paragraphs}>
        <Section>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <ParallaxImage src={E.images[1].src} alt={E.images[1].alt} frameClassName="aspect-[4/3]" clipReveal />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <SplitText as="h2" text={E.strengths.heading} className="font-display text-display-lg uppercase text-bone" />
              <Reveal stagger className="mt-8 space-y-5">
                {E.strengths.paragraphs.map((p, i) => (
                  <p key={i} className="max-w-measure font-body text-body-lg text-bone/80">{p}</p>
                ))}
              </Reveal>
            </div>
          </div>
        </Section>
        {/* Bento grid: five feature blocks, built once */}
        <Section tone="coal" aria-label="Our strengths">
          <Reveal stagger className="grid gap-4 md:grid-cols-6">
            {E.features.map((f, i) => (
              <TiltCard key={f.title} className={`${i === 0 ? 'md:col-span-4' : i === 1 ? 'md:col-span-2' : i === 2 ? 'md:col-span-2' : i === 3 ? 'md:col-span-2' : 'md:col-span-2'} h-full`}>
                <article className="flex h-full flex-col justify-between border border-steel/70 bg-ink p-7 transition-colors duration-base hover:border-amber/60 md:p-9">
                  <span className="font-display text-display-sm text-amber" aria-hidden="true">0{i + 1}</span>
                  <div className="mt-10">
                    <h3 className="font-display text-display-sm uppercase text-bone">{f.title}</h3>
                    <p className="mt-3 font-body text-sm leading-relaxed text-bone/70">{f.body}</p>
                  </div>
                </article>
              </TiltCard>
            ))}
          </Reveal>
        </Section>
      </EditorialPage>
    </>
  )
}
