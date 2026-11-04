import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from 'react'
import { HERO } from '@/config/motion'
import { useIsDesktop } from '@/hooks/useMediaQuery'

export interface ParticleFieldHandle {
  /** Emit a short burst from a horizontal line (px, relative to the field). */
  burst: (x: number, y: number, width: number) => void
}

interface Props {
  pointerTarget: RefObject<HTMLElement>
}

interface P {
  x: number; y: number; vx: number; vy: number
  size: number; alpha: number; amber: boolean
  life: number; maxLife: number // maxLife < 0 → ambient (never dies)
}

/**
 * Layer 3 — dust and debris. Low-alpha particles drifting up-right like dust
 * after a blast, a burst on every slide change, gentle push away from the pointer.
 */
export const ParticleField = forwardRef<ParticleFieldHandle, Props>(function ParticleField({ pointerTarget }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const burstRef = useRef<{ x: number; y: number; w: number; until: number; emitted: number } | null>(null)
  const desktop = useIsDesktop()

  useImperativeHandle(ref, () => ({
    burst: (x, y, width) => {
      burstRef.current = { x, y, w: width, until: performance.now() + HERO.particles.burstMs, emitted: 0 }
    },
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const target = pointerTarget.current
    if (!canvas || !target) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const C = HERO.particles
    const count = desktop ? C.desktop : C.mobile
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0
    let h = 0
    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const spawnAmbient = (p?: P): P => {
      const o = p ?? ({} as P)
      o.x = rand(0, w)
      o.y = p ? rand(h * 0.6, h + 20) : rand(0, h)
      o.vx = C.drift.x * rand(0.4, 1.4)
      o.vy = C.drift.y * rand(0.4, 1.4)
      o.size = rand(C.size.min, C.size.max)
      o.alpha = rand(C.alpha.min, C.alpha.max)
      o.amber = Math.random() < C.amberRatio
      o.life = 0
      o.maxLife = -1
      return o
    }
    const particles: P[] = []
    const resize = () => {
      w = target.clientWidth
      h = target.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!particles.length) for (let i = 0; i < count; i++) particles.push(spawnAmbient())
    }
    const ro = new ResizeObserver(resize)
    ro.observe(target)
    resize()

    const pointer = { x: -9999, y: -9999, active: false }
    const onMove = (e: PointerEvent) => {
      const r = target.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.active = true
    }
    const onLeave = () => (pointer.active = false)
    target.addEventListener('pointermove', onMove, { passive: true })
    target.addEventListener('pointerleave', onLeave)

    let raf = 0
    let running = false
    let visible = true
    let last = performance.now()
    const bone = '242,237,228'
    const amber = '141,198,63'

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(2, (now - last) / 16.67)
      last = now
      ctx.clearRect(0, 0, w, h)

      // Burst emission
      const b = burstRef.current
      if (b) {
        const total = C.burstCount
        const elapsed = 1 - Math.max(0, b.until - now) / C.burstMs
        const shouldHave = Math.floor(total * Math.min(1, elapsed + 0.1))
        while (b.emitted < shouldHave) {
          b.emitted++
          const a = -Math.PI / 2 + rand(-0.9, 0.9)
          const sp = C.burstSpeed * rand(0.4, 1.6)
          particles.push({
            x: b.x + rand(0, b.w), y: b.y + rand(-4, 4),
            vx: Math.cos(a) * sp + C.drift.x, vy: Math.sin(a) * sp,
            size: rand(C.size.min, C.size.max * 1.4), alpha: rand(C.alpha.max * 0.6, C.alpha.max * 1.6),
            amber: Math.random() < C.amberRatio + 0.25, life: 0, maxLife: rand(50, 110),
          })
        }
        if (now > b.until) burstRef.current = null
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        // jitter
        p.vx += (Math.random() - 0.5) * C.jitter * dt
        p.vy += (Math.random() - 0.5) * C.jitter * dt
        // pointer push
        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          const r2 = C.pointerRadiusPx * C.pointerRadiusPx
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const f = (1 - d / C.pointerRadiusPx) * C.pointerForce * 0.08
            p.vx += (dx / d) * f * dt
            p.vy += (dy / d) * f * dt
          }
        }
        p.vx *= C.friction
        p.vy *= C.friction
        // keep ambient drift alive
        if (p.maxLife < 0) {
          p.vx += (C.drift.x - p.vx) * 0.01 * dt
          p.vy += (C.drift.y - p.vy) * 0.01 * dt
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        let alpha = p.alpha
        if (p.maxLife > 0) {
          p.life += dt
          const t = p.life / p.maxLife
          alpha *= t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
          if (p.life >= p.maxLife) {
            particles.splice(i, 1)
            continue
          }
        } else if (p.y < -10 || p.x > w + 10 || p.x < -10) {
          spawnAmbient(p)
          continue
        }
        ctx.fillStyle = `rgba(${p.amber ? amber : bone},${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
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
    const sync = () => (visible && !document.hidden ? start() : stop())
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', sync)
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
    }
  }, [pointerTarget, desktop])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
})
