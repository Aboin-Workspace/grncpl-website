import { STRENGTHS_AND_EXPERIENCE as S } from '@/data/operations'
import { Seo } from '@/components/ui/Seo'
import { EditorialPage } from '@/components/ui/EditorialPage'

export default function StrengthsAndExperience() {
  return (
    <>
      <Seo path="/strengths-and-experience/" />
      <EditorialPage eyebrow={S.eyebrow} title={S.title} headline={S.headline} banner={S.banner} paragraphs={S.paragraphs} />
    </>
  )
}
