import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { Box, Camera, Cylinder, Geometry, Mesh, Program, Renderer, RenderTarget, Shadow, Sphere, Transform, Triangle, Vec3 } from 'ogl'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { benchPoint, roadPoint, spline } from '@/lib/pit'
import { onIdle } from '@/lib/idle'
import { HERO, TERRAIN, WORLD } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HeroSlide } from '@/data/home'
import { HERO_CTAS, STATS } from '@/data/home'
import { EQUIPMENT, EQUIPMENT_OTHERS } from '@/data/equipment'
import { MineAudio } from '@/lib/mineAudio'
import depthFrag from '@/lib/shaders/depth.frag.glsl?raw'
import blastVert from '@/lib/shaders/blast.vert.glsl?raw'
import blastFrag from '@/lib/shaders/blast.frag.glsl?raw'
import { HeroHeadline, type HeroHeadlineHandle } from './HeroHeadline'
import { StageRail } from './StageRail'
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

const fleetCount = (id: string) => EQUIPMENT.find((c) => c.id === id)?.rows.reduce((a, r) => a + r.numbers, 0) ?? 0
const CALLOUT = {
  truck: { title: 'Dumpers/Trucks', detail: `${fleetCount('dumpers-trucks')} in the fleet` },
  excavator: { title: 'Excavators', detail: `${fleetCount('excavators')} in the fleet` },
  cart: { title: EQUIPMENT_OTHERS.items[1].title, detail: `${EQUIPMENT_OTHERS.items[1].count} in the fleet` },
  worker: { title: STATS[1].label, detail: `${STATS[1].value}${STATS[1].suffix}` },
}
const MAP_SCALE = 44
const mapPoint = (tc: number) => { const q = roadPoint(tc); return [50 + q.x * MAP_SCALE, 50 + q.z * MAP_SCALE] as const }
const mix3 = (a: readonly number[], b: readonly number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]

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
  const tag = useRef<HTMLDivElement>(null)
  const marker = useRef<SVGCircleElement>(null)
  const audio = useRef<MineAudio | null>(null)
  const [sound, setSound] = useState(false)
  const toggleSound = () => {
    if (sound) { audio.current?.stop(); audio.current = null; setSound(false); return }
    audio.current = new MineAudio()
    audio.current.start()
    setSound(true)
  }
  useEffect(() => () => audio.current?.stop(), [])
  const mapPath = useMemo(() => Array.from({ length: 121 }, (_, i) => { const [x, y] = mapPoint((i / 120) * TERRAIN.pit.benches); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}` }).join(' '), [])
  const startedRef = useRef(started)
  const introRef = useRef<{ t: number } | null>(null)
  useEffect(() => {
    startedRef.current = started
    if (started && introRef.current && introRef.current.t < 1 && !reduced) gsap.to(introRef.current, { t: 1, duration: WORLD.intro.duration, ease: 'none' })
    else if (started && introRef.current) introRef.current.t = 1
  }, [started, reduced])
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
        // This component loads after the sections below it, so it must be measured first.
        refreshPriority: 10,
        onUpdate: (self) => {
          progress.current = self.progress
          // Hysteresis: a stage only changes once the scroll is clearly past the boundary.
          const p = self.progress * n
          setIndex((i) => {
            if (p > i + 1 + WORLD.stageHysteresis && i < n - 1) return Math.min(n - 1, Math.floor(p - WORLD.stageHysteresis))
            if (p < i - WORLD.stageHysteresis && i > 0) return Math.max(0, Math.floor(p + WORLD.stageHysteresis))
            return i
          })
        },
      })
      // Sections below were measured before this pin existed: re-sort and re-measure them.
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
      // Stage progress bars in the chrome
      const bars = chrome.current?.querySelectorAll<HTMLElement>('[data-progress-bar]')
      const tick = () => {
        const p = progress.current * n
        bars?.forEach((b, i) => b.style.setProperty('--p', String(Math.max(0, Math.min(1, p - i)))))
        if (marker.current) {
          const [mx, my] = mapPoint(progress.current * TERRAIN.pit.benches * 0.92)
          marker.current.setAttribute('cx', mx.toFixed(1))
          marker.current.setAttribute('cy', my.toFixed(1))
        }
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
    gl.clearColor(1, 1, 1, 1) // shadow map clears to "far"; the sky pass repaints the colour buffer
    const light = new Camera(gl, { left: -W.shadow.extent, right: W.shadow.extent, bottom: -W.shadow.extent, top: W.shadow.extent, near: 0.1, far: 7 })
    const shadow = new Shadow(gl, { light, width: W.shadow.size })
    shadow.target = new RenderTarget(gl, { width: W.shadow.size, height: W.shadow.size, minFilter: gl.NEAREST, magFilter: gl.NEAREST })
    shadow.targetUniform.value = shadow.target.texture
    const shared = {
      uSunCol: { value: [1, 1, 1] },
      shadowProjectionMatrix: { value: light.projectionMatrix },
      shadowViewMatrix: { value: light.viewMatrix },
      tShadow: shadow.targetUniform,
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
          uFlash: { value: 0 }, uFlashPos: { value: [0, 0, 0] }, uCartTc: { value: 0 },
          uPitRadius: { value: T.pit.radius }, uBenches: { value: T.pit.benches }, uBenchWidth: { value: T.pit.benchWidth }, uBenchDepth: { value: T.pit.benchDepth }, uRamp: { value: W.ramp },
          uRoadWidth: { value: T.road.width }, uRoadTurns: { value: T.road.turns },
          uNoiseAmp: { value: W.relief.amplitude }, uNoiseFreq: { value: W.relief.frequency }, uInner: { value: W.relief.inner },
          uSurface: { value: [...W.earth.surface] }, uBenchCol: { value: [...W.earth.bench] }, uRock: { value: [...W.earth.rock] }, uDeep: { value: [...W.earth.deep] }, uRoadCol: { value: [...W.earth.road] },
        },
      }),
    })
    terrain.setParent(scene)
    ;(terrain as unknown as { depthProgram: Program }).depthProgram = new Program(gl, { vertex: worldVert, fragment: depthFrag, cullFace: null, uniforms: terrain.program.uniforms })

    // Trucks: low-poly rigid dumpers (chassis, flared tipper, cab, six wheels, exhaust, ground shadow)
    const mkProg = (c: readonly [number, number, number]) => new Program(gl, { vertex: propVert, fragment: propFrag, uniforms: { ...shared, uColor: { value: [...c] } } })
    const paint = mkProg(W.trucks.paint)
    const paintDark = mkProg([W.trucks.paint[0] * 0.75, W.trucks.paint[1] * 0.75, W.trucks.paint[2] * 0.6])
    const dark = mkProg([0.10, 0.10, 0.11])
    const steel = mkProg([0.38, 0.40, 0.42])
    const glass = mkProg([0.22, 0.30, 0.36])
    const chassisGeo = new Box(gl, { width: 0.09, height: 0.014, depth: 0.04 })
    const deckGeo = new Box(gl, { width: 0.06, height: 0.012, depth: 0.05 })
    // Flared tipper: a trapezoid prism (wider at the top) built by hand.
    const tipperGeo = (() => {
      const w0 = 0.028, w1 = 0.034, h = 0.034, d0 = 0.022, d1 = 0.028
      const v = [
        [-w0, 0, -d0], [w0, 0, -d0], [w0, 0, d0], [-w0, 0, d0],
        [-w1, h, -d1], [w1, h, -d1], [w1, h, d1], [-w1, h, d1],
      ]
      const faces = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
      const pos: number[] = []
      faces.forEach(([a, b, c, d]) => { for (const i of [a, b, c, a, c, d]) pos.push(...v[i]) })
      return new Geometry(gl, { position: { size: 3, data: new Float32Array(pos) } })
    })()
    const tipperInnerGeo = new Box(gl, { width: 0.052, height: 0.006, depth: 0.044 })
    const cabGeo = new Box(gl, { width: 0.02, height: 0.024, depth: 0.03 })
    const cabGlassGeo = new Box(gl, { width: 0.006, height: 0.012, depth: 0.026 })
    const wheelGeo = new Cylinder(gl, { radiusTop: 0.012, radiusBottom: 0.012, height: 0.011, radialSegments: 12 })
    const hubGeo = new Cylinder(gl, { radiusTop: 0.006, radiusBottom: 0.006, height: 0.012, radialSegments: 8 })
    const stackGeo = new Cylinder(gl, { radiusTop: 0.002, radiusBottom: 0.002, height: 0.018, radialSegments: 6 })
    const trucks: { node: Transform; offset: number; dir: number; wheels: Mesh[]; lane: number; cart: boolean }[] = []
    const emissive = new Program(gl, { vertex: propVert, fragment: `#version 300 es\nprecision highp float; uniform vec3 uColor; uniform float uPulse; in vec3 vWorld; out vec4 o; void main(){ o = vec4(uColor * (0.6 + 0.9 * uPulse), 1.0); }`, uniforms: { uColor: { value: [...W.beacon] }, uPulse: { value: 1 } } })
    const lampGeo = new Sphere(gl, { radius: 0.003, widthSegments: 8, heightSegments: 6 })
    const headlampGeo = new Box(gl, { width: 0.003, height: 0.005, depth: 0.006 })
    const headlamp = new Program(gl, { vertex: propVert, fragment: `#version 300 es\nprecision highp float; in vec3 vWorld; out vec4 o; void main(){ o = vec4(1.0, 0.95, 0.8, 1.0); }` })
    const grilleGeo = new Box(gl, { width: 0.004, height: 0.018, depth: 0.03 })
    const guardGeo = new Box(gl, { width: 0.03, height: 0.004, depth: 0.014 })
    const ladderGeo = new Box(gl, { width: 0.003, height: 0.03, depth: 0.008 })
    const ribGeo = new Box(gl, { width: 0.003, height: 0.03, depth: 0.052 })
    const place = (node: Transform, geo: Geometry, prog: Program, x: number, y: number, z: number, rx = 0, rz = 0, ry = 0) => {
      const mesh = new Mesh(gl, { geometry: geo, program: prog }); mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); mesh.setParent(node); return mesh
    }
    const tank = mkProg([0.84, 0.86, 0.86])
    const tankGeo = new Cylinder(gl, { radiusTop: 0.024, radiusBottom: 0.024, height: 0.07, radialSegments: 14 })
    const buildTruck = (cart: boolean) => {
      const node = new Transform()
      node.scale.set(W.trucks.scale, W.trucks.scale, W.trucks.scale)
      const add = (geo: Geometry, prog: Program, x: number, y: number, z: number, rx = 0, rz = 0) => place(node, geo, prog, x, y, z, rx, rz)
      add(chassisGeo, dark, 0, 0.02, 0)
      add(deckGeo, steel, -0.01, 0.03, 0)
      if (cart) {
        add(tankGeo, tank, -0.012, 0.056, 0, 0, Math.PI / 2)
      } else {
        const tip = add(tipperGeo, paint, -0.012, 0.034, 0); tip.rotation.z = 0.04
        add(tipperInnerGeo, paintDark, -0.012, 0.064, 0)
        for (const rx of [-0.03, -0.012, 0.006]) add(ribGeo, paintDark, rx, 0.05, 0)
      }
      add(cabGeo, paint, 0.03, 0.046, -0.008)
      add(cabGlassGeo, glass, 0.041, 0.05, -0.008)
      add(grilleGeo, dark, 0.047, 0.03, 0)
      add(headlampGeo, headlamp, 0.047, 0.036, 0.012)
      add(headlampGeo, headlamp, 0.047, 0.036, -0.012)
      add(ladderGeo, steel, 0.03, 0.03, 0.021)
      for (const [x, z] of [[0.03, 0.026], [-0.027, 0.028], [-0.027, -0.028], [0.03, -0.026]] as const) add(guardGeo, dark, x, 0.026, z)
      add(stackGeo, dark, 0.024, 0.062, 0.012)
      add(lampGeo, emissive, 0.03, 0.062, -0.008)
      const wheels: Mesh[] = []
      for (const [x, z] of [[0.03, 0.024], [0.03, -0.024], [-0.018, 0.026], [-0.018, -0.026], [-0.036, 0.026], [-0.036, -0.026]] as const) {
        wheels.push(add(wheelGeo, dark, x, 0.012, z, Math.PI / 2))
        add(hubGeo, steel, x, 0.012, z, Math.PI / 2)
      }
      node.setParent(scene)
      return { node, wheels }
    }
    for (let i = 0; i < W.trucks.count; i++) {
      const dir = i % 2 === 0 ? 1 : -1
      trucks.push({ ...buildTruck(false), offset: (i / W.trucks.count) * (T.pit.benches - 0.3) + 0.15, dir, lane: dir * W.trucks.laneOffset, cart: false })
    }
    // Water cart: same lane and speed as the down-road trucks, spaced between two of them.
    trucks.push({ ...buildTruck(true), offset: (1 / W.trucks.count) * (T.pit.benches - 0.3) + 0.15, dir: 1, lane: W.trucks.laneOffset, cart: true })

    // Excavators: tracked base, slewing house, boom → stick → bucket on nested pivots, digging the toe of a batter.
    const X = W.excavators
    const exPaint = mkProg(X.paint)
    const trackGeo = new Box(gl, { width: 0.07, height: 0.016, depth: 0.018 })
    const carGeo = new Box(gl, { width: 0.04, height: 0.012, depth: 0.04 })
    const houseGeo = new Box(gl, { width: 0.07, height: 0.03, depth: 0.044 })
    const exCabGeo = new Box(gl, { width: 0.022, height: 0.028, depth: 0.02 })
    const exGlassGeo = new Box(gl, { width: 0.006, height: 0.016, depth: 0.016 })
    const cwGeo = new Box(gl, { width: 0.02, height: 0.026, depth: 0.044 })
    const boomGeo = new Box(gl, { width: 0.11, height: 0.016, depth: 0.014 })
    const stickGeo = new Box(gl, { width: 0.08, height: 0.012, depth: 0.011 })
    const bucketGeo = new Box(gl, { width: 0.028, height: 0.024, depth: 0.03 })
    const cylGeo = new Cylinder(gl, { radiusTop: 0.003, radiusBottom: 0.003, height: 0.06, radialSegments: 6 })
    const excavators: { root: Transform; ang: number; house: Transform; boom: Transform; stick: Transform; bucket: Transform; phase: number; base: number }[] = []
    for (let i = 0; i < X.count; i++) {
      const bench = 1 + i // benches 1..4
      const ang = (i / X.count) * Math.PI * 2 + 1.1 + bench * 0.9 // staggered, away from the road entry
      const pt = benchPoint(bench, 0.3, ang)
      const root = new Transform(); root.position.set(pt.x, pt.y + 0.002, pt.z); root.scale.set(X.scale, X.scale, X.scale)
      const facing = ang + Math.PI // face the inner batter (toward the pit centre)
      root.rotation.y = -facing
      place(root, trackGeo, dark, 0, 0.008, 0.02); place(root, trackGeo, dark, 0, 0.008, -0.02)
      place(root, carGeo, steel, 0, 0.02, 0)
      const house = new Transform(); house.position.set(0, 0.026, 0); house.setParent(root)
      place(house, houseGeo, exPaint, -0.01, 0.015, 0)
      place(house, cwGeo, dark, -0.046, 0.013, 0)
      place(house, exCabGeo, exPaint, 0.016, 0.032, 0.014)
      place(house, exGlassGeo, glass, 0.03, 0.034, 0.014)
      place(house, lampGeo, emissive, -0.02, 0.034, -0.016)
      const boom = new Transform(); boom.position.set(0.02, 0.028, -0.004); boom.setParent(house)
      place(boom, boomGeo, exPaint, 0.05, 0.012, 0, 0, 0.5)
      place(boom, cylGeo, steel, 0.03, 0.03, 0.009, 0, 1.2)
      const stick = new Transform(); stick.position.set(0.092, 0.062, 0); stick.setParent(boom)
      place(stick, stickGeo, exPaint, 0.03, -0.02, 0, 0, -1.0)
      const bucket = new Transform(); bucket.position.set(0.058, -0.06, 0); bucket.setParent(stick)
      place(bucket, bucketGeo, dark, 0.008, -0.012, 0)
      root.setParent(scene)
      excavators.push({ root, ang, house, boom, stick, bucket, phase: i * 1.7, base: -facing })
    }

    // Drill rigs: tracked base with a tall mast; the drill string plunges and dust puffs at the bit.
    const D = W.drills
    const drillPaint = mkProg(D.paint)
    const mastGeo = new Box(gl, { width: 0.012, height: 0.12, depth: 0.012 })
    const drillBaseGeo = new Box(gl, { width: 0.05, height: 0.02, depth: 0.04 })
    const stringGeo = new Cylinder(gl, { radiusTop: 0.0025, radiusBottom: 0.0025, height: 0.09, radialSegments: 6 })
    const drills: { string: Mesh; phase: number; pos: [number, number, number] }[] = []
    for (let i = 0; i < D.count; i++) {
      const bench = 2 + i * 2
      const ang = 2.6 + i * 2.1 + bench * 0.9
      const pt = benchPoint(bench, 0.35, ang)
      const root = new Transform(); root.position.set(pt.x, pt.y + 0.002, pt.z); root.scale.set(D.scale, D.scale, D.scale); root.rotation.y = -ang
      place(root, trackGeo, dark, 0, 0.008, 0.016); place(root, trackGeo, dark, 0, 0.008, -0.016)
      place(root, drillBaseGeo, drillPaint, 0, 0.026, 0)
      place(root, mastGeo, steel, 0.03, 0.09, 0)
      place(root, lampGeo, emissive, 0.03, 0.152, 0)
      const str = place(root, stringGeo, dark, 0.03, 0.06, 0)
      root.setParent(scene)
      drills.push({ string: str, phase: i * 2.3, pos: [pt.x, pt.y, pt.z] })
    }

    // Muck piles beside each excavator (loose spoil cones).
    const pileGeo = new Cylinder(gl, { radiusTop: 0.002, radiusBottom: 0.03, height: 0.014, radialSegments: 9 })
    const pileMat = mkProg([0.42, 0.33, 0.22])
    excavators.forEach((ex, i) => {
      const pile = new Mesh(gl, { geometry: pileGeo, program: pileMat })
      const bench = 1 + i
      const ang = (i / X.count) * Math.PI * 2 + 1.1 + bench * 0.9 + 0.22
      const pt = benchPoint(bench, 0.3, ang)
      pile.position.set(pt.x, pt.y + 0.006, pt.z); pile.scale.set(X.scale * 1.6, X.scale * 1.6, X.scale * 1.6)
      pile.setParent(scene)
      void ex
    })

    // Work crews: hi-vis figures near the machines and on the floor (legs, vest, head, helmet), idling.
    const K = W.workers
    const vest = mkProg(K.hiVis)
    const helmet = mkProg(K.helmet)
    const skin = mkProg([0.55, 0.40, 0.30])
    const trouser = mkProg([0.16, 0.17, 0.22])
    const legGeo = new Box(gl, { width: 0.0022, height: 0.0055, depth: 0.0022 })
    const torsoGeo = new Box(gl, { width: 0.005, height: 0.0055, depth: 0.0032 })
    const armGeo = new Box(gl, { width: 0.0016, height: 0.005, depth: 0.0016 })
    const headGeo = new Sphere(gl, { radius: 0.0018, widthSegments: 8, heightSegments: 6 })
    const hatGeo = new Cylinder(gl, { radiusTop: 0.0022, radiusBottom: 0.0024, height: 0.0014, radialSegments: 8 })
    const workers: { node: Transform; phase: number; base: number }[] = []
    const spots: { x: number; y: number; z: number; face: number }[] = []
    excavators.forEach((_, i) => {
      const bench = 1 + i
      for (const da of [-0.16, -0.22]) { const ang = (i / X.count) * Math.PI * 2 + 1.1 + bench * 0.9 + da; const pt = benchPoint(bench, 0.35, ang); spots.push({ ...pt, face: ang }) }
    })
    for (let i = 0; i < D.count; i++) { const bench = 2 + i * 2; const ang = 2.6 + i * 2.1 + bench * 0.9 + 0.14; const pt = benchPoint(bench, 0.5, ang); spots.push({ ...pt, face: ang + 1 }) }
    for (let i = 0; i < 4; i++) { const ang = 0.6 + i * 1.5; const pt = benchPoint(T.pit.benches - 0.02, 0.0, ang); const r = 0.16 + i * 0.02; spots.push({ x: r * Math.cos(ang), y: pt.y, z: r * Math.sin(ang), face: ang + 2 }) }
    spots.slice(0, K.count).forEach((sp, i) => {
      const node = new Transform(); node.position.set(sp.x, sp.y + 0.001, sp.z); node.scale.set(K.scale, K.scale, K.scale); node.rotation.y = -sp.face
      place(node, legGeo, trouser, -0.0014, 0.00275, 0); place(node, legGeo, trouser, 0.0014, 0.00275, 0)
      place(node, torsoGeo, vest, 0, 0.0083, 0)
      place(node, armGeo, vest, -0.0034, 0.0083, 0, 0, 0.25); place(node, armGeo, vest, 0.0034, 0.0083, 0, 0, -0.25)
      place(node, headGeo, skin, 0, 0.0128, 0)
      place(node, hatGeo, helmet, 0, 0.0148, 0)
      node.setParent(scene)
      workers.push({ node, phase: i * 1.3, base: -sp.face })
    })

    // Dust trails: a pool of puffs re-spawned at the rear of each truck.
    const TN = (W.trucks.count + 1) * W.trucks.trailPuffs
    const tpos = new Float32Array(TN * 3)
    const tseed = new Float32Array(TN)
    const tlife = new Float32Array(TN)
    for (let i = 0; i < TN; i++) { tseed[i] = Math.random(); tlife[i] = Math.random() }
    const trailGeo = new Geometry(gl, { position: { size: 3, data: tpos, usage: gl.DYNAMIC_DRAW }, seed: { size: 1, data: tseed } })
    const trailProg = new Program(gl, { vertex: dustVert, fragment: dustFrag, transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uSize: { value: W.dust.size * renderer.dpr * 16 }, uAlpha: { value: W.trucks.trailAlpha } } })
    trailProg.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const trail = new Mesh(gl, { geometry: trailGeo, program: trailProg, mode: gl.POINTS })
    trail.setParent(scene)

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

    // Loading cycle: one truck reverses along the bench to the first excavator.
    const L = W.loading
    const loaderEx = excavators[0]
    const loaderBench = 1
    const loader = buildTruck(false)
    const heapGeo = new Box(gl, { width: 0.05, height: 0.02, depth: 0.04 })
    const heap = new Mesh(gl, { geometry: heapGeo, program: mkProg([0.2, 0.18, 0.17]) })
    heap.position.set(-0.012, 0.064, 0); heap.setParent(loader.node)
    const rockGeo = new Box(gl, { width: 0.006, height: 0.005, depth: 0.006 })
    const rockMat = mkProg([0.24, 0.21, 0.19])
    const rocks = Array.from({ length: L.rocks }, (_, i) => { const r = new Mesh(gl, { geometry: rockGeo, program: rockMat }); r.setParent(scene); r.visible = false; return { r, seed: i / L.rocks } })
    const loadPeriod = L.approach + L.wait + L.leave

    // Scripted event: rock and dust thrown off a wall the camera is facing.
    const E2 = W.event
    const EN = E2.debris + E2.plume
    const evVel = new Float32Array(EN * 3)
    const evSeed = new Float32Array(EN * 2)
    for (let i = 0; i < EN; i++) {
      const plume = i >= E2.debris
      const a = Math.random() * Math.PI * 2
      const sp = (plume ? 0.1 : E2.debrisSpeed) * (0.35 + Math.random() * 0.75)
      evVel[i * 3] = Math.cos(a) * sp
      evVel[i * 3 + 1] = plume ? E2.plumeRise * (0.25 + Math.random()) : E2.debrisSpeed * (0.5 + Math.random())
      evVel[i * 3 + 2] = Math.sin(a) * sp
      evSeed[i * 2] = Math.random()
      evSeed[i * 2 + 1] = plume ? 1 : 0
    }
    const evProg = new Program(gl, { vertex: blastVert, fragment: blastFrag, transparent: true, depthWrite: false, uniforms: { uOrigin: { value: [0, 0, 0] }, uT: { value: 0 }, uSize: { value: E2.size * renderer.dpr } } })
    evProg.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const evMesh = new Mesh(gl, { geometry: new Geometry(gl, { position: { size: 3, data: evVel }, seed: { size: 2, data: evSeed } }), program: evProg, mode: gl.POINTS, frustumCulled: false })
    evMesh.visible = false
    evMesh.setParent(scene)
    let eventStart = -1
    let eventArmed = true

    // Everything solid casts into the sun's depth map; dust and the event plume do not.
    scene.traverse((node) => {
      const mesh = node as Mesh
      if (!mesh.draw || mesh === dust || mesh === trail || mesh === evMesh) return
      shadow.add({ mesh, receive: false })
    })

    // Hover callouts: machines and crews, with figures from the Equipments and home data.
    const callouts: { node: Transform; info: { title: string; detail: string } }[] = [
      ...trucks.map((tr) => ({ node: tr.node, info: tr.cart ? CALLOUT.cart : CALLOUT.truck })),
      { node: loader.node, info: CALLOUT.truck },
      ...excavators.map((ex) => ({ node: ex.root, info: CALLOUT.excavator })),
      ...workers.map((wk) => ({ node: wk.node, info: CALLOUT.worker })),
    ]
    const v3 = new Vec3()
    const titleEl = tag.current?.querySelector<HTMLElement>('[data-title]')
    const detailEl = tag.current?.querySelector<HTMLElement>('[data-detail]')
    let shownCallout: unknown = null

    // Camera path: aerial establishing shot → onto the road → down to the floor.
    const rp = (tc: number, lift: number): [number, number, number] => { const q = roadPoint(tc); return [q.x * 1.06, q.y + lift, q.z * 1.06] }
    const posKeys: [number, number, number][] = [[0.0, 1.25, 2.1], rp(0.25, 0.38), rp(1.4, 0.16), rp(2.8, 0.11), rp(4.0, 0.1), rp(4.5, 0.22)]
    const ahead = (tc: number): [number, number, number] => { const q = roadPoint(tc); return [q.x, q.y + 0.02, q.z] }
    const far = roadPoint(2.4)
    const lookKeys: [number, number, number][] = [[0, -0.25, 0], [0, -0.3, 0], ahead(2.2), ahead(3.6), ahead(4.7), [far.x * 0.15, -T.pit.benches * T.pit.benchDepth - 0.02, far.z * 0.15]]

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
    const mouse = { x: 0, y: 0, on: false }
    const free = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, drag: false, released: 0 }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = target.getBoundingClientRect()
      ptr.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ptr.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.on = true
      if (free.drag) {
        free.tYaw = Math.max(-W.look.maxYaw, Math.min(W.look.maxYaw, free.tYaw - e.movementX * W.look.sensitivity))
        free.tPitch = Math.max(-W.look.maxPitch, Math.min(W.look.maxPitch, free.tPitch - e.movementY * W.look.sensitivity))
      }
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || (e.target as Element).closest('a, button')) return
      free.drag = true
    }
    const onUp = () => { if (free.drag) { free.drag = false; free.released = performance.now() } }
    const onLeave = () => { ptr.tx = 0; ptr.ty = 0; mouse.on = false }
    target.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
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
    let vel = 0
    const introState = { t: startedRef.current ? 1 : 0 }
    introRef.current = introState
    let lastT = 0
    let frameNo = 0
    const draw = (t: number) => {
      const dt = Math.min(0.05, t - lastT); lastT = t
      const p = progress.current
      // critically damped spring toward the scroll position: no snap, no overshoot
      const F = W.flight
      vel += ((p - smooth) * F.omega * F.omega - 2 * F.omega * vel) * dt
      smooth += vel * dt
      ptr.x += (ptr.tx - ptr.x) * W.pointer.lerp
      ptr.y += (ptr.ty - ptr.y) * W.pointer.lerp
      const pos = spline(posKeys, smooth)
      const look = spline(lookKeys, smooth)
      // intro: ease from a far, high vantage into the first key
      const k = introState.t
      if (k < 1) {
        // While loading: a slow orbit at the far vantage, then ease into the first key.
        const a = Math.sin(t * 0.12) * 0.18
        const fx = W.intro.from[0] * Math.cos(a) - W.intro.from[2] * Math.sin(a)
        const fz = W.intro.from[0] * Math.sin(a) + W.intro.from[2] * Math.cos(a)
        const from = [fx, W.intro.from[1] + Math.sin(t * 0.2) * 0.05, fz]
        const e = 1 - Math.pow(1 - k, 3)
        for (let i = 0; i < 3; i++) pos[i] = from[i] + (pos[i] - from[i]) * e
      }
      // pointer steers the look target sideways / up-down
      const fx = look[0] - pos[0], fz = look[2] - pos[2]
      const len = Math.hypot(fx, fz) || 1
      const rx = -fz / len, rz = fx / len
      look[0] += rx * ptr.x * W.pointer.yaw
      look[2] += rz * ptr.x * W.pointer.yaw
      look[1] -= ptr.y * W.pointer.pitch
      // free look: rotate the view vector around the camera
      if (!free.drag && performance.now() - free.released > W.look.returnAfter * 1000) { free.tYaw = 0; free.tPitch = 0 }
      free.yaw += (free.tYaw - free.yaw) * W.look.follow
      free.pitch += (free.tPitch - free.pitch) * W.look.follow
      if (Math.abs(free.yaw) + Math.abs(free.pitch) > 0.001) {
        const dx = look[0] - pos[0], dz = look[2] - pos[2]
        const c = Math.cos(free.yaw), sn = Math.sin(free.yaw)
        look[0] = pos[0] + dx * c - dz * sn
        look[2] = pos[2] + dx * sn + dz * c
        look[1] += Math.hypot(dx, dz) * Math.tan(free.pitch)
      }
      // time of day follows the descent
      const D0 = W.timeOfDay
      const day = Math.max(0, Math.min(1, smooth))
      shared.uSun.value = mix3(D0.sun[0], D0.sun[1], day)
      shared.uSunCol.value = mix3(D0.sunCol[0], D0.sunCol[1], day)
      shared.uFog.value = mix3(D0.fog[0], D0.fog[1], day)
      sky.program.uniforms.uTop.value = mix3(D0.top[0], D0.top[1], day)
      sky.program.uniforms.uHorizon.value = mix3(D0.horizon[0], D0.horizon[1], day)
      const sunV = shared.uSun.value
      const sunLen = Math.hypot(sunV[0], sunV[1], sunV[2])
      light.position.set((sunV[0] / sunLen) * 3.2, (sunV[1] / sunLen) * 3.2, (sunV[2] / sunLen) * 3.2)
      light.lookAt([0, -0.2, 0])

      // scripted event
      const evAt = (E2.stage + E2.delay) / n
      if (eventArmed && smooth > evAt && smooth < (E2.stage + 1) / n) {
        eventArmed = false
        eventStart = t
        const hx = pos[0] + (look[0] - pos[0]) * 0.8, hz = pos[2] + (look[2] - pos[2]) * 0.8
        const q = benchPoint(1, 0.75, Math.atan2(hz, hx))
        evProg.uniforms.uOrigin.value = [q.x, q.y + 0.01, q.z]
        terrain.program.uniforms.uFlashPos.value = [q.x, q.y + 0.04, q.z]
        audio.current?.rumble()
      }
      if (smooth < E2.stage / n - 0.02 || smooth > (E2.stage + 1) / n + 0.02) eventArmed = true
      const evT = eventStart < 0 ? 99 : t - eventStart
      evMesh.visible = evT < 9
      evProg.uniforms.uT.value = evT
      terrain.program.uniforms.uFlash.value = E2.flash * Math.exp(-evT * 5)
      if (evT < 3) {
        const sh = E2.shake * Math.exp(-evT * 2.5)
        pos[0] += (Math.random() - 0.5) * sh; pos[1] += (Math.random() - 0.5) * sh; pos[2] += (Math.random() - 0.5) * sh
      }
      pos[1] += Math.sin(t * F.swayHz * Math.PI * 2) * F.swayAmp
      camera.position.set(pos[0], pos[1], pos[2])
      camera.lookAt(look)
      camera.rotation.z += Math.max(-0.12, Math.min(0.12, -vel * F.bank))
      shared.uCam.value = [pos[0], pos[1], pos[2]]
      terrain.program.uniforms.uTime.value = t
      dustProg.uniforms.uTime.value = t
      // trucks
      const span = T.pit.benches - 0.3
      trucks.forEach((tr, ti) => {
        const raw = (tr.offset + tr.dir * t * W.trucks.speed) % span
        const tc = 0.15 + ((raw % span) + span) % span
        const a = roadPoint(tc, tr.lane), b = roadPoint(tc + 0.02 * tr.dir, tr.lane)
        tr.node.position.set(a.x, a.y + 0.004, a.z)
        tr.node.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x)
        // shrink away at the two ends of the road instead of popping
        const edge = Math.min(tc - 0.15, 0.15 + span - tc)
        const es = W.trucks.scale * Math.max(0, Math.min(1, edge / 0.2))
        tr.node.scale.set(es, es, es)
        if (tr.cart) terrain.program.uniforms.uCartTc.value = tc
        tr.wheels.forEach((wh) => { wh.rotation.y = t * 6 * tr.dir })
        // trail: puffs drift up/back and die; respawn behind the rear axle
        const dirx = Math.cos(tr.node.rotation.y), dirz = -Math.sin(tr.node.rotation.y)
        for (let k = 0; k < W.trucks.trailPuffs; k++) {
          const i = ti * W.trucks.trailPuffs + k
          tlife[i] += dt * 0.6
          if (tlife[i] >= 1) {
            tlife[i] = 0
            tpos[i * 3] = tr.node.position.x - dirx * 0.03 * W.trucks.scale
            tpos[i * 3 + 1] = tr.node.position.y + 0.004
            tpos[i * 3 + 2] = tr.node.position.z - dirz * 0.03 * W.trucks.scale
          } else {
            tpos[i * 3] += (-dirx * 0.012 + (tseed[i] - 0.5) * 0.01) * dt
            tpos[i * 3 + 1] += 0.016 * dt
            tpos[i * 3 + 2] += (-dirz * 0.012 + (tseed[i] - 0.5) * 0.01) * dt
          }
        }
      })
      trailGeo.attributes.position.needsUpdate = true
      trailProg.uniforms.uTime.value = t
      // machines
      emissive.uniforms.uPulse.value = 0.5 + 0.5 * Math.sin(t * 4.0)
      // loading cycle
      const lm = t % loadPeriod
      const easeL = (v: number) => v * v * (3 - 2 * v)
      const away = lm < L.approach ? 1 - easeL(lm / L.approach) : lm > L.approach + L.wait ? easeL((lm - L.approach - L.wait) / L.leave) : 0
      const reachR = Math.hypot(loaderEx.root.position.x, loaderEx.root.position.z)
      const reach = 0.17 * X.scale
      const la = loaderEx.ang + reach / reachR + away * L.travelRad
      const lp = benchPoint(loaderBench, 0.2, la)
      loader.node.position.set(lp.x, lp.y + 0.004, lp.z)
      loader.node.rotation.y = -(la + Math.PI / 2)
      const ls = W.trucks.scale * Math.max(0, Math.min(1, (1 - away) / 0.15))
      loader.node.scale.set(ls, ls, ls)
      loader.wheels.forEach((wh) => { wh.rotation.y = away > 0 && away < 1 ? t * (lm < L.approach ? -6 : 6) : 0 })
      audio.current?.setReversing(lm < L.approach)
      const dumpOffset = X.cycleSeconds * 0.75
      const dumped = lm < L.approach ? 0 : Math.max(0, Math.min(L.buckets, Math.floor((lm - L.approach - dumpOffset) / X.cycleSeconds) + 1))
      heap.visible = dumped > 0
      heap.scale.set(1, dumped / L.buckets, 1)
      const cyc = (t % X.cycleSeconds) / X.cycleSeconds
      const falling = lm >= L.approach && lm <= L.approach + L.wait && cyc > 0.68 && cyc < 0.8
      rocks.forEach(({ r, seed }) => {
        r.visible = falling
        if (!falling) return
        const f = (cyc - 0.68) / 0.12
        const ang2 = seed * Math.PI * 2
        r.position.set(lp.x + Math.cos(ang2) * 0.008, lp.y + 0.075 - 0.04 * f * f, lp.z + Math.sin(ang2) * 0.008)
      })
      excavators.forEach((ex, exi) => {
        const c = ((t + ex.phase) % X.cycleSeconds) / X.cycleSeconds // 0..1 dig cycle
        const dig = c < 0.45 ? c / 0.45 : 0                         // digging (down + curl)
        const swing = c >= 0.45 && c < 0.75 ? (c - 0.45) / 0.3 : 0   // swing to dump
        const back = c >= 0.75 ? (c - 0.75) / 0.25 : 0               // swing back
        const ease = (v: number) => v * v * (3 - 2 * v)
        const slew = swing ? ease(swing) : back ? 1 - ease(back) : 0
        ex.house.rotation.y = slew * (exi === 0 ? Math.PI / 2 : 1.1)
        const bite = Math.sin(ease(dig) * Math.PI)
        ex.boom.rotation.z = -0.15 - bite * 0.35 + slew * (exi === 0 ? 0.55 : 0.25)
        ex.stick.rotation.z = 0.2 + bite * 0.9 - slew * 0.3
        ex.bucket.rotation.z = -0.3 + bite * 1.2 - slew * 0.9
      })
      workers.forEach((wk) => { wk.node.rotation.y = wk.base + Math.sin(t * 0.6 + wk.phase) * 0.35; wk.node.position.y += 0 })
      drills.forEach((d) => { d.string.position.y = 0.06 - 0.035 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.phase)) })
      // callout under the mouse
      const tagEl = tag.current
      if (tagEl) {
        let best: (typeof callouts)[number] | null = null
        let bx = 0, by = 0, bd: number = W.callout.radiusPx
        if (mouse.on && !free.drag) {
          for (const c of callouts) {
            if (c.node.scale.x < 0.05) continue
            const m = c.node.worldMatrix
            v3.set(m[12], m[13], m[14]).applyMatrix4(camera.viewMatrix)
            if (v3.z > 0) continue
            v3.applyMatrix4(camera.projectionMatrix)
            const sx = (v3.x * 0.5 + 0.5) * el.clientWidth, sy = (0.5 - v3.y * 0.5) * el.clientHeight
            const d = Math.hypot(sx - mouse.x, sy - mouse.y)
            if (d < bd) { bd = d; best = c; bx = sx; by = sy }
          }
        }
        tagEl.style.opacity = best ? '1' : '0'
        if (best) {
          tagEl.style.transform = `translate(${bx + 18}px, ${by - 44}px)`
          if (shownCallout !== best.info && titleEl && detailEl) { titleEl.textContent = best.info.title; detailEl.textContent = best.info.detail; shownCallout = best.info }
        }
      }
      if (frameNo++ % W.shadow.everyFrames === 0) shadow.render({ scene })
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
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; audio.current?.setActive(e.isIntersecting) }, { threshold: 0.01 })
    io.observe(target)
    if (reduced) draw(0)
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
      target.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      el.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [reduced, n])

  return (
    <section
      ref={root}
      className="theme-dark relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink"
      aria-roledescription="carousel"
      aria-label="GRN Constructions highlights"
      data-cursor={index === n - 1 ? 'Drag' : undefined}
    >
      <div ref={host} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-scrim" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[34vh] min-h-[180px] bg-scrim-top" aria-hidden="true" />
      {!reduced && dustReady && <ParticleField ref={particles} pointerTarget={root} />}

      <div ref={headlineWrap} className="pointer-events-none absolute inset-x-gutter bottom-[6.5rem] z-10 md:bottom-[8.5rem] lg:right-[16rem] lg:bottom-[9rem]">
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

      <m.div className="absolute inset-0 z-20" initial={false} animate={{ opacity: started ? 1 : 0 }} transition={{ duration: reduced ? 0 : 1.2, delay: started && !reduced ? 1.6 : 0, ease: [0.16, 1, 0.3, 1] }} style={{ pointerEvents: started ? undefined : 'none' }}>
        <StageRail ref={chrome} slides={slides} index={index} onSelect={scrollToStage} onPrev={() => scrollToStage(Math.max(0, index - 1))} onNext={() => scrollToStage(Math.min(n - 1, index + 1))} />
        {!reduced && <ScrollCue />}
        {/* Depth map: the haul-road spiral with four stage ticks and your position */}
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute right-gutter top-[9.25rem] h-24 w-24" aria-hidden="true">
          <circle cx="50" cy="50" r="48" fill="rgb(11 11 12 / 0.45)" stroke="rgb(var(--c-bone) / 0.2)" />
          <path d={mapPath} fill="none" stroke="rgb(var(--c-bone) / 0.55)" strokeWidth="1.2" />
          {slides.map((_, i) => { const [x, y] = mapPoint((i / n) * TERRAIN.pit.benches * 0.92); return <circle key={i} cx={x} cy={y} r="2" fill="rgb(var(--c-bone))" /> })}
          <circle ref={marker} r="3.4" fill="rgb(var(--c-amber))" />
        </svg>
        <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? 'Turn site sound off' : 'Turn site sound on'} data-cursor-grow className="pointer-events-auto absolute right-gutter top-[16.25rem] flex h-10 w-24 items-center justify-center gap-2 border border-bone/25 bg-ink/40 font-body text-[10px] uppercase text-bone/80 backdrop-blur-sm hud-mono transition-colors duration-fast hover:border-amber hover:text-amber">
          {sound ? 'Sound on' : 'Sound off'}
        </button>
      </m.div>
      <div ref={tag} className="pointer-events-none absolute left-0 top-0 z-[19] border border-amber/70 bg-ink/80 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-fast" aria-hidden="true">
        <p data-title className="font-display text-lg uppercase leading-none text-bone" />
        <p data-detail className="mt-1 font-body text-[10px] uppercase text-amber hud-mono" />
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">Stage {index + 1} of {n}: {slides[index].title}</div>
    </section>
  )
}
