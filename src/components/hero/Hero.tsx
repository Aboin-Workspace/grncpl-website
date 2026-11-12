import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { hasWebGL } from '@/lib/webgl'
import { onIdle } from '@/lib/idle'
import { HERO, DURATION } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { usePointerFine } from '@/hooks/useMediaQuery'
import type { HeroSlide } from '@/data/home'
import { HeroCanvas, type HeroCanvasHandle } from './HeroCanvas'
import { HeroFallback } from './HeroFallback'
import { StrataLines } from './StrataLines'
import { ParticleField, type ParticleFieldHandle } from './ParticleField'
import { HeroHeadline, type HeroHeadlineHandle } from './HeroHeadline'
import { SlideChrome } from './SlideChrome'
import { ScrollCue } from './ScrollCue'
import { Link } from 'react-router-dom'
import { HERO_CTAS } from '@/data/home'

interface Props {
  slides: HeroSlide[]
  subtext: string
  /** Gate from the preloader: the headline timeline only starts once true. */
  started?: boolean
  /** Dev/test: force the non-WebGL fallback. */
  forceFallback?: boolean
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Six-layer hero. Owns slide index, autoplay, keyboard/swipe, and the single
 * ScrollTrigger exit timeline. GSAP drives scroll + timelines; Framer drives
 * the swipe layer and the magnetic buttons (never the same element).
 */
export function Hero({ slides, subtext, started = true, forceFallback = false }: Props) {
  const n = slides.length
  const reduced = useReducedMotion()
  const webgl = useMemo(() => !forceFallback && hasWebGL(), [forceFallback])
  // The still image paints first; WebGL starts once the page has settled, so it never blocks phone load.
  const [canvasFrom, setCanvasFrom] = useState<number | null>(null)
  const canvasWanted = webgl && !reduced
  const useCanvas = canvasWanted && canvasFrom !== null

  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HeroCanvasHandle>(null)
  const particles = useRef<ParticleFieldHandle>(null)
  const headline = useRef<HeroHeadlineHandle>(null)
  const headlineWrap = useRef<HTMLDivElement>(null)
  const strata = useRef<SVGSVGElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const vignette = useRef<HTMLDivElement>(null)
  const exitState = useRef({ progress: 0 })
  const inView = useRef(true)
  const firstRender = useRef(true)

  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  indexRef.current = index
  useEffect(() => {
    if (!canvasWanted || !started) return
    let cancelIdle = () => {}
    const id = window.setTimeout(() => { cancelIdle = onIdle(() => setCanvasFrom(indexRef.current)) }, HERO.canvasDelayMs)
    return () => { window.clearTimeout(id); cancelIdle() }
  }, [canvasWanted, started])
  const [paused, setPaused] = useState(false)
  // Off-screen (scrolled past) or hidden tab: autoplay waits.
  const [offscreen, setOffscreen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [manualTick, setManualTick] = useState(0)
  // Pointer parallax (desktop, fine pointer): the headline block drifts a few px against the pointer.
  const fine = usePointerFine()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 20, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 120, damping: 20, mass: 0.6 })
  const onParallax = (e: React.PointerEvent) => {
    if (!fine || reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(-((e.clientX - r.left) / r.width - 0.5) * 2 * HERO.pointerParallaxPx.x)
    py.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * HERO.pointerParallaxPx.y)
  }
  // Mount the dust field after first paint so it never competes with the LCP image + headline.
  const [dustReady, setDustReady] = useState(false)
  useEffect(() => onIdle(() => setDustReady(true)), [])

