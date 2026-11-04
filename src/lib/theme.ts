import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'
const KEY = 'grncpl:theme'

export const readTheme = (): Theme => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#F4F0E8' : '#0B0B0C')
  try { localStorage.setItem(KEY, t) } catch { /* private mode */ }
}

/** Current theme + toggle. Dark is the default; the choice persists in localStorage. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(readTheme()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return [theme, () => applyTheme(theme === 'light' ? 'dark' : 'light')]
}

/** Reads a colour token (e.g. 'amber') from the nearest element's CSS variables as an rgb() string. */
export function token(name: 'ink' | 'coal' | 'steel' | 'bone' | 'amber' | 'safety', el: Element = document.documentElement): string {
  const v = getComputedStyle(el).getPropertyValue(`--c-${name}`).trim()
  return v ? `rgb(${v.split(/\s+/).join(',')})` : '#000'
}
