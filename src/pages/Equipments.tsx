import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { EQUIPMENT, EQUIPMENT_COLUMNS as COL, EQUIPMENT_OTHERS, EQUIPMENT_TITLE } from '@/data/equipment'
import { FLEET } from '@/config/motion'
import { Seo } from '@/components/ui/Seo'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Counter } from '@/components/motion/Counter'
import { TiltCard } from '@/components/motion/TiltCard'
import { StrataDivider } from '@/components/motion/StrataDivider'
import { TerrainMesh } from '@/components/three/TerrainMesh'
import { HudFrame } from '@/components/fleet/HudFrame'
import { FleetSelector, type FleetTab } from '@/components/fleet/FleetSelector'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap'

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const TABS: FleetTab[] = [
  ...EQUIPMENT.map((c) => ({ id: c.id, label: c.label, units: sum(c.rows.map((r) => r.numbers)) })),
  { id: EQUIPMENT_OTHERS.id, label: EQUIPMENT_OTHERS.label, units: sum(EQUIPMENT_OTHERS.items.map((i) => i.count)) },
]
const TL_ID = 'fleet'

/** Fleet hero: the 3D open-pit survey behind the title, with category readouts. */
function FleetHero({ onPick }: { onPick: (id: string) => void }) {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef({ progress: 0 })
  const reduced = useReducedMotion()
  useGSAP(
    () => {
      if (!root.current || reduced) return
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (st) => { progress.current.progress = st.progress } })
      gsap.to('[data-fleet-copy]', { yPercent: 18, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    },
    { scope: root, dependencies: [reduced] },
  )
  return (
    <div ref={root} className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden bg-ink pb-16 pt-40 md:pb-20 md:pt-48">
      <div className="earth-wash" aria-hidden="true" />
      <TerrainMesh progressRef={progress} pointerTarget={root} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-28 z-[1] hidden justify-between px-gutter font-body text-[11px] uppercase text-bone/50 hud-mono md:flex" aria-hidden="true">
        <span>Fleet index</span>
        <span>{String(TABS.length).padStart(2, '0')} categories</span>
      </div>
      <Container className="relative z-[1]">
        <div data-fleet-copy>
          <Eyebrow>Fleet</Eyebrow>
          <SplitText as="h1" text={EQUIPMENT_TITLE} immediate className="mt-4 font-display text-[clamp(4rem,14vw,14rem)] uppercase leading-[0.85] text-bone" />
        </div>
        <m.ul
          className="mt-10 flex flex-wrap gap-2 md:mt-14"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: 0.6 } } }}
          aria-label="Jump to a category"
        >
          {TABS.map((t, i) => (
            <m.li key={t.id} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 10 }, show: { opacity: 1, y: 0 } }}>
              <button
                type="button"
                onClick={() => onPick(t.id)}
                data-cursor-grow
                className="group flex items-center gap-3 border border-steel/70 bg-ink/50 px-4 py-2.5 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-bone/80 backdrop-blur-sm transition-colors duration-fast hover:border-amber hover:text-bone"
              >
                <span className="text-amber hud-mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {t.label}
                <span className="hud-mono text-bone/50 transition-colors duration-fast group-hover:text-amber">{t.units}</span>
              </button>
            </m.li>
          ))}
        </m.ul>
      </Container>
    </div>
  )
}

function Rows({ cat }: { cat: (typeof EQUIPMENT)[number] }) {
  const reduced = useReducedMotion()
  const max = Math.max(...cat.rows.map((r) => r.numbers))
  const total = sum(cat.rows.map((r) => r.numbers))
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <caption className="sr-only">{cat.label}</caption>
      <thead>
        <tr className="border-b border-steel font-body text-[11px] uppercase text-bone/55 hud-mono">
          <th scope="col" className="w-[30%] py-3 pr-4 md:w-[22%]">{COL.make}</th>
          <th scope="col" className="py-3 pr-4">{COL.model}</th>
          <th scope="col" className="hidden w-[26%] py-3 pr-4 md:table-cell"><span className="sr-only">Share of category</span></th>
          <th scope="col" className="w-[26%] py-3 text-right md:w-[18%]">{COL.numbers}</th>
        </tr>
      </thead>
      <tbody>
        {cat.rows.map((r, i) => (
          <m.tr
            key={`${r.make}-${r.model}`}
            className="border-b border-steel/50 font-body text-base text-bone/85"
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * FLEET.rowStagger + 0.15, ease: FLEET.panel.ease }}
          >
            <td className="py-4 pr-4 uppercase tracking-[0.06em]">{r.make}</td>
            <td className="py-4 pr-4 text-bone">{r.model}</td>
            <td className="hidden py-4 pr-6 md:table-cell" aria-hidden="true">
              <span className="block h-px w-full bg-steel/70">
                <m.span
                  className="block h-px bg-amber shadow-[0_0_10px_rgb(var(--c-amber)/0.7)]"
                  style={{ width: `${(r.numbers / max) * 100}%`, transformOrigin: '0 50%' }}
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: FLEET.barDuration, delay: i * FLEET.rowStagger + 0.35, ease: FLEET.panel.ease }}
                />
              </span>
            </td>
            <td className="py-4 text-right font-display text-2xl text-bone"><Counter value={r.numbers} underline={false} start="top 98%" /></td>
          </m.tr>
        ))}
        <tr className="font-body text-base text-bone">
          <td className="py-5 pr-4 font-body text-[11px] uppercase text-bone/60 hud-mono md:hidden" colSpan={2}>Total {cat.label.toLowerCase()}</td>
          <td className="hidden py-5 pr-4 font-body text-[11px] uppercase text-bone/60 hud-mono md:table-cell" colSpan={3}>Total {cat.label.toLowerCase()}</td>
          <td className="py-5 text-right font-display text-4xl text-amber"><Counter value={total} underline={false} start="top 98%" /></td>
        </tr>
      </tbody>
    </table>
  )
}

