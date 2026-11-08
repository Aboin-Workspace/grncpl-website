/**
 * Single source of truth for every motion constant on the site.
 * Durations are in seconds unless the key ends in `Ms` or `Px`.
 * GSAP eases are strings; the CSS mirrors live in src/styles/globals.css.
 */

export const EASE = {
  expoOut: 'expo.out',
  expoInOut: 'expo.inOut',
  power3InOut: 'power3.inOut',
  power3In: 'power3.in',
  power2Out: 'power2.out',
  none: 'none',
} as const

export const DURATION = {
  fast: 0.2,
  base: 0.6,
  slow: 1.1,
  wipe: 0.7,
  liquid: 1.6,
  /** All motion collapses to this when prefers-reduced-motion is set. */
  reducedFade: 0.2,
} as const

export const BREAKPOINT = { md: 768, lg: 1024, xl: 1440 } as const

export const HERO = {
  /** Slides advance on their own every 6s (progress bar in the chrome). Hover never pauses; focus/Space/off-screen do. */
  autoplayMs: 6000,
  swipeThresholdPx: 60,
  /** Fraction of the hero that must be visible for keyboard control + rAF to run. */
  visibleThreshold: 0.35,

  headline: {
    perspectivePx: 900,
    enter: { duration: 1.1, stagger: 0.025, yPercent: 110, rotateX: -40, skewY: 6, ease: EASE.expoOut },
    exit: { duration: 0.6, stagger: 0.015, yPercent: -110, ease: EASE.power3In },
    /** Exit and next-slide enter overlap by this much so the text feels continuous. */
    overlap: 0.3,
    accentFill: { delay: 0.4, duration: 0.5, ease: EASE.power2Out },
    subtext: { delay: 0.2, duration: 0.8, y: 24, ease: EASE.power2Out },
  },

  liquid: { duration: DURATION.liquid, ease: EASE.power3InOut, edgePx: 2, softness: 0.05, chromaticOffset: 0.004 },

  webgl: {
    dprCap: 1.5,
    idleScale: 1.03,
    /** Period (s) of the slow scale drift between 1 and idleScale. */
    idlePeriod: 14,
    idleFlow: 0.15,
    /** Time constant for the pointer bulge to settle back to rest (~1.2s to rest). */
    pointerDecaySeconds: 1.2,
    pointerRadius: 0.22,
    pointerMaxStrength: 1,
    /** px/ms → strength multiplier. 1px/ms (fast flick) ≈ full strength. */
    pointerVelocityScale: 1.1,
    pointerFollow: 0.18,
    exitZoom: 1.15,
    exitDarken: 0.45,
    vignette: 0.38,
    /** Colour grade applied in the shader so the photography reads rich, not flat. */
    grade: { contrast: 1.1, saturation: 1.15, warmth: 0.06, lift: 0.015 },
    /** Pseudo-depth parallax: uv shift (in uv units) at the bottom of the frame for a pointer at the edge. */
    depthParallax: 0.012,
    depthFollow: 0.06,
  },

  strata: {
    count: 6,
    opacity: 0.2,
    strokeWidth: 1.25,
    /** SVG viewBox units; the svg covers the bottom third of the hero. */
    viewBox: { w: 1440, h: 400 },
    segments: 14,
    amplitude: 26,
    seed: 1983,
    draw: { duration: 1.6, stagger: 0.08, ease: EASE.power2Out, delay: 0.3 },
    parallax: { minPercent: -5, maxPercent: -20 },
    converge: { scaleY: 0.02, startAt: 0.25 },
  },

  particles: {
    desktop: 240,
    mobile: 80,
    burstMs: 300,
    burstCount: 70,
    burstSpeed: 1.6,
    drift: { x: 0.12, y: -0.22 },
    jitter: 0.08,
    pointerRadiusPx: 140,
    pointerForce: 0.9,
    alpha: { min: 0.08, max: 0.45 },
    size: { min: 0.8, max: 2.2 },
    amberRatio: 0.35,
    friction: 0.985,
  },

  exit: { headlineScale: 0.85, pinPercent: 100, /** Scrub smoothing (s) so the exit glides instead of tracking the wheel 1:1. */ scrub: 0.6 },
  /** Pointer parallax on the headline block (px at the viewport edge). */
  pointerParallaxPx: { x: 18, y: 12 },

  magnetic: { radiusPx: 80, strength: 0.35, spring: { stiffness: 200, damping: 18, mass: 0.6 } },

  scrollCue: { lineHeightPx: 48, pulseDuration: 1.8 },
} as const

