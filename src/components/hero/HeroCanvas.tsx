import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from 'react'
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl'
import { gsap } from '@/lib/gsap'
import { loadImage, pickHeroSrc } from '@/lib/webgl'
import { onIdle } from '@/lib/idle'
import { HERO } from '@/config/motion'
import type { HeroSlide } from '@/data/home'
import frag from '@/lib/shaders/hero.frag.glsl?raw'
import vert from '@/lib/shaders/hero.vert.glsl?raw'

export interface HeroCanvasHandle {
  /** Liquid transition to slide `index`. */
  goTo: (index: number) => void
}

interface Props {
  slides: HeroSlide[]
  initialIndex: number
  /** The element that receives pointer events (the whole hero). */
  pointerTarget: RefObject<HTMLElement>
  /** 0..1 scroll-exit progress, mutated by the ScrollTrigger scrub in Hero. */
  exitRef: RefObject<{ progress: number }>
  /** Whether the hero is on screen; drives rAF pausing. */
  onReady?: () => void
}

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * Layer 1 — OGL fullscreen quad. Simplex-noise heat-haze displacement,
 * velocity-driven pointer bulge with exponential decay, and a noise-threshold
 * liquid wipe between slides with an amber chromatic edge.
 */
export const HeroCanvas = forwardRef<HeroCanvasHandle, Props>(function HeroCanvas(
  { slides, initialIndex, pointerTarget, exitRef, onReady },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ goTo: (i: number) => void } | null>(null)

  useImperativeHandle(ref, () => ({ goTo: (i) => api.current?.goTo(i) }), [])

  useEffect(() => {
    const host = hostRef.current
    const target = pointerTarget.current
    if (!host || !target) return

    const W = HERO.webgl
    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, W.dprCap),
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      webgl: 2,
    })
    const gl = renderer.gl
    gl.clearColor(11 / 255, 11 / 255, 12 / 255, 1)
    host.appendChild(gl.canvas)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'

    const mkTex = () => new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE })
    const textures = slides.map(() => mkTex())
    const sizes = slides.map(() => [1, 1] as [number, number])

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTexA: { value: textures[initialIndex] },
        uTexB: { value: textures[initialIndex] },
        uRes: { value: [1, 1] },
        uSizeA: { value: sizes[initialIndex] },
        uSizeB: { value: sizes[initialIndex] },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uSeed: { value: 0 },
        uSoft: { value: HERO.liquid.softness },
        uEdgePx: { value: HERO.liquid.edgePx * renderer.dpr },
        uChroma: { value: HERO.liquid.chromaticOffset },
        uPointer: { value: [0.5, 0.5] },
        uPointerStrength: { value: 0 },
        uPointerRadius: { value: W.pointerRadius },
        uZoom: { value: 1 },
        uFlow: { value: W.idleFlow },
        uDarken: { value: 0 },
        uVignette: { value: W.vignette },
        uAmber: { value: hexToRgb('#8DC63F') },
        uContrast: { value: W.grade.contrast },
        uSaturation: { value: W.grade.saturation },
        uWarmth: { value: W.grade.warmth },
        uLift: { value: W.grade.lift },
        uTilt: { value: [0, 0] },
        uDepth: { value: W.depthParallax },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    const u = program.uniforms

    // ---- textures: the first slide loads now, the rest when the browser is idle ----
    const pick = (s: HeroSlide) => pickHeroSrc(s.image)
    let readyFired = false
    const loadSlide = (i: number) =>
      loadImage(pick(slides[i]))
        .then((img) => {
          textures[i].image = img
          sizes[i][0] = img.naturalWidth
          sizes[i][1] = img.naturalHeight
          if (i === initialIndex && !readyFired) {
            readyFired = true
            onReady?.()
          }
        })
        .catch(() => {})
    loadSlide(initialIndex).then(() => onIdle(() => slides.forEach((_, i) => i !== initialIndex && loadSlide(i)), 2000))

    // ---- transitions ----------------------------------------------------
    let current = initialIndex
    let tween: gsap.core.Tween | null = null
    const goTo = (next: number) => {
      if (next === current && !tween) return
      if (tween) {
        // Mid-transition: snap to the previous destination, then start fresh.
        tween.kill()
        tween = null
        u.uTexA.value = u.uTexB.value
        u.uSizeA.value = u.uSizeB.value
        u.uProgress.value = 0
      }
      u.uTexB.value = textures[next]
      u.uSizeB.value = sizes[next]
      u.uSeed.value = Math.random() * 100
      tween = gsap.fromTo(
        u.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: HERO.liquid.duration,
          ease: HERO.liquid.ease,
          onComplete: () => {
            u.uTexA.value = textures[next]
            u.uSizeA.value = sizes[next]
            u.uProgress.value = 0
            current = next
            tween = null
          },
        },
      )
    }
    api.current = { goTo }

    // ---- pointer --------------------------------------------------------
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, strength: 0, lastX: 0, lastY: 0, lastT: 0, touching: false }
    const tilt = { x: 0, y: 0 }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !pointer.touching) return
      const r = host.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width
      const ny = 1 - (e.clientY - r.top) / r.height
      const now = e.timeStamp
      const dt = Math.max(1, now - pointer.lastT)
      const dist = Math.hypot(e.clientX - pointer.lastX, e.clientY - pointer.lastY)
      const velocity = dist / dt // px per ms
      const targetStrength = Math.min(W.pointerMaxStrength, velocity * W.pointerVelocityScale)
      pointer.strength = Math.max(pointer.strength, targetStrength)
      pointer.tx = nx
      pointer.ty = ny
      pointer.lastX = e.clientX
      pointer.lastY = e.clientY
      pointer.lastT = now
    }
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        pointer.touching = true
        pointer.lastX = e.clientX
        pointer.lastY = e.clientY
        pointer.lastT = e.timeStamp
      }
    }
    const onPointerUp = () => (pointer.touching = false)
    target.addEventListener('pointermove', onPointerMove, { passive: true })
    target.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })

    // ---- sizing ---------------------------------------------------------
    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h)
      u.uRes.value = [gl.canvas.width, gl.canvas.height]
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    // ---- loop -----------------------------------------------------------
    let raf = 0
    let running = false
    let visible = true
    let last = performance.now()
    const decayK = 3 / W.pointerDecaySeconds // ~95% decayed after pointerDecaySeconds

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      u.uTime.value += dt

      // pointer smoothing + exponential settle
      pointer.x += (pointer.tx - pointer.x) * W.pointerFollow
      pointer.y += (pointer.ty - pointer.y) * W.pointerFollow
      pointer.strength *= Math.exp(-decayK * dt)
      u.uPointer.value = [pointer.x, pointer.y]
      u.uPointerStrength.value = pointer.strength
      // depth parallax follows the (mouse) pointer slowly; touch leaves it centred
      const wantX = pointer.touching ? 0 : (pointer.tx - 0.5) * 2
      const wantY = pointer.touching ? 0 : (pointer.ty - 0.5) * 2
      tilt.x += (wantX - tilt.x) * W.depthFollow
      tilt.y += (wantY - tilt.y) * W.depthFollow
      u.uTilt.value = [tilt.x, -tilt.y]

      // idle drift + scroll exit
      const idle = 1 + (W.idleScale - 1) * (0.5 + 0.5 * Math.sin((u.uTime.value * Math.PI * 2) / W.idlePeriod))
      const exit = exitRef.current?.progress ?? 0
      u.uZoom.value = idle * (1 + (W.exitZoom - 1) * exit)
      u.uDarken.value = W.exitDarken * exit

      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const sync = () => {
      if (visible && !document.hidden) start()
      else stop()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0 },
    )
    io.observe(host)
    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', sync)
      target.removeEventListener('pointermove', onPointerMove)
      target.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      tween?.kill()
      api.current = null
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides])

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
})
