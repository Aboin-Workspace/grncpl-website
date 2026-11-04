import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

/** Desktop + mouse/trackpad: the only case where the custom cursor and magnetic effects run. */
export const usePointerFine = () => useMediaQuery('(pointer: fine) and (min-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
