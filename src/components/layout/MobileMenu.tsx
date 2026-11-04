import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { NAV, isGroup } from '@/data/nav'
import { HEADER } from '@/config/motion'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props { open: boolean; onClose: () => void }

function Group({ label, href, children, delay }: { label: string; href?: string; children: { label: string; href: string }[]; delay: number }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  return (
    <m.li variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center justify-between">
        {href ? (
          <NavLink to={href} className="font-display text-display-md uppercase text-bone aria-[current=page]:text-amber">{label}</NavLink>
        ) : (
          <button type="button" className="font-display text-display-md uppercase text-bone" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {label}
          </button>
        )}
        <button type="button" className="grid h-10 w-10 place-items-center text-bone/70" aria-expanded={open} aria-label={`${label} submenu`} onClick={() => setOpen((o) => !o)}>
          <m.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }} className="block text-2xl leading-none">+</m.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <m.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {children.map((c) => (
              <li key={c.href} className="border-l border-amber/50 pl-4">
                <NavLink to={c.href} className="block py-2 font-body text-base text-bone/80 aria-[current=page]:text-amber">{c.label}</NavLink>
              </li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </m.li>
  )
}

export function MobileMenu({ open, onClose }: Props) {
  const location = useLocation()
  const reduced = useReducedMotion()
  const first = useRef<HTMLAnchorElement>(null)
  useBodyScrollLock(open)
  useEffect(() => { onClose() /* close on navigation */ }, [location.pathname, onClose])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => first.current?.focus())
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : HEADER.overlay.duration * 0.6 }}
          className="fixed inset-0 z-menu flex flex-col bg-ink/95 backdrop-blur-glass lg:hidden"
          data-lenis-prevent
        >
          <div className="h-20 shrink-0" />
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-gutter pb-28">
            <m.ul initial="hidden" animate="show" className="flex flex-col gap-5">
              {NAV.filter((i) => i.label !== 'Contact Us').map((item, i) => {
                const delay = HEADER.overlay.linkDelay + i * HEADER.overlay.linkStagger
                return isGroup(item) ? (
                  <Group key={item.label} label={item.label} href={item.href} children={item.children} delay={delay} />
                ) : (
                  <m.li key={item.href} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <NavLink ref={i === 0 ? first : undefined} to={item.href} end={item.href === '/'} className="font-display text-display-md uppercase text-bone aria-[current=page]:text-amber">
                      {item.label}
                    </NavLink>
                  </m.li>
                )
              })}
            </m.ul>
          </nav>
          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }} className="shrink-0 px-gutter pb-8">
            <Link to="/contact-us/" className="btn-sweep block bg-amber px-6 py-5 text-center font-display text-display-sm uppercase text-ink">
              Contact Us
            </Link>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
