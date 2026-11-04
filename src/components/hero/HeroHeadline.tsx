import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { splitText, type SplitResult } from '@/lib/split'
import { HERO, DURATION } from '@/config/motion'
import type { HeroSlide } from '@/data/home'

export interface HeroHeadlineHandle {
  /** Bounding rect (relative to the viewport) of the active headline's last line. */
  getBaselineRect: () => DOMRect | null
}

interface Props {
  slides: HeroSlide[]
  index: number
  subtext: string
  /** When false the headline stays hidden (preloader gate). */
  started: boolean
  reduced: boolean
}

const AMBER = '#8DC63F' // GRN logo green
const BONE = '#F2EDE4'

/**
 * Layer 4 — the headline. One visually-hidden <h1> carries the active title for
 * assistive tech; the animated copies are aria-hidden. Each line is masked and
 * chars enter with yPercent/rotateX/skewY on an expo timeline; the accent word
 * starts outlined and fills amber after its line lands.
 */
export const HeroHeadline = forwardRef<HeroHeadlineHandle, Props>(function HeroHeadline(
  { slides, index, subtext, started, reduced },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<(HTMLDivElement | null)[]>([])
  const subRef = useRef<HTMLParagraphElement>(null)
  const splits = useRef<(SplitResult | null)[]>([])
  const prevIndex = useRef<number | null>(null)
  const master = useRef<gsap.core.Timeline | null>(null)
  const subShown = useRef(false)
  const splitReady = useRef(false)

  useImperativeHandle(ref, () => ({
    getBaselineRect: () => {
      const s = splits.current[index]
      const line = s?.lines[s.lines.length - 1]
      return line ? line.getBoundingClientRect() : null
    },
  }), [index])

  const setHiddenState = (i: number) => {
    const s = splits.current[i]
    if (!s) return
    gsap.set(s.chars, { yPercent: HERO.headline.enter.yPercent, rotateX: HERO.headline.enter.rotateX, skewY: HERO.headline.enter.skewY })
    gsap.set(s.accentChars, { color: 'transparent', webkitTextStrokeColor: BONE })
  }
  const setShownState = (i: number) => {
    const s = splits.current[i]
    if (!s) return
    gsap.set(s.chars, { yPercent: 0, rotateX: 0, skewY: 0 })
    gsap.set(s.accentChars, { color: AMBER, webkitTextStrokeColor: AMBER })
  }

  const enter = (i: number): gsap.core.Timeline => {
    const s = splits.current[i]!
    const E = HERO.headline.enter
    const tl = gsap.timeline()
    tl.set(titleRefs.current[i], { visibility: 'visible' }, 0)
    tl.fromTo(
      s.chars,
      { yPercent: E.yPercent, rotateX: E.rotateX, skewY: E.skewY, willChange: 'transform' },
      { yPercent: 0, rotateX: 0, skewY: 0, duration: E.duration, stagger: E.stagger, ease: E.ease, clearProps: 'willChange' },
      0,
    )
    // Accent fills `delay` after the accent line lands (its last char completes).
    const lastAccent = s.accentChars[s.accentChars.length - 1]
    const landAt = s.chars.indexOf(lastAccent) * E.stagger + E.duration
    tl.fromTo(
      s.accentChars,
      { color: 'transparent', webkitTextStrokeColor: BONE },
      { color: AMBER, webkitTextStrokeColor: AMBER, duration: HERO.headline.accentFill.duration, ease: HERO.headline.accentFill.ease },
      landAt + HERO.headline.accentFill.delay,
    )
    return tl
  }
  const exit = (i: number): gsap.core.Timeline => {
    const s = splits.current[i]!
    const X = HERO.headline.exit
    const tl = gsap.timeline()
    tl.to(
      s.chars,
      {
        yPercent: X.yPercent,
        duration: X.duration,
        stagger: { each: X.stagger, from: 'end' },
        ease: X.ease,
        willChange: 'transform',
        clearProps: 'willChange',
        onComplete: () => {
          gsap.set(titleRefs.current[i], { visibility: 'hidden' })
          gsap.set(s.accentChars, { color: 'transparent', webkitTextStrokeColor: BONE })
        },
      },
      0,
    )
    return tl
  }

  // Split once fonts are ready; re-split on width change.
  useLayoutEffect(() => {
    if (reduced) return
    let cancelled = false
    let lastW = 0
    const doSplit = () => {
      splits.current.forEach((s) => s?.revert())
      splits.current = titleRefs.current.map((el, i) =>
        el ? splitText(el, { accentWords: [slides[i].accent], accentClass: 'is-accent text-outline' }) : null,
      )
      splits.current.forEach((s) => {
        s?.lines.forEach((l) => {
          l.style.perspective = `${HERO.headline.perspectivePx}px`
        })
      })
      titleRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.visibility = i === index && started ? 'visible' : 'hidden'
        if (i === index && started) setShownState(i)
        else setHiddenState(i)
      })
      splitReady.current = true
    }
    const ready = Promise.all([document.fonts.load('1em "Bebas Neue"'), document.fonts.ready]).catch(() => {})
    ready.then(() => {
      if (cancelled) return
      lastW = window.innerWidth
      doSplit()
    })
    const onResize = () => {
      if (window.innerWidth === lastW) return
      lastW = window.innerWidth
      master.current?.kill()
      master.current = null
      doSplit()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      master.current?.kill()
      splits.current.forEach((s) => s?.revert())
      splits.current = []
      splitReady.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, reduced])

  // Drive enter/exit on index change (and the initial reveal once `started`).
  useEffect(() => {
    if (reduced) return
    const run = () => {
      if (!splitReady.current) {
        requestAnimationFrame(run)
        return
      }
      if (!started) return
      const prev = prevIndex.current
      if (prev === index) return
      master.current?.kill()
      const tl = gsap.timeline()
      if (prev !== null && prev !== index) {
        tl.add(exit(prev), 0)
        tl.add(enter(index), HERO.headline.exit.duration - HERO.headline.overlap)
      } else if (prev === null) {
        tl.add(enter(index), 0)
      }
      if (!subShown.current && subRef.current) {
        subShown.current = true
        const S = HERO.headline.subtext
        tl.fromTo(subRef.current, { opacity: 0, y: S.y }, { opacity: 1, y: 0, duration: S.duration, ease: S.ease }, prev === null ? S.delay : HERO.headline.exit.duration - HERO.headline.overlap + S.delay)
      }
      master.current = tl
      prevIndex.current = index
    }
    run()
  }, [index, started, reduced])

  return (
    <div ref={rootRef} className="relative">
      <h1 className="sr-only">{slides[index].title}</h1>
      <div className="relative" aria-hidden="true">
        {slides.map((s, i) => (
          <div
            key={`${s.title}-${reduced ? 'rm' : 'full'}`}
            ref={(el) => (titleRefs.current[i] = el)}
            className={`text-hero ${i === 0 ? 'relative' : 'absolute inset-0'}`}
            style={
              reduced
                ? { opacity: i === index && started ? 1 : 0, transition: `opacity ${DURATION.reducedFade}s ease` }
                : { visibility: 'hidden' }
            }
          >
            {reduced ? (
              <>
                {s.title.split(' ').map((w, wi, arr) => (
                  <span key={wi} className={w === s.accent ? 'text-amber' : undefined}>
                    {w}
                    {wi < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </>
            ) : (
              s.title
            )}
          </div>
        ))}
      </div>
      <p
        ref={subRef}
        className="mt-6 max-w-[34rem] text-balance font-body text-body-lg text-bone/80 md:mt-8"
        style={reduced ? undefined : { opacity: 0 }}
      >
        {subtext}
      </p>
    </div>
  )
})
