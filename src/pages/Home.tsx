import { lazy, Suspense } from 'react'
import { Hero } from '@/components/hero/Hero'
import { hasWebGL } from '@/lib/webgl'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Seo } from '@/components/ui/Seo'
import { HERO_SLIDES, HERO_SUBTEXT } from '@/data/home'
import { useAppState } from '@/lib/appState'
import { Pillars } from './home/Pillars'
import { NationBuilding } from './home/NationBuilding'
import { StatsBand } from './home/StatsBand'
import { QualityProfessionalism } from './home/QualityProfessionalism'
import { LeadersDeck } from './home/LeadersDeck'
import { CsrStrip } from './home/CsrStrip'
import { ClientMarquee } from './home/ClientMarquee'
import { OperatingArea } from './home/OperatingArea'
import { StrataDivider } from '@/components/motion/StrataDivider'
import { Defer } from '@/components/motion/Defer'

const WorldHero = lazy(() => import('@/components/hero/WorldHero').then((mod) => ({ default: mod.WorldHero })))

export default function Home() {
  const { started } = useAppState()
  // The scroll-driven 3D world needs a desktop viewport and WebGL; everything else gets the photo hero.
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  const world = desktop && !reduced && hasWebGL()
  return (
    <>
      <Seo path="/" localBusiness />
      {world ? <Suspense fallback={<div className="theme-dark h-[100svh] bg-ink" />}><WorldHero slides={HERO_SLIDES} subtext={HERO_SUBTEXT} started={started} /></Suspense> : <Hero slides={HERO_SLIDES} subtext={HERO_SUBTEXT} started={started} />}
      <div className="relative z-10">
        <Pillars />
        <Defer>
          <NationBuilding />
          <StrataDivider amber seed={11} />
          <StatsBand />
        </Defer>
        <Defer>
          <QualityProfessionalism />
          <LeadersDeck />
        </Defer>
        <Defer>
          <CsrStrip />
          <ClientMarquee />
          <OperatingArea />
        </Defer>
      </div>
    </>
  )
}
