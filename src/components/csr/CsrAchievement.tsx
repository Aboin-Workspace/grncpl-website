import { useRef, useState } from 'react'
import { AnimatePresence, m, useInView } from 'motion/react'
import { CSR_ACHIEVEMENT as A } from '@/data/csr'
import { ACHIEVEMENT as M } from '@/config/motion'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { Counter } from '@/components/motion/Counter'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const EASE = [0.16, 1, 0.3, 1] as const

/** Laurel sprig drawn in strokes; mirrored for the right side. */
function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 80" className={`h-16 w-8 text-amber md:h-24 md:w-12 ${flip ? '-scale-x-100' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M32 76 C 14 62, 8 40, 16 6" />
      {[14, 26, 38, 50, 62].map((y, i) => (
        <g key={y}>
          <path d={`M${15 + i * 2.6} ${y} q -11 -3 -12 -13 q 10 1 12 13`} />
          <path d={`M${16 + i * 2.6} ${y + 3} q 10 -5 15 -13 q -11 0 -15 13`} opacity="0.7" />
        </g>
      ))}
    </svg>
  )
}

/**
 * Featured CSR recognition: headline, the ₹4 crore figure framed by laurels, a fact
 * sheet, the news clip in a frame that opens on scroll, two event photos, the
 * announcement copy and a closing tagline. All copy comes from CSR_ACHIEVEMENT.
 */
