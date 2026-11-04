import { CONTACT as C, OFFICES } from '@/data/contact'
import { Seo } from '@/components/ui/Seo'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { OfficeCard } from '@/components/ui/OfficeCard'
import { ContactForm } from '@/components/ui/ContactForm'

export default function ContactUs() {
  return (
    <>
      <Seo path="/contact-us/" localBusiness />
      <Section className="pt-40 md:pt-48">
        <Eyebrow>Get in touch</Eyebrow>
        <SplitText as="h1" text={C.title} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
        <Reveal stagger className="mt-14 grid gap-4 md:grid-cols-2">
          {OFFICES.map((o) => (
            <OfficeCard key={o.id} office={o} />
          ))}
        </Reveal>
      </Section>
      <Section tone="coal">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h2 className="font-display text-display-lg uppercase text-bone">{C.getInTouch.heading}</h2>
            <p className="mt-6 max-w-measure font-body text-body-lg text-bone/80">{C.getInTouch.body}</p>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <ContactForm />
          </Reveal>
        </div>
      </Section>
      <Section aria-label="Map">
        {/* TODO(client): map embed URL (CONTACT.mapEmbedUrl) */}
        {C.mapEmbedUrl ? (
          <iframe src={C.mapEmbedUrl} title="Map" className="aspect-[16/7] w-full border-0" loading="lazy" />
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center border border-dashed border-steel bg-coal font-body text-sm uppercase tracking-[0.18em] text-bone/60">Map pending</div>
        )}
      </Section>
    </>
  )
}
