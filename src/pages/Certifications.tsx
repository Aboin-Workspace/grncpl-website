import { useState, type KeyboardEvent } from 'react'
import { m } from 'motion/react'
import { CERTIFICATIONS as C } from '@/data/company'
import { CAROUSEL } from '@/config/motion'
import { Seo } from '@/components/ui/Seo'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { TiltCard } from '@/components/motion/TiltCard'
import { Lightbox } from '@/components/ui/Lightbox'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function Certifications() {
  const [active, setActive] = useState(1)
  const [open, setOpen] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const n = C.certificates.length
  const go = (d: number) => setActive((a) => (a + d + n) % n)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
  }
  const current = C.certificates.find((c) => c.id === open)

  return (
    <>
      <Seo path="/certifications/" />
      <Section className="pt-40 md:pt-48">
        <Eyebrow>{C.eyebrow}</Eyebrow>
        <SplitText as="h1" text={C.title} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
      </Section>

      {/* 3D tilt carousel */}
      <Section tone="coal" bleed aria-label="ISO certificates">
        <div className="mx-auto max-w-[1440px] px-gutter">
          <div className="relative mx-auto h-[min(70vh,640px)] max-w-5xl" style={{ perspective: CAROUSEL.perspectivePx }} onKeyDown={onKey} tabIndex={0} role="group" aria-roledescription="carousel" aria-label="ISO certificates, use arrow keys">
            {C.certificates.map((cert, i) => {
              const rel = ((i - active + n + 1) % n) - 1 // -1, 0, 1
              const isActive = rel === 0
              return (
                <m.div
                  key={cert.id}
                  className="absolute left-1/2 top-0 h-full w-[min(72vw,420px)]"
                  animate={reduced
                    ? { x: `${-50 + rel * 100}%`, opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }
                    : { x: `${-50 + rel * CAROUSEL.spacingPercent}%`, rotateY: -rel * CAROUSEL.sideRotateY, scale: isActive ? 1 : CAROUSEL.sideScale, opacity: isActive ? 1 : 0.5, zIndex: isActive ? 2 : 1 }}
                  transition={reduced ? { duration: 0.2 } : CAROUSEL.spring}
                  style={{ transformStyle: 'preserve-3d' }}
                  drag={isActive && !reduced ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => { if (info.offset.x < -CAROUSEL.swipeThresholdPx) go(1); else if (info.offset.x > CAROUSEL.swipeThresholdPx) go(-1) }}
                  aria-hidden={!isActive}
                >
                  <TiltCard className="h-full" cursorLabel={isActive ? 'Open' : 'View'}>
                    <button
                      type="button"
                      onClick={() => (isActive ? setOpen(cert.id) : setActive(i))}
                      tabIndex={isActive ? 0 : -1}
                      className="block h-full w-full overflow-hidden border border-steel/70 bg-ink shadow-amber-glow"
                      aria-label={isActive ? `Open ${cert.label} certificate` : `Show ${cert.label}`}
                    >
                      <m.img layoutId={reduced ? undefined : `cert-${cert.id}`} src={cert.src} alt={cert.alt} loading={i === active ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover" />
                    </button>
                  </TiltCard>
                </m.div>
              )
            })}
          </div>
          <div className="mt-10 flex items-center justify-between">
            <div>
              <p className="font-display text-display-sm uppercase text-amber">{C.certificates[active].label}</p>
              <p className="font-body text-sm text-bone/60">{C.certificates[active].caption}</p>
            </div>
            <div className="flex gap-2">
              <MagneticButton onClick={() => go(-1)} aria-label="Previous certificate" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone hover:border-safety hover:text-safety">‹</MagneticButton>
              <MagneticButton onClick={() => go(1)} aria-label="Next certificate" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 text-bone hover:border-safety hover:text-safety">›</MagneticButton>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SplitText as="h2" by="words" text={C.headline} className="font-display text-display-lg uppercase text-bone" />
          </div>
          <Reveal stagger className="space-y-6 lg:col-span-6 lg:col-start-7">
            {C.paragraphs.map((p, i) => (
              <p key={i} className="max-w-measure font-body text-body-lg text-bone/80">{p}</p>
            ))}
          </Reveal>
        </div>
      </Section>

      {current && <Lightbox open={!!open} onClose={() => setOpen(null)} layoutId={`cert-${current.id}`} src={current.src} alt={current.alt} caption={`${current.label} — ${current.caption}`} />}
    </>
  )
}