export function CsrAchievement() {
  const reduced = useReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const tagline = useRef<HTMLParagraphElement>(null)
  const frameIn = useInView(frame, { once: true, amount: 0.35 })
  const taglineIn = useInView(tagline, { once: true, amount: 0.6 })
  const [playing, setPlaying] = useState(false)

  const play = () => {
    setPlaying(true)
    requestAnimationFrame(() => void video.current?.play())
  }

  return (
    <section className="relative overflow-hidden bg-coal py-section-y" aria-labelledby="achievement-heading">
      <div className="pointer-events-none absolute -right-40 top-10 h-[55vw] w-[55vw] rounded-full bg-amber/10 blur-[150px]" aria-hidden="true" />
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" aria-hidden="true" />
      <Container className="relative">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            {!reduced && <span className="absolute inset-0 animate-ping rounded-full bg-amber/70" />}
            <span className="relative h-2.5 w-2.5 rounded-full bg-amber" />
          </span>
          <Eyebrow>{A.eyebrow}</Eyebrow>
          <span className="font-body text-[11px] uppercase text-bone/55 hud-mono">{A.date}</span>
        </div>
        <SplitText as="h2" by="words" text={A.title} accentWords={['Education', 'Tomorrow']} className="mt-5 max-w-5xl font-display text-display-lg uppercase text-bone" />
        <span id="achievement-heading" className="sr-only">{A.title}</span>

        {/* Figure + fact sheet */}
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <div className="flex items-center justify-center gap-3 md:gap-5 lg:justify-start">
              <Laurel />
              <p className="font-display text-[clamp(4.5rem,11vw,10rem)] leading-[0.85] text-amber">
                <Counter value={A.amount.value} prefix={A.amount.prefix} suffix={A.amount.suffix} smallSuffix underline={false} start="top 90%" />
              </p>
              <Laurel flip />
            </div>
            <p className="mt-5 text-center font-body text-eyebrow uppercase text-bone/65 lg:text-left">{A.amount.label}</p>
          </Reveal>
          <Reveal as="dl" stagger className="grid gap-px border border-steel/60 bg-steel/60 sm:grid-cols-2 lg:col-span-7">
            {A.facts.map((f) => (
              <div key={f.label} className="group bg-coal p-5 transition-colors duration-base hover:bg-ink md:p-6">
                <dt className="font-body text-[11px] uppercase text-amber hud-mono">{f.label}</dt>
                <dd className="mt-2 font-display text-[1.35rem] uppercase leading-tight text-bone md:text-[1.6rem]">{f.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Film + photos */}
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div ref={frame} className="lg:col-span-8">
            <m.div
              className="hud-corners relative aspect-video overflow-hidden border border-steel/70 bg-ink"
              initial={reduced ? false : { clipPath: 'inset(48% 0% 48% 0%)' }}
              animate={frameIn || reduced ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
              transition={{ duration: M.reveal.duration, ease: M.reveal.ease }}
            >
              <span className="hud-c" aria-hidden="true" />
              <video
                ref={video}
                src={playing ? A.video.src : undefined}
                poster={A.video.poster}
                preload="none"
                controls={playing}
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label={A.video.label}
                onEnded={() => setPlaying(false)}
              />
              <AnimatePresence>
                {!playing && (
                  <m.button
                    key="play"
                    type="button"
                    onClick={play}
                    aria-label={A.video.label}
                    data-cursor="Play"
                    className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[rgba(11,11,12,0.75)] via-[rgba(11,11,12,0.15)] to-[rgba(11,11,12,0.3)]"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="relative grid h-20 w-20 place-items-center md:h-24 md:w-24">
                      {!reduced && [0, 1].map((i) => (
                        <m.span key={i} className="absolute inset-0 rounded-full border border-[#8DC63F]" animate={{ scale: [1, 1.7], opacity: [0.7, 0] }} transition={{ duration: M.ringSeconds, repeat: Infinity, delay: i * (M.ringSeconds / 2), ease: 'easeOut' }} aria-hidden="true" />
                      ))}
                      <span className="grid h-full w-full place-items-center rounded-full bg-[#8DC63F] text-[#0B0B0C] transition-transform duration-base ease-expo-out group-hover:scale-110">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
                      </span>
                    </span>
                    <span className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 text-left md:inset-x-7 md:bottom-6">
                      <span className="font-display text-xl uppercase leading-tight text-[#F2EDE4] md:text-2xl">{A.video.label}</span>
                      <span className="shrink-0 font-body text-[10px] uppercase text-[#F2EDE4]/70 hud-mono">0:28</span>
                    </span>
                  </m.button>
                )}
              </AnimatePresence>
            </m.div>
            <p className="mt-2 font-body text-[10px] uppercase tracking-[0.14em] text-bone/45">{A.video.credit}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-1 lg:gap-6">
            {A.photos.map((ph, i) => (
              <m.figure
                key={ph.src}
                className="group relative overflow-hidden border border-steel/70 bg-ink"
                initial={reduced ? false : { opacity: 0, y: 40, rotate: M.photo.rotate[i] }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: M.photo.duration, delay: i * M.photo.stagger, ease: EASE }}
              >
                <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" className="aspect-[16/10] h-full w-full object-cover transition-transform duration-[1.6s] ease-expo-out group-hover:scale-105" />
                <span className="absolute left-3 top-3 bg-ink/70 px-2 py-1 font-body text-[10px] uppercase text-bone hud-mono backdrop-blur-sm" aria-hidden="true">0{i + 1}</span>
              </m.figure>
            ))}
          </div>
        </div>

        {/* Announcement */}
        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="border-l-2 border-amber pl-6 font-display text-display-sm uppercase leading-tight text-bone">{A.paragraphs[3]}</p>
          </Reveal>
          <Reveal stagger className="space-y-6 lg:col-span-6 lg:col-start-7">
            {A.paragraphs.slice(0, 3).map((p) => (
              <p key={p.slice(0, 24)} className="max-w-measure font-body text-body-lg text-bone/80">{p}</p>
            ))}
          </Reveal>
        </div>

        {/* Tagline */}
        <p ref={tagline} className="mt-16 flex flex-col gap-1 border-t border-steel/60 pt-10 font-display text-[clamp(2rem,6vw,5.5rem)] uppercase leading-[0.95] md:mt-24 lg:flex-row lg:flex-wrap lg:gap-x-8">
          {A.tagline.map((line, i) => (
            <span key={line} className="overflow-hidden">
              <m.span
                className={`block ${i === 1 ? 'text-amber' : i === 2 ? 'text-outline' : 'text-bone'}`}
                initial={reduced ? false : { y: '110%' }}
                animate={taglineIn || reduced ? { y: '0%' } : undefined}
                transition={{ duration: M.tagline.duration, delay: i * M.tagline.stagger, ease: EASE }}
              >
                {line}
              </m.span>
            </span>
          ))}
        </p>
      </Container>
    </section>
  )
}
