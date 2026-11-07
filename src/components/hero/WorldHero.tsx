import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { Box, Camera, Cylinder, Geometry, Mesh, Program, Renderer, Transform, Triangle } from 'ogl'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { roadPoint, spline } from '@/lib/pit'
import { onIdle } from '@/lib/idle'
import { HERO, TERRAIN, WORLD } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HeroSlide } from '@/data/home'
import { HERO_CTAS } from '@/data/home'
import { HeroHeadline, type HeroHeadlineHandle } from './HeroHeadline'
import { SlideChrome } from './SlideChrome'
import { ScrollCue } from './ScrollCue'
import { ParticleField, type ParticleFieldHandle } from './ParticleField'
import worldVert from '@/lib/shaders/world.vert.glsl?raw'
import worldFrag from '@/lib/shaders/world.frag.glsl?raw'
import propVert from '@/lib/shaders/prop.vert.glsl?raw'
import propFrag from '@/lib/shaders/prop.frag.glsl?raw'
import skyVert from '@/lib/shaders/hero.vert.glsl?raw'
import skyFrag from '@/lib/shaders/sky.frag.glsl?raw'
import dustVert from '@/lib/shaders/dust.vert.glsl?raw'
import dustFrag from '@/lib/shaders/dust.frag.glsl?raw'

interface Props {
  slides: HeroSlide[]
  subtext: string
  started?: boolean
}

/**
 * Scroll-driven 3D hero. A low-poly open-pit world fills the screen; scrolling
 * flies the camera from an aerial view down the spiral haul road to the pit
 * floor while dumpers work the benches. Four headline stages sit at four
 * depths. Desktop + WebGL only (Home.tsx falls back to the photo hero).
 */