export const CURSOR = {
  dotPx: 12,
  ringPx: 40,
  ringActivePx: 72,
  spring: { stiffness: 300, damping: 28 },
} as const

export const PRELOADER = {
  minMs: 1600,
  maxMs: 4000,
  reducedMs: 400,
  curtainDuration: 0.9,
} as const

export const PAGE_TRANSITION = { duration: DURATION.wipe, ease: EASE.expoInOut } as const

export const HEADER = {
  /** Scroll depth (px) after which the header turns to glass. */
  glassAfterPx: 40,
  /** Hide on scroll-down only after this depth. */
  hideAfterPx: 160,
  /** Lenis velocity (px/frame) that counts as intentional scrolling. */
  velocityThreshold: 2,
  dropdown: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], y: 8 },
  overlay: { duration: 0.5, linkStagger: 0.05, linkDelay: 0.15 },
} as const

export const REVEAL = {
  duration: 0.9,
  y: 32,
  stagger: 0.08,
  start: 'top 85%',
  ease: EASE.expoOut,
  mask: { duration: 1.1, yPercent: 110, stagger: 0.02, ease: EASE.expoOut },
} as const

export const COUNTER = {
  duration: 1.4,
  digitStagger: 0.08,
  ease: EASE.expoOut,
  underline: { duration: 0.5, ease: EASE.power2Out },
  start: 'top 80%',
} as const

export const PILLARS = {
  /** Extra scroll distance while pinned: 3 panels → 300vh including the pinned viewport. */
  pinScrollPercent: 200,
  indexDrift: { from: 12, to: -12 },
} as const

export const NATION = { wordStagger: 0.02, scrub: 0.6, start: 'top 75%', end: 'bottom 55%' } as const

export const DECK = {
  fanRotation: 4,
  fanOffsetX: 28,
  fanOffsetY: 10,
  scaleStep: 0.05,
  spring: { type: 'spring', stiffness: 260, damping: 26 } as const,
  swipeThresholdPx: 60,
} as const

export const CSR_STRIP = { scrub: 1, start: 'top top', endPaddingPx: 48 } as const

export const TILT = { maxDeg: 8, spring: { stiffness: 220, damping: 20 }, scale: 1.02 } as const

export const MARQUEE = {
  /** Seconds for one full loop at rest. */
  loopSeconds: 28,
  /** How much scroll velocity (Lenis, px/frame) adds to the time scale. */
  velocityFactor: 0.06,
  maxTimeScale: 4,
  lerp: 0.08,
  /** Degrees the strip leans at ±3000px/s scroll velocity. */
  maxSkewDeg: 6,
} as const

export const PARALLAX = { imageYPercent: -15, zoomScale: 1.12, zoomDuration: 12 } as const

export const CAROUSEL = {
  perspectivePx: 1200,
  spacingPercent: 62,
  sideScale: 0.82,
  sideRotateY: 28,
  spring: { type: 'spring', stiffness: 200, damping: 26 } as const,
  swipeThresholdPx: 60,
} as const

export const TABLE = { rowStagger: 0.04, rowDuration: 0.6, layoutSpring: { type: 'spring', stiffness: 300, damping: 32 } as const } as const

/**
 * Procedural open-pit terrain (OGL, src/components/three/TerrainMesh.tsx).
 * A stepped pit of `benches` with a spiral haul road, drawn as a survey wireframe.
 */
