import type { HeroSlide } from '@/data/home'
import { DURATION } from '@/config/motion'

interface Props {
  slides: HeroSlide[]
  index: number
  reduced: boolean
}

/**
 * Used when WebGL is unavailable or reduced-motion is on:
 * static image stack with a plain opacity crossfade and an animated ochre wash
 * (the wash is frozen by CSS under reduced motion).
 */
export function HeroFallback({ slides, index, reduced }: Props) {
  const dur = reduced ? DURATION.reducedFade : DURATION.liquid
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {slides.map((s, i) => (
        <img
          key={s.image.src}
          src={s.image.src}
          srcSet={`${s.image.srcSmall} 1080w, ${s.image.src} 1920w, ${s.image.srcLarge} 3840w`}
          sizes="100vw"
          alt=""
          decoding="async"
          loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === index ? 1 : 0, transition: `opacity ${dur}s var(--ease-power2-out)` }}
        />
      ))}
      <div className="ochre-wash absolute inset-0" />
      <div className="absolute inset-0 bg-vignette" />
    </div>
  )
}
