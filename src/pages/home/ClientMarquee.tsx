import { m } from 'motion/react'
import { CLIENTS, CLIENT_BADGES, type ClientBadge } from '@/data/home'
import { Marquee } from '@/components/motion/Marquee'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Monogram tile when no logo file is supplied: initials over faint strata lines. */
function Monogram({ abbr }: { abbr: string }) {
  const initials = abbr.replace(/[^A-Z&]/g, '').slice(0, 5)
  return (
    <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden bg-amber text-ink md:h-20 md:w-20" aria-hidden="true">
      <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none">
        <path d="M0 52 C 14 46, 26 58, 40 52 S 66 46, 80 52" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0 62 C 16 68, 28 56, 44 62 S 68 68, 80 62" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0 71 C 12 66, 30 76, 46 71 S 70 66, 80 72" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className={`relative font-display leading-none tracking-[0.02em] ${initials.length > 4 ? 'text-lg md:text-xl' : initials.length > 3 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'}`}>{initials}</span>
    </span>
  )
}

function Badge({ c }: { c: ClientBadge }) {
  const reduced = useReducedMotion()
  return (
    <m.div
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="group mx-3 flex items-center gap-5 border border-steel/60 bg-coal px-5 py-4 transition-colors duration-base hover:border-amber md:mx-4 md:px-6 md:py-5"
    >
      {c.logo ? (
        <img src={c.logo} alt="" width={80} height={80} loading="lazy" decoding="async" className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20" />
      ) : (
        <Monogram abbr={c.abbr} />
      )}
      <span className="flex flex-col">
        <span className="whitespace-nowrap font-display text-[2rem] uppercase leading-none text-bone md:text-[2.5rem]">{c.abbr}</span>
        <span className="mt-1.5 whitespace-nowrap font-body text-[11px] uppercase tracking-[0.18em] text-bone/55 transition-colors duration-base group-hover:text-amber">{c.fullName}</span>
      </span>
    </m.div>
  )
}

export function ClientMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-steel/60 bg-ink py-16 md:py-24" aria-label="Clients">
      <div className="pointer-events-none absolute -left-20 top-1/2 h-[40vw] w-[40vw] -translate-y-1/2 rounded-full bg-amber/10 blur-[120px]" aria-hidden="true" />
      <Container className="relative">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow>Clients</Eyebrow>
            <h2 className="mt-4 font-display text-display-md uppercase text-bone">Clients</h2>
          </div>
          <p className="hidden font-body text-[11px] uppercase text-bone/50 hud-mono md:block" aria-hidden="true">{String(CLIENTS.length).padStart(2, '0')} organisations</p>
        </Reveal>
      </Container>
      <div className="relative mt-10 md:mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent md:w-40" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent md:w-40" aria-hidden="true" />
        <Marquee ariaLabel={`Clients: ${CLIENTS.join(', ')}`}>
          {CLIENT_BADGES.map((c) => (
            <Badge key={c.slug} c={c} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}
