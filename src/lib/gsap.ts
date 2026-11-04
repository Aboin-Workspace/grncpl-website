import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
gsap.defaults({ overwrite: 'auto' })

export { gsap, ScrollTrigger, useGSAP }

// Dev only: lets headless checks inspect timelines/ScrollTriggers.
if (import.meta.env.DEV) {
  ;(window as unknown as { __gsap: typeof gsap; __ST: typeof ScrollTrigger }).__gsap = gsap
  ;(window as unknown as { __gsap: typeof gsap; __ST: typeof ScrollTrigger }).__ST = ScrollTrigger
}
