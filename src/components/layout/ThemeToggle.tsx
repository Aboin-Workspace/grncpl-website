import { m } from 'motion/react'
import { useTheme } from '@/lib/theme'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, toggle] = useTheme()
  const reduced = useReducedMotion()
  const light = theme === 'light'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={light}
      title={light ? 'Dark theme' : 'Light theme'}
      className={`relative grid h-10 w-10 place-items-center rounded-full border border-bone/25 text-bone transition-colors duration-fast hover:border-amber hover:text-amber ${className}`}
      data-cursor-grow
    >
      <m.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" animate={{ rotate: light ? 180 : 0 }} transition={{ duration: reduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}>
        {light ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </m.svg>
    </button>
  )
}
