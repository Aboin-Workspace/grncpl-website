import { CONSTRUCTION_BRILLIANCE as C } from '@/data/company'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'

export default function ConstructionBrilliance() {
  return (
    <>
      <Seo path="/construction-brilliance/" />
      <EditorialPage eyebrow={C.eyebrow} title={C.title} headline={C.headline} banner={C.banner} paragraphs={C.paragraphs} />
    </>
  )
}
