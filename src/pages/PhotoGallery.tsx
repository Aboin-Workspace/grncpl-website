import { GALLERY as G } from '@/data/contact'
import { Seo } from '@/components/ui/Seo'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { Section, Eyebrow } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { SplitText } from '@/components/motion/SplitText'

export default function PhotoGallery() {
  return (
    <>
      <Seo path="/photo-gallery/" />
      <ComingSoon eyebrow="Gallery" title={G.title} label={G.comingSoon}>
        <Section tone="coal" aria-labelledby="award-heading">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Eyebrow>Recognition</Eyebrow>
              <SplitText as="h2" by="words" text={G.award.heading} className="mt-4 font-display text-display-lg uppercase text-bone" />
              <span id="award-heading" className="sr-only">{G.award.heading}</span>
            </div>
            <Reveal stagger className="space-y-8 lg:col-span-6">
              <p className="max-w-measure font-body text-body-lg text-bone/80">{G.award.body}</p>
              <div className="border-l-2 border-amber pl-6">
                <h3 className="font-display text-display-sm uppercase text-amber">{G.award.recognition.heading}</h3>
                <p className="mt-2 max-w-measure font-body text-body-lg text-bone/80">{G.award.recognition.body}</p>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-16">
            <h3 className="font-display text-display-md uppercase text-bone">{G.award.highlightsHeading}</h3>
            {/* TODO(client): award ceremony photos. Placeholder grid until supplied. */}
            <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Award ceremony photos (pending)">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex aspect-[4/3] items-center justify-center border border-dashed border-steel font-body text-xs uppercase tracking-[0.18em] text-bone/60">Photo pending</li>
              ))}
            </ul>
          </Reveal>
        </Section>
      </ComingSoon>
    </>
  )
}
