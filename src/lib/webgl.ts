let cached: boolean | null = null

/** True when a WebGL2 (or WebGL1) context can be created. Result is memoised. */
export function hasWebGL(): boolean {
  if (cached !== null) return cached
  try {
    const c = document.createElement('canvas')
    cached = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    cached = false
  }
  return cached
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

/** Loads an image once and caches the element so the preloader and the hero share it. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imageCache.get(src)
  if (hit) return hit
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
  imageCache.set(src, p)
  return p
}

/** Picks the hero texture size for this viewport: 1080 on small screens, 3840 when the device actually needs it. */
export function pickHeroSrc(image: { src: string; srcSmall: string; srcLarge: string }): string {
  const w = window.innerWidth
  const dpr = window.devicePixelRatio || 1
  if (w < 1024) return image.srcSmall
  return w * Math.min(dpr, 2) >= 2400 ? image.srcLarge : image.src
}
