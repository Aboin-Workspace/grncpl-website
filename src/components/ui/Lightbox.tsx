import { useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  open: boolean
  onClose: () => void
  layoutId: string
  src: string
  alt: string
  caption?: string
}

/** Shared-element zoom lightbox (Framer layoutId). Esc/backdrop closes, focus trapped. */
export function Lightbox({ open, onClose, layoutId, src, alt, caption }: Props) {
  const dialog = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement as HTMLElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>('button')?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      returnTo.current?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-menu flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.3 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <m.figure layoutId={reduced ? undefined : layoutId} className="relative max-h-full" onClick={(e) => e.stopPropagation()} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
            <img src={src} alt={alt} className="max-h-[85svh] w-auto max-w-full object-contain shadow-amber-glow" />
            {caption && <figcaption className="mt-3 text-center font-body text-sm text-bone/70">{caption}</figcaption>}
          </m.figure>
          <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-12 w-12 place-items-center border border-bone/30 text-bone hover:border-amber hover:text-amber md:right-8 md:top-8" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" /></svg>
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}
