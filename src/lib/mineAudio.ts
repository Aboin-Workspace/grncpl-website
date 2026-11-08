/** Procedural site ambience (Web Audio, no files). Created only after the visitor turns sound on. */
export class MineAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private beep: GainNode | null = null
  private reversing = false
  private beepTimer = 0
  private noise: AudioBuffer | null = null

  private makeNoise(ctx: AudioContext) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02 // brown noise
      d[i] = last * 3.5
    }
    return buf
  }

  start() {
    if (this.ctx) return
    const ctx = new AudioContext()
    this.ctx = ctx
    const master = ctx.createGain()
    master.gain.value = 0
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.2)
    master.connect(ctx.destination)
    this.master = master
    this.noise = this.makeNoise(ctx)

    // Low air bed
    const bed = ctx.createBufferSource()
    bed.buffer = this.noise
    bed.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 260
    const bedGain = ctx.createGain()
    bedGain.gain.value = 0.5
    bed.connect(lp).connect(bedGain).connect(master)
    bed.start()

    // Distant diesel engines with a slow surge
    const engineLp = ctx.createBiquadFilter()
    engineLp.type = 'lowpass'
    engineLp.frequency.value = 210
    const engineGain = ctx.createGain()
    engineGain.gain.value = 0.09
    engineLp.connect(engineGain).connect(master)
    for (const f of [47, 61.5]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.connect(engineLp)
      o.start()
    }
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.13
    const lfoAmt = ctx.createGain()
    lfoAmt.gain.value = 0.03
    lfo.connect(lfoAmt).connect(engineGain.gain)
    lfo.start()

    // Reversing beeper
    const beepOsc = ctx.createOscillator()
    beepOsc.type = 'square'
    beepOsc.frequency.value = 1150
    const beep = ctx.createGain()
    beep.gain.value = 0
    beepOsc.connect(beep).connect(master)
    beepOsc.start()
    this.beep = beep
    this.beepTimer = window.setInterval(() => {
      if (!this.reversing || !this.ctx || !this.beep) return
      const t = this.ctx.currentTime
      this.beep.gain.setValueAtTime(0.012, t)
      this.beep.gain.setValueAtTime(0, t + 0.45)
    }, 900)
  }

  setReversing(on: boolean) { this.reversing = on }

  setActive(on: boolean) {
    if (!this.ctx) return
    if (on) void this.ctx.resume()
    else void this.ctx.suspend()
  }

  /** Low rumble for the rock-slide event. */
  rumble() {
    if (!this.ctx || !this.master || !this.noise) return
    const t = this.ctx.currentTime
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 130
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(1.6, t + 0.12)
    g.gain.exponentialRampToValueAtTime(0.001, t + 3.8)
    src.connect(lp).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + 4)
  }

  stop() {
    window.clearInterval(this.beepTimer)
    void this.ctx?.close()
    this.ctx = null
    this.master = null
    this.beep = null
  }
}
