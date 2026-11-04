import { useEffect, useRef, type RefObject } from 'react'
import { Camera, Geometry, Mesh, Program, Renderer, Transform } from 'ogl'
import { TERRAIN } from '@/config/motion'
import { hasWebGL } from '@/lib/webgl'
import { token } from '@/lib/theme'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import vert from '@/lib/shaders/terrain.vert.glsl?raw'
import frag from '@/lib/shaders/terrain.frag.glsl?raw'

interface Props {
  className?: string
  /** 0..1 scroll progress (mutated externally) that lifts the camera and tilts the pit. */
  progressRef?: RefObject<{ progress: number }>
  /** Element whose pointer position steers the orbit. Defaults to the canvas host. */
  pointerTarget?: RefObject<HTMLElement>
  /** Overall opacity multiplier for the lines. */
  intensity?: number
  /** Scene scale (1 = pit fills roughly the middle of the frame). */
  scale?: number
  /** Vertical offset of the pit in mesh units (negative = lower in frame). */
  offsetY?: number
}

const parseRgb = (s: string): [number, number, number] => {
  const m = s.match(/\d+/g)
  if (!m) return [1, 1, 1]
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255]
}

/**
 * Procedural open-pit mine drawn as a survey wireframe (OGL). Benches, a spiral
 * haul road and rolling overburden are computed in the vertex shader, so the
 * whole scene is one static grid: no models, no textures. A slow orbit, pointer
 * yaw/pitch, a scroll-driven camera lift and an amber survey ring give it life.
 * Renders a single frame under reduced motion and pauses off-screen.
 */
