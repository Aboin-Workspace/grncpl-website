import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { DECK } from '@/config/motion'
import { LEADERS } from '@/data/home'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Section, Eyebrow } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { CtaLink } from '@/components/ui/CtaLink'

/**
 * Stacked card deck (Framer). Cards are fanned; click/tap/Enter brings a card to
 * the front, the others settle behind. Drag the front card to cycle.
 */
export function LeadersDeck() {
  const [order, setOrder] = useState(() => LEADERS.map((_, i) => i))
  const reduced = useReducedMotion()
  const bring = (idx: number) => setOrder((o) => [idx, ...o.filter((i) => i !== idx)])
  const cycle = () => setOrder((o) => [...o.slice(1), o[0]])

  const onKey = (e: KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bring(idx) }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); cycle() }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]) }
  }

  return (
    <Section tone="coal" as="section" aria-labelledby="leaders-heading" className="overflow-hidden">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <Reveal>
            <Eyebrow>Founder’s Message</Eyebrow>
            <h2 id="leaders-heading" className="mt-4 font-display text-display-lg uppercase text-bone">The people behind the work</h2>
            <p className="mt-6 font-body text-base text-bone/60">Tap a card to bring it forward. Use arrow keys to cycle.</p>
            <div className="mt-8">
              <CtaLink to="/founders-message/" tone="outline">Read the message</CtaLink>
            </div>
          </Reveal>
        </div>
        <div className="relative h-[520px] md:h-[480px] lg:col-span-8" role="group" aria-label="Leadership">
          {LEADERS.map((leader, idx) => {
            const pos = order.indexOf(idx)
            const front = pos === 0
            return (
              <m.article
                key={leader.name}
                layout={!reduced}
                animate={{
                  x: pos * DECK.fanOffsetX,
                  y: pos * DECK.fanOffsetY,
                  rotate: reduced ? 0 : (pos - 1) * DECK.fanRotation,
                  scale: 1 - pos * DECK.scaleStep,
                  zIndex: LEADERS.length - pos,
                  opacity: 1 - pos * 0.12,
                }}
                transition={reduced ? { duration: 0.2 } : DECK.spring}
                drag={front && !reduced ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => Math.abs(info.offset.x) > DECK.swipeThresholdPx && cycle()}
                onClick={() => !front && bring(idx)}
                onKeyDown={(e) => onKey(e, idx)}
                tabIndex={0}
                aria-current={front ? 'true' : undefined}
                data-cursor={front ? 'Drag' : 'View'}
                className={`absolute left-0 top-0 w-[min(100%,34rem)] origin-bottom-left border border-steel/80 bg-ink p-7 shadow-amber-glow md:p-9 ${front ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                style={{ transformOrigin: 'bottom left' }}
              >
                <span className="font-display text-display-sm text-amber" aria-hidden="true">0{idx + 1}</span>
                <h3 className="mt-3 font-display text-display-md uppercase leading-none text-bone">{leader.name}</h3>
                <p className="mt-1 font-body text-eyebrow uppercase text-bone/60">{leader.role}</p>
                <p className="mt-5 font-body text-base leading-relaxed text-bone/80 line-clamp-6 md:line-clamp-none">{leader.body}</p>
                <Link to="/founders-message/" className="mt-5 inline-block font-body text-sm uppercase tracking-[0.18em] text-amber hover:text-safety" tabIndex={front ? 0 : -1}>
                  Founder’s Message →
                </Link>
              </m.article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
