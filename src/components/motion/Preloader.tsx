import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { loadImage, pickHeroSrc } from '@/lib/webgl'
import { PRELOADER, EASE } from '@/config/motion'
import { SITE } from '@/data/nav'
import { HERO_SLIDES } from '@/data/home'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PRELOAD_KEY } from '@/lib/preload'

interface Props {
  /** Current pathname; on the home route the first hero image is part of the budget. */
  pathname: string
  /** Fires when the curtain starts to open, so the page underneath can start its intro in sync. */
  onReveal?: () => void
  onDone: () => void
  /** 'curtain' = opaque loader with the excavator scene; 'hud' = transparent game-style readout over the live 3D hero. */
  variant?: 'curtain' | 'hud'
}

/** Scene (viewBox 800×420): ground surface at y=320, strata below it. */
const GROUND = 320
const STRATA = [
  'M0 340 C 140 332, 280 348, 420 340 S 700 330, 800 342 L800 360 L0 360 Z',
  'M0 362 C 160 370, 320 354, 480 364 S 740 372, 800 362 L800 384 L0 384 Z',
  'M0 386 C 120 378, 300 394, 440 386 S 680 378, 800 388 L800 420 L0 420 Z',
]
/** Excavator pivots (viewBox units). */
const SHOULDER = [300, 232] as const
const ELBOW = [470, 118] as const
const WRIST = [566, 252] as const

/**
 * Logo clip-path reveal + 0→100 counter driven by real asset loading (fonts,
 * logo, first hero image). The scene is a line-art excavator working a strata
 * cross-section; the amber cut line along the ground is the real progress. Min 1.6s / max 4s, then a
 * two-panel curtain from the centre. Runs once per session. Reduced motion: 400ms fade.
 */