  const goTo = useCallback(
    (i: number, manual = true) => {
      setIndex(((i % n) + n) % n)
      if (manual) setManualTick((t) => t + 1)
    },
    [n],
  )
  const next = useCallback((manual = true) => goTo(index + 1, manual), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // ---- slide change: liquid wipe + dust burst ------------------------------
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    canvas.current?.goTo(index)
    if (reduced) return
    const delay = (HERO.headline.exit.duration - HERO.headline.overlap) * 1000
    const t = window.setTimeout(() => {
      const rect = headline.current?.getBaselineRect()
      const rootRect = root.current?.getBoundingClientRect()
      if (rect && rootRect) particles.current?.burst(rect.left - rootRect.left, rect.bottom - rootRect.top, rect.width)
    }, delay)
    return () => window.clearTimeout(t)
  }, [index, reduced])

  // ---- autoplay progress (GSAP tween on the active bar's --p) ---------------
  const autoplay = useRef<gsap.core.Tween | null>(null)
  useEffect(() => {
    const bars = chrome.current?.querySelectorAll<HTMLElement>('[data-progress-bar]')
    if (!bars || !started) return
    autoplay.current?.kill()
    bars.forEach((b) => gsap.set(b, { '--p': 0 }))
    const bar = bars[index]
    autoplay.current = gsap.fromTo(bar, { '--p': 0 }, { '--p': 1, duration: HERO.autoplayMs / 1000, ease: 'none', onComplete: () => goTo(index + 1, false) })
    return () => {
      autoplay.current?.kill()
    }
  }, [index, started, goTo, manualTick])
  useEffect(() => {
    const t = autoplay.current
    if (!t) return
    // Hovering does NOT pause: the hero fills the viewport, so a resting mouse would stop the show.
    if (paused || focused || offscreen) t.pause()
    else t.play()
  }, [paused, focused, offscreen, index, manualTick])

  // ---- keyboard ------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inView.current) return
      const t = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === ' ' && (t === document.body || t === root.current)) {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [next, prev])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.intersectionRatio >= HERO.visibleThreshold
      setOffscreen(!inView.current)
    }, { threshold: [0, HERO.visibleThreshold, 1] })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // ---- strata draw-in ------------------------------------------------------
  useGSAP(
    () => {
      if (reduced || !started) return
      const paths = strata.current?.querySelectorAll<SVGPathElement>('.strata-path')
      if (!paths?.length) return
      paths.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      const D = HERO.strata.draw
      gsap.to(paths, { strokeDashoffset: 0, duration: D.duration, stagger: D.stagger, ease: D.ease, delay: D.delay })
    },
    { scope: root, dependencies: [reduced, started] },
  )

  // ---- scroll exit: pin + scrub ------------------------------------------
  useGSAP(
    () => {
      if (reduced) return
      const paths = Array.from(strata.current?.querySelectorAll<SVGPathElement>('.strata-path') ?? [])
      const group = strata.current?.querySelector('.strata-group')
      const S = HERO.strata
      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: `+=${HERO.exit.pinPercent}%`,
          pin: true,
          scrub: HERO.exit.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to(headlineWrap.current, { scale: HERO.exit.headlineScale, opacity: 0, transformOrigin: '0% 100%' }, 0)
      tl.to(exitState.current, { progress: 1 }, 0)
      tl.to(vignette.current, { opacity: 1 }, 0)
      tl.to(chrome.current, { opacity: 0, duration: 0.5 }, 0)
      tl.to('[data-scroll-cue]', { opacity: 0, duration: 0.3 }, 0)
      tl.to(paths, { yPercent: (i: number) => lerp(S.parallax.minPercent, S.parallax.maxPercent, paths.length > 1 ? i / (paths.length - 1) : 0) }, 0)
      if (group) tl.to(group, { scaleY: S.converge.scaleY, duration: 1 - S.converge.startAt }, S.converge.startAt)
    },
    { scope: root, dependencies: [reduced] },
  )


  return (
    <section
      ref={root}
      className="theme-dark relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink"
      aria-roledescription="carousel"
      aria-label="GRN Constructions highlights"
      onPointerLeave={() => { px.set(0); py.set(0) }}
      onPointerMove={onParallax}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
    >
      {/* Layer 1 — image */}
      {useCanvas ? (
        <HeroCanvas ref={canvas} slides={slides} initialIndex={canvasFrom ?? 0} pointerTarget={root} exitRef={exitState} />
      ) : (
        <HeroFallback slides={slides} index={index} reduced={reduced} />
      )}
      <div className="pointer-events-none absolute inset-0 bg-scrim" aria-hidden="true" />
      {/* Top scrim so the header (logo + nav) stays legible over bright skies. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[34vh] min-h-[180px] bg-scrim-top" aria-hidden="true" />

      {/* Layer 2 — strata */}
      <StrataLines ref={strata} />

      {/* Layer 3 — dust */}
      {!reduced && dustReady && <ParticleField ref={particles} pointerTarget={root} />}

      {/* Swipe layer (Framer) */}
      <m.div
        className="absolute inset-0 z-10"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.x < -HERO.swipeThresholdPx) next()
          else if (info.offset.x > HERO.swipeThresholdPx) prev()
        }}
        data-cursor="Drag"
        aria-hidden="true"
      />

      {/* Layer 4 — headline */}
      <div ref={headlineWrap} className="hero-copy hero-photo pointer-events-none absolute inset-x-gutter z-10 flex flex-col justify-end lg:right-[16rem]">
        <m.div className="w-full" style={{ x: sx, y: sy }}>
          <HeroHeadline ref={headline} slides={slides} index={index} subtext={subtext} started={started} reduced={reduced} />
          {/* CTAs: existing nav destinations, revealed after the headline settles */}
          <m.div
            className="pointer-events-auto mt-[var(--hero-gap)] flex flex-wrap gap-3"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={started ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={HERO_CTAS.primary.href} className="btn-sweep inline-flex items-center gap-3 bg-amber px-6 py-3.5 font-body text-[12px] font-bold uppercase tracking-[0.18em] text-ink" data-cursor-grow>
              {HERO_CTAS.primary.label}<span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to={HERO_CTAS.secondary.href} className="inline-flex items-center gap-3 border border-bone/30 px-6 py-3.5 font-body text-[12px] font-bold uppercase tracking-[0.18em] text-bone backdrop-blur-sm transition-colors duration-fast hover:border-amber hover:text-amber" data-cursor-grow>
              {HERO_CTAS.secondary.label}
            </Link>
          </m.div>
        </m.div>
      </div>

      {/* Exit darkening (also covers the fallback) */}
      <div ref={vignette} className="pointer-events-none absolute inset-0 z-[15] bg-ink/80 opacity-0" aria-hidden="true" />

      {/* Layer 5 — chrome */}
      <SlideChrome ref={chrome} slides={slides} index={index} paused={paused || focused || offscreen} onSelect={goTo} onPrev={prev} onNext={() => next()} />
      {!reduced && <ScrollCue />}

      <div className="sr-only" aria-live={paused ? 'polite' : 'off'} aria-atomic="true">
        Slide {index + 1} of {n}: {slides[index].title}
      </div>
      <span className="sr-only">{reduced ? '' : `Transitions take ${DURATION.liquid} seconds.`}</span>
    </section>
  )
}
