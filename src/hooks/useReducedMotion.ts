import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** True when the OS asks for reduced motion OR the dev override `<html data-reduced-motion="1">` is set. */
export function readReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(QUERY).matches || document.documentElement.dataset.reducedMotion === '1'
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const update = () => setReduced(readReducedMotion())
    mq.addEventListener('change', update)
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] })
    return () => {
      mq.removeEventListener('change', update)
      mo.disconnect()
    }
  }, [])
  return reduced
}