export default function Equipments() {
  const [tab, setTab] = useState(TABS[0].id)
  const reduced = useReducedMotion()
  const browser = useRef<HTMLDivElement>(null)
  const index = useMemo(() => TABS.findIndex((t) => t.id === tab), [tab])
  const pick = (id: string) => {
    setTab(id)
    browser.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }
  const panelMotion = {
    initial: reduced ? false : { opacity: 0, y: 18, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: reduced ? { opacity: 0 } : { opacity: 0, y: -12, filter: 'blur(6px)' },
    transition: { duration: reduced ? 0.15 : FLEET.panel.duration, ease: FLEET.panel.ease },
  } as const

  return (
    <>
      <Seo path="/equipments/" />
      <FleetHero onPick={pick} />
      <StrataDivider amber seed={23} className="-mt-px" />
      <section ref={browser} className="relative scroll-mt-24 bg-ink py-section-y" aria-label="Fleet by category">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-4">
              <div className="min-w-0 lg:sticky lg:top-28">
                <p className="mb-4 hidden font-body text-[11px] uppercase text-bone/50 hud-mono lg:block" aria-hidden="true">Select category</p>
                <FleetSelector tabs={TABS} active={tab} onChange={setTab} label="Equipment categories" idBase={TL_ID} />
              </div>
            </div>
            <div className="relative min-w-0 lg:col-span-8">
              <AnimatePresence mode="wait" initial={false}>
                <m.div key={tab} role="tabpanel" id={`${TL_ID}-panel-${tab}`} aria-labelledby={`${TL_ID}-tab-${tab}`} {...panelMotion}>
                  {tab === EQUIPMENT_OTHERS.id ? (
                    <div className="grid gap-6 md:grid-cols-3">
                      {EQUIPMENT_OTHERS.items.map((it, i) => (
                        <TiltCard key={it.title} maxDeg={5} className="h-full">
                          <HudFrame label={`${String(index + 1).padStart(2, '0')}.${i + 1}`} readout={`${it.count} ${it.unit}`} className="h-full">
                            <article className="h-full">
                              <div className="aspect-[4/3] overflow-hidden hud-grid"><img src={it.image.src} alt={it.image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[2s] ease-expo-out hover:scale-105" /></div>
                              <div className="p-5">
                                <h2 className="font-display text-display-sm uppercase text-bone">{it.title}</h2>
                                <p className="mt-2 font-display text-[2.5rem] leading-none text-amber"><Counter value={it.count} suffix={` ${it.unit}`} underline={false} smallSuffix start="top 98%" /></p>
                              </div>
                            </article>
                          </HudFrame>
                        </TiltCard>
                      ))}
                    </div>
                  ) : (
                    (() => {
                      const cat = EQUIPMENT.find((c) => c.id === tab)!
                      const units = sum(cat.rows.map((r) => r.numbers))
                      return (
                        <div className="grid min-w-0 gap-8 md:grid-cols-12">
                          <div className="min-w-0 md:col-span-12">
                            <TiltCard maxDeg={4} className="w-full" cursorLabel={cat.image ? 'View' : undefined}>
                              <HudFrame label={`CAT ${String(index + 1).padStart(2, '0')} / ${cat.label}`} readout={`${units} units`} caption={cat.image ? cat.image.alt : 'Image pending'} className="w-full">
                                {cat.image ? (
                                  <div className="aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
                                    <img src={cat.image.src} alt={cat.image.alt} loading="eager" decoding="async" className="h-full w-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="hud-grid flex aspect-[16/9] w-full items-center justify-center md:aspect-[21/9]">
                                    {/* TODO(client): no image for Surface Miner on the old site */}
                                    <span className="font-body text-[11px] uppercase text-bone/50 hud-mono">No imagery on file</span>
                                  </div>
                                )}
                              </HudFrame>
                            </TiltCard>
                          </div>
                          <div className="min-w-0 md:col-span-12">
                            <Rows cat={cat} />
                          </div>
                        </div>
                      )
                    })()
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
