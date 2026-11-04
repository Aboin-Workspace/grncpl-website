import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { usePointerFine } from '@/hooks/useMediaQuery'

interface Props { to: string; children: string; className?: string; tone?: 'amber' | 'outline' }

/** Amber CTA link with a tap/hover micro-interaction (Framer). */
export function CtaLink({ to, children, className = '', tone = 'amber' }: Props) {
  const reduced = useReducedMotion()
  const fine = usePointerFine()
  const base = tone === 'amber' ? 'btn-sweep bg-amber text-ink' : 'btn-sweep border border-bone/40 text-bone hover:border-safety hover:text-ink'
  return (
    <m.span whileHover={!reduced && fine ? { x: 4 } : undefined} whileTap={!reduced ? { scale: 0.96 } : undefined} className="inline-block">
      <Link to={to} className={`inline-flex items-center gap-3 px-7 py-4 font-body text-sm font-bold uppercase tracking-[0.18em] transition-colors duration-fast ${base} ${className}`} data-cursor-grow>
        {children}
        <span aria-hidden="true" className="btn-arrow">→</span>
      </Link>
    </m.span>
  )
}
