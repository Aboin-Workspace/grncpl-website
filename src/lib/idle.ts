/** requestIdleCallback with a setTimeout fallback (Safari). Returns a cancel function. */
export function onIdle(fn: () => void, timeout = 1500): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(fn, Math.min(timeout, 300))
  return () => window.clearTimeout(id)
}