export function Preloader({ pathname, onReveal, onDone, variant = 'curtain' }: Props) {
  const hud = variant === 'hud'
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const logo = useRef<HTMLImageElement>(null)
  const cut = useRef<HTMLDivElement>(null)
  const scene = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    const t0 = performance.now()
    const tasks: Promise<unknown>[] = [document.fonts.ready, document.fonts.load('1em "Bebas Neue"'), loadImage(SITE.logo)]
    if (pathname === '/') {
      const s = HERO_SLIDES[0]
      tasks.push(loadImage(pickHeroSrc(s.image)))
    }
    let completed = 0
    tasks.forEach((p) => p.catch(() => {}).then(() => completed++))

    const state = { shown: 0 }
    const finish = () => {
      if (cancelled) return
      try { sessionStorage.setItem(PRELOAD_KEY, '1') } catch { /* private mode */ }
      const el = root.current
      if (!el) return onDone()
      if (reduced) {
        onReveal?.()
        gsap.to(el, { opacity: 0, duration: PRELOADER.reducedMs / 1000, ease: 'power1.out', onComplete: () => { setDone(true); onDone() } })
        return
      }
      const tl = gsap.timeline({ onComplete: () => { setDone(true); onDone() } })
      if (hud) {
        tl.call(() => onReveal?.(), [], 0)
        tl.to(el.querySelectorAll('[data-pre-content]'), { opacity: 0, scale: 1.04, duration: 0.6, ease: 'power2.inOut', stagger: 0.03 }, 0)
        tl.to(el, { opacity: 0, duration: 0.4 }, 0.5)
        return
      }
      tl.to(el.querySelectorAll('[data-pre-content]'), { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in', stagger: 0.04 })
      tl.call(() => onReveal?.(), [], '-=0.05')
      tl.to(el.querySelector('[data-curtain="top"]'), { scaleY: 0, transformOrigin: '50% 0%', duration: PRELOADER.curtainDuration, ease: EASE.expoInOut }, '<')
      tl.to(el.querySelector('[data-curtain="bottom"]'), { scaleY: 0, transformOrigin: '50% 100%', duration: PRELOADER.curtainDuration, ease: EASE.expoInOut }, '<')
    }

    if (reduced) {
      const id = window.setTimeout(finish, PRELOADER.reducedMs)
      return () => { cancelled = true; window.clearTimeout(id) }
    }

    gsap.fromTo(logo.current, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: EASE.expoInOut, delay: 0.1 })
    // Excavator dig cycle: boom, stick and bucket swing on nested pivots; dust bursts at the bottom of the stroke.
    const sv = scene.current
    if (sv && !hud) {
      const boom = sv.querySelector('[data-boom]')
      const stick = sv.querySelector('[data-stick]')
      const bucket = sv.querySelector('[data-bucket]')
      const dust = Array.from(sv.querySelectorAll<SVGCircleElement>('[data-dust]'))
      const burst = () => {
        dust.forEach((d) => {
          gsap.killTweensOf(d)
          gsap.fromTo(d, { attr: { cx: WRIST[0] + 20 + (Math.random() - 0.5) * 30, cy: GROUND + 4 }, opacity: 0.9, scale: 0.5 }, { attr: { cx: `+=${(Math.random() - 0.3) * 90}`, cy: `-=${30 + Math.random() * 70}` }, opacity: 0, scale: 1.4, duration: 0.7 + Math.random() * 0.4, ease: 'power2.out', transformOrigin: '50% 50%' })
        })
      }
      const dig = gsap.timeline({ repeat: -1, defaults: { ease: 'power1.inOut' } })
      dig.fromTo(boom, { rotation: -14, svgOrigin: SHOULDER.join(' ') }, { rotation: 8, duration: 1.1 }, 0)
      dig.fromTo(stick, { rotation: -12, svgOrigin: ELBOW.join(' ') }, { rotation: 26, duration: 1.1 }, 0)
      dig.fromTo(bucket, { rotation: -30, svgOrigin: WRIST.join(' ') }, { rotation: 38, duration: 1.0, ease: 'power2.in' }, 0.15)
      dig.call(burst, [], 1.1)
      dig.to(bucket, { rotation: 70, duration: 0.5, ease: 'power2.out' }, 1.1) // curl: scoop closes
      dig.to(boom, { rotation: -14, duration: 1.2 }, 1.3)
      dig.to(stick, { rotation: -12, duration: 1.2 }, 1.3)
      dig.to(bucket, { rotation: -30, duration: 0.8 }, 1.9)
      // Body idles with a slight settle each stroke.
      gsap.to(sv.querySelector('[data-body]'), { y: 1.5, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      // Strata draw themselves in once.
      const layers = sv.querySelectorAll<SVGPathElement>('[data-strata]')
      gsap.fromTo(layers, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out', delay: 0.15 })
    }

    const tick = () => {
      if (cancelled) return
      const elapsed = performance.now() - t0
      const real = completed / tasks.length
      const timeFloor = Math.min(1, elapsed / PRELOADER.minMs)
      const forced = elapsed >= PRELOADER.maxMs
      const target = forced ? 1 : Math.min(real, timeFloor)
      state.shown += (target - state.shown) * 0.12
      if (target >= 1 && state.shown > 0.995) state.shown = 1
      if (counter.current) counter.current.textContent = String(Math.round(state.shown * 100)).padStart(3, '0')
      if (cut.current) cut.current.style.transform = `scaleX(${state.shown})`
      if (state.shown >= 1) {
        gsap.ticker.remove(tick)
        finish()
      }
    }
    gsap.ticker.add(tick)
    return () => { cancelled = true; gsap.ticker.remove(tick) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null
  return (
    <div ref={root} className={`theme-dark fixed inset-0 z-preloader ${hud ? 'pointer-events-none' : ''}`} role="status" aria-label="Loading" aria-live="polite">
      {hud ? (
        <>
          {/* Game-style HUD over the live 3D world: brackets, telemetry, big progress */}
          <div data-pre-content className="hud-corners absolute inset-x-gutter bottom-8 top-24 opacity-70" aria-hidden="true"><span className="hud-c" /></div>
          <div data-pre-content className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/70 to-transparent" aria-hidden="true" />
          <div data-pre-content className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden="true" />
          <img data-pre-content ref={logo} src={SITE.logo} alt={SITE.title} width={179} height={70} className="absolute left-gutter top-6 h-10 w-auto md:h-11" style={reduced ? undefined : { clipPath: 'inset(100% 0 0 0)' }} />
          <div data-pre-content className="absolute right-gutter top-8 font-body text-[11px] uppercase text-bone/70 hud-mono" aria-hidden="true">Site survey · initialising</div>
          <div data-pre-content className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 px-gutter text-center">
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-amber hud-mono">Loading world</p>
            <div className="flex items-baseline gap-3">
              <span ref={counter} className="font-display text-[clamp(5rem,14vw,12rem)] tabular-nums leading-none text-bone drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]" aria-hidden="true">{reduced ? '' : '000'}</span>
              <span className="font-body text-eyebrow uppercase text-bone/60">%</span>
            </div>
            <div className="relative h-px w-[min(36rem,80vw)] bg-bone/20" aria-hidden="true">
              <div ref={cut} className="absolute inset-y-0 left-0 w-full origin-left bg-amber shadow-amber-glow" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>
          <div data-pre-content className="absolute bottom-8 left-gutter font-body text-eyebrow uppercase text-bone/60">Moving earth since 1983</div>
          <div data-pre-content className="absolute bottom-8 right-gutter hidden font-body text-eyebrow uppercase text-bone/60 md:block">Scroll to descend</div>
        </>
      ) : (<>
      <div data-curtain="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-curtain="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-gutter">
        <img data-pre-content ref={logo} src={SITE.logo} alt={SITE.title} width={179} height={70} className="h-12 w-auto md:h-16" style={reduced ? undefined : { clipPath: 'inset(100% 0 0 0)' }} />
        <div data-pre-content className="relative w-full max-w-xl">
          {/* Line-art excavator digging a strata cross-section. Reduced motion: static frame. */}
          <svg ref={scene} viewBox="0 0 800 420" className="block h-auto w-full" aria-hidden="true">
            <defs>
              <linearGradient id="pre-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B0B0C" /><stop offset="1" stopColor="#141416" /></linearGradient>
            </defs>
            {/* ground + strata */}
            <line x1="0" x2="800" y1={GROUND} y2={GROUND} stroke="#F2EDE4" strokeOpacity="0.35" strokeWidth="1" />
            {STRATA.map((d, i) => (
              <path key={i} data-strata d={d} fill={['#1E2A18', '#171F14', '#121612'][i]} stroke="#5CA829" strokeOpacity={0.5 - i * 0.12} strokeWidth="1" />
            ))}
            {/* dust */}
            {Array.from({ length: 9 }, (_, i) => <circle key={i} data-dust cx={WRIST[0]} cy={GROUND} r={2 + (i % 3)} fill={i % 2 ? '#8DC63F' : '#F2EDE4'} opacity="0" />)}
            {/* excavator */}
            <g data-body stroke="#F2EDE4" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round">
              {/* tracks */}
              <rect x="118" y="268" width="210" height="48" rx="24" />
              <path d="M140 292 h166" strokeDasharray="10 8" strokeOpacity="0.6" />
              <circle cx="146" cy="292" r="9" /><circle cx="300" cy="292" r="9" /><circle cx="223" cy="292" r="7" strokeOpacity="0.6" />
              {/* undercarriage + turret */}
              <path d="M176 268 v-12 h96 v12" />
              <rect x="126" y="212" width="196" height="46" rx="6" />
              {/* cab with amber window */}
              <path d="M262 212 v-44 h58 a8 8 0 0 1 8 8 v36" />
              <path d="M274 212 v-30 h40 v30" stroke="#8DC63F" strokeOpacity="0.9" />
              {/* counterweight + exhaust */}
              <path d="M126 236 h-14 v18 h14" /><path d="M150 212 v-16 h8 v16" />
              {/* boom → stick → bucket */}
              <g data-boom>
                <path d={`M${SHOULDER[0]} ${SHOULDER[1]} L${ELBOW[0]} ${ELBOW[1]}`} stroke="#8DC63F" strokeWidth="14" strokeOpacity="0.95" />
                <path d={`M${SHOULDER[0]} ${SHOULDER[1]} L${ELBOW[0]} ${ELBOW[1]}`} stroke="#0B0B0C" strokeWidth="6" />
                <path d={`M${SHOULDER[0] + 20} ${SHOULDER[1] - 22} L${ELBOW[0] - 70} ${ELBOW[1] + 28}`} stroke="#F2EDE4" strokeWidth="3" strokeOpacity="0.7" />
                <circle cx={SHOULDER[0]} cy={SHOULDER[1]} r="9" fill="#0B0B0C" />
                <g data-stick>
                  <path d={`M${ELBOW[0]} ${ELBOW[1]} L${WRIST[0]} ${WRIST[1]}`} stroke="#8DC63F" strokeWidth="11" strokeOpacity="0.95" />
                  <path d={`M${ELBOW[0]} ${ELBOW[1]} L${WRIST[0]} ${WRIST[1]}`} stroke="#0B0B0C" strokeWidth="4" />
                  <path d={`M${ELBOW[0] + 24} ${ELBOW[1] - 10} L${WRIST[0] - 30} ${WRIST[1] - 40}`} stroke="#F2EDE4" strokeWidth="2.5" strokeOpacity="0.7" />
                  <circle cx={ELBOW[0]} cy={ELBOW[1]} r="8" fill="#0B0B0C" />
                  <g data-bucket>
                    <path d={`M${WRIST[0]} ${WRIST[1]} l18 -8 l26 22 q6 30 -26 44 l-30 -6 q-10 -30 12 -52 z`} fill="#141416" stroke="#F2EDE4" strokeWidth="2.5" />
                    <path d={`M${WRIST[0] - 12} ${WRIST[1] + 50} l6 10 M${WRIST[0] + 2} ${WRIST[1] + 54} l4 10 M${WRIST[0] + 16} ${WRIST[1] + 50} l2 10`} stroke="#8DC63F" strokeWidth="3" />
                    <circle cx={WRIST[0]} cy={WRIST[1]} r="6" fill="#0B0B0C" />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          {/* Amber cut line: the real load progress advancing across the ground surface */}
          <div className="absolute inset-x-0 h-px bg-steel" style={{ top: `${(GROUND / 420) * 100}%` }} aria-hidden="true">
            <div ref={cut} className="absolute inset-y-0 left-0 w-full origin-left bg-amber shadow-amber-glow" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
        <div data-pre-content className="flex items-baseline gap-4">
          <span ref={counter} className="font-display text-display-xl tabular-nums leading-none text-bone/90" aria-hidden="true">{reduced ? '' : '000'}</span>
          <span className="font-body text-eyebrow uppercase text-bone/50">%</span>
        </div>
      </div>
      <div data-pre-content className="absolute bottom-8 left-gutter font-body text-eyebrow uppercase text-bone/50">Moving earth since 1983</div>
      <div data-pre-content className="absolute bottom-8 right-gutter hidden font-body text-eyebrow uppercase text-bone/50 md:block">GRN Constructions</div>
      </>)}
    </div>
  )
}
