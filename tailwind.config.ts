import type { Config } from 'tailwindcss'

/**
 * Design-token layer. Colors, type scale, spacing, easings and durations
 * are defined here once and mirrored to CSS variables in src/styles/globals.css
 * via Tailwind's theme() so GSAP/Framer code can read the same values
 * (see src/config/motion.ts for the JS mirror of easings/durations).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '375px', md: '768px', lg: '1024px', xl: '1440px' },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Theme tokens live in CSS variables (src/styles/globals.css) so the light theme can swap them.
      ink: 'rgb(var(--c-ink) / <alpha-value>)',
      coal: 'rgb(var(--c-coal) / <alpha-value>)',
      steel: 'rgb(var(--c-steel) / <alpha-value>)',
      bone: 'rgb(var(--c-bone) / <alpha-value>)',
      amber: 'rgb(var(--c-amber) / <alpha-value>)',
      safety: 'rgb(var(--c-safety) / <alpha-value>)',
      ochre: { from: 'rgb(var(--c-ochre-from) / <alpha-value>)', to: 'rgb(var(--c-ochre-to) / <alpha-value>)' },
      white: '#FFFFFF',
      black: '#000000',
    },
    fontFamily: {
      display: ['"Bebas Neue"', 'Impact', '"Arial Narrow"', 'sans-serif'],
      body: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
    },
    extend: {
      fontSize: {
        // Fluid display scale (clamp). Hero is handled in globals.css (.text-hero).
        'display-xl': ['clamp(3.5rem, 9vw, 9rem)', { lineHeight: '0.9', letterSpacing: '0.01em' }],
        'display-lg': ['clamp(2.75rem, 6.5vw, 6.5rem)', { lineHeight: '0.92', letterSpacing: '0.01em' }],
        'display-md': ['clamp(2rem, 4.5vw, 4.25rem)', { lineHeight: '0.95', letterSpacing: '0.01em' }],
        'display-sm': ['clamp(1.5rem, 2.8vw, 2.5rem)', { lineHeight: '1', letterSpacing: '0.02em' }],
        eyebrow: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.22em' }],
        'body-lg': ['clamp(1.0625rem, 1.3vw, 1.25rem)', { lineHeight: '1.6' }],
      },
      spacing: {
        gutter: 'var(--gutter)',
        'section-y': 'clamp(5rem, 12vw, 11rem)',
      },
      maxWidth: { measure: '65ch', 'measure-narrow': '52ch' },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-inout': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'power3-inout': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'power2-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: { fast: '200ms', base: '600ms', slow: '1100ms', wipe: '700ms', liquid: '1400ms' },
      backdropBlur: { glass: '16px' },
      boxShadow: {
        'amber-glow': '0 0 80px 10px rgb(var(--c-amber) / 0.18)',
        'amber-glow-lg': '0 0 160px 30px rgb(var(--c-amber) / 0.22)',
      },
      backgroundImage: {
        ochre: 'linear-gradient(135deg, rgb(var(--c-ochre-from)) 0%, rgb(var(--c-ochre-to)) 100%)',
        vignette: 'radial-gradient(120% 90% at 50% 45%, rgba(11,11,12,0) 60%, rgba(11,11,12,0.45) 100%)',
        scrim: 'linear-gradient(180deg, rgba(11,11,12,0.08) 0%, rgba(11,11,12,0.18) 45%, rgba(11,11,12,0.82) 100%)',
        'scrim-top': 'linear-gradient(180deg, rgba(11,11,12,0.78) 0%, rgba(11,11,12,0.42) 40%, rgba(11,11,12,0) 100%)',
      },
      zIndex: { header: '50', menu: '60', transition: '70', preloader: '80', cursor: '90', grain: '95' },
    },
  },
  plugins: [],
} satisfies Config
