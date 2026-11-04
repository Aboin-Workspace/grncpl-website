import { ABOUT_US as A } from '@/data/company'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { NumberedList } from '@/components/ui/NumberedList'
import { SplitText } from '@/components/motion/SplitText'
import { KeyValuesWheel } from '@/components/company/KeyValuesWheel'

export default function AboutUs() {
  return (
    <>
      <Seo path="/about-us/" />
      <EditorialPage eyebrow={A.eyebrow} title={A.title} headline={A.headline} banner={A.banner} paragraphs={A.paragraphs} lists={[A.coreDrivers]}>
        <Section tone="coal">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-10">
            {[A.vision, A.mission].map((col) => (
              <div key={col.heading}>
                <Reveal>
                  <h2 className="font-display text-display-md uppercase text-amber">{col.heading}</h2>
                </Reveal>
                <NumberedList items={col.items} className="mt-6" />
              </div>
            ))}
          </div>
        </Section>
        <Section aria-label={A.keyValues.title} className="overflow-hidden">
          <div className="pointer-events-none absolute -right-32 top-1/2 h-[55vw] w-[55vw] -translate-y-1/2 rounded-full bg-amber/10 blur-[140px]" aria-hidden="true" />
          {/* Replaces the old values.png wheel with the same six values, drawn live. */}
          <KeyValuesWheel className="relative" />
        </Section>
        <Section>
          <SplitText as="h2" text={A.strengths.heading} className="font-display text-display-lg uppercase text-bone" />
          <Reveal>
            <p className="mt-8 max-w-measure font-body text-body-lg text-bone/80">{A.strengths.body}</p>
          </Reveal>
        </Section>
      </EditorialPage>
    </>
  )
}