export function WorldHero({ slides, subtext, started = true }: Props) {
  const n = slides.length
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const headlineWrap = useRef<HTMLDivElement>(null)
  const headline = useRef<HeroHeadlineHandle>(null)
  const particles = useRef<ParticleFieldHandle>(null)
  const progress = useRef(0)
  const st = useRef<ScrollTrigger | null>(null)
  const [index, setIndex] = useState(0)
  const [dustReady, setDustReady] = useState(false)
  useEffect(() => onIdle(() => setDustReady(true)), [])

  // ---- scroll: pin + progress → stage ---------------------------------
  useGSAP(
    () => {
      if (!root.current) return
      st.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${WORLD.pinPercent}%`,
        pin: true,
        scrub: WORLD.scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.current = self.progress
          const stage = Math.min(n - 1, Math.floor(self.progress * n))
          setIndex((i) => (i === stage ? i : stage))
        },
      })
      // Stage progress bars in the chrome
      const bars = chrome.current?.querySelectorAll<HTMLElement>('[data-progress-bar]')
      const tick = () => {
        const p = progress.current * n
        bars?.forEach((b, i) => b.style.setProperty('--p', String(Math.max(0, Math.min(1, p - i)))))
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root, dependencies: [n] },
  )

  const scrollToStage = useCallback(
    (i: number) => {
      const t = st.current
      if (!t) return
      const y = t.start + ((i + 0.04) / n) * (t.end - t.start)
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(y, { duration: reduced ? 0 : 1.4 })
      else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
    },
    [n, reduced],
  )

  // ---- dust burst on stage change --------------------------------------
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (reduced) return
    const delay = (HERO.headline.exit.duration - HERO.headline.overlap) * 1000
    const t = window.setTimeout(() => {
      const rect = headline.current?.getBaselineRect()
      const rootRect = root.current?.getBoundingClientRect()
      if (rect && rootRect) particles.current?.burst(rect.left - rootRect.left, rect.bottom - rootRect.top, rect.width)
    }, delay)
    return () => window.clearTimeout(t)
  }, [index, reduced])

  // ---- the world --------------------------------------------------------
  useEffect(() => {
    const el = host.current
    const target = root.current
    if (!el || !target) return
    const W = WORLD
    const T = TERRAIN
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, W.dprCap), antialias: true, alpha: false, powerPreference: 'high-performance', webgl: 2 })
    const gl = renderer.gl
    el.appendChild(gl.canvas)
    Object.assign(gl.canvas.style, { width: '100%', height: '100%', display: 'block' })
    const camera = new Camera(gl, { fov: W.camera.fov, near: W.camera.near, far: W.camera.far })
    const scene = new Transform()
    const shared = {
      uSun: { value: [...W.sun] },
      uFog: { value: [...W.fog.color] },
      uFogDensity: { value: W.fog.density },
      uCam: { value: [0, 0, 0] },
      uAmbient: { value: 0.62 },
    }

    // Sky (fullscreen, drawn first)
    const sky = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, { vertex: skyVert, fragment: skyFrag, depthTest: false, depthWrite: false, uniforms: { uTop: { value: [...W.sky.top] }, uHorizon: { value: [...W.sky.horizon] }, uHaze: { value: W.sky.haze }, uSunScreen: { value: [0.74, 0.8] } } }),
    })

    // Terrain: polar grid (rings × segments) so triangle edges follow the circular benches
    // instead of sawing across them. Rings are denser inside the pit than on the plain outside.
    const RINGS = W.grid
    const SEGS = Math.round(W.grid * 1.6)
    const E = W.extent
    const verts = (RINGS + 1) * (SEGS + 1)
    const position = new Float32Array(verts * 3)
    const pitR = T.pit.radius + 0.08
    for (let j = 0; j <= RINGS; j++) {
      const u = j / RINGS
      // 70% of rings inside the pit (linear), the rest eased out to the extent
      const r = u < 0.7 ? (u / 0.7) * pitR : pitR + Math.pow((u - 0.7) / 0.3, 1.6) * (E * 1.42 - pitR)
      for (let i = 0; i <= SEGS; i++) {
        const a = (i / SEGS) * Math.PI * 2
        const k = (j * (SEGS + 1) + i) * 3
        position[k] = r * Math.cos(a)
        position[k + 2] = r * Math.sin(a)
      }
    }
    const index = new Uint32Array(RINGS * SEGS * 6)
    let w = 0
    for (let j = 0; j < RINGS; j++) for (let i = 0; i < SEGS; i++) {
      const a = j * (SEGS + 1) + i, b = a + 1, c = a + SEGS + 1, d = c + 1
      index[w++] = a; index[w++] = c; index[w++] = b
      index[w++] = b; index[w++] = c; index[w++] = d
    }
    const terrain = new Mesh(gl, {
      geometry: new Geometry(gl, { position: { size: 3, data: position }, index: { data: index } }),
      program: new Program(gl, {
        vertex: worldVert, fragment: worldFrag, cullFace: null,
        uniforms: {
          ...shared,
          uTime: { value: 0 },
          uPitRadius: { value: T.pit.radius }, uBenches: { value: T.pit.benches }, uBenchWidth: { value: T.pit.benchWidth }, uBenchDepth: { value: T.pit.benchDepth }, uRamp: { value: W.ramp },
          uRoadWidth: { value: T.road.width }, uRoadTurns: { value: T.road.turns },
          uNoiseAmp: { value: W.relief.amplitude }, uNoiseFreq: { value: W.relief.frequency }, uInner: { value: W.relief.inner },
          uSurface: { value: [...W.earth.surface] }, uBenchCol: { value: [...W.earth.bench] }, uRock: { value: [...W.earth.rock] }, uDeep: { value: [...W.earth.deep] }, uRoadCol: { value: [...W.earth.road] },
        },
      }),
    })
    terrain.setParent(scene)

    // Trucks: low-poly dumpers on the haul road
    const paint = new Program(gl, { vertex: propVert, fragment: propFrag, uniforms: { ...shared, uColor: { value: [...W.trucks.paint] } } })
    const dark = new Program(gl, { vertex: propVert, fragment: propFrag, uniforms: { ...shared, uColor: { value: [0.12, 0.12, 0.13] } } })
    const glass = new Program(gl, { vertex: propVert, fragment: propFrag, uniforms: { ...shared, uColor: { value: [0.25, 0.30, 0.34] } } })
    const bodyGeo = new Box(gl, { width: 0.085, height: 0.026, depth: 0.044 })
    const tipperGeo = new Box(gl, { width: 0.056, height: 0.03, depth: 0.046 })
    const cabGeo = new Box(gl, { width: 0.022, height: 0.03, depth: 0.04 })
    const wheelGeo = new Cylinder(gl, { radiusTop: 0.013, radiusBottom: 0.013, height: 0.012, radialSegments: 10 })
    const trucks: { node: Transform; offset: number; dir: number }[] = []
    for (let i = 0; i < W.trucks.count; i++) {
      const node = new Transform()
      node.scale.set(W.trucks.scale, W.trucks.scale, W.trucks.scale)
      const body = new Mesh(gl, { geometry: bodyGeo, program: paint }); body.position.set(0, 0.03, 0); body.setParent(node)
      const tip = new Mesh(gl, { geometry: tipperGeo, program: paint }); tip.position.set(-0.016, 0.058, 0); tip.rotation.z = 0.05; tip.setParent(node)
      const cab = new Mesh(gl, { geometry: cabGeo, program: glass }); cab.position.set(0.032, 0.058, 0); cab.setParent(node)
      for (const [x, z] of [[0.03, 0.026], [0.03, -0.026], [-0.028, 0.026], [-0.028, -0.026]] as const) {
        const wheel = new Mesh(gl, { geometry: wheelGeo, program: dark }); wheel.rotation.x = Math.PI / 2; wheel.position.set(x, 0.013, z); wheel.setParent(node)
      }
      node.setParent(scene)
      trucks.push({ node, offset: (i / W.trucks.count) * (T.pit.benches - 0.3) + 0.15, dir: i % 2 === 0 ? 1 : -1 })
    }

    // Dust motes
    const dn = W.dust.count
    const dpos = new Float32Array(dn * 3)
    const dseed = new Float32Array(dn)
    for (let i = 0; i < dn; i++) {
      const r = Math.sqrt(Math.random()) * (T.pit.radius + 0.3)
      const a = Math.random() * Math.PI * 2
      dpos[i * 3] = r * Math.cos(a); dpos[i * 3 + 1] = -0.38 + Math.random() * 0.85; dpos[i * 3 + 2] = r * Math.sin(a)
      dseed[i] = Math.random()
    }
    const dustProg = new Program(gl, { vertex: dustVert, fragment: dustFrag, transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uSize: { value: W.dust.size * renderer.dpr * 10 }, uAlpha: { value: W.dust.alpha } } })
    dustProg.setBlendFunc(gl.SRC_ALPHA, gl.ONE)
    const dust = new Mesh(gl, { geometry: new Geometry(gl, { position: { size: 3, data: dpos }, seed: { size: 1, data: dseed } }), program: dustProg, mode: gl.POINTS })
    dust.setParent(scene)

    // Camera path: aerial establishing shot → onto the road → down to the floor.
    const rp = (tc: number, lift: number): [number, number, number] => { const q = roadPoint(tc); return [q.x * 1.06, q.y + lift, q.z * 1.06] }
    const posKeys: [number, number, number][] = [[0.0, 1.25, 2.1], rp(0.25, 0.38), rp(1.4, 0.16), rp(2.8, 0.11), rp(4.0, 0.1), rp(4.5, 0.22)]
    const ahead = (tc: number): [number, number, number] => { const q = roadPoint(tc); return [q.x, q.y + 0.02, q.z] }
    const far = roadPoint(2.4)
    const lookKeys: [number, number, number][] = [[0, -0.25, 0], [0, -0.3, 0], ahead(2.2), ahead(3.6), ahead(4.7), [far.x * 0.15, -T.pit.benches * T.pit.benchDepth - 0.02, far.z * 0.15]]

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = target.getBoundingClientRect()
      ptr.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ptr.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => { ptr.tx = 0; ptr.ty = 0 }
    target.addEventListener('pointermove', onMove, { passive: true })
    target.addEventListener('pointerleave', onLeave)

    const resize = () => {
      const { clientWidth: cw, clientHeight: ch } = el
      if (!cw || !ch) return
      renderer.setSize(cw, ch)
      camera.perspective({ aspect: cw / ch })
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const t0 = performance.now()
    let smooth = 0
    const draw = (t: number) => {
      const p = progress.current
      smooth += (p - smooth) * 0.12
      ptr.x += (ptr.tx - ptr.x) * W.pointer.lerp
      ptr.y += (ptr.ty - ptr.y) * W.pointer.lerp
      const pos = spline(posKeys, smooth)
      const look = spline(lookKeys, smooth)
      // pointer steers the look target sideways / up-down
      const fx = look[0] - pos[0], fz = look[2] - pos[2]
      const len = Math.hypot(fx, fz) || 1
      const rx = -fz / len, rz = fx / len
      look[0] += rx * ptr.x * W.pointer.yaw
      look[2] += rz * ptr.x * W.pointer.yaw
      look[1] -= ptr.y * W.pointer.pitch
      camera.position.set(pos[0], pos[1], pos[2])
      camera.lookAt(look)
      shared.uCam.value = [pos[0], pos[1], pos[2]]
      terrain.program.uniforms.uTime.value = t
      dustProg.uniforms.uTime.value = t
      // trucks
      const span = T.pit.benches - 0.3
      trucks.forEach((tr) => {
        const raw = (tr.offset + tr.dir * t * W.trucks.speed) % span
        const tc = 0.15 + ((raw % span) + span) % span
        const a = roadPoint(tc), b = roadPoint(tc + 0.02 * tr.dir)
        tr.node.position.set(a.x * 1.06, a.y + 0.004, a.z * 1.06)
        tr.node.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x)
      })
      renderer.render({ scene: sky, camera, clear: true })
      renderer.render({ scene, camera, clear: false })
    }

    let raf = 0
    let visible = true
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      draw((performance.now() - t0) / 1000)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.01 })
    io.observe(target)
    if (reduced) draw(0)
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
      el.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [reduced])

  return (
    <section
      ref={root}
      className="theme-dark relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink"
      aria-roledescription="carousel"
      aria-label="GRN Constructions highlights"
    >
      <div ref={host} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-scrim" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[34vh] min-h-[180px] bg-scrim-top" aria-hidden="true" />
      {!reduced && dustReady && <ParticleField ref={particles} pointerTarget={root} />}

      <div ref={headlineWrap} className="pointer-events-none absolute inset-x-gutter bottom-[6.5rem] z-10 md:bottom-[11.5rem] lg:right-[16rem] lg:bottom-[12.5rem]">
        <HeroHeadline ref={headline} slides={slides} index={index} subtext={subtext} started={started} reduced={reduced} />
        <m.div
          className="pointer-events-auto mt-6 flex flex-wrap gap-3 md:mt-8"
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
      </div>

      <SlideChrome ref={chrome} slides={slides} index={index} paused={false} onSelect={scrollToStage} onPrev={() => scrollToStage(Math.max(0, index - 1))} onNext={() => scrollToStage(Math.min(n - 1, index + 1))} />
      {!reduced && <ScrollCue />}
      <div className="sr-only" aria-live="polite" aria-atomic="true">Stage {index + 1} of {n}: {slides[index].title}</div>
    </section>
  )
}
