import { Hero } from '@/components/hero/Hero'
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

export default function Home() {
  const { started } = useAppState()
  return (
    <>
      <Seo path="/" localBusiness />
      <Hero slides={HERO_SLIDES} subtext={HERO_SUBTEXT} started={started} />
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
