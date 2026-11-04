import { QUALITY_PROFESSIONALISM as Q } from '@/data/home'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/ui/ParallaxImage'

export function QualityProfessionalism() {
  return (
    <Section as="section" aria-label="Quality and professionalism">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <div className="absolute -left-4 -top-4 h-full w-full bg-ochre opacity-70 lg:-left-8 lg:-top-8" aria-hidden="true" />
          <ParallaxImage src={Q.image.src} alt={Q.image.alt} clipReveal frameClassName="aspect-[4/5] md:aspect-[4/3]" className="relative" />
        </div>
        <div className="space-y-12 lg:col-span-5 lg:col-start-8">
          {Q.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <h2 className="font-display text-display-md uppercase text-bone">{item.title}</h2>
              <p className="mt-4 max-w-measure font-body text-body-lg text-bone/75">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
