export const PRELOAD_KEY = 'grncpl:preloaded'

/** True when the preloader has not yet run this session. */
export const shouldPreload = () => {
  try {
    return sessionStorage.getItem(PRELOAD_KEY) !== '1'
  } catch {
    return true
  }
}
