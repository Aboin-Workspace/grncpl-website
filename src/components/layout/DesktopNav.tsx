import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { NAV, isGroup, type NavGroup } from '@/data/nav'
import { HEADER } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const linkBase = 'font-body text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-fast'
const topLink = `${linkBase} nav-link text-bone/80 hover:text-bone aria-[current=page]:text-amber`

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="ml-1.5 inline-block">
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  )
}

function Dropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const wrap = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const location = useLocation()
  const items = () => Array.from(wrap.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? [])

  useEffect(() => setOpen(false), [location.pathname])

  const onKeyDown = (e: KeyboardEvent) => {
    const list = items()
    const i = list.indexOf(document.activeElement as HTMLAnchorElement)
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        button.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) setOpen(true)
        requestAnimationFrame(() => (items()[Math.min(i + 1, items().length - 1)] ?? items()[0])?.focus())
        break
      case 'ArrowUp':
        e.preventDefault()
        if (i <= 0) button.current?.focus()
        else list[i - 1]?.focus()
        break
      case 'Home':
        e.preventDefault()
        list[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        list[list.length - 1]?.focus()
        break
    }
  }

  return (
    <div
      ref={wrap}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onBlur={(e) => !wrap.current?.contains(e.relatedTarget as Node) && setOpen(false)}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-center">
        {group.href ? (
          <NavLink to={group.href} className={topLink} end>
            {group.label}
          </NavLink>
        ) : (
          <span className={`${topLink} cursor-default`} onClick={() => setOpen((o) => !o)}>
            {group.label}
          </span>
        )}
        <button
          ref={button}
          type="button"
          className="rounded p-1 text-bone/70 hover:text-bone"
          aria-expanded={open}
          aria-controls={id}
          aria-haspopup="true"
          aria-label={`${group.label} submenu`}
          onClick={() => setOpen((o) => !o)}
        >
          <Chevron />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <m.ul
            id={id}
            role="menu"
            aria-label={group.label}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, y: reduced ? 0 : HEADER.dropdown.y, transition: { duration: HEADER.dropdown.duration, ease: HEADER.dropdown.ease } },
              show: { opacity: 1, y: 0, transition: { duration: HEADER.dropdown.duration, ease: HEADER.dropdown.ease, staggerChildren: reduced ? 0 : 0.035, delayChildren: 0.05 } },
            }}
            className="absolute left-0 top-full z-10 min-w-[16rem] border border-steel/80 bg-coal/95 py-2 shadow-amber-glow backdrop-blur-glass"
          >
            {group.children.map((c) => (
              <m.li key={c.href} role="none" variants={{ hidden: { opacity: 0, x: reduced ? 0 : -8 }, show: { opacity: 1, x: 0 } }}>
                <Link
                  to={c.href}
                  role="menuitem"
                  tabIndex={-1}
                  className="block px-5 py-2.5 font-body text-sm text-bone/85 transition-colors duration-fast hover:bg-steel/40 hover:text-amber focus-visible:bg-steel/40 focus-visible:text-amber"
                >
                  {c.label}
                </Link>
              </m.li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DesktopNav() {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
      {NAV.filter((i) => i.label !== 'Contact Us').map((item) =>
        isGroup(item) ? (
          <Dropdown key={item.label} group={item} />
        ) : (
          <NavLink key={item.href} to={item.href} className={topLink} end={item.href === '/'}>
            {item.label}
          </NavLink>
        ),
      )}
      <Link to="/contact-us/" className={`${linkBase} btn-sweep border border-amber px-4 py-2 text-amber hover:text-ink`} data-cursor-grow>
        Contact Us
      </Link>
    </nav>
  )
}
