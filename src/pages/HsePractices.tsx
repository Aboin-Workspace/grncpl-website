import { HSE_PRACTICES as H } from '@/data/operations'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'

export default function HsePractices() {
  return (
    <>
      <Seo path="/hse-practices/" />
      <EditorialPage eyebrow={H.eyebrow} title={H.title} headline={H.headline} banner={H.banner} paragraphs={H.paragraphs} lists={[{ heading: 'Our HSE commitments', items: H.list }]} />
    </>
  )
}
