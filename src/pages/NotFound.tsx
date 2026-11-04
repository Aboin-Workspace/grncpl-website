import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/ui/Seo'
import { Section } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { MagneticButton } from '@/components/motion/MagneticButton'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <>
      <Seo path="404" />
      <Section className="flex min-h-[90svh] flex-col justify-center pt-40">
        <SplitText as="h1" text="404" immediate className="font-display text-[clamp(8rem,30vw,28rem)] leading-[0.85] text-outline" />
        <p className="mt-6 max-w-measure font-body text-body-lg text-bone/75">The page you are looking for does not exist.</p>
        <div className="mt-10">
          <MagneticButton onClick={() => navigate('/')} className="btn-sweep bg-amber px-8 py-4 font-body text-sm font-bold uppercase tracking-[0.18em] text-ink">Back home</MagneticButton>
        </div>
      </Section>
    </>
  )
}
