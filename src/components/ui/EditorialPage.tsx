import type { ReactNode } from 'react'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from './ParallaxImage'
import { PullQuote } from './PullQuote'
import { NumberedList } from './NumberedList'
import { StrataDivider } from '@/components/motion/StrataDivider'

export interface EditorialProps {
  eyebrow: string
  title: string
  headline?: string
  banner?: { src: string; alt: string }
  paragraphs?: readonly string[]
  pullQuote?: string
  lists?: readonly { heading: string; items: readonly string[] }[]
  children?: ReactNode
}

/**
 * Editorial inner-page layout: giant masked headline, parallax hero image,
 * narrow-measure copy, pull-quote in display type, numbered amber-rule lists.
 */
export function EditorialPage({ eyebrow, title, headline, banner, paragraphs, pullQuote, lists, children }: EditorialProps) {
  return (
    <>
      <Section className="pt-40 md:pt-48">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SplitText as="h1" text={title} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
        {banner && <ParallaxImage src={banner.src} alt={banner.alt} priority className="mt-12 md:mt-16" frameClassName="aspect-[4/3] md:aspect-[21/9]" />}
      </Section>

      <StrataDivider amber className="bg-ink" />
      <Section tone="coal">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {headline && headline !== title && <SplitText as="h2" by="words" text={headline} className="font-display text-display-lg uppercase text-bone" />}
            {headline === title && <SplitText as="h2" by="words" text={headline} className="font-display text-display-lg uppercase text-bone lg:sr-only" />}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {paragraphs && (
              <Reveal stagger className="space-y-6">
                {paragraphs.map((p, i) => (
                  <p key={i} className="max-w-measure font-body text-body-lg text-bone/80">{p}</p>
                ))}
              </Reveal>
            )}
          </div>
        </div>
        {pullQuote && <PullQuote text={pullQuote} className="mt-20 max-w-5xl md:mt-28" />}
      </Section>

      {lists?.map((l) => (
        <Section key={l.heading}>
          <Reveal>
            <h2 className="font-display text-display-md uppercase text-bone">{l.heading}</h2>
          </Reveal>
          <NumberedList items={l.items} className="mt-8" />
        </Section>
      ))}

      {children}
    </>
  )
}
