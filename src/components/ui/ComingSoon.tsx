import type { ReactNode } from 'react'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'

interface Props { eyebrow: string; title: string; label: string; children?: ReactNode; /** Heading level for the visually hidden title (h1 when it leads the page). */ as?: 'h1' | 'h2'; minHeight?: string }

/** Designed "Coming Soon" state: display headline + a gentle looping amber pulse. */
export function ComingSoon({ eyebrow, title, label, children, as: Tag = 'h1', minHeight = 'min-h-[80svh] pt-40' }: Props) {
  return (
    <>
      <Section className={`flex flex-col justify-center ${minHeight}`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Tag className="sr-only">{title}</Tag>
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
