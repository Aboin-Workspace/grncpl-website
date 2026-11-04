import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { m } from 'motion/react'
import { SITE } from '@/data/nav'
import { HEADER } from '@/config/motion'
import { useLenisScroll } from '@/hooks/useLenisScroll'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { DesktopNav } from './DesktopNav'
import { MobileMenu } from './MobileMenu'
import { ThemeToggle } from './ThemeToggle'
import { ScrollProgress } from '@/components/motion/ScrollProgress'

/**
 * Transparent over the hero, glass once scrolled. Hides on scroll-down and
 * reveals on scroll-up using Lenis direction + velocity.
 */
export function Header() {
  const [glass, setGlass] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  // Over the home hero the header sits on dark imagery, so it keeps the dark palette until it turns to glass.
  const overHero = pathname === '/' && !glass && !menuOpen

  useLenisScroll(
    useCallback((e) => {
      setGlass(e.scroll > HEADER.glassAfterPx)
      if (Math.abs(e.velocity) < HEADER.velocityThreshold) return
      setHidden(e.direction === 1 && e.scroll > HEADER.hideAfterPx)
    }, []),
  )
  const close = useCallback(() => setMenuOpen(false), [])

  return (
    <>
      <m.header
        className={`fixed inset-x-0 top-0 z-header transition-[background-color,border-color,backdrop-filter] duration-base ${overHero ? 'theme-dark over-hero' : ''} ${glass || menuOpen ? 'border-b border-steel/60 bg-ink/70 backdrop-blur-glass' : 'border-b border-transparent bg-transparent'}`}
        animate={{ y: hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-gutter">
          <Link to="/" className="relative z-10 flex items-center" aria-label={`${SITE.title} home`}>
            <img src={SITE.logo} alt="" width={179} height={70} className="h-10 w-auto md:h-11" />
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            <DesktopNav />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="relative z-10 flex h-11 items-center gap-3 font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-bone lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="relative block h-3 w-6" aria-hidden="true">
              <m.span className="absolute left-0 top-0 h-px w-6 bg-bone" animate={{ y: menuOpen ? 6 : 0, rotate: menuOpen ? 45 : 0 }} />
              <m.span className="absolute bottom-0 left-0 h-px w-6 bg-bone" animate={{ y: menuOpen ? -6 : 0, rotate: menuOpen ? -45 : 0 }} />
            </span>
          </button>
          </div>
        </div>
        {glass && !menuOpen && <ScrollProgress />}
      </m.header>
      <MobileMenu open={menuOpen} onClose={close} />
    </>
  )
}
