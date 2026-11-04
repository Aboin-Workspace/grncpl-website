import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, useGSAP } from '@/lib/gsap'
import { CSR_STRIP } from '@/config/motion'
import { CSR_TEASER } from '@/data/home'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Eyebrow } from '@/components/layout/Section'
import { TiltCard } from '@/components/motion/TiltCard'
import { CtaLink } from '@/components/ui/CtaLink'

/** Horizontal strip: pinned xPercent scrub on desktop, native snap-scroll on mobile. */
export function CsrStrip() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const desktop = useIsDesktop()
  const pinned = desktop && !reduced

  useGSAP(
    () => {
      if (!pinned || !root.current || !track.current) return
      gsap.to(track.current, {
        x: () => -(track.current!.scrollWidth - window.innerWidth + CSR_STRIP.endPaddingPx),
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: CSR_STRIP.start, end: () => `+=${track.current!.scrollWidth - window.innerWidth}`, pin: true, scrub: CSR_STRIP.scrub, anticipatePin: 1, invalidateOnRefresh: true },
      })
    },
    { scope: root, dependencies: [pinned] },
  )

  return (
    <section ref={root} className={`relative bg-ink ${pinned ? 'h-screen overflow-hidden' : 'py-section-y'}`} aria-labelledby="csr-teaser-heading">
      <div className={`${pinned ? 'absolute inset-x-0 top-0 pt-20' : ''} mx-auto max-w-[1440px] px-gutter`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Giving back</Eyebrow>
            <h2 id="csr-teaser-heading" className="mt-3 font-display text-display-lg uppercase text-bone">{CSR_TEASER.title}</h2>
          </div>
          <CtaLink to="/csr/" tone="outline">All CSR activities</CtaLink>
        </div>
      </div>
      <div
        ref={track}
        className={`flex gap-6 ${pinned ? 'absolute bottom-[8vh] left-gutter w-max pr-gutter' : 'mt-12 snap-x snap-mandatory overflow-x-auto px-gutter pb-4 [scrollbar-width:none]'}`}
        style={pinned ? { top: 'calc(20vh + 6rem)' } : undefined}
      >
        {CSR_TEASER.cards.map((card, i) => (
          <TiltCard key={card.title} cursorLabel="View" className={`shrink-0 snap-start ${pinned ? 'w-[min(34vw,520px)]' : 'w-[80vw] md:w-[46vw]'}`}>
            <Link to="/csr/" className="group block h-full border border-steel/70 bg-coal">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={card.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1.6s] ease-expo-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden="true" />
                <span className="absolute left-4 top-4 font-display text-display-sm text-amber" aria-hidden="true">0{i + 1}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-display-sm uppercase text-bone">{card.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-bone/70">{card.body}</p>
              </div>
            </Link>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
