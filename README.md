# GRN Constructions (GRNCPL) — website

Award-calibre redesign of grncpl.com. Same content, section names, page names and URL slugs as the old site; new design, look and feel, and motion.

## Stack

Vite · React 18 · TypeScript (strict) · React Router v6 · Tailwind (token layer in `tailwind.config.ts`) · Motion (`motion/react`, formerly Framer Motion) · GSAP + ScrollTrigger · Lenis · OGL (hero WebGL) · Recharts · react-helmet-async · zod + react-hook-form · `@fontsource` self-hosted fonts.

**Rule of thumb:** GSAP owns anything tied to scroll position or a multi-step timeline. Motion owns anything tied to React state, routes, hover/tap or layout changes. They never run on the same element.

Motion is loaded through `LazyMotion` (`strict`) with the `m` component: the core ships in the main bundle and the `domMax` feature set (drag, layout) loads after first paint from `src/lib/motionFeatures.ts`. Always import `m` from `motion/react`, never `motion`, or the strict guard throws. `MotionConfig reducedMotion="user"` makes every Motion transform respect the OS setting. Motion also drives the header's scroll-progress bar (`useScroll`, native ScrollTimeline where supported), the scroll-velocity skew on the client marquee (`useVelocity`), the hero headline's pointer parallax, the spring back-to-top button and the staggered dropdown items.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck, production build to `dist/`, then writes `dist/sitemap.xml` from the routes in `src/data/nav.ts` |
| `npm run preview` | Serves `dist/` on port 4173 with SPA fallback |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run lhci` | Lighthouse CI (mobile preset) against the preview server. Reports land in `.lighthouseci/reports` |
| `npm run check` | typecheck → lint → build → Lighthouse CI |

Dev-only review harness for the hero: `/hero-dev` (`?fallback=1` forces the non-WebGL layer, `?rm=1` forces reduced motion, `?nostart=1` simulates the preloader gate). In devtools `__gsap.globalTimeline.timeScale(0.1)` slows every GSAP timeline.

## Editing content

All copy lives in `src/data/*.ts`, verbatim from the old site. Components never hardcode copy.

| File | Holds |
|---|---|
| `nav.ts` | Menu structure (exact names/order/slugs), footer quick links, site identity |
| `home.ts` | Hero slides + subtext, pillars, nation-building copy, stats, quality/professionalism, leaders, CSR teaser, clients, operating area |
| `company.ts` | About Us, Management, Founder's Message, Certifications, Construction Brilliance, Our Expertise |
| `operations.ts` | Infrastructure, Strengths and Experience, HSE practices |
| `projects.ts` | Completed projects table (23 rows), yearly production data + grand total, current projects |
| `equipment.ts` | Equipment categories and the Others list |
| `csr.ts` | CSR hub text + the six pillars (routable at their own slugs) |
| `contact.ts` | Offices, contact form labels, footer contact block, gallery + careers copy |
| `seo.ts` | Per-route `<title>` + meta description, Organization and LocalBusiness JSON-LD |

Search the codebase for `TODO(client)` to find everything that still needs input from the client: hero 4K masters, social profile URLs, map embed URL, video URL, award photos, corrected completed-projects row 12 title, headline equipment count, contact form endpoint, Surface Miner image.

## Swapping images

- Hero slides: drop new files in `public/images/hero/` and point `HERO_SLIDES[].image.src` (≥1024px viewports) and `.srcSmall` (<1024px) at them. WebP recommended; the OGL shader needs same-origin images (cross-origin images without CORS headers cannot be used as WebGL textures).
- Every other photo was pulled from the live site, colour-graded and re-encoded as WebP into `public/images/site/` (and `public/images/site-banner.webp`). The data files reference those local paths; drop a replacement with the same name to swap one.

## Swapping fonts

Fonts are self-hosted from `public/fonts/` and declared in `src/styles/globals.css` (`@font-face`, `font-display: swap`) and preloaded in `index.html`. Display face is Bebas Neue, body is Manrope Variable. Change the family names in `tailwind.config.ts` (`fontFamily.display` / `fontFamily.body`) and the `.text-hero` rule in `globals.css`.

## Brand colour

The accent is the green from the GRN logo (`#8DC63F` on dark, `#3F7A1A` on light for AA contrast). The token is still named `amber` throughout (`--c-amber`, `text-amber`, `bg-amber`, `uAmber`) because it was amber in the first design pass; change the values in `src/styles/globals.css` (`:root`, `html[data-theme='light']`, `.theme-dark`) and the handful of hard-coded hexes in Cursor, HeroHeadline, HeroCanvas, ParticleField and Preloader to re-brand again.

## Themes

Dark is the default. A toggle in the header switches to a light theme (warm paper, charcoal type, burnt amber) and the choice persists in `localStorage` (`grncpl:theme`); an inline script in `index.html` applies it before first paint. Both palettes are CSS variables in `src/styles/globals.css` (`:root` = dark, `html[data-theme='light']` = light), consumed by Tailwind through `tailwind.config.ts`. Cinematic surfaces (hero, preloader, the header while over the hero) carry the `theme-dark` class so they keep the dark palette in both themes. JS that needs a colour (chart, scrubbed copy) reads it with `token()` from `src/lib/theme.ts`, never a hard-coded hex.

## Tuning motion

Every motion constant lives in `src/config/motion.ts`: eases, durations, hero autoplay interval, headline stagger/overlap, liquid-wipe duration and edge, pointer displacement decay, strata count and parallax, particle counts (desktop/mobile), magnetic radius, cursor spring, preloader min/max, page-wipe duration, pillar pin distance, counter roll, marquee speed and scroll-velocity coupling, tilt angle, carousel geometry, table stagger and chart timings. Design tokens (colours, type scale, easings as CSS) are in `tailwind.config.ts` and mirrored as CSS variables in `globals.css`.

`prefers-reduced-motion` (or `<html data-reduced-motion="1">`) disables the shader, particles, parallax, pinning, marquee autoplay and magnetic effects and replaces transitions with short fades.

## Structure

```
src/
  config/motion.ts       all motion constants
  data/                  content (see above)
  lib/                   gsap + lenis setup, split-text, shaders, helpers
  hooks/                 reduced motion, media queries, Lenis scroll, scroll lock
  components/
    layout/              Header, DesktopNav, MobileMenu, Footer, Section, Container
    motion/              PageTransition, Preloader, Reveal, SplitText, Counter, Marquee, TiltCard, MagneticButton, Cursor, Grain
    hero/                Hero + the six layers (HeroCanvas, StrataLines, ParticleField, HeroHeadline, SlideChrome, ScrollCue) + HeroFallback
    ui/                  EditorialPage, DataTable, Tabs, Lightbox, ContactForm, Seo, …
    charts/              ProductionChart (lazy)
  pages/                 one file per route (+ pages/home/* sections)
  routes.ts              route table (slugs identical to the old site)
```

## 3D and built graphics

- `src/components/three/TerrainMesh.tsx` is a procedural open-pit survey in OGL (benches, a spiral haul road, rolling overburden, an amber survey ring). Everything is computed in `src/lib/shaders/terrain.vert.glsl`; there are no models or textures. Used on the Equipments hero and behind the home stats band. Props: `progressRef` (scroll 0..1 lifts the camera), `pointerTarget`, `intensity`, `scale`, `offsetY`. Tunables live in `TERRAIN` in `src/config/motion.ts`. Renders one frame under reduced motion and pauses off-screen.
- `src/components/csr/ResponsibilityPyramid.tsx` and `src/components/company/KeyValuesWheel.tsx` replace the old stock bitmaps (CSR.jpg, values.png). Their text lives verbatim in `src/data/csr.ts` (`CSR_PYRAMID`) and `src/data/company.ts` (`ABOUT_US.keyValues`). Both auto-cycle until the visitor hovers, taps or focuses a tier.
- Home hero on desktop with WebGL is `src/components/hero/WorldHero.tsx`: a scroll-driven low-poly open-pit world (polar-grid terrain, spiral haul road, dumpers, dust, sky) that the camera flies down through four headline stages while the section is pinned. Everything procedural, no models. Tunables in `WORLD`; the camera path is the `posKeys`/`lookKeys` splines in the component. The world also has a sun shadow map (`WORLD.shadow`), time of day tied to the descent (`WORLD.timeOfDay`), a scripted rock slide (`WORLD.event`), a truck-loading cycle (`WORLD.loading`), a water cart, hold-and-drag look (`WORLD.look`), hover callouts fed from the Equipments and home data, a depth map, and optional synthesised sound (`src/lib/mineAudio.ts`, off by default). Phones, reduced motion and no-WebGL get the photo hero (`Hero.tsx`), whose photos carry a pseudo-depth pointer parallax (`HERO.webgl.depthParallax`).
- Client badges on the home strip (`CLIENT_BADGES` in `src/data/home.ts`) draw a monogram until a `logo` file is supplied.
- The Equipments page uses `src/components/fleet/*` (HUD frame with corner brackets and scan line, vertical fleet selector). Timing in `FLEET`.

## Project map

Completed Projects shows an India map (`src/components/works/ProjectMap.tsx`) built on the `@svg-maps/india` paths (CC BY 4.0, credited in the UI). Each project row carries a `state` id in `src/data/projects.ts`, derived from the mine area named in the work and marked `TODO(client)` to confirm. Clicking a state or its list entry filters the table.

## Images

All bitmaps in `public/images` are re-mastered from the grncpl.com originals with `scripts`-style sharp processing (Lanczos3 upscale, light clarity, WebP). The hero ships 1080 / 1920 / 3840 variants picked by `pickHeroSrc()` in `src/lib/webgl.ts`. The 3840 files are upscales of the 1920 originals, not true 4K: swap in the client's masters at the same paths when available (`TODO(client)`).
