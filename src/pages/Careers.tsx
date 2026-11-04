import { CAREERS } from '@/data/contact'
import { Seo } from '@/components/ui/Seo'
import { ComingSoon } from '@/components/ui/ComingSoon'

export default function Careers() {
  return (
    <>
      <Seo path="/careers/" />
      <ComingSoon eyebrow="Join us" title={CAREERS.title} label={CAREERS.comingSoon} />
    </>
  )
}
