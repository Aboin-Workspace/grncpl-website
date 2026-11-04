import { MANAGEMENT as M } from '@/data/company'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'

export default function Management() {
  return (
    <>
      <Seo path="/management/" />
      <EditorialPage eyebrow={M.eyebrow} title={M.title} headline={M.headline} banner={M.banner} paragraphs={M.paragraphs} />
    </>
  )
}