export function TerrainMesh({ className = '', progressRef, pointerTarget, intensity = 1, scale = 1, offsetY = 0 }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const desktop = useIsDesktop()

  useEffect(() => {
    const el = host.current
    if (!el || !hasWebGL()) return
    const T = TERRAIN
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, T.dprCap), alpha: true, antialias: true, premultipliedAlpha: true, webgl: 2 })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    el.appendChild(gl.canvas)
    Object.assign(gl.canvas.style, { width: '100%', height: '100%', display: 'block' })

    // ---- grid geometry: shared positions, one index buffer for lines, drawn again as points ----
    const N = desktop ? T.grid.desktop : T.grid.mobile
    const verts = (N + 1) * (N + 1)
    const position = new Float32Array(verts * 3)
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const k = (j * (N + 1) + i) * 3
        position[k] = (i / N) * 2 - 1
        position[k + 1] = 0
        position[k + 2] = (j / N) * 2 - 1
      }
    }
    const index = new Uint32Array(N * (N + 1) * 4)
    let w = 0
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i
        index[w++] = a; index[w++] = a + 1                   // row segment
        index[w++] = i * (N + 1) + j; index[w++] = (i + 1) * (N + 1) + j // column segment
      }
    }
    const lines = new Geometry(gl, { position: { size: 3, data: position }, index: { data: index } })
    const points = new Geometry(gl, { position: { size: 3, data: position } })

    // On paper (light theme) thin dark lines need more alpha to read than light lines on ink.
    const lightTheme = () => document.documentElement.dataset.theme === 'light' && !el.closest('.theme-dark')
    const alphaBoost = () => (lightTheme() ? T.light.alphaBoost : 1)
    const rgb01 = (c: readonly [number, number, number]): [number, number, number] => [c[0] / 255, c[1] / 255, c[2] / 255]
    const read = () => {
      const amber = parseRgb(token('amber', el))
      if (lightTheme()) return { line: rgb01(T.light.surface), deep: rgb01(T.light.deep), amber }
      const bone = parseRgb(token('bone', el))
      return { line: bone, deep: bone, amber }
    }
    let colors = read()
    const mkProgram = (isPoint: boolean) =>
      new Program(gl, {
        vertex: vert,
        fragment: frag,
        transparent: true,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uPitRadius: { value: T.pit.radius },
          uBenches: { value: T.pit.benches },
          uBenchWidth: { value: T.pit.benchWidth },
          uBenchDepth: { value: T.pit.benchDepth },
          uRamp: { value: T.pit.rampFraction },
          uRoadWidth: { value: T.road.width },
          uRoadTurns: { value: T.road.turns },
          uNoiseAmp: { value: T.noise.amplitude },
          uNoiseFreq: { value: T.noise.frequency },
          uNoiseDrift: { value: T.noise.drift },
          uPointSize: { value: T.points.size * renderer.dpr },
          uReveal: { value: reduced ? 1 : 0 },
          uLine: { value: colors.line },
          uLineDeep: { value: colors.deep },
          uAmber: { value: colors.amber },
          uAlpha: { value: (isPoint ? T.points.alpha : T.line.alpha) * intensity * alphaBoost() },
          uScanPeriod: { value: T.scan.period },
          uScanWidth: { value: T.scan.width },
          uScanIntensity: { value: T.scan.intensity },
          uFogStart: { value: T.line.fogStart },
          uFogEnd: { value: T.line.fogEnd },
          uIsPoint: { value: isPoint ? 1 : 0 },
        },
      })
    const lineProg = mkProgram(false)
    const pointProg = mkProgram(true)
    const scene = new Transform()
    const lineMesh = new Mesh(gl, { geometry: lines, program: lineProg, mode: gl.LINES })
    const pointMesh = new Mesh(gl, { geometry: points, program: pointProg, mode: gl.POINTS })
    lineMesh.setParent(scene)
    pointMesh.setParent(scene)
    scene.scale.set(scale, scale, scale)
    scene.position.y = offsetY
    const camera = new Camera(gl, { fov: T.camera.fov, near: 0.1, far: 10 })

    // Theme changes (light/dark toggle) recolour the lines.
    const mo = new MutationObserver(() => {
      colors = read()
      lineProg.uniforms.uLine.value = pointProg.uniforms.uLine.value = colors.line
      lineProg.uniforms.uLineDeep.value = pointProg.uniforms.uLineDeep.value = colors.deep
      lineProg.uniforms.uAmber.value = pointProg.uniforms.uAmber.value = colors.amber
      lineProg.uniforms.uAlpha.value = T.line.alpha * intensity * alphaBoost()
      pointProg.uniforms.uAlpha.value = T.points.alpha * intensity * alphaBoost()
      if (reduced) draw(0)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // ---- pointer + camera state ----
    const target = pointerTarget?.current ?? el
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
    let yaw = 0
    const draw = (t: number) => {
      const p = progressRef?.current?.progress ?? 0
      ptr.x += (ptr.tx - ptr.x) * T.orbit.lerp
      ptr.y += (ptr.ty - ptr.y) * T.orbit.lerp
      yaw = t * T.orbit.speed + ptr.x * T.orbit.pointerYaw
      scene.rotation.y = yaw
      scene.rotation.x = -ptr.y * T.orbit.pointerPitch - p * T.scroll.tilt
      const [cx, cy, cz] = T.camera.position
      camera.position.set(cx, cy + p * T.scroll.lift, cz)
      camera.lookAt(T.camera.lookAt)
      const reveal = reduced ? 1 : Math.min(1, t / T.reveal)
      const eased = 1 - Math.pow(1 - reveal, 3)
      lineProg.uniforms.uTime.value = pointProg.uniforms.uTime.value = t
      lineProg.uniforms.uReveal.value = pointProg.uniforms.uReveal.value = eased
      renderer.render({ scene, camera })
    }

    if (reduced) {
      draw(0)
      return () => { mo.disconnect(); ro.disconnect(); target.removeEventListener('pointermove', onMove); target.removeEventListener('pointerleave', onLeave); el.removeChild(gl.canvas); gl.getExtension('WEBGL_lose_context')?.loseContext() }
    }

    let raf = 0
    let visible = true
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      draw((performance.now() - t0) / 1000)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.02 })
    io.observe(el)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      mo.disconnect()
      ro.disconnect()
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
      el.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [reduced, desktop, intensity, scale, offsetY, progressRef, pointerTarget])

  return <div ref={host} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true" />
}
