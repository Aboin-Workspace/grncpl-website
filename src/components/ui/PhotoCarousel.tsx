import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { CAROUSEL } from '@/config/motion'

export interface CarouselPhoto { src: string; srcSmall?: string; alt: string; caption?: string }
interface Props { photos: CarouselPhoto[]; label: string; autoplayMs?: number; className?: string }

const pad = (n: number) => String(n + 1).padStart(2, '0')

/**
 * Full-bleed photo carousel: cross-fading slides with a slow drift, numbered
 * thumbnails, arrows, keyboard and drag. Autoplays until the visitor interacts.
 */
export function PhotoCarousel({ photos, label, autoplayMs = 6000, className = '' }: Props) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  const [touched, setTouched] = useState(false)
  const n = photos.length
  const go = useCallback((k: number, manual = true) => { setI(((k % n) + n) % n); if (manual) setTouched(true) }, [n])

  useEffect(() => {
    if (touched || reduced || n < 2) return
    const id = window.setInterval(() => setI((k) => (k + 1) % n), autoplayMs)
    return () => window.clearInterval(id)
  }, [touched, reduced, n, autoplayMs])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1) }
  }
  const p = photos[i]

  return (
    <div className={`relative ${className}`} role="group" aria-roledescription="carousel" aria-label={label} tabIndex={0} onKeyDown={onKey}>
      <div className="hud-corners relative aspect-[16/9] overflow-hidden border border-steel/60 bg-coal md:aspect-[21/9]">
        <span className="hud-c" aria-hidden="true" />
        <m.div
          className="absolute inset-0"
          drag={reduced ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => { if (info.offset.x < -CAROUSEL.swipeThresholdPx) go(i + 1); else if (info.offset.x > CAROUSEL.swipeThresholdPx) go(i - 1) }}
          data-cursor="Drag"
        >
          <AnimatePresence initial={false}>
            <m.img
              key={p.src}
              src={p.src}
              srcSet={p.srcSmall ? `${p.srcSmall} 1080w, ${p.src} 1920w` : undefined}
              sizes="100vw"
              alt={p.alt}
              className="absolute inset-0 h-full w-full select-none object-cover"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1.0, transition: { opacity: { duration: 0.9 }, scale: { duration: autoplayMs / 1000 + 1.5, ease: 'linear' } } }}
              exit={{ opacity: 0, transition: { duration: 0.9 } }}
              draggable={false}
            />
          </AnimatePresence>
        </m.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(11,11,12,0.88)] to-transparent px-5 pb-5 pt-16 md:px-8 md:pb-7">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-body text-[11px] uppercase text-[#8DC63F] hud-mono" aria-hidden="true">{pad(i)} / {pad(n - 1)}</p>
              <p className="mt-2 max-w-2xl font-body text-sm text-[#F2EDE4]/90 md:text-base">{p.caption ?? p.alt}</p>
            </div>
            <div className="pointer-events-auto hidden shrink-0 gap-2 md:flex">
              <MagneticButton onClick={() => go(i - 1)} aria-label="Previous photo" className="grid h-11 w-11 place-items-center rounded-full border border-[#F2EDE4]/40 text-[#F2EDE4] hover:border-[#8DC63F] hover:text-[#8DC63F]">‹</MagneticButton>
              <MagneticButton onClick={() => go(i + 1)} aria-label="Next photo" className="grid h-11 w-11 place-items-center rounded-full border border-[#F2EDE4]/40 text-[#F2EDE4] hover:border-[#8DC63F] hover:text-[#8DC63F]">›</MagneticButton>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 md:gap-3" role="tablist" aria-label={`${label} thumbnails`}>
        {photos.map((ph, k) => {
          const on = k === i
          return (
            <button key={ph.src} type="button" role="tab" aria-selected={on} aria-label={`Photo ${pad(k)}: ${ph.alt}`} onClick={() => go(k)} data-cursor-grow className={`group relative aspect-[16/9] overflow-hidden border transition-colors duration-base ${on ? 'border-amber' : 'border-steel/60 hover:border-bone/50'}`}>
              <img src={ph.srcSmall ?? ph.src} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover transition-opacity duration-base ${on ? 'opacity-100' : 'opacity-50 group-hover:opacity-85'}`} />
              <span className={`absolute left-2 top-2 font-body text-[10px] hud-mono ${on ? 'text-amber' : 'text-bone/70'}`} aria-hidden="true">{pad(k)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
