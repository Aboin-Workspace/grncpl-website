import type { ReactNode } from 'react'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'

interface Props { eyebrow: string; title: string; label: string; children?: ReactNode }

/** Designed "Coming Soon" state: display headline + a gentle looping amber pulse. */
export function ComingSoon({ eyebrow, title, label, children }: Props) {
  return (
    <>
      <Section className="flex min-h-[80svh] flex-col justify-center pt-40">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="sr-only">{title}</h1>
        <div className="relative mt-6">
          <span className="pulse-ring absolute -left-6 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-amber/40 md:-left-10 md:h-64 md:w-64" aria-hidden="true" />
          <span className="pulse-ring absolute -left-6 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-amber/40 [animation-delay:1.2s] md:-left-10 md:h-64 md:w-64" aria-hidden="true" />
          <SplitText as="p" text={label} immediate className="relative font-display text-[clamp(4rem,16vw,16rem)] uppercase leading-[0.9] text-bone" />
        </div>
      </Section>
      {children}
    </>
  )
}
