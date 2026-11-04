import { FOUNDERS_MESSAGE as F } from '@/data/company'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'

export default function FoundersMessage() {
  return (
    <>
      <Seo path="/founders-message/" />
      <EditorialPage eyebrow={F.eyebrow} title={F.title} headline={F.headline} banner={F.banner} paragraphs={F.paragraphs} pullQuote={F.pullQuote} />
    </>
  )
}