export const TERRAIN = {
  /** Grid resolution per side (vertices = (grid+1)²). */
  grid: { desktop: 110, mobile: 64 },
  dprCap: 1.5,
  /** Pit geometry in mesh units (the mesh spans -1..1). */
  pit: { radius: 0.82, benches: 5, benchWidth: 0.12, benchDepth: 0.075, rampFraction: 0.28 },
  /** Spiral haul road: angular width (rad) and how many turns it makes from rim to floor. */
  road: { width: 0.55, turns: 1.1 },
  noise: { amplitude: 0.09, frequency: 2.4, drift: 0.04 },
  camera: { fov: 36, position: [0, 1.25, 2.1] as [number, number, number], lookAt: [0, -0.22, 0] as [number, number, number] },
  /** Slow idle orbit (rad/s) and the pointer's extra yaw/pitch (rad) at the viewport edge. */
  orbit: { speed: 0.045, pointerYaw: 0.35, pointerPitch: 0.12, lerp: 0.06 },
  /** Scroll progress 0..1 lifts the camera and tilts the pit toward the viewer. */
  scroll: { lift: 0.5, tilt: 0.35 },
  /** Amber survey ring sweeping outward from the pit floor. */
  scan: { period: 6, width: 0.05, intensity: 1.0 },
  line: { alpha: 0.55, fogStart: 1.2, fogEnd: 3.2 },
  /** Light theme: earth tones by depth (surface ochre → pit-floor umber) and stronger lines on paper. */
  light: { surface: [158, 110, 58] as [number, number, number], deep: [88, 52, 26] as [number, number, number], alphaBoost: 3.6 },
  points: { size: 2.2, alpha: 0.5 },
  /** Fade-in on mount. */
  reveal: 1.6,
} as const

/**
 * Scroll-driven 3D hero (src/components/hero/WorldHero.tsx). The camera flies from an
 * aerial view down the spiral haul road to the pit floor over `pinPercent` of scroll.
 */
export const WORLD = {
  grid: 240,
  /** Bench batter as a fraction of bench width (wider than the wireframe's so flat shading reads as a slope, not a saw). */
  ramp: 0.55,
  /** Half-extent of the terrain in mesh units (the pit radius is 0.82). */
  extent: 2.4,
  dprCap: 1.5,
  /** Extra scroll while pinned: 4 stages across this distance. */
  pinPercent: 320,
  scrub: 0.9,
  camera: { fov: 46, near: 0.02, far: 12, roadLift: 0.09 },
  /** Lighting + atmosphere (linear RGB 0..1). */
  sun: [0.45, 0.75, 0.35] as [number, number, number],
  sky: { top: [0.52, 0.60, 0.66], horizon: [0.86, 0.82, 0.74], haze: 0.9 },
  fog: { color: [0.80, 0.76, 0.68] as [number, number, number], density: 0.22 },
  /** Surface relief: gentle rolling ground outside the rim, nearly flat benches inside. */
  relief: { amplitude: 0.05, frequency: 1.6, inner: 0.05 },
  earth: {
    surface: [0.60, 0.46, 0.29] as [number, number, number],
    bench: [0.72, 0.58, 0.38] as [number, number, number],
    rock: [0.30, 0.33, 0.36] as [number, number, number],
    deep: [0.24, 0.22, 0.20] as [number, number, number],
    road: [0.46, 0.41, 0.35] as [number, number, number],
  },
  trucks: { count: 7, speed: 0.11, paint: [0.93, 0.70, 0.12] as [number, number, number], scale: 0.6, trailPuffs: 14, trailAlpha: 0.22 },
  /** Fraction of a stage the scroll must pass a boundary by before the headline changes. */
  stageHysteresis: 0.08,
  pointer: { yaw: 0.14, pitch: 0.07, lerp: 0.05 },
  /** Dust motes in the air (GL points). */
  dust: { count: 900, size: 2.2, alpha: 0.35 },
} as const

export const FLEET = {
  panel: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  rowStagger: 0.06,
  barDuration: 0.9,
  /** HUD frame scan line sweep (s). */
  scanSeconds: 4.5,
  imageReveal: { duration: 1.1, ease: [0.87, 0, 0.13, 1] as [number, number, number, number] },
} as const

export const PYRAMID = {
  /** Auto-cycle through tiers until the user interacts (ms). */
  cycleMs: 2800,
  build: { stagger: 0.14, duration: 0.9, y: 40 },
  lift: { y: -10, spring: { type: 'spring', stiffness: 320, damping: 26 } as const },
  /** Side-face extrusion in viewBox units. */
  depth: { x: 16, y: 10 },
  connector: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
} as const

export const VALUES_WHEEL = {
  cycleMs: 2600,
  /** Full rotation time of the letter ring (s). */
  ringSeconds: 60,
  build: { stagger: 0.1, duration: 0.8 },
  lift: { scale: 1.04, spring: { type: 'spring', stiffness: 300, damping: 24 } as const },
} as const

export const CHART = { barDuration: 1200, barStagger: 90, lineDuration: 1600, lineDelay: 500 } as const
